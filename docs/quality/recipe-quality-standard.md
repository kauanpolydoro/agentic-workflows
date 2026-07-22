# Recipe quality standard

This standard defines when an Agentic Workflows recipe is ready to publish.
If you are writing or reviewing a recipe, this is the document that tells you what "done" means.

It applies to recipe metadata, the canonical workflow, the execution checklist, the individual README, the examples, adapter declarations, generated catalog content, and verification claims.
The intended readers are recipe authors, repository maintainers, domain reviewers, and adapter maintainers.

## Publication gate

A recipe is ready only when all required files exist, deterministic validation passes, and a human reviewer completes the editorial review in this document.
A structurally valid recipe is not necessarily operational, derivable, safe, or ready to publish.

Use these final review states:

| State | Meaning |
| --- | --- |
| `pass` | Every applicable requirement is satisfied and supported by retained evidence. |
| `needs-work` | At least one applicable requirement can be corrected within the repository. |
| `blocked` | Required evidence or approval is unavailable and the recipe cannot be reviewed honestly. |
| `not-applicable` | The requirement does not apply, and the audit records why. |

Do not assign `pass` while an applicable item is `needs-work` or `blocked`.
An unavailable external-agent run does not block structural readiness when the exporter and installation contract are valid, but execution and outcome must remain untested.

## Readiness principles

1. The expected result must be derivable from the supplied inputs.
2. Every material claim must map to identified evidence.
3. Workflow steps must describe observable actions and intermediate results.
4. Decision points must state an explicit condition and its resulting action.
5. Every failure mode must map to a recovery procedure.
6. Checklists must prevent execution omissions instead of repeating workflow prose.
7. Examples must be synthetic, realistic, self-contained, and explicit about what was or was not executed.
8. Expected outputs must be complete examples of the promised artifact.
9. Export compatibility does not imply agent execution or outcome verification.
10. Every recipe must contain domain-specific evidence, decisions, safety controls, and completion criteria.
11. Verification status must never be stronger than the retained evidence.
12. An individual README must orient a new user without requiring them to open every other file first.

Length does not establish quality.
Do not inflate superficial content, copy generic workflows between domains, or reuse paragraphs when the relevant evidence, decisions, risks, and recovery actions differ.

## Required recipe bundle

Every recipe directory contains these files:

| File | Purpose | Ready when |
| --- | --- | --- |
| `recipe.yml` | Machine-readable identity, scope, risk, compatibility, and verification metadata | Every declaration agrees with the other recipe files and repository registries. |
| `workflow.md` | Canonical operating procedure | Every required section is non-empty, domain-specific, and executable from the declared inputs. |
| `checklist.md` | In-execution control | The items expose consequential omissions without copying the workflow. |
| `README.md` | User orientation | A new user can decide whether and how to use the recipe before reading the canonical workflow. |
| `output.schema.json` | Machine-validatable output contract | The contract requires populated domain artifacts, non-empty required sections, populated tables where declared, and evidence-reference rules. |
| `examples/input.md` | Self-contained synthetic evidence set | The expected output can be produced without external or implicit facts. |
| `examples/expected-output.md` | Complete reference artifact | Every material claim is traceable to the input and the artifact satisfies the workflow output contract. |

The `canonical.file` path declared by metadata must exist and identify the authoritative workflow.
Generated catalog pages are derived artifacts and must be regenerated through the repository generator after source content changes.

## Metadata requirements

Keep `recipe.yml` concise, precise, and consistent with the workflow.
Do not turn metadata into a duplicate of the procedure.

