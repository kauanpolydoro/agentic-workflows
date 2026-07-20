# Large module refactor fixture

The single report module intentionally combines validation, normalization, sorting, aggregation, formatting, and result assembly.
Its public `generateReport` contract is protected by characterization tests.
Run `node --test`.
