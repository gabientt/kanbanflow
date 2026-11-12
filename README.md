# KanbanFlow

Aplicação web de gerenciamento de tarefas baseada na metodologia ágil Kanban, desenvolvida com foco em organização visual de fluxo de trabalho, definição de prioridades e mecânicas de gamificação para incentivo à consistência diária.

---

## Visão Geral do Projeto

O KanbanFlow foi projetado para oferecer uma interface minimalista, responsiva e de baixa fricção para o controle de atividades pessoais ou de pequenas equipes. O sistema permite a gestão visual do ciclo de vida das tarefas através de colunas de status, categorização por níveis de urgência e acompanhamento de métricas de engajamento contínuo por meio de um sistema de ofensiva diária (Daily Streak).

Toda a arquitetura foi construída utilizando tecnologias web nativas e estilização utilitária, dispensando dependências de back-end ou bancos de dados externos ao operar com persistência local diretamente no navegador do cliente.

---

## Funcionalidades Principais

* **Quadro Kanban Interativo:** Organização do fluxo de trabalho em três estágios fundamentais: *A Fazer*, *Fazendo* e *Concluído*, com suporte nativo a arrastar e soltar (Drag and Drop) entre as colunas.
* **Sistema de Priorização:** Classificação visual de tarefas em três níveis (*Baixa*, *Média* e *Alta*), identificados por marcadores cromáticos e bordas superiores dedicadas para rápida leitura de urgência.
* **Ofensiva Diária (Daily Streak):** Contador de consistência integrado ao cabeçalho da aplicação. O algoritmo monitora a conclusão diária de tarefas, incrementando a contagem em dias consecutivos e reiniciando o ciclo caso ocorra interrupção na atividade.
* **Feedback Visual e Recompensa:** Execução de animações programáticas em tela (efeito de confetes via Canvas API) e notificações temporárias (Toasts) ao finalizar tarefas, reforçando a experiência de uso.
* **Persistência de Estado:** Armazenamento automático de tarefas, colunas, histórico de ofensiva e registros temporais no navegador, garantindo a integridade dos dados após recarregamentos ou fechamento da sessão.
* **Interface Responsiva e Tema Neutro:** Design adaptado para diferentes resoluções de tela, construído sobre uma paleta de tons escuros neutros (grafite/carvão) para conforto visual.

---

## Tecnologias Utilizadas

* **HTML5 Semântico:** Estruturação acessível da página utilizando elementos semânticos (`header`, `main`, `section`, `form`) e integração com a API de Canvas.
* **CSS3 Customizado:** Definição de animações (`@keyframes`), transições de estado, pseudoelementos (`::before`) para indicadores visuais e personalização de barras de rolagem.
* **Tailwind CSS (via CDN):** Estilização utilitária para construção de layout em grid responsivo, espaçamentos, tipografia e controle de contraste.
* **JavaScript Vanilla (ES6+):** Implementação integral da lógica de negócios, manipulação dinâmica do DOM, gerenciamento de eventos e controle de estado em memória.
* **Web Storage API (LocalStorage):** Serialização e desserialização de objetos JSON para persistência local de dados.
* **HTML5 Drag and Drop API:** Gerenciamento nativo de eventos de arraste (`dragstart`, `dragover`, `drop`) para movimentação fluida dos cartões.

---

## Arquitetura e Funções Relevantes

O código JavaScript (`app.js`) foi modularizado em responsabilidades claras para facilitar a leitura e manutenção:

* **Gerenciamento de Estado (`saveState` e `loadState`):** Sincronizam o estado global da aplicação com o `localStorage` utilizando blocos de tratamento de exceções (`try...catch`) para prevenir falhas de leitura ou escrita.
* **Lógica Temporal (`todayISO`, `yesterdayISO` e `formatDate`):** Realizam a normalização de datas no formato ISO (`YYYY-MM-DD`) para comparação precisa de dias consecutivos no cálculo da ofensiva, evitando inconsistências de fuso horário, além da formatação localizada para exibição nos cartões.
* **Identificação e Segurança (`uid` e `esc`):** Geração de identificadores únicos combinando timestamp em base 36 com valores pseudoaleatórios, acompanhada de função de sanitização de strings para prevenção de ataques XSS (Cross-Site Scripting) durante a renderização dinâmica de HTML.
* **Renderização Dinâmica (`cardHTML` e `emptyStateHTML`):** Construção programática dos componentes de interface com base no estado atual das colunas, incluindo estados vazios informativos.
* **Renderização Gráfica (`launchConfetti`):** Manipulação de contexto 2D (`getContext('2d')`) no elemento `<canvas>` para cálculo de física básica e renderização de partículas animadas.

---

## Competências Técnicas Desenvolvidas

* **Engenharia de Front-End sem Frameworks:** Domínio aprofundado da manipulação nativa do DOM, ciclos de eventos do navegador e gerenciamento de estado puro em JavaScript.
* **Persistência e Integridade de Dados no Cliente:** Estruturação de modelos de dados em JSON, validação de tipos na inicialização e tratamento defensivo contra corrupção de armazenamento local.
* **Design de Interface e Experiência do Usuário (UI/UX):** Aplicação de princípios de hierarquia visual, contraste acessível em temas escuros, microinterações e feedback imediato ao usuário.
* **Segurança em Aplicações Web:** Prevenção de injeção de código malicioso em entradas de formulário através do escape adequado de caracteres antes da inserção no DOM.
* **Controle de Versão e Fluxo Git:** Organização de repositório, padronização de mensagens de commit e configuração de privacidade de credenciais.

---
