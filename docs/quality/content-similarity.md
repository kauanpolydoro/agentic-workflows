# Lexical content similarity report

Generated deterministically by the pnpm audit:similarity command.

The audit compares five-token shingles for workflow actions, decision points, failure modes, recovery procedures, checklist controls, and complete example artifacts.

It removes required headings, checklist markers, evidence IDs, common stop words, and minimal verification boilerplate.

Lexical similarity is a triage signal, not proof of editorial duplication, originality, correctness, or semantic quality.

This command gates only whether every lexical warning has a human review tied to the exact current pair content.

## Result

- Recipes compared: 20
- Surface comparisons: 1140
- Manual-review threshold: 0.200 Jaccard similarity
- Review schema version: 1
- Review digest version: `awf-content-similarity-review-v1`
- Audited corpus SHA-256: `1895d96d5e95cb07b19e507f88750f3e8c87979a7f357f5ee5ddae4f9c367dd2`
- Comparisons above the review threshold: 0
- Stale retained reviews: 0
- Unresolved current-content reviews: 0
- Cross-recipe literal blocks of at least 120 normalized characters: 0
- Five-token shingles shared by at least two recipes: 46

The pair table contains every comparison at or above the review threshold plus the 30 closest comparisons below it.

| Recipe A | Recipe B | Surface | Similarity | Current content SHA-256 | Disposition | Review provenance | Review rationale |
| --- | --- | --- | ---: | --- | --- | --- | --- |
| document-api | synchronize-documentation | workflow-steps | 0.024 | `1230cd459682dd9f8f9b47bf288adb79960b326ca3e154154c38398e40c9253b` | below threshold |  |  |
| document-api | triage-issues | workflow-steps | 0.018 | `b0077888a0fba5a69d91306fb98f7ccb03f1d7383fdf46c0cc48fa25707069b6` | below threshold |  |  |
| document-api | synchronize-documentation | checklist-controls | 0.011 | `8def774f44f905ff5653061be4b5af3789cca01a5cb0741ac3efb1f1467bc6f7` | below threshold |  |  |
| document-api | incident-postmortem | workflow-steps | 0.009 | `746a3793eaafd6bba3c2af163411438314ccbb4beb2635b0b68baef20c0496dd` | below threshold |  |  |
| synchronize-documentation | triage-issues | workflow-steps | 0.008 | `442fdb8da7beb2b2c527433b11761aa372fcb7f38e04ce5f54434853e59792b4` | below threshold |  |  |
| refactor-large-module | upgrade-dependencies | checklist-controls | 0.008 | `2aef91b4cdb6f5d06d46f2b55a2e452f7f41eb8b655673de1ea4d10786a18855` | below threshold |  |  |
| migrate-framework | refactor-large-module | checklist-controls | 0.008 | `4184568679d8bc2b6c1217a251f7669b845c3ea22cb25ceb3ff9772c15bb6ffc` | below threshold |  |  |
| incident-postmortem | synchronize-documentation | workflow-steps | 0.006 | `003f781ba0b4b2edd81dbe1efb00347c4bb07d828a2b76de8265d92e65c82fae` | below threshold |  |  |
| document-api | generate-tests | checklist-controls | 0.006 | `3bbd1fe69e9dbeb7535416232ef9d07530740e4cb9e096246eb9e8915f828424` | below threshold |  |  |
| api-contract-review | database-migration-review | recovery-procedures | 0.005 | `31b76304ceb95b60a28fa53bed43fc973ed2e7595c17eb29dcea0e0ad8ef39a2` | below threshold |  |  |
| generate-tests | synchronize-documentation | checklist-controls | 0.005 | `46726a6bef856de7f48eaae5c29e119657a711f638eaecadbf96e92841ebb0e5` | below threshold |  |  |
| document-api | triage-issues | checklist-controls | 0.005 | `d44c468dec39b42242f548409dda4c16a499f3f2d80f40b5590660cc57f706ef` | below threshold |  |  |
| document-api | improve-type-safety | checklist-controls | 0.005 | `922fb7c7a13c222f6cd362226443b7d500630ac2716d191bbf3e68e71be68981` | below threshold |  |  |
| generate-tests | triage-issues | checklist-controls | 0.005 | `69754cf77ccb5ba4b7dad61ff08dd092dcfce7aa73f8a0534104b6d64fceb925` | below threshold |  |  |
| debug-failing-ci | reproduce-bug | checklist-controls | 0.005 | `a1651922a344bc0d89e2e0aaeb8454c3c29172ef92713dcf0808d80e41c824f8` | below threshold |  |  |
| generate-tests | improve-type-safety | checklist-controls | 0.005 | `ec5bae3b6374adeaa82d0ac1a7f77f41d62ccc24dff7a2e1512cfc722739ae3b` | below threshold |  |  |
| synchronize-documentation | triage-issues | checklist-controls | 0.005 | `8406f3e5509626ed732b7cac9ce2bc3b5b3d828c4cbb65b93dc26455488b0e17` | below threshold |  |  |
| improve-type-safety | synchronize-documentation | checklist-controls | 0.005 | `2bede2c1575ee2ed974bae42f36faeb5022f04efc8487396b34e7a74d5e465ab` | below threshold |  |  |
| improve-type-safety | triage-issues | checklist-controls | 0.005 | `b1e30e2c457da6308b3431bb0fef868e014a7cdf1b55dfe3c324ecc53121720c` | below threshold |  |  |
| document-api | incident-postmortem | checklist-controls | 0.005 | `39f9764e95e5904e8feb7ea548d59b22d795898425b8ddda06801d42f2705d6c` | below threshold |  |  |
| generate-tests | incident-postmortem | checklist-controls | 0.005 | `1533196f2f6bcd871137687c546c62418b06a1ee63ed53bdf398b2e5e111ce99` | below threshold |  |  |
| incident-postmortem | synchronize-documentation | checklist-controls | 0.004 | `b95a4cdfb88f41f4fa20c09cae024f409a1699dd96b1da2fb8b4b4ea6f6793ba` | below threshold |  |  |
| incident-postmortem | triage-issues | checklist-controls | 0.004 | `9ebe91d74b23042aea04351325b7dbfd1efb0206f5940648ed04dab7f5af8729` | below threshold |  |  |
| review-pull-request | security-review | example-artifact | 0.004 | `38ae1db545da5d504e3f3c13c0af5586ef9674503a4f33809bffcacc0608445e` | below threshold |  |  |
| improve-type-safety | incident-postmortem | checklist-controls | 0.004 | `8d5d2d6fe6c0cd4036100c3b15d98c6f7f2388bc5af80ad9643f9028c04de9bd` | below threshold |  |  |
| migrate-framework | upgrade-dependencies | checklist-controls | 0.004 | `8cd63a3ab0400d1044c253ae820b3334d30cf338721d713a3508fe784a7c6601` | below threshold |  |  |
| document-api | write-release-notes | checklist-controls | 0.004 | `6e2d20e1fca57d12d9e0d87b5ea5aad45c711e8234ba3dd3cdc15546c103d7b8` | below threshold |  |  |
| generate-tests | write-release-notes | checklist-controls | 0.004 | `589f82ab21a721cf71d7bef0885ec0844c902a9552a54d10bf951a8ea9bb5f09` | below threshold |  |  |
| synchronize-documentation | write-release-notes | checklist-controls | 0.004 | `dcd5ba557be5a8098a6680f8f93d86c6be77a35cbd14a5a02fea745daeea38f5` | below threshold |  |  |
| triage-issues | write-release-notes | checklist-controls | 0.004 | `ff9c428da04621507021231277f0d011cce8b3335f4277f3a983a9aa2aa4a048` | below threshold |  |  |

