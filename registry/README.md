# Registry

This directory ships a [shadcn/ui custom registry](https://ui.shadcn.com/docs/registry)
manifest for the framework's blocks.

## Layout

```txt
registry/
└── registry.json     # shadcn-compatible registry manifest
```

The `registry.json` lists every block in `packages/blocks/`, together with:

- a stable name (e.g. `hero-split-code`),
- a human title and description,
- the source file path inside this repository,
- a `target` path indicating where the block should land in a downstream
  shadcn/ui project, and
- one or more category tags that mirror the four pattern atlases.

## Consuming the registry

A downstream project that uses `shadcn` can install any block by name once
this registry is hosted at a public URL, for example:

```bash
npx shadcn@latest add https://shadcn-ui-framework.example/registry/hero-split-code.json
```

The framework does not host this URL itself. It ships the manifest, and the
manifest is the contract.

## Keeping the registry in sync with the atlas

Every block listed here corresponds to a `block_ref` field in one or more
`pattern-atlas/*.json` files. When you add a new block:

1. Add the file under `packages/blocks/<family>/<BlockName>.tsx`.
2. Re-export it from `packages/blocks/index.ts`.
3. Set the matching pattern's `block_ref` in the atlas to
   `<family>/<BlockName>.tsx`.
4. Add an entry here in `registry.json` with the same `block_ref` path.

A future tooling pass (out of scope for v0.1) will diff these four sites
and fail CI on any drift.
