# Gaijin Bot

Gaijin Bot é uma interface web de chat desenvolvida para funcionar como um assistente de conversação integrado a modelos de IA. O projeto possui uma interface própria, histórico de conversas durante a execução, integração com o Microsoft Foundry/Azure para geração das respostas e integração com o ElevenLabs para leitura das respostas em voz.

## 📌 Status atual

O projeto está em desenvolvimento.

Atualmente, o Gaijin Bot possui:

- Interface de chat responsiva.
- Tema escuro e tema claro.
- Sidebar retrátil.
- Botão para iniciar uma nova conversa.
- Histórico de conversas mantido apenas durante a execução da página.
- Troca entre conversas existentes durante a execução.
- Integração com a API compatível com OpenAI do Microsoft Foundry.
- Prompt base enviado como `instructions` para o modelo.
- Respostas da IA exibidas no chat.
- Configuração das credenciais por meio de `config.env`.
- Estrutura preparada para versionamento com Git.

Em estado de desenvolvimento:
- Integração com ElevenLabs para conversão das respostas em áudio.
- Botão de reprodução de áudio nas respostas do bot.

> ⚠️ O histórico das conversas não é persistido. Ao recarregar ou fechar a página, as conversas são perdidas.

## 🖥️ Tecnologias utilizadas

O projeto atualmente utiliza:

- HTML5
- CSS3
- JavaScript
- Material Symbols
- Microsoft Foundry / Azure AI
- API compatível com OpenAI Responses API
- ElevenLabs Text-to-Speech
- Git

Não é necessário utilizar Node.js, `dotenv` ou outro pacote para carregar o arquivo `config.env`. O projeto atualmente lê o arquivo diretamente pelo navegador usando `fetch()`.

## 📂 Estrutura do projeto

Uma estrutura básica do projeto é:

```text
Gaijin Bot/
├── index.html
├── style.css
├── script.js
├── config.env
├── .gitignore
├── README.md
└── imagens/
    └── bot.jpeg
