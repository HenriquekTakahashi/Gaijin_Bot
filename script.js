// ============================================================
// GAJIN BOT
// script.js
// ============================================================


// ============================================================
// CONFIGURAÇÃO
// ============================================================

let CONFIG = {};


// ============================================================
// CARREGAR CONFIG.ENV
// ============================================================

async function carregarConfig() {
    try {
        const resposta = await fetch("./config.env");

        if (!resposta.ok) {
            throw new Error(
                `Não foi possível carregar o config.env. Status: ${resposta.status}`
            );
        }

        const texto = await resposta.text();

        texto.split(/\r?\n/).forEach(function (linha) {

            linha = linha.trim();
            // Ignora linhas vazias
            if (!linha) {
                return;
            }

            // Ignora comentários
            if (linha.startsWith("#")) {
                return;
            }

            const separador = linha.indexOf("=");

            if (separador === -1) {
                return;
            }

            const chave = linha
                .substring(0, separador)
                .trim();

            let valor = linha
                .substring(separador + 1)
                .trim();

            // Remove aspas caso existam
            if (
                (valor.startsWith('"') && valor.endsWith('"')) ||
                (valor.startsWith("'") && valor.endsWith("'"))
            ) {
                valor = valor.substring(1, valor.length - 1);
            }

            CONFIG[chave] = valor;
        });

        console.log("config.env carregado com sucesso.");

    } catch (erro) {

        console.error(
            "Erro ao carregar config.env:",
            erro
        );

        throw erro;
    }
}


// ============================================================
// ELEMENTOS DO HTML
// ============================================================

const messages =
    document.getElementById("messages");

const welcome =
    document.getElementById("welcome");

const messageInput =
    document.getElementById("messageInput");

const sendButton =
    document.getElementById("sendButton");

const newChatButton =
    document.getElementById("newChatButton");

const conversationList =
    document.getElementById("conversationList");

const lightModeButton =
    document.getElementById("lightModeButton");

const darkModeButton =
    document.getElementById("darkModeButton");

const sidebarToggle =
    document.getElementById("sidebarToggle");


// ============================================================
// SYSTEM INSTRUCTION
// ============================================================

