# Agentic Workflows

Pacotes de fluxos de trabalho orientados a evidências e exportadores verificados localmente para agentes de programação com IA.

Use procedimentos estruturados para revisão de código, diagnóstico de CI, migrações, segurança, testes, documentação e manutenção em diferentes agentes de programação.

![Demonstração da CLI Agentic Workflows](docs/public/terminal-demo.svg)

Agentic Workflows é um catálogo estruturado com instalador offline, não uma lista de prompts soltos.
As receitas são dados e documentação, e a CLI nunca executa suas instruções.
Cada receita declara entradas, pré-condições, passos observáveis, decisões, proteções de segurança, aprovações humanas, saídas, critérios de conclusão, exemplos, status dos adaptadores e estágios independentes de verificação.

[Leia em inglês](README.md)

## Início rápido

Execute a CLI publicada sem instalação global:

```bash
npx --yes @kauanpolydoro/agentic-workflows@latest list
npx --yes @kauanpolydoro/agentic-workflows@latest show review-pull-request
```

Para fixar a CLI nas dependências de um projeto:

```bash
npm install --save-dev @kauanpolydoro/agentic-workflows
npx agentic-workflows list
```

O [pacote da CLI](https://www.npmjs.com/package/@kauanpolydoro/agentic-workflows) e o [núcleo compartilhado](https://www.npmjs.com/package/@kauanpolydoro/agentic-workflows-core) estão públicos no npm.

Para desenvolver a partir do código-fonte, clone o repositório por HTTPS e execute a CLI local:

```bash
git clone https://github.com/kauanpolydoro/agentic-workflows.git
cd agentic-workflows
corepack enable
pnpm install --frozen-lockfile
pnpm build
pnpm validate
pnpm awf list
pnpm awf show review-pull-request
```

Use `git@github.com:kauanpolydoro/agentic-workflows.git` apenas quando suas credenciais SSH já estiverem configuradas.

Simule uma instalação sem escrever arquivos:

```bash
pnpm awf install review-pull-request --agent generic --dry-run
```

## Veja um resultado completo

A receita de referência `write-release-notes` inclui uma [entrada sintética e autocontida](recipes/write-release-notes/examples/input.md) e o [artefato completo de notas de versão esperado](recipes/write-release-notes/examples/expected-output.md).
Cada afirmação material da saída esperada aponta para um ID de evidência da entrada.
Esse par é uma referência editorial mantida no repositório, não uma evidência de execução por agente externo nem de aprovação de um resultado real.

A demonstração reproduzível também avalia as saídas de referência mantidas para `debug-failing-ci`, `review-pull-request` e `synchronize-documentation` contra seus contratos de saída.
Consulte o [registro das avaliações de referência](docs/launch/reference-evaluations.md) para ver a rastreabilidade das afirmações e o limite explícito da verificação.

## O que diferencia o projeto

- Vinte fluxos de trabalho completos com contratos e listas de verificação operacionais.
- Representação canônica em Markdown e exportações específicas por agente.
- CLI offline com manifestos, hashes e proteção contra sobrescrita.
- Esquemas estritos, JSON Schema e geração automatizada do catálogo.
- Verificação transparente, separando estrutura, instalação, execução e resultado.
- Site VitePress pesquisável, sem ferramentas de análise, cookies ou fontes externas obrigatórias.

## Compatibilidade

Markdown genérico, Claude Code, OpenAI Codex, Cursor, Gemini CLI e OpenCode possuem exportações suportadas com base em documentação oficial.
Os artefatos históricos de execução de `review-pull-request` no Claude Code e no Codex estão arquivados, mas não promovem um status atual porque o commit de origem saiu do histórico durante o reset intencional.
Todos os agentes permanecem sem execução externa verificável no histórico atual, e nenhum resultado possui revisão humana.

“Suportado” descreve o formato gerado.
Não significa que um agente externo executou o fluxo de trabalho nem que o resultado foi revisado.

Consulte o [site com o catálogo completo](https://kauanpolydoro.github.io/agentic-workflows/catalog/), a [matriz de compatibilidade](docs/compatibility.md) e as [fontes dos adaptadores](docs/research/adapter-sources.md).

## Segurança

Receitas são dados e documentação não confiáveis, nunca plugins executáveis.
A CLI não usa telemetria, não faz chamadas de rede no uso normal e bloqueia travessia de diretório, caminhos absolutos, links simbólicos inseguros, sobrescrita silenciosa e remoção de arquivos modificados.

Leia [SECURITY.md](SECURITY.md) antes de reportar uma vulnerabilidade.

## Contribuição

Use `pnpm new:recipe my-workflow`, substitua todos os marcadores e valide localmente.
O processo completo está em [CONTRIBUTING.md](CONTRIBUTING.md).

Distribuído sob a [Licença MIT](LICENSE).

Adicione o repositório aos favoritos para acompanhar novos fluxos de trabalho.
