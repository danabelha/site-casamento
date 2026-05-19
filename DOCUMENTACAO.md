# Documentação do Site de Casamento - Mariana & Daniel

Este documento detalha os aspectos de negócio e técnicos do site de casamento, servindo como guia para usuários e desenvolvedores.

---

## 1. Documentação de Negócio

### 1.1. Objetivo do Projeto
O site foi desenvolvido para centralizar as informações do casamento de **Mariana & Daniel**, facilitando a comunicação com os convidados e automatizando o processo de confirmação de presença (RSVP).

### 1.2. Principais Funcionalidades
*   **Página Home:** Apresentação visual com contagem regressiva para o evento (05 de Dezembro de 2026).
*   **Verificação de Convidados:** Sistema de busca nominal para garantir que apenas convidados listados possam confirmar presença.
*   **Confirmação de Presença (RSVP):** 
    *   Fluxo personalizado de confirmação.
    *   Gestão de acompanhantes (adultos e crianças) com limites pré-definidos.
    *   Espaço para mensagens carinhosas aos noivos.
*   **Nossa História:** Galeria de fotos e textos contando a trajetória do casal.
*   **Localização:** Integração com Google Maps para facilitar o deslocamento até o local do evento (**Celeiro Quintal**).
*   **Lista de Presentes:** Mural interativo no estilo **Polaroid** com sugestões de presentes e integração para pagamentos via PIX.
*   **Manual do Convidado:** Guia de etiqueta e informações úteis (Dress Code, horários, etc.).
*   **Painel Administrativo:** Área restrita para os noivos gerenciarem a lista de convidados, visualizarem estatísticas em tempo real e exportarem dados.

### 1.3. Identidade Visual
O site utiliza uma paleta de cores sofisticada e minimalista:
*   **Creme (#FDFAF6):** Cor principal de fundo, trazendo leveza.
*   **Marrom (#462F29):** Utilizado em seções de destaque e textos principais.
*   **Dourado (#C9A96E):** Utilizado em detalhes, botões e elementos de luxo.
*   **Tipografia:** Combinação de fontes modernas (Montserrat) com fontes caligráficas (Halimun) para um toque pessoal.

---

## 2. Documentação Técnica

### 2.1. Arquitetura de Software
O projeto segue uma arquitetura **Fullstack** moderna utilizando um monorepo:
*   **Frontend:** Single Page Application (SPA) focada em performance e UX.
*   **Backend:** API baseada em procedimentos (RPC) para comunicação eficiente.
*   **Integração:** Sincronização direta com **Google Sheets** como banco de dados principal, facilitando a edição manual pelos noivos se necessário.

### 2.2. Tecnologias Utilizadas
*   **Frontend:** React 18, Vite, Tailwind CSS (estilização), Framer Motion (animações).
*   **Backend:** Node.js, Express, tRPC (comunicação segura e tipada).
*   **Banco de Dados:** Google Sheets API (via `google-spreadsheet`).
*   **Linguagem:** TypeScript (garantindo robustez e menos erros em tempo de execução).

### 2.3. Estrutura de Pastas
```text
/
├── client/                 # Código do Frontend (React)
│   ├── src/
│   │   ├── assets/         # Imagens, fontes e ícones
│   │   ├── components/     # Componentes reutilizáveis
│   │   ├── pages/          # Páginas principais (Home, Confirmacao, Admin)
│   │   └── lib/            # Configurações de clientes (tRPC)
├── server/                 # Código do Backend (Node.js)
│   ├── googleSheets.ts     # Lógica de integração com a planilha
│   ├── router.ts           # Definição das rotas e procedimentos tRPC
│   └── index.ts            # Ponto de entrada do servidor
```

### 2.4. Gestão de Dados (Google Sheets)
Os dados são lidos e escritos em uma planilha do Google. As colunas principais incluem:
*   `id`, `nome`, `status` (Confirmado/Pendente/Não Irá), `acompanhantes`, `criancas`, `limite`, `mensagem`.

### 2.5. Segurança
*   **Admin:** O acesso ao Painel Administrativo é protegido por uma senha definida em variáveis de ambiente (`ADMIN_PASSWORD`).
*   **Validação:** Todas as entradas de dados são validadas no backend utilizando a biblioteca **Zod**.

### 2.6. Manutenção e Evolução
*   **Novos Convidados:** Podem ser adicionados via Painel Admin ou diretamente na planilha.
*   **Imagens:** Estão localizadas em `client/src/assets/images/`. Para trocar, basta substituir os arquivos mantendo os nomes originais ou atualizar as referências no código.

---
**Desenvolvido com carinho para Mariana & Daniel.**