const SYSTEM_INSTRUCTION = `

<Persona>
Você é um jogador experiente de War Thunder especializado em análise de disparos contra veículos terrestres.

Sua função é analisar as informações fornecidas pelo jogador e determinar o melhor local para realizar um disparo contra o veículo inimigo, considerando penetração, munição, blindagem, posição, ângulo, partes expostas e possibilidade de destruição ou incapacitação. 
</Persona>

<Escopo>
Você deve responder exclusivamente perguntas relacionadas a:

Melhor local para atirar em um veículo terrestre inimigo;
Possibilidade de penetração;
Possibilidade de destruir o veículo com um único disparo;
Melhor local para incapacitar o veículo inimigo;
Melhor local para danificar componentes importantes do veículo inimigo.

Para qualquer outro assunto, mesmo sendo sobre War Thunder mas não sendo sobre penetração de tanques responda exatamente:

"Desculpe! Sou apenas um modelo para responder perguntas sobre penetração no modo de batalhas de tanques do jogo War Thunder" </Escopo>

<Formato de entrada>
A entrada de uma análise deve utilizar os seguintes campos:

Meu tanque:
Meu tipo de munição:
Perfuração da munição em milímetros:
Tanque inimigo:
Posição do inimigo (frontal, lateral ou traseira):
Partes do tanque exposto:
Ângulo (em relação a linha de tiro):

Distância aproximada: [opcional]

As informação da entrada devem estar devidamente sinalizadas.

O jogador não precisa obrigatoriamente fornecer todos os campos para que uma análise seja realizada. Alguns dados podem ser desnecessários dependendo da situação.

Não invente informações que não foram fornecidas.
</Formato de entrada>

<Entrada inválida>
Se o usuário informar os dados que não seja o formato de entrada definido responda:

"Tipo de entrada inválida, por favor entre com as informações da seguinte maneira:
Meu tanque:
Meu tipo de munição:
Perfuração da munição em milímetros:
Tanque inimigo:
Posição do inimigo (frontal, lateral ou traseira):
Partes do tanque exposto:
Ângulo (em relação a linha de tiro):

Distância aproximada: [opcional]
"

</Entrada inválida>

<Requisitos de informação>
Não exija informações desnecessárias.

Determine primeiro se os dados fornecidos já são suficientes para produzir uma recomendação válida.

Informações como tanque do jogador, munição, penetração, tanque inimigo, posição e partes expostas podem ser suficientes em determinadas situações.

Se os dados não forem suficientes para determinar uma recomendação válida, responda:

"Pouca informação!
Não é possível determinar um disparo com as informações presentes. Necessito de mais informações, tais como: [informações necessárias]."

Solicite somente as informações que realmente fazem diferença para a análise.

Não peça distância, ângulo ou partes expostas quando esses dados não alterarem significativamente a conclusão.
</Entrada inválida>

<Definições>
Considere as seguintes definições:

Hit kill:
Destruir o veículo inimigo com apenas um disparo.

Incapacitação:
Reduzir significativamente a capacidade de combate do veículo inimigo sem necessariamente destruí-lo.

Disparo finalizante:
Disparo posterior realizado contra um veículo que já foi incapacitado ou severamente danificado com o objetivo de destruí-lo.

Penetração Garantida:
Quando a blindagem apresentada ao disparo possui margem suficiente para considerar a penetração altamente confiável.

Penetração Provável:
Quando existe uma boa possibilidade de penetração, mas fatores como ângulo, ponto exato de impacto ou características da blindagem podem impedir o resultado.

Penetração Incerta:
Quando a penetração depende de um ponto muito específico, pequena margem de penetração ou condições difíceis de reproduzir.

Penetração Impossível:
Quando a munição não possui capacidade suficiente para penetrar a blindagem apresentada naquele ponto.
</Definições>

<Ordem de Análise>
Sempre analise o disparo seguindo esta ordem:

1. Identifique corretamente o tanque do jogador.
2. Identifique corretamente o tipo de munição.
3. Considere a capacidade de penetração da munição.
4. Identifique corretamente o tanque inimigo.
5. Determine a orientação do inimigo usando a posição informada.
6. Determine quais partes do veículo estão expostas.
7. Considere o ângulo informado.
8. Considere a distância quando ela for relevante.
9. Determine os pontos que podem ser penetrados.
10. Determine se algum ponto possui alta probabilidade de destruir o veículo com um único disparo.
11. Caso exista um ponto confiável para Hit kill, recomende esse ponto.
12. Caso o Hit kill não seja confiável, determine o melhor ponto para incapacitar o inimigo.
13. Caso a incapacitação também seja limitada, determine o melhor dano possível que proporcione vantagem tática.
14. Se nenhum dano relevante for possível, informe que o disparo é impossível ou pouco efetivo.

Sempre priorize uma recomendação principal.
</Ordem de Análise>

<Prioridade  da Recomendação>
A prioridade das recomendações deve ser:

1. Hit kill confiável;
2. Penetração com alta probabilidade de destruição;
3. Incapacitação do inimigo;
4. Redução significativa da capacidade de combate;
5. Dano a componentes importantes;
6. Nenhum disparo efetivo.

Não recomende um disparo de incapacitação quando existir uma oportunidade claramente superior de Hit kill.
</Prioridade  da Recomendação>

<Penetração vs Destruíção>
Nunca considere que uma penetração significa automaticamente que o tanque será destruído.

Analise separadamente:

capacidade de penetração;
espessura e configuração da blindagem;
ângulo da blindagem;
componentes localizados atrás do ponto de impacto;
posição da tripulação;
posição de munição;
possibilidade de atingir componentes críticos;
capacidade explosiva da munição;
possibilidade de dano por estilhaços;
capacidade do veículo de continuar combatendo depois do impacto.

Uma penetração que não tenha alta probabilidade de destruir o veículo não deve ser classificada automaticamente como Hit kill.
</Penetração vs Destruíção>

<Análise de Munição>
Considere o comportamento específico da munição utilizada.

Não utilize somente o valor de penetração para determinar o resultado.

Considere as características relevantes da munição, incluindo, quando aplicável:

penetração;
efeito após a penetração;
quantidade de explosivo;
estilhaços;
capacidade de atingir múltiplos componentes;
comportamento contra blindagem;
capacidade de causar dano sem penetração.

Para munições HE, considere a possibilidade de causar dano através de efeitos explosivos ou outros mecanismos de dano aplicáveis no jogo, mesmo quando a blindagem principal não seja penetrada.

Não presuma que uma munição possui capacidade de causar dano não penetrante se esse comportamento não for aplicável ao tipo de munição.
</Análise de Munição>

<Analise de Hit Kill>
Quando existir possibilidade de Hit kill, procure o ponto que ofereça a maior probabilidade de destruir o veículo com apenas um disparo.

Considere especialmente:

concentração de tripulantes;
armazenamento de munição;
componentes críticos;
combustível;
motor;
áreas com maior quantidade de componentes atrás da blindagem.

Não escolha simplesmente a área com menor blindagem.

O melhor ponto é aquele que combina possibilidade de penetração com maior potencial de destruição.
</Analise de Hit Kill>

<Incapacitação>
Se não houver um Hit kill confiável, procure o melhor ponto para incapacitar o inimigo.

Priorize, conforme a situação:

1. Canhão, quando isso impedir o inimigo de realizar um disparo efetivo;
2. Esteira, quando retirar a mobilidade proporcionar vantagem significativa;
3. Motor ou transmissão, quando reduzir significativamente a mobilidade;
4. Tripulação ou componentes internos acessíveis;
5. Outros componentes importantes que reduzam a capacidade de combate.

Não recomende automaticamente a esteira.

Considere:

se o veículo possui torre giratória;
velocidade de rotação da torre;
capacidade do inimigo de continuar atirando;
tempo necessário para reparar o componente;
tempo de recarga do jogador;
possibilidade de realizar um segundo disparo;
posição atual do jogador;
vantagem tática obtida pela incapacitação.

O objetivo é escolher o dano que proporcione a maior vantagem para o jogador, e não simplesmente causar qualquer dano.
</Incapacitação>

<Contexto da Situação>
Interprete as informações fornecidas para determinar a situação do combate.

Exemplo:

Se o jogador estiver utilizando um Panzer III contra um veículo pesado cuja blindagem não possa ser penetrada pela munição disponível, não recomende um ponto de blindagem apenas porque existe uma parte do tanque visível.

Procure componentes que possam ser danificados mesmo sem uma penetração efetiva, como canhão, culatra ou esteiras, quando aplicável.
</Contexto da Situação>

<Ângulo>
O ângulo fornecido representa o ângulo do veículo inimigo em relação à linha de tiro do jogador.

Considere o efeito do ângulo sobre a espessura efetiva da blindagem e sobre a possibilidade de ricochete.

Não trate uma blindagem nominal como equivalente à blindagem efetiva quando o ângulo alterar significativamente o resultado.
</Ângulo>

<Distância>
A distância é opcional.

Considere a distância somente quando ela puder alterar significativamente:

a penetração;
a queda ou trajetória do projétil;
a efetividade da munição;
a precisão necessária;
a possibilidade de acertar um ponto específico.

Se a distância não alterar a recomendação, não solicite essa informação.
</Distância>

<Desambiguação de Veículos>
Nunca confunda veículos com nomes semelhantes.

Exemplos:

"T34" = tanque pesado americano.

"T-34" = tanque médio soviético.

Quando um nome puder representar mais de um veículo, determine qual veículo está sendo utilizado antes de realizar a análise.

Se não for possível determinar qual veículo foi mencionado, solicite esclarecimento.

Não escolha arbitrariamente entre veículos com nomes semelhantes.

A mesma regra vale para o veículo inimigo.

Considere também variantes diferentes do mesmo veículo quando elas possuírem diferenças relevantes de blindagem, armamento ou configuração.
</Desambiguação de Veículos>

<Regras Especiais>
Quando a penetração for:

garantida e houver alta possibilidade de destruição: priorize Hit kill;
provável e houver boa possibilidade de destruição: priorize o ponto de maior potencial destrutivo;
incerta e depender de um ponto muito específico ou difícil de acertar: prefira um ponto de incapacitação mais confiável;
impossível: procure uma alternativa de incapacitação, como canhão, esteira ou outro componente vulnerável.

Não recomende um disparo extremamente difícil de acertar quando existir uma alternativa significativamente mais confiável que proporcione vantagem semelhante.
</Regras Especiais>

<Restrições>
Não invente:

valores de blindagem;
valores de penetração;
partes expostas;
distância;
ângulo;
componentes internos;
características do veículo.

Utilize somente informações fornecidas ou características conhecidas do veículo e da munição.

Se uma conclusão depender de uma informação desconhecida ou ambígua, indique a incerteza ou solicite a informação necessária.

Não trate "penetrável" como sinônimo de "destruível".
</Restrições>

<Formato de Saída>
Sempre que houver informações suficientes, responda utilizando exatamente esta estrutura:

Penetração: [Garantida/Provável/Incerta/Impossível]
Objetivo: [Hit kill/Incapacitação/Redução da capacidade de combate]
Melhor local para atirar: [local específico]
Motivo: [explicação breve e objetiva]

A resposta deve ser curta e direta.

Sempre escolha um único melhor local para atirar quando isso for possível.

Somente apresente uma segunda opção quando duas alternativas forem praticamente equivalentes.

Não faça listas extensas de pontos de impacto.
</Formato de Saída>

<Informações Insuficientes>
Quando as informações não forem suficientes para determinar um disparo válido, responda:

"Pouca informação!
Não é possível determinar um disparo com as informações presentes. Necessito de mais informações, tais como: [informações necessárias]."

Liste somente as informações que realmente estão faltando.
</Informações Insuficientes>

<Exemplo de Entrada>
Meu tanque: M22
Meu tipo de munição: APHE
Perfuração da munição em milímetros: 34mm
Tanque inimigo: IS-3
Posição do inimigo (frontal, lateral ou traseira): Frontal
Partes do tanque exposto: Torre
Ângulo (em relação a linha de tiro): 0°
</Exemplo de Entrada>

<Exemplo de Saída>
Penetração: Impossível
Objetivo: Incapacitação
Melhor local para atirar: Breech/canhão
Motivo: A blindagem frontal da torre impede uma penetração confiável com essa munição. O melhor disparo é contra o armamento para impedir o inimigo de revidar.
</Exemplo de Saída>

<Exemplo de Entrada 2>
Meu tanque: Tiger II
Meu tipo de munição: APHE
Perfuração da munição em milímetros: 243mm
Tanque inimigo: T-34
Posição do inimigo (frontal, lateral ou traseira): Frontal
Partes do tanque exposto: Torre e casco
Ângulo (em relação a linha de tiro): 0°
</Exemplo de Entrada 2>

<Exemplo de Saída 2>
Penetração: Garantida
Objetivo: Hit kill
Melhor local para atirar: Centro da torre, na região ocupada pela maior concentração de tripulantes/componentes críticos
Motivo: A munição possui ampla capacidade de penetração contra a blindagem apresentada, permitindo atingir componentes e tripulação no interior da torre com alta probabilidade de destruição.
</Exemplo de Saída 2>

<Receber o prompt>
Ao receber esse prompt responda exatamente:
"Entendido! Que as forças do Deus Caracol esteja com você!!"
</Receber o prompt>

`;


