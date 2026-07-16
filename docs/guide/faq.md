# Frequently asked questions

## Is this a prompt collection?

No.
Each recipe has a strict contract, operational checklist, examples, safety gates, adapters, and separate evidence states.

## Does supported mean verified by the external agent?

No.
Supported means the exporter follows a confirmed format.
Execution and outcome review are separate fields.

## Does the CLI use the network?

No normal command uses the network.
Clone and dependency installation are external setup operations, not runtime behavior.

## Can a recipe execute code?

No.
Recipes are YAML and Markdown data.

## Why is npm installation unavailable?

The packages have not been published.
The documentation will add a package command only after a real release exists.

## Can I edit an installed file?

Yes, but update and remove will detect the changed hash and preserve the file unless you explicitly use `--force`.
