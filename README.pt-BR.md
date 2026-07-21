# Agentic Workflows

Instale fluxos de engenharia inspecionáveis no Codex, Claude Code, Cursor, Gemini CLI, OpenCode ou em qualquer ferramenta capaz de seguir Markdown.

Agentic Workflows é um catálogo com 20 pacotes de fluxos orientados a evidências e uma CLI offline que os instala com segurança dentro de um projeto.
Ele oferece aos agentes de programação entradas, pré-requisitos, passos observáveis, decisões, aprovações, saídas esperadas e critérios de conclusão explícitos para tarefas como revisão de pull request, diagnóstico de CI, migrações, segurança, testes e documentação.

![Demonstração da CLI Agentic Workflows](docs/public/terminal-demo.svg)

[Read in English](README.md) | [Documentação](https://kauanpolydoro.github.io/agentic-workflows/) | [Catálogo de fluxos](https://kauanpolydoro.github.io/agentic-workflows/catalog/) | [Pacote npm](https://www.npmjs.com/package/@kauanpolydoro/agentic-workflows)

## Por que usar

- Comece por um procedimento completo e revisável em vez de reconstruir um prompt longo para cada tarefa.
- Visualize os arquivos e conteúdos exatos antes de instalar um fluxo.
- Exporte a mesma receita canônica para o formato local esperado por cada agente suportado.
- Atualize ou remova pacotes gerenciados sem descartar silenciosamente alterações locais.
- Mantenha validação estrutural, testes de instalação, execução por agente externo e revisão humana do resultado como estados de evidência separados.

Uma receita é um pacote de sete arquivos de dados e documentação, não um plugin executável.
A CLI serializa esse pacote para o agente escolhido e o grava localmente, mas nunca executa a receita nem concede permissão para os efeitos descritos por ela.

## Início rápido

O pacote público da CLI exige Node.js 22 ou superior.
Instale-o globalmente uma vez para disponibilizar `awf` em qualquer projeto:

```bash
npm install --global @kauanpolydoro/agentic-workflows
```

O exemplo a seguir para Codex começa sem configuração do projeto e termina com um fluxo instalado e inspecionável:

```bash
cd seu-projeto
awf context
awf init --agent codex
awf list
awf show review-pull-request
awf install review-pull-request --dry-run --show-content
awf install review-pull-request
awf status
```

`awf context` informa a raiz selecionada sem alterar arquivos.
`awf init --agent codex` grava as configurações do projeto em `.agentic-workflows/config.yml`.
A simulação mostra cada arquivo planejado e seu conteúdo gerado completo sem alterar o destino da instalação.
O segundo comando de instalação grava o pacote revisado e seu manifesto com hashes.

Confirme estes checkpoints antes de continuar:

| Depois de | Checkpoint esperado |
| --- | --- |
| `awf context` | `Project root:` identifica o projeto que você pretende modificar |
| `awf init --agent codex` | `Created .agentic-workflows/config.yml.` e `Default agent: codex` aparecem |
| A simulação da instalação | O plano termina com `No files were changed.` |
| A instalação real | `Installed review-pull-request for codex:` e `Invoke explicitly with: $review-pull-request` aparecem |
| `awf status` | O resumo informa uma instalação `healthy` |

Depois da instalação, invoque o fluxo explicitamente no Codex:

```text
$review-pull-request Revise o pull request #123 conforme seus critérios de aceite.
```

A saída de uma instalação bem-sucedida sempre informa o entrypoint e a política de invocação exatos.
Nos adaptadores que definem um comando de agente, ela também informa a invocação explícita exata.
O Markdown genérico não possui comando de agente, portanto seu entrypoint instalado é o documento que deve ser seguido manualmente.
Instalar o pacote não inicia um wizard nem modifica qualquer projeto.

Execute apenas `awf` para ver a ajuda de primeiro uso.
Execute apenas `awf init` em um terminal interativo para escolher o agente padrão e o destino em um wizard curto.
Use `awf init --wizard` para forçar as perguntas quando o ambiente não conseguir identificar um terminal interativo.
Informar `--agent`, `--target` ou `--no-interactive` ignora o wizard em scripts determinísticos e CI, e essas opções não podem ser combinadas com `--wizard`.

## Escolha um agente

Use o valor da segunda coluna com `awf init --agent <agent>` ou `awf install <workflow-id> --agent <agent>`.

| Destino | Valor do agente | Entrypoint instalado | Invocação explícita |
| --- | --- | --- | --- |
| Markdown genérico | `generic` | `.agentic-workflows/workflows/<workflow-id>/workflow.md` | Abra e siga manualmente o documento instalado |
| Claude Code | `claude-code` | `.claude/skills/<workflow-id>/SKILL.md` | `/<workflow-id>` |
| OpenAI Codex | `codex` | `.agents/skills/<workflow-id>/SKILL.md` | `$<workflow-id>` |
| Cursor | `cursor` | `.cursor/skills/<workflow-id>/SKILL.md` | `/<workflow-id>` |
| Gemini CLI | `gemini-cli` | `.gemini/commands/<workflow-id>.toml` | `/<workflow-id>` |
| OpenCode | `opencode` | `.opencode/commands/<workflow-id>.md` | `/<workflow-id>` |

Por exemplo, uma instalação de `review-pull-request` para Claude Code, Cursor, Gemini CLI ou OpenCode é invocada com:

```text
/review-pull-request Revise o pull request #123 conforme seus critérios de aceite.
```

Suportado significa que o formato foi confirmado, o exportador foi implementado e os testes locais dos contratos de geração e instalação passam.
Isso não significa que um agente externo executou o fluxo nem que uma pessoa revisou seu resultado.
Consulte as [fontes dos adaptadores](docs/research/adapter-sources.md) e a [matriz de compatibilidade gerada](docs/compatibility.md) para ver as evidências ativas exatas de cada status.

## Experimente sem instalação global

Use o escopo completo do pacote com qualquer um dos executores:

```bash
npx --yes @kauanpolydoro/agentic-workflows@latest list
bunx @kauanpolydoro/agentic-workflows list
```

O nome sem escopo `agentic-workflows` pertence a outro pacote no npm.
Mantenha `@kauanpolydoro/agentic-workflows` nos comandos com `npx` e `bunx`.
Esses exemplos com `@latest` destinam-se intencionalmente a avaliações pontuais, não a automações reproduzíveis.

Instale a versão exata do repositório e versione o manifesto e o lockfile resultantes para uso no projeto ou CI:

```bash
npm install --save-dev --save-exact @kauanpolydoro/agentic-workflows@0.2.0
npx awf context --json
npx awf list --json
```

Se `awf` não estiver disponível depois da instalação global, use o [guia de diagnóstico da instalação](docs/guide/installation.md#troubleshoot-installation) para verificar Node.js, prefixo do npm, `PATH` e permissões.

## Fluxos em destaque

- [`review-pull-request`](https://kauanpolydoro.github.io/agentic-workflows/catalog/review-pull-request) revisa correção, regressões, segurança, manutenibilidade e evidências de testes.
- [`debug-failing-ci`](https://kauanpolydoro.github.io/agentic-workflows/catalog/debug-failing-ci) parte do primeiro log causal, testa hipóteses refutáveis e chega a uma correção mínima.
- [`database-migration-review`](https://kauanpolydoro.github.io/agentic-workflows/catalog/database-migration-review) avalia locks, perda de dados, compatibilidade entre versões e recuperação do rollout.
- [`security-review`](https://kauanpolydoro.github.io/agentic-workflows/catalog/security-review) permanece estritamente defensivo e exige escopo autorizado explícito.

[Consulte todos os 20 fluxos](https://kauanpolydoro.github.io/agentic-workflows/catalog/) ou filtre-os localmente com `awf list --category <categoria>`, `--agent <agente>` ou `--tag <tag>`.

## Veja um resultado completo

A receita de referência `write-release-notes` inclui uma [entrada sintética e autocontida](recipes/write-release-notes/examples/input.md) e o [artefato completo de notas de versão esperado](recipes/write-release-notes/examples/expected-output.md).
Cada afirmação material da saída esperada aponta para um ID de evidência da entrada.
Esse par é uma referência editorial mantida no repositório, não uma evidência de execução da receita por um agente externo nem de aprovação de um resultado real.

A demonstração reproduzível também verifica as saídas de referência mantidas para `debug-failing-ci`, `review-pull-request` e `synchronize-documentation` contra seus contratos de saída.
Consulte o [registro das avaliações de referência](docs/launch/reference-evaluations.md) para ver a rastreabilidade das afirmações e o limite explícito da verificação.

## Como funciona

1. Inspecione o Markdown canônico e os metadados YAML estritos em `recipes/`.
2. Peça ao `awf` para serializar uma receita para o agente escolhido e simular o plano de ciclo de vida resultante.
3. Instale o pacote revisado dentro da raiz de projeto selecionada.
4. Use o manifesto e os hashes retidos para verificar status, atualizar ou remover com segurança.
5. Registre separadamente a execução por agente externo e a evidência de revisão humana quando essas atividades realmente ocorrerem.

O repositório mantém cada responsabilidade explícita:

| Local | Responsabilidade |
| --- | --- |
| `recipes/` | Dados canônicos das receitas em YAML e Markdown |
| `packages/core/` | Schemas, parsing, segurança de caminhos, hashes, manifestos, filtros, compatibilidade e serialização dos adaptadores |
| `packages/cli/` | Interação com terminal e orquestração do ciclo de vida no sistema de arquivos local |
| `scripts/generate.ts` | Geração de JSON Schema, catálogo JSON, páginas dos fluxos e documentação de compatibilidade |

## Segurança e verificação

A CLI opera offline durante o uso normal, não possui telemetria e nunca executa as instruções das receitas.
Ela valida contenção no projeto, diretórios-pai com links simbólicos, intenção de sobrescrita e hashes de arquivos gerenciados nas condições locais testadas.
Ela se recusa a sobrescrever arquivos não gerenciados ou remover silenciosamente arquivos gerenciados que foram modificados.
Esses controles não formam uma barreira de segurança contra um processo privilegiado que altere o sistema de arquivos simultaneamente.

O projeto informa quatro estágios independentes de verificação:

| Estágio | O que comprova |
| --- | --- |
| Validação estrutural | A receita satisfaz seu schema e contrato de diretório |
| Teste de instalação | O ciclo de vida da CLI funciona em um destino descartável |
| Execução por agente externo | Uma versão identificada do agente realmente executou o fluxo |
| Revisão humana do resultado | Uma pessoa avaliou o resultado conforme os critérios de conclusão |

Nenhum adaptador de agente externo possui atualmente evidência ativa que promova execução externa ou revisão humana do resultado para aprovado.
O Markdown genérico informa parsing pelo consumidor, execução externa e revisão do resultado como `not-applicable`, pois ele é documentação e não uma integração com agente.
Evidências históricas do Claude Code e Codex permanecem retidas no arquivo, mas o commit de origem saiu do repositório durante o reset intencional do histórico e elas não são evidências ativas.
Testes aprovados no repositório não substituem uma execução por agente externo.

## Referência da CLI

| Comando | Finalidade |
| --- | --- |
| `awf context` | Explicar qual raiz de projeto foi selecionada e por quê |
| `awf list` | Descobrir e filtrar os fluxos incluídos |
| `awf show <workflow-id>` | Inspecionar metadados, Markdown bruto ou documentação local correspondente à versão |
| `awf install <workflow-id>` | Simular ou instalar um pacote específico para um agente |
| `awf status [workflow-id]` | Informar instalações locais saudáveis, divergentes ou inválidas |
| `awf update <workflow-id>` | Simular ou aplicar uma atualização protegendo alterações locais |
| `awf remove <workflow-id>` | Simular ou remover arquivos gerenciados protegendo alterações locais |
| `awf validate [path]` | Validar catálogo, receita, manifesto ou destino de instalação |
| `awf doctor` | Diagnosticar configuração, catálogo, instalações e estado de recuperação |
| `awf init` | Configurar padrões do projeto de forma interativa ou determinística |
| `awf manifest <workflow-id>` | Exibir o manifesto instalado exato |
| `awf completion <shell>` | Gerar autocomplete para Bash, Zsh, Fish ou PowerShell |

`awf show <workflow-id> --open` pede ao manipulador nativo de documentos do sistema operacional para abrir a página local correspondente à versão.
O comando não promete que esse manipulador seja um navegador web.

A saída legível por pessoas é o padrão.
Os comandos legíveis por máquina usam contratos JSON versionados, e automações devem validá-los pelo export público `@kauanpolydoro/agentic-workflows/output-contract`.

| Código de saída | Significado |
| --- | --- |
| `0` | Sucesso, incluindo relatórios saudáveis ou somente com avisos |
| `1` | Falha operacional, falha de validação ou relatório não saudável |
| `2` | Sintaxe inválida ou opções incompatíveis |
| `130` ou `143` | Interrupção POSIX por `SIGINT` ou `SIGTERM` |

Execute `awf <comando> --help` para ver as opções específicas do comando.
Leia a [referência completa da CLI](docs/guide/cli-reference.md) para conhecer filtros, streams JSON, semântica do ciclo de vida e detalhes dos códigos de saída.

Gere autocomplete com `awf completion bash`, `awf completion zsh`, `awf completion fish` ou `awf completion pwsh`.
Adicione `--install-instructions` para imprimir instruções de configuração persistente sem modificar o perfil do shell.

## Desenvolvimento e contribuição

Clone o repositório-fonte por HTTPS e faça o build antes de invocar a CLI local:

```bash
git clone https://github.com/kauanpolydoro/agentic-workflows.git
cd agentic-workflows
corepack enable
pnpm install --frozen-lockfile
pnpm build
pnpm awf list
pnpm awf show review-pull-request
```

`pnpm awf` executa a saída compilada, portanto `pnpm build` é obrigatório depois de um clone novo.
Os arquivos-fonte disponibilizados pelo GitHub também exigem instalação das dependências e build.
O arquivo da CLI para npm é produzido com `pnpm --filter @kauanpolydoro/agentic-workflows pack` e contém a CLI compilada, o catálogo incluído e a documentação offline correspondente à versão.

Crie o esqueleto de uma receita com:

```bash
pnpm new:recipe meu-fluxo
```

Cada receita completa contém `recipe.yml`, `workflow.md`, `checklist.md`, `README.md`, `output.schema.json`, `examples/input.md` e `examples/expected-output.md`.
Substitua todos os marcadores, use exemplos originais, declare suporte honestamente e siga o [padrão de qualidade das receitas](docs/quality/recipe-quality-standard.md).
O [guia de contribuição](CONTRIBUTING.md) é a fonte oficial para a suíte completa de validação exigida antes da entrega.

O `README.md` da raiz é a fonte canônica do pacote da CLI.
O build o copia para o arquivo publicado no npm, mantendo as páginas iniciais do GitHub e do npm sincronizadas em cada versão publicada.
Os testes de contrato comparam o mapa de seções e os comandos de primeiro uso entre os dois idiomas, enquanto o teste do pacote compara byte por byte o README em inglês empacotado com esta fonte.

## Mapa da documentação

| Necessidade | Recurso |
| --- | --- |
| Instalar ou diagnosticar a CLI | [Guia de instalação](docs/guide/installation.md) |
| Consultar todas as opções e saídas da CLI | [Referência da CLI](docs/guide/cli-reference.md) |
| Validar JSON em automações | [Contratos de saída](docs/guide/output-contracts.md) |
| Entender os estados de evidência | [Modelo de verificação](docs/guide/verification.md) |
| Criar ou revisar uma receita | [Guia de autoria](docs/guide/authoring.md) |
| Comparar o suporte dos agentes | [Matriz de compatibilidade](docs/compatibility.md) |
| Contribuir com alterações | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Reportar uma vulnerabilidade de forma privada | [SECURITY.md](SECURITY.md) |
| Ver entregas e planos | [CHANGELOG.md](CHANGELOG.md) e [ROADMAP.md](ROADMAP.md) |

## Status do projeto

A CLI e o núcleo compartilhado estão públicos no npm.
As releases são acionadas por tags e usam publicação confiável do npm, proveniência, testes do pacote e verificação de integridade antes da sincronização da release no GitHub.
O teste do pacote comprova que o tarball contém este README exato, e a verificação de `dist.integrity` do registro cobre o tarball publicado completo.
O GitHub pode exibir primeiro alterações ainda não publicadas, pois a página inicial do npm só muda quando uma nova versão contendo esses bytes é publicada.
Consulte o [changelog](CHANGELOG.md) e o [processo de release](RELEASING.md) para conhecer a versão atual e o contrato de entrega.

Receitas são dados e documentação não confiáveis.
Revise uma receita antes de pedir que um agente a siga e use o processo privado em [SECURITY.md](SECURITY.md) para reportar vulnerabilidades.

Distribuído sob a [Licença MIT](LICENSE).