// ============================================================
// VARIÁVEIS DO SISTEMA
// ============================================================

let FOUNDRY_PROJECT_ENDPOINT = "";
let FOUNDRY_MODEL = "";
let FOUNDRY_API_KEY = "";
let FOUNDRY_API_URL = "";

// ============================================================
// HISTÓRICO DAS CONVERSAS
// ============================================================
//
// O histórico existe somente enquanto a página estiver aberta.
// Nada é salvo em:
// - localStorage
// - sessionStorage
// - cookies
// - banco de dados
// - arquivos
//
// Ao recarregar a página, tudo é perdido.
// ============================================================

let conversations = [];

let currentConversationId = null;


// ============================================================
// GERAR ID DA CONVERSA
// ============================================================

function generateConversationId() {

    return (
        Date.now() +
        Math.floor(Math.random() * 1000)
    );
}


// ============================================================
// OBTER CONVERSA ATUAL
// ============================================================

function getCurrentConversation() {

    return conversations.find(function (conversation) {

        return conversation.id === currentConversationId;

    });
}


// ============================================================
// CRIAR NOVA CONVERSA
// ============================================================

function createNewConversation() {

    const newConversation = {

        id: generateConversationId(),

        title: "Nova conversa",

        messages: []

    };

    conversations.unshift(newConversation);

    currentConversationId =
        newConversation.id;

    renderConversationList();

    renderCurrentConversation();

    messageInput.focus();
}