| Field or concern | Ready criterion |
| --- | --- |
| Identity | `id` exactly matches the directory, the title is specific, and the summary names an observable result. |
| Classification | Category describes the actual domain, execution mode describes expected human interaction, tags improve discovery, and difficulty reflects the procedure rather than document length. |
| Risk and duration | Risk matches the possible impact, and duration is explicitly approximate and plausible for the declared scope. |
| Inputs | Each input names concrete data such as immutable revisions, complete logs, contracts, measurements, commands, files, or records. |
| Outputs | Each output names a concrete artifact represented in `workflow.md`. |
| Preconditions | Every prerequisite can be checked before execution. |
| Safety | Forbidden actions and approvals are specific to the recipe and represented in the workflow guardrails and gates. |
| Ownership | Maintainers resolve to identities defined by the repository, and the declared license exists. |
| Adapters | Agent IDs resolve to the central adapter registry, and recipe-specific limitations do not contradict global capabilities. |
| Verification | Status, version, date, and evidence fields describe only checks that actually occurred. |

Increment the recipe version whenever any of its seven source files changes.
A schema-only metadata migration still changes the bundle identity and must not reuse the previous recipe version.

### Autonomous execution mode

Use `execution_mode: autonomous` only when the workflow's normal path requires no human response after explicit invocation and one complete upfront authorization.
The required `autonomy` object is a strict baseline contract rather than evidence that any agent has executed the workflow.

An autonomous recipe is ready for editorial review only when all of these conditions hold:

- Every normal-path mutation, approval, limit, protected domain, and policy decision is covered by the upfront authorization.
- The declared failure policy fits the workflow shape: item-oriented campaigns defer only the affected item and continue eligible work, while atomic workflows fail closed and checkpoint without inventing an item queue.
- The workflow defines a finite scope or bounded intake cutoff, an absolute hard deadline, a positive shutdown reserve, and an observable owner-bound stop signal.
- The stop signal is checked before every consequential mutation and at a bounded interval during polling or long-running work.
- Durable state records expected prior state, mutation intent, idempotency key, remote confirmation, ownership, retries, and the next safe transition.
- Resume begins with read-only reconciliation and never blindly repeats an uncertain mutation.
- Parallel workers have isolated mutable resources, explicit leases, bounded concurrency, conflict serialization, and a single owner for shared state.
- Global circuit breakers stop mutations for lost authority, state corruption, ambiguous external mutation, systemic failure, security risk, or unsafe downstream effects.
- Item-oriented terminal states distinguish complete exhaustion from user stop, deadline, circuit breaker, deferred work, and unattempted work; atomic workflows instead distinguish complete, failed, interrupted, cleanup-pending, and ambiguous effects without inventing a queue.
- An item-oriented final output reconciles resolution, deferred, active, queued, unattempted, cleanup-pending, and out-of-scope counts without overstating completion.
- An atomic final output reconciles completed, pending, failed, ambiguous, cleanup, and recovery states for its declared steps and effects.
- The README states that the recipe is an instruction bundle and names every unverified host capability needed for unattended execution.

If a human response is required on the normal path, classify the recipe as `supervised`.
If the host capability has not been demonstrated by a retained external run, keep execution and outcome status `untested` even when the design is autonomous.

Avoid inputs such as `repository data`, `relevant files`, `project information`, `change records`, or `logs` unless the description states exactly which records, boundaries, fields, and integrity checks are required.

## Canonical workflow requirements

Every `workflow.md` contains these non-empty sections in this order:

1. Objective
2. When to use
3. When not to use
4. Required inputs
5. Optional inputs
6. Preconditions
7. Workflow
8. Decision points
9. Safety guardrails
10. Human approval gates
11. Expected output
12. Completion criteria
13. Failure modes
14. Recovery procedure
15. Example

### Objective

State the transformation performed, the artifact produced, and the primary quality constraint.

### Usage boundaries

`When to use` describes concrete situations that require this procedure.
`When not to use` describes genuine exclusion conditions, such as insufficient evidence, unresolved scope, an unsuitable environment, absent approval, uncontrolled risk, an unstable source artifact, or a request owned by another workflow.
Writing advice does not belong in `When not to use`.

### Inputs and preconditions