## Repeated literal blocks

This detector reports exact normalized paragraph-sized blocks shared by at least two recipes after headings, checklist markers, evidence numbers, case, and whitespace are normalized.

It reports every qualifying block rather than applying a silent result cap.

| Block SHA-256 | Recipes | Surfaces | Preview |
| --- | --- | --- | --- |
| none | none | none | No qualifying cross-recipe literal block was detected. |

## Frequent five-token shingles

This table shows the 30 most widely shared five-token shingles that occur in at least two recipes.

It is an explicitly capped diagnostic inventory, not a pass or fail result.

| Shingle | Recipe count | Recipes | Surfaces |
| --- | ---: | --- | --- |
| artifact satisfies every completion criterion | 7 | document-api, generate-tests, improve-type-safety, incident-postmortem, synchronize-documentation, triage-issues, write-release-notes | checklist-controls |
| final artifact satisfies every completion | 7 | document-api, generate-tests, improve-type-safety, incident-postmortem, synchronize-documentation, triage-issues, write-release-notes | checklist-controls |
| confidence finding impact recommendation disposition | 4 | api-contract-review, database-migration-review, review-pull-request, security-review | example-artifact |
| only when every completion criterion | 4 | document-api, incident-postmortem, synchronize-documentation, upgrade-dependencies | workflow-steps |
| owner role dependency exit criterion | 4 | document-api, generate-adr, incident-postmortem, triage-issues | checklist-controls, example-artifact, recovery-procedures |
| severity confidence finding impact recommendation | 4 | api-contract-review, database-migration-review, review-pull-request, security-review | example-artifact |
| action owner role dependency exit | 3 | document-api, generate-adr, triage-issues | example-artifact |
| applicable approval recorded explicitly non-applicable | 3 | document-api, synchronize-documentation, triage-issues | workflow-steps |
| complete only when every completion | 3 | document-api, incident-postmortem, synchronize-documentation | workflow-steps |
| completion criterion maps artifact stop | 3 | document-api, incident-postmortem, triage-issues | workflow-steps |
| every applicable approval recorded explicitly | 3 | document-api, synchronize-documentation, triage-issues | workflow-steps |
| every completion criterion maps artifact | 3 | document-api, incident-postmortem, triage-issues | workflow-steps |
| finding impact recommendation disposition high | 3 | database-migration-review, review-pull-request, security-review | example-artifact |
| have owner roles measurable exit | 3 | migrate-framework, refactor-large-module, upgrade-dependencies | checklist-controls |
| impact recommendation disposition high high | 3 | database-migration-review, review-pull-request, security-review | example-artifact |
| owner roles measurable exit conditions | 3 | migrate-framework, refactor-large-module, upgrade-dependencies | checklist-controls |
| required approval pending denied deliver | 3 | document-api, synchronize-documentation, triage-issues | workflow-steps |
| when every completion criterion maps | 3 | document-api, incident-postmortem, synchronize-documentation | workflow-steps |
| while required approval pending denied | 3 | document-api, synchronize-documentation, triage-issues | workflow-steps |
| advance merge review only when | 2 | refactor-large-module, upgrade-dependencies | workflow-steps |
| advance when every applicable approval | 2 | document-api, synchronize-documentation | workflow-steps |
| approval pending denied deliver reconcile | 2 | document-api, triage-issues | workflow-steps |
| approval recorded explicitly non-applicable stop | 2 | document-api, triage-issues | workflow-steps |
| been validated final artifact satisfies | 2 | document-api, synchronize-documentation | checklist-controls |
| command exit status test count | 2 | refactor-large-module, upgrade-dependencies | checklist-controls, workflow-steps |
| criterion maps artifact stop handoff | 2 | document-api, triage-issues | workflow-steps |
| every material path version command | 2 | debug-failing-ci, reproduce-bug | checklist-controls |
| finding impact recommendation disposition medium | 2 | api-contract-review, dependency-audit | example-artifact |
| impact owner role exit condition | 2 | refactor-large-module, upgrade-dependencies | example-artifact |
| impact recommendation disposition medium high | 2 | api-contract-review, dependency-audit | example-artifact |

## Manual review contract

Every row at or above the threshold requires one retained review in content-similarity-reviews.yml.

A current review records the two recipe IDs, surface, disposition, rationale, reviewer identity, review date, and the exact current content SHA-256 shown above.

Any source change that alters either reviewed surface changes that digest and makes the review stale.

A missing or stale review for a row at or above the threshold makes the command fail after regenerating this report.

The acceptable disposition requires a domain-specific reason why the shared language is unavoidable and operationally correct.

The rewritten disposition means the source recipes were changed to remove interchangeable prose and the reported score reflects the reviewed content.

Shared canonical headings, evidence notation, safety vocabulary, and verification terminology are not defects by themselves.

Do not lower similarity through cosmetic synonym replacement.

Passing this lexical-review gate does not assign a semantic recipe-quality status.