// ============================================================
// ABRIR CONVERSA
// ============================================================

function openConversation(id) {

    const conversation =
        conversations.find(function (conversation) {

            return conversation.id === id;

        });

    if (!conversation) {
        return;
    }

    currentConversationId = id;

    renderConversationList();

    renderCurrentConversation();


    // Fecha a sidebar no celular
    if (window.innerWidth <= 700) {

        document.body.classList.add(
            "sidebar-hidden"
        );

        updateSidebarButton();
    }
}


// ============================================================
// RENDERIZAR LISTA DE CONVERSAS
// ============================================================

function renderConversationList() {

    conversationList.innerHTML = "";

    conversations.forEach(function (conversation) {

        const button =
            document.createElement("button");

        button.classList.add(
            "conversation-item"
        );


        if (
            conversation.id ===
            currentConversationId
        ) {

            button.classList.add("active");
        }


        const icon =
            document.createElement("span");

        icon.classList.add(
            "material-symbols-outlined",
            "conversation-icon"
        );

        icon.textContent = "chat";


        const title =
            document.createElement("span");

        title.classList.add(
            "conversation-title"
        );

        title.textContent =
            conversation.title;


        button.appendChild(icon);

        button.appendChild(title);


        button.addEventListener(
            "click",
            function () {

                openConversation(
                    conversation.id
                );

            }
        );


        conversationList.appendChild(button);

    });
}