For each required input, state what it is, its expected format or an example, why the procedure needs it, and how to validate its integrity.
For each optional input, state how it changes or improves the result.
Preconditions must be binary or otherwise objectively verifiable before work begins.
Stop when a required input or precondition cannot be established instead of silently substituting an assumption.

### Workflow

Use as many steps and phases as the domain requires.
Do not force every recipe into the same number of steps.

Each consequential step identifies:

- the action;
- the evidence used;
- the intermediate result;
- the validation applied;
- the condition for advancing; and
- the condition for stopping.

Complex procedures may group steps into phases such as scope, evidence collection, baseline, analysis, implementation, verification, reporting, and approval.
Every action must be observable enough that another person or agent can determine whether it occurred.

### Decision points

Write decisions as `If <explicit condition>, <specific action>` or an equivalent condition-to-action statement.
Include stop, escalate, narrow-scope, or approval consequences where continuing would be unsafe or unsupported.
Do not list a preference or general recommendation as a decision point.

### Safety guardrails

Convert each relevant risk into an operational rule.
Define prohibited actions, sensitive data that must not be exposed, scope limits, mandatory stop conditions, and restrictions on destructive actions.
Require backups, dry runs, isolated environments, or reversible checkpoints when the domain risk calls for them.
Every forbidden action declared in metadata must have a corresponding guardrail.

### Human approval gates

For every gate, identify what is approved, when approval occurs, the responsible role, and the evidence submitted for review.
Use roles such as repository maintainer, release manager, database owner, security owner, or incident commander.
Do not invent individual approvers.
Every approval declared in metadata must have a corresponding workflow gate.

### Expected output and completion

Define the artifact format, required sections, traceability, assumptions, limitations, decisions, follow-up actions, and ownership where applicable.
Completion criteria must be objectively reviewable against the produced artifact and recorded evidence.
Avoid subjective criteria such as `documentation is good`, `tests are sufficient`, or `performance is better`.

### Failure and recovery

Every foreseeable failure mode has a corresponding recovery procedure.
Use stable pairs such as `F1` and `R1` when more than one pair exists.
Each recovery states the corrective action, the evidence required before retrying, and whether execution resumes, restarts, escalates, or stops.
The identifiers and meanings must match across both sections.

### Embedded example

The embedded example may summarize the complete example files, but it must not contradict them or introduce additional facts.
Link to the complete input and expected output with valid relative paths.

## Example and evidence requirements

Examples are synthetic evidence packages, not prompts that depend on fictional external systems.
Label the scenario as synthetic and include all context needed to review it.
Both the input and expected output must remain explicitly identifiable as synthetic or fictional when read independently.

### Example input

`examples/input.md` includes context, objective, scope, environment, constraints, versions, relevant files or excerpts, observed and expected behavior, risks, available approvals, and other domain evidence where applicable.
It must not require access to unprovided pull requests, logs, files, services, or implicit project knowledge.

Every input includes a `## Evidence inventory` section.
Define each item once with a unique identifier in the form `E1`, `E2`, `E3`, and so on.
For each item, state the evidence type, relevant content, provenance or integrity information, and what it can establish.

An evidence item may represent a pull request, commit, log, test, benchmark, file, contract, decision, observation, approval, or artifact.
Synthetic evidence may be realistic, but it must never be presented as a real repository event or external verification.

### Material claims and derivability

A material claim is a statement that would affect scope, risk, user behavior, a decision, a result, verification, or approval.
Material claims include versions, dates, paths, commands, measurements, changed behaviors, root causes, findings, test results, compatibility, and execution status.

For every material claim in `examples/expected-output.md`, a reviewer must be able to identify the input evidence that supports it.
Do not infer missing facts merely because they would be typical in a similar project.
Verify names, versions, paths, dates, calculations, exclusions, and limitations against the input.

When the artifact contains analysis, distinguish observation, inference, and recommendation.
When it contains code, patches, or commands, identify the target, include enough context to validate the proposal, and never imply execution unless evidence records it.
When it contains a plan, identify responsible roles, dependencies, exit criteria, risks, and rollback or recovery.

