# ADR 0002: Support Node.js 22 and later

- Status: accepted
- Decision owner: project maintainers

## Context

The repository previously required Node.js 24 without using a runtime feature that made 24 necessary.

The CLI relies on stable ESM, filesystem, cryptography, and process APIs available in Node.js 22.

The pinned development and release environment can remain Node.js 24 without making that version the consumer minimum.

## Decision

Published packages declare Node.js 22 as the minimum runtime.

The main quality pipeline continues to use the version pinned in `.nvmrc`.

A dedicated compatibility job runs build, unit tests, integration tests, and acceptance tests on Node.js 22.

Project documentation must distinguish the minimum supported runtime from the version used to record a particular verification result.

## Consequences

Consumers on Node.js 22 can use the CLI without an artificial major-runtime upgrade.

Features introduced after Node.js 22 cannot be used without revisiting this decision and the compatibility job.

Passing on Node.js 24 does not by itself prove Node.js 22 compatibility.