// ============================================================
// RENDERIZAR CONVERSA ATUAL
// ============================================================

function renderCurrentConversation() {

    const conversation =
        getCurrentConversation();

    if (!conversation) {
        return;
    }


    // Limpa mensagens atuais
    messages.innerHTML = "";


    // Mostra welcome quando não existem mensagens
    if (conversation.messages.length === 0) {

        messages.appendChild(
            criarWelcome()
        );

        return;
    }


    // Renderiza todas as mensagens
    conversation.messages.forEach(
        function (message) {

            adicionarMensagemNaInterface(
                message.role,
                message.content
            );

        }
    );


    scrollParaFinal();

}


// ============================================================
// CRIAR WELCOME
// ============================================================

function criarWelcome() {

    const welcomeElement =
        document.createElement("div");

    welcomeElement.classList.add("welcome");

    welcomeElement.id = "welcome";


    const titulo =
        document.createElement("h1");

    titulo.textContent =
        "Bem vindo a Gaijin Bot";


    const texto =
        document.createElement("p");

    texto.textContent =
        "Como posso de ajudar hoje?";


    welcomeElement.appendChild(titulo);

    welcomeElement.appendChild(texto);


    return welcomeElement;
}


// ============================================================
// ADICIONAR MENSAGEM NA INTERFACE
// ============================================================

function adicionarMensagemNaInterface(
    role,
    content
) {

    const message =
        document.createElement("div");


    // --------------------------------------------------------
    // MENSAGEM DO USUÁRIO
    // --------------------------------------------------------

    if (role === "user") {

        message.classList.add(
            "message",
            "user-message"
        );


        const bubble =
            document.createElement("div");

        bubble.classList.add(
            "message-bubble"
        );

        bubble.textContent =
            content;


        message.appendChild(bubble);

    }


    // --------------------------------------------------------
    // MENSAGEM DO BOT
    // --------------------------------------------------------

    else if (role === "assistant") {

        message.classList.add(
            "message",
            "bot-message"
        );


        const icon =
            document.createElement("img");

        icon.src =
            "imagens/bot.jpeg";

        icon.classList.add(
            "bot-message-icon"
        );

        icon.alt =
            "Gaijin Bot";


        const bubble =
            document.createElement("div");

        bubble.classList.add(
            "message-bubble"
        );

        bubble.textContent =
            content;


        message.appendChild(icon);

        message.appendChild(bubble);

    }


    messages.appendChild(message);
}


// ============================================================
// ADICIONAR MENSAGEM
// ============================================================

function adicionarMensagem(
    role,
    content
) {

    const conversation =
        getCurrentConversation();

    if (!conversation) {
        return;
    }


    conversation.messages.push({

        role: role,

        content: content

    });


    adicionarMensagemNaInterface(
        role,
        content
    );


    scrollParaFinal();
}


// ============================================================
// SCROLL PARA O FINAL
// ============================================================

function scrollParaFinal() {

    setTimeout(function () {

        messages.scrollTop =
            messages.scrollHeight;

    }, 10);
}


// ============================================================
// ATUALIZAR TÍTULO DA CONVERSA
// ============================================================

function atualizarTituloConversa(
    mensagem
) {

    const conversation =
        getCurrentConversation();

    if (!conversation) {
        return;
    }


    if (
        conversation.title !==
        "Nova conversa"
    ) {
        return;
    }


    let titulo =
        mensagem.trim();


    // Remove espaços extras
    titulo =
        titulo.replace(/\s+/g, " ");


    // Limita o tamanho
    if (titulo.length > 35) {

        titulo =
            titulo.substring(0, 35) +
            "...";

    }


    if (!titulo) {

        titulo =
            "Nova conversa";

    }


    conversation.title =
        titulo;


    renderConversationList();
}


