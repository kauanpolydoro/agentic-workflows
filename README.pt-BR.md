# Agentic Workflows

Pacotes de fluxos de trabalho orientados a evidências e exportadores verificados localmente para agentes de programação com IA.

Use procedimentos estruturados para revisão de código, diagnóstico de CI, migrações, segurança, testes, documentação e manutenção em diferentes agentes de programação.

![Demonstração da CLI Agentic Workflows](docs/public/terminal-demo.svg)

Agentic Workflows é um catálogo estruturado com instalador offline, não uma lista de prompts soltos.
As receitas são dados e documentação, e a CLI nunca executa suas instruções.
Cada receita declara entradas, pré-condições, passos observáveis, decisões, proteções de segurança, aprovações humanas, saídas, critérios de conclusão, exemplos, status dos adaptadores e estágios independentes de verificação.

[Leia em inglês](README.md)

## Início rápido

O pacote público da CLI exige Node.js 22 ou superior.
Para uso frequente, instale-o globalmente uma vez:

```bash
npm install --global @kauanpolydoro/agentic-workflows
```

O comando curto `awf` passa a funcionar em qualquer projeto:

```bash
awf
awf list
awf show review-pull-request
```

Na raiz do projeto que receberá o fluxo, salve o agente padrão e simule a instalação antes de escrever arquivos:

```bash
awf init --agent codex
awf install review-pull-request --dry-run
awf install review-pull-request --dry-run --show-content
```

A primeira simulação lista cada criação, substituição e retirada prevista.
Adicione `--show-content` quando também quiser inspecionar o conteúdo completo dos arquivos gerados.
Remova `--dry-run` depois de revisar o plano.

Depois da instalação, verifique a saúde dos arquivos gerenciados com:

```bash
awf status
```

Para experimentar a versão mais recente sem instalação global, mantenha o escopo completo do pacote:

```bash
npx --yes @kauanpolydoro/agentic-workflows@latest list
bunx @kauanpolydoro/agentic-workflows list
```

O nome sem escopo `agentic-workflows` pertence a outro pacote no npm.

Para fixar a versão da CLI em um projeto ou ambiente de CI:

```bash
npm install --save-dev @kauanpolydoro/agentic-workflows
npx awf list
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