### Expected output

`examples/expected-output.md` is the complete artifact promised by the recipe rather than a sentence, generic paragraph, minimal conclusion, or description of a future artifact.
It follows the structure declared in `workflow.md` and records evidence references, assumptions, decisions, limitations, and next steps where applicable.
Every cited evidence identifier must exist in the input.
Unused evidence is allowed when the exclusion is intentional and the output records that exclusion when it affects scope.

The output must not claim that sources were included without listing them, that tests were added without identifying them, that performance improved without a reproducible comparison, or that a command ran when it was only proposed.

### Output contract

`output.schema.json` declares every produced Markdown artifact, its audience, required headings, domain-specific literals, and evidence-reference policy.
Every required heading must contain material content rather than acting as an empty shell.
A required Markdown table header also requires its separator and at least one body row.
Evidence-based artifacts declare a minimum number of distinct evidence identifiers, while public artifacts may forbid internal identifiers.
These deterministic checks reject incomplete structure but do not prove semantic derivability, factual accuracy, or outcome quality.
Those properties still require the evidence review described above.

## Checklist requirements

`checklist.md` is a control used during execution.
Organize it into domain-relevant phases such as scope, evidence, baseline, analysis, implementation, validation, safety, approvals, and delivery.

Checklist items verify omissions that could invalidate or endanger the result, including evidence completeness, immutable boundaries, excluded changes, command status, destructive approvals, known limitations, validated links or paths, and unresolved risks where applicable.
Do not copy workflow sentences or use the same checklist across unrelated recipes.
The final item confirms that the produced artifact satisfies every completion criterion.

## Individual README requirements

Each recipe `README.md` contains:

1. a specific title;
2. a concise value proposition;
3. primary use cases;
4. concrete exclusion cases;
5. required evidence;
6. produced artifacts;
7. primary risks;
8. an execution sequence;
9. a description of each recipe file;
10. the actual verification status;
11. known limitations; and
12. relative links to related documentation when it exists.

The README may identify `workflow.md` as canonical, but that statement is not a substitute for user guidance.
A new user must be able to decide whether the recipe fits, identify the evidence to gather, understand the risks, and start the procedure from the README alone.

## Adapter compatibility and support

Adapter compatibility describes export and installation behavior, not the quality of a workflow result.
Global adapter identity, destination path, export format, naming rules, official documentation, exporter implementation, and support level belong in the central adapter registry.
A recipe declares only recipe-specific compatibility, overrides, limitations, and verification evidence.

Use these support levels:

| Level | Meaning |
| --- | --- |
| `supported` | The current official format was confirmed, the exporter is implemented, and generation and installation contract tests pass. |
| `partial` | A relevant part of the official format or required lifecycle behavior is not supported. |
| `experimental` | The exporter exists, but its contract may change or lacks sufficient coverage. |
| `unsupported` | The project intentionally does not export to this agent. |
| `unknown` | The official format or required behavior could not be confirmed. |

Do not mark an adapter `supported` merely because an agent can read generic Markdown.
Use a format name that identifies the implemented representation, such as a skill, rule, command, or plain Markdown bundle.

The public compatibility matrix distinguishes at least:

- official export format confirmation;
- exporter implementation;
- installation testing;
- external-agent execution testing;
- outcome review;
- tested agent version;
- last verified date; and
- retained evidence.

No support level implies a tested model version, an external-agent run, or an approved outcome.
If the external agent cannot run in the available environment, keep execution and outcome untested and record the limitation without fabricating evidence.

## Verification semantics

Keep verification dimensions independent.
Do not promote one dimension based on evidence from another.