// ============================================================
// EXTRAIR RESPOSTA DA API
// ============================================================

function extrairResposta(data) {

    let reply = "";


    // --------------------------------------------------------
    // output_text
    // --------------------------------------------------------

    if (
        typeof data.output_text ===
        "string"
    ) {

        reply =
            data.output_text;
    }


    // --------------------------------------------------------
    // output[]
    // --------------------------------------------------------

    else if (
        Array.isArray(data.output)
    ) {

        for (
            const outputItem
            of data.output
        ) {

            if (
                !Array.isArray(
                    outputItem.content
                )
            ) {

                continue;
            }


            for (
                const contentItem
                of outputItem.content
            ) {

                if (
                    contentItem.type ===
                    "output_text" &&
                    typeof contentItem.text ===
                    "string"
                ) {

                    reply +=
                        contentItem.text;
                }

            }

        }

    }


    return reply.trim();
}


// ============================================================
// ENVIAR MENSAGEM PARA O FOUNDRY
// ============================================================

async function enviarParaFoundry(
    conversation
) {

    if (!FOUNDRY_API_URL) {

        throw new Error(
            "FOUNDRY_API_URL não foi configurada."
        );
    }


    if (!FOUNDRY_MODEL) {

        throw new Error(
            "FOUNDRY_MODEL não foi configurado."
        );
    }


    if (!FOUNDRY_API_KEY) {

        throw new Error(
            "FOUNDRY_API_KEY não foi configurada."
        );
    }


    const response =
        await fetch(
            FOUNDRY_API_URL,
            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json",

                    "api-key":
                        FOUNDRY_API_KEY

                },

                body: JSON.stringify({

                    model:
                        FOUNDRY_MODEL,

                    instructions:
                        SYSTEM_INSTRUCTION,

                    input:
                        conversation.messages,

                    max_output_tokens:
                        2000

                })

            }
        );


    // --------------------------------------------------------
    // LER RESPOSTA
    // --------------------------------------------------------

    let data;

    try {

        data =
            await response.json();

    } catch (erro) {

        throw new Error(
            `A API retornou uma resposta que não é JSON. Status HTTP: ${response.status}`
        );
    }


    // --------------------------------------------------------
    // ERRO DA API
    // --------------------------------------------------------

    if (!response.ok) {

        console.error(
            "Resposta completa da Foundry:",
            data
        );


        const mensagemErro =
            data?.error?.message ||
            data?.message ||
            "Erro desconhecido na API.";


        throw new Error(
            `Erro HTTP ${response.status}: ${mensagemErro}`
        );
    }


    // --------------------------------------------------------
    // EXTRAIR RESPOSTA
    // --------------------------------------------------------

    const reply =
        extrairResposta(data);


    if (!reply) {

        console.error(
            "Resposta da API sem texto:",
            data
        );


        throw new Error(
            "A API respondeu, mas não foi possível encontrar o texto da resposta."
        );
    }


    return reply;
}


// ============================================================
// ENVIAR MENSAGEM
// ============================================================

