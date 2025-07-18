# Estocaí - Sistema de Gerenciamento de Estoque

Bem-vindo ao **Estocaí**! Este é um sistema de gerenciamento de estoque projetado para ser executado em um ambiente de desenvolvimento local.

## Pré-requisitos

Para executar o sistema em sua máquina, você precisará ter instalado:

-   [**Node.js**](https://nodejs.org/en/)
-   [**npm**](https://www.npmjs.com/) (Node Package Manager), que é instalado junto com o Node.js.

## 🚀 Como Executar o Projeto

O processo envolve a execução simultânea do back-end (servidor) e do front-end (interface do usuário), cada um em seu próprio terminal.

### Passos Iniciais

1.  **Clone o Repositório:** Se ainda não o fez, clone o repositório do projeto para a sua máquina local.
    ```bash
    git clone https://github.com/serginnn/Estoque
    ```
2.  **Abra o Projeto:** Abra a pasta raiz do projeto no seu editor de código (ex: Visual Studio Code).

3.  **Abra Dois Terminais:** É crucial que o back-end e o front-end rodem ao mesmo tempo. Para isso, abra dois terminais integrados no seu editor. No VS Code, você pode fazer isso indo em `Terminal > New Terminal` duas vezes.

---

### 🖥️ **Terminal 1: Executando o Back-end (Servidor)**

No primeiro terminal, siga estes passos para iniciar o servidor da aplicação:

1.  Navegue até a pasta do back-end:
    ```bash
    cd backend
    ```

2.  Instale as dependências necessárias para o servidor:
    ```bash
    npm install express cors sqlite3
    ```

3.  Inicie o servidor:
    ```bash
    node server.js
    ```

Após executar o último comando, uma mensagem indicando que o servidor está rodando (geralmente em `http://localhost:3000`) deverá aparecer. **Deixe este terminal aberto e em execução.**

---

### 🎨 **Terminal 2: Executando o Front-end (Interface do Usuário)**

No segundo terminal, siga estes passos para iniciar a interface da aplicação:

1.  Navegue até a pasta do front-end:
    ```bash
    cd frontend
    ```

2.  Instale todas as dependências do projeto front-end:
    ```bash
    npm install
    ```

3.  Execute o comando para iniciar o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

O terminal fornecerá uma URL local (como `http://localhost:5173`). Abra esta URL no seu navegador de internet para acessar e utilizar a aplicação.

---

Com os dois terminais rodando conforme as instruções, o sistema estará totalmente funcional para uso e desenvolvimento.