| Dimension | Passing means | Required evidence |
| --- | --- | --- |
| Structural | Schema validation, required-file checks, content validation, and internal relative-link checks passed for the recipe. | Recorded output from the relevant current validation commands. |
| Exporter contract | Serialization matches the confirmed adapter format, naming rules, required fields, and escaping behavior. | Passing deterministic contract tests tied to the documented format source. |
| Installation | Generation, destination paths, manifest creation, overwrite protection, update, remove, and filesystem safety passed in a temporary target. | Passing installation and lifecycle tests. |
| Execution | The exported workflow was actually invoked through the named external agent. | A retained run record that identifies the agent and tested version. |
| Outcome | The execution result was reviewed against objective recipe completion criteria. | A retained review record with the disposition and reviewer role. |

Mark structural status as passing only after the relevant commands have run successfully.
File generation does not count as installation, installation does not count as execution, and execution does not count as outcome review.
Unknown versions, dates, and evidence paths remain null or explicitly untested.
Never invent a tested version, verification date, or evidence path.

## Deterministic validation

Automated validation enforces facts that can be checked reliably without an external API or language model.
It complements schema validation, type checking, unit tests, integration tests, and adapter contract tests.

Deterministic checks include:

- all required files and the canonical file exist;
- the metadata ID matches the directory name;
- recipe versions, agent IDs, and export formats resolve to repository-defined values;
- required workflow sections exist and are non-empty;
- required metadata inputs and outputs are represented in the workflow;
- forbidden actions and human approvals are represented in their corresponding workflow sections;
- failure and recovery sections are non-empty;
- prohibited placeholders are absent;
- input and expected-output examples are not trivial or merely descriptive;
- evidence identifiers are unique in the input;
- every evidence identifier cited in the output exists in the input;
- public Markdown titles do not conflict incorrectly;
- filenames and relative links are valid; and
- README verification language is consistent with metadata.

Validators must fail on deterministic violations with the recipe, file, and relevant identifier in the diagnostic.
Do not weaken schemas, lower thresholds, or add fragile semantic heuristics merely to make existing content pass.
Similarity analysis may warn on likely copied prose when a reliable pass or fail boundary is not available.

## Human editorial review

Automation cannot prove that an output claim is materially supported, that domain decisions are correct, or that a procedure is useful in practice.
A domain reviewer must complete this review after deterministic validation and before assigning `pass`:

1. Trace every material output claim to the example input.
2. Recalculate numeric results and confirm names, versions, paths, dates, and exclusions.
3. Identify vague actions, implicit assumptions, and steps with no advance or stop condition.
4. Confirm every decision has a condition and consequence.
5. Confirm every relevant risk has a guardrail and every destructive action has an approval gate.
6. Pair every failure mode with an actionable recovery procedure.
7. Reject subjective completion criteria that cannot be independently reviewed.
8. Remove checklist items that merely repeat prose.
9. Confirm support and verification claims do not exceed retained evidence.
10. Challenge instructions that could broaden scope or modify unrelated systems.
11. Compare similar recipes and replace copied generic content with domain-specific procedure.
12. Confirm the expected output is the complete promised artifact.
13. Separate facts, inferences, recommendations, and unexecuted proposals.
14. Record remaining limitations and their effect on use.

The reviewer records findings, changed files, decisions, remaining limitations, and the final justification in the recipe audit.

## Definition of ready

A recipe can receive final status `pass` only when:

- its complete required bundle exists;
- metadata is precise and coherent with every public file;
- the workflow is operational, ordered, bounded, and safe;
- the input example is self-contained and defines unique evidence identifiers;
- the expected output is complete and every material claim is derivable;
- decisions, approvals, failure recovery, and completion criteria are explicit;
- the checklist is domain-specific and useful during execution;
- the README is sufficient for a new user;
- adapter and verification declarations reflect only retained evidence;
- deterministic validation passes;
- generated artifacts are current; and
- an adversarial human review has no unresolved `needs-work` finding.

If external execution evidence is unavailable, record execution and outcome as untested and state the limitation.
Never convert missing evidence into a passing claim.