async function enviarMensagem() {

    const texto =
        messageInput.value.trim();


    // Não envia mensagem vazia
    if (!texto) {
        return;
    }


    // Garante que exista uma conversa
    if (!currentConversationId) {

        createNewConversation();

    }


    const conversation =
        getCurrentConversation();


    if (!conversation) {
        return;
    }


    // --------------------------------------------------------
    // ESCONDER WELCOME
    // --------------------------------------------------------

    const welcomeElement =
        document.getElementById("welcome");

    if (welcomeElement) {

        welcomeElement.remove();

    }


    // --------------------------------------------------------
    // ATUALIZAR TÍTULO
    // --------------------------------------------------------

    atualizarTituloConversa(
        texto
    );


    // --------------------------------------------------------
    // LIMPAR INPUT
    // --------------------------------------------------------

    messageInput.value = "";

    ajustarAlturaInput();


    // --------------------------------------------------------
    // ADICIONAR MENSAGEM DO USUÁRIO
    // --------------------------------------------------------

    adicionarMensagem(
        "user",
        texto
    );


    // --------------------------------------------------------
    // DESABILITAR BOTÃO
    // --------------------------------------------------------

    sendButton.disabled = true;

    messageInput.disabled = true;


    // --------------------------------------------------------
    // INDICADOR DE CARREGAMENTO
    // --------------------------------------------------------

    const loadingMessage =
        document.createElement("div");

    loadingMessage.classList.add(
        "message",
        "bot-message"
    );


    const loadingIcon =
        document.createElement("img");

    loadingIcon.src =
        "imagens/bot.jpeg";

    loadingIcon.classList.add(
        "bot-message-icon"
    );

    loadingIcon.alt =
        "Gaijin Bot";


    const loadingBubble =
        document.createElement("div");

    loadingBubble.classList.add(
        "message-bubble"
    );

    loadingBubble.textContent =
        "Pensando...";


    loadingMessage.appendChild(
        loadingIcon
    );

    loadingMessage.appendChild(
        loadingBubble
    );


    messages.appendChild(
        loadingMessage
    );


    scrollParaFinal();


    try {

        // ----------------------------------------------------
        // ENVIAR PARA API
        // ----------------------------------------------------

        const resposta =
            await enviarParaFoundry(
                conversation
            );


        // Remove "Pensando..."
        loadingMessage.remove();


        // ----------------------------------------------------
        // ADICIONAR RESPOSTA
        // ----------------------------------------------------

        adicionarMensagem(
            "assistant",
            resposta
        );


    } catch (erro) {

        console.error(
            "Erro ao enviar mensagem:",
            erro
        );


        // Remove "Pensando..."
        loadingMessage.remove();


        // ----------------------------------------------------
        // MOSTRAR ERRO
        // ----------------------------------------------------

        adicionarMensagem(
            "assistant",
            "Ocorreu um erro ao conversar com o Gaijin Bot.\n\n" +
            erro.message
        );

    } finally {

        // ----------------------------------------------------
        // REATIVAR INPUT
        // ----------------------------------------------------

        sendButton.disabled = false;

        messageInput.disabled = false;

        messageInput.focus();

    }
}


// ============================================================
// AJUSTAR ALTURA DO TEXTAREA
// ============================================================

function ajustarAlturaInput() {

    messageInput.style.height =
        "auto";


    const altura =
        Math.min(
            messageInput.scrollHeight,
            180
        );


    messageInput.style.height =
        altura + "px";
}


// ============================================================
// BOTÃO DE ENVIAR
// ============================================================

sendButton.addEventListener(
    "click",
    function () {

        enviarMensagem();

    }
);


// ============================================================
// TECLADO DO INPUT
// ============================================================

messageInput.addEventListener(
    "keydown",
    function (event) {

        // Enter envia
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            enviarMensagem();

        }

    }
);


messageInput.addEventListener(
    "input",
    function () {

        ajustarAlturaInput();

    }
);


// ============================================================
// NOVA CONVERSA
// ============================================================

newChatButton.addEventListener(
    "click",
    function () {

        createNewConversation();

    }
);


// ============================================================
// TEMA
// ============================================================

function ativarTemaClaro() {

    document.body.classList.add(
        "light-mode"
    );


    lightModeButton.classList.add(
        "active"
    );

    darkModeButton.classList.remove(
        "active"
    );
}


function ativarTemaEscuro() {

    document.body.classList.remove(
        "light-mode"
    );


    darkModeButton.classList.add(
        "active"
    );

    lightModeButton.classList.remove(
        "active"
    );
}


// ------------------------------------------------------------
// BOTÃO TEMA CLARO
// ------------------------------------------------------------

lightModeButton.addEventListener(
    "click",
    function () {

        ativarTemaClaro();

    }
);


// ------------------------------------------------------------
// BOTÃO TEMA ESCURO
// ------------------------------------------------------------

darkModeButton.addEventListener(
    "click",
    function () {

        ativarTemaEscuro();

    }
);


// ============================================================
// SIDEBAR
// ============================================================

const sidebarIcon =
    sidebarToggle.querySelector(
        ".material-symbols-outlined"
    );


function updateSidebarButton() {

    const hidden =
        document.body.classList.contains(
            "sidebar-hidden"
        );


    sidebarIcon.textContent =
        hidden
            ? "menu"
            : "close";


    sidebarToggle.title =
        hidden
            ? "Mostrar menu"
            : "Esconder menu";
}


// ------------------------------------------------------------
// CLIQUE NO BOTÃO
// ------------------------------------------------------------

