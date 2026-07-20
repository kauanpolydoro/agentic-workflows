# Example input

This is a synthetic, self-contained scenario.
No external record should be consulted.

## Context

Synthetic PR `#42` changes timeout retry handling for an invoice-delivery client.
The application sends invoice-creation requests to an external provider.

## Request

Review the synthetic change and decide whether it is ready to merge.

## Constraints

- Use only the evidence below.
- Treat commands as executed only when their evidence explicitly records a result.
- State assumptions and limitations.
- Do not modify the synthetic code or contact an external provider.

## Evidence inventory

### E1 - Revision record

- Type: Immutable revision record.
- Content: Base `a100000000000000000000000000000000000000`, head `b200000000000000000000000000000000000000`, and merge base `a100000000000000000000000000000000000000` resolve locally.
- Integrity: The supplied diff and test command record both identify head `b200000000000000000000000000000000000000`.
- Establishes: The immutable comparison boundary.

### E2 - Pull request intent and changed-file inventory

- Type: Author request and path inventory.
- Content: The acceptance criterion is "retry one transport timeout only when duplicate invoice creation is prevented, and preserve all non-timeout errors."
- Content: The complete changed-file inventory is `src/delivery.ts` and `src/delivery.test.ts`; there are no renames, deletions, generated files, or other changed paths.
- Integrity: The inventory was generated from `a100000000000000000000000000000000000000...b200000000000000000000000000000000000000`.
- Establishes: Intended behavior, exclusions, and review coverage.

### E3 - Complete production diff for `src/delivery.ts`

- Type: Unified diff.
- Content: The complete production diff is:

```diff
 export async function deliverInvoice(client, invoice) {
-  return client.post(invoice);
+  try {
+    return await client.post(invoice);
+  } catch (error) {
+    if (error.code !== "ETIMEDOUT") throw error;
+    return client.post(invoice);
+  }
 }
```

- No idempotency header or key is created elsewhere in the changed file.
- Integrity: The hunk is from `a100000000000000000000000000000000000000...b200000000000000000000000000000000000000` and accounts for the complete changed production file.
- Establishes: The timeout branch, retry action, and unchanged request arguments.

### E4 - Complete test diff for `src/delivery.test.ts`

- Type: Unified diff.
- Content: The complete test diff is:

```diff
+it("retries ETIMEDOUT once", async () => {
+  client.post
+    .mockRejectedValueOnce(Object.assign(new Error("timeout"), { code: "ETIMEDOUT" }))
+    .mockResolvedValueOnce({ ok: true });
+  await expect(deliverInvoice(client, invoice)).resolves.toEqual({ ok: true });
+  expect(client.post).toHaveBeenCalledTimes(2);
+});
```

- No test models a first request accepted by the provider followed by a local timeout, and no assertion inspects an idempotency key.
- Integrity: The hunk is from `a100000000000000000000000000000000000000...b200000000000000000000000000000000000000` and accounts for the complete changed test file.
- Establishes: The timeout retry-count coverage and the untested duplicate-prevention property.

### E5 - Provider contract and repository instruction

- Type: Public client contract and governing repository rule.
- Content: `client.post(invoice, options?)` creates an invoice and returns its provider identifier.
- Content: The provider only deduplicates repeated creation requests when both calls carry the same `Idempotency-Key` header.
- Content: `ETIMEDOUT` means the client did not receive a response and does not establish whether the provider accepted the first request.
- Content: The repository rule says external invoice writes must not be retried after an unknown outcome without an idempotency key.
- Content: The instruction inventory maps this external-write rule to `src/delivery.ts`, maps the E7 test-coverage and merge policy to `src/delivery.test.ts`, and records that neither changed path has another nested or conflicting instruction.
- Integrity: The contract and instruction map are declared complete for both changed paths at head `b200000000000000000000000000000000000000`.
- Establishes: Write semantics, timeout uncertainty, deduplication requirement, the applicable safety invariant, and the governing-instruction map for both changed files.

### E6 - Command record

- Type: Executed verification record.
- Content: `pnpm test delivery` exited 0 with 8 tests passing on head `b200000000000000000000000000000000000000` in the local Node.js test environment.
- Content: No end-to-end provider test or accepted-first-request simulation was executed.
- Integrity: The record identifies the command, reviewed head, environment class, exit status, and passing count.
- Establishes: The narrow unit-test result and its coverage limitation.

### E7 - Review and merge policy

- Type: Repository policy.
- Content: Repository review policy classifies a plausible duplicate external write as High severity and blocking until prevented or disproved.
- Content: A changed branch without a test for its required safety property is Medium severity when a separate blocking finding already prevents merge.
- Content: Any unresolved High finding requires `request changes`.
- Integrity: The policy is supplied as applicable to PR `#42`.
- Establishes: Severity and merge-disposition rules.

### E8 - Approval state

- Type: Human approval record.
- Content: The repository maintainer has not reviewed or submitted the synthetic report.
- Content: No specialist review was requested because the supplied rule and provider contract fully define the external-write concern for this example.
- Establishes: The pending submission gate and specialist-review disposition.