sidebarToggle.addEventListener(
    "click",
    function () {

        document.body.classList.toggle(
            "sidebar-hidden"
        );


        updateSidebarButton();

    }
);


// ============================================================
// RESPONSIVIDADE DA SIDEBAR
// ============================================================

let wasMobile =
    window.innerWidth <= 700;


function checkSidebarSize() {

    if (
        window.innerWidth <= 700
    ) {

        document.body.classList.add(
            "sidebar-hidden"
        );

    } else {

        document.body.classList.remove(
            "sidebar-hidden"
        );

    }


    updateSidebarButton();
}


checkSidebarSize();


window.addEventListener(
    "resize",
    function () {

        const isMobile =
            window.innerWidth <= 700;


        // Desktop → celular
        if (
            isMobile &&
            !wasMobile
        ) {

            document.body.classList.add(
                "sidebar-hidden"
            );

        }


        // Celular → desktop
        if (
            !isMobile &&
            wasMobile
        ) {

            document.body.classList.remove(
                "sidebar-hidden"
            );

        }


        wasMobile =
            isMobile;


        updateSidebarButton();

    }
);


// ============================================================
// INICIALIZAR APLICAÇÃO
// ============================================================

async function iniciarAplicacao() {

    try {

        // ----------------------------------------------------
        // CARREGAR CONFIG.ENV
        // ----------------------------------------------------

        await carregarConfig();


        // ----------------------------------------------------
        // OBTER VARIÁVEIS
        // ----------------------------------------------------

        FOUNDRY_PROJECT_ENDPOINT =
            CONFIG.FOUNDRY_PROJECT_ENDPOINT || "";


        FOUNDRY_MODEL =
            CONFIG.FOUNDRY_MODEL || "";


        FOUNDRY_API_KEY =
            CONFIG.FOUNDRY_API_KEY || "";


        // ----------------------------------------------------
        // MONTAR URL
        // ----------------------------------------------------

        FOUNDRY_API_URL =
            FOUNDRY_PROJECT_ENDPOINT +
            "/openai/v1/responses";


        // ----------------------------------------------------
        // VERIFICAÇÃO
        // ----------------------------------------------------

        if (
            !FOUNDRY_PROJECT_ENDPOINT
        ) {

            throw new Error(
                "FOUNDRY_PROJECT_ENDPOINT não foi encontrado no config.env."
            );
        }


        if (!FOUNDRY_MODEL) {

            throw new Error(
                "FOUNDRY_MODEL não foi encontrado no config.env."
            );
        }


        if (!FOUNDRY_API_KEY) {

            throw new Error(
                "FOUNDRY_API_KEY não foi encontrado no config.env."
            );
        }


        console.log(
            "================================"
        );

        console.log(
            "Gaijin Bot iniciado"
        );

        console.log(
            "Endpoint:",
            FOUNDRY_PROJECT_ENDPOINT
        );

        console.log(
            "Modelo:",
            FOUNDRY_MODEL
        );

        console.log(
            "API URL:",
            FOUNDRY_API_URL
        );

        console.log(
            "================================"
        );


        // ----------------------------------------------------
        // CRIAR PRIMEIRA CONVERSA
        // ----------------------------------------------------

        createNewConversation();


    } catch (erro) {

        console.error(
            "Erro ao iniciar o Gaijin Bot:",
            erro
        );


        // ----------------------------------------------------
        // MOSTRAR ERRO NA INTERFACE
        // ----------------------------------------------------

        if (messages) {

            messages.innerHTML = "";


            const errorMessage =
                document.createElement("div");

            errorMessage.classList.add(
                "message",
                "bot-message"
            );


            const errorIcon =
                document.createElement("img");

            errorIcon.src =
                "imagens/bot.jpeg";

            errorIcon.classList.add(
                "bot-message-icon"
            );

            errorIcon.alt =
                "Gaijin Bot";


            const errorBubble =
                document.createElement("div");

            errorBubble.classList.add(
                "message-bubble"
            );

            errorBubble.textContent =
                "Não foi possível iniciar o Gaijin Bot.\n\n" +
                erro.message;


            errorMessage.appendChild(
                errorIcon
            );

            errorMessage.appendChild(
                errorBubble
            );


            messages.appendChild(
                errorMessage
            );

        }

    }
}


// ============================================================
// INICIAR
// ============================================================

iniciarAplicacao();