// ============================================================
//  demo/versions.ts — Catálogo de versiones publicadas del
//  framework. Cada entrada apunta al CSS compilado que genera
//  `pnpm build:versions` en public/versions/<tag>.css.
//
//  Al publicar una versión nueva:
//  1. `sass src/scss/main.scss public/versions/<tag>.css`
//  2. Añade la entrada aquí (la primera de la lista es la
//     "latest" que se usa por defecto).
// ============================================================

export interface ReleasedVersion {
  tag: string;
  label: string;
}

export interface VersionCatalog {
  current: string;
  released: ReleasedVersion[];
}

const versions: VersionCatalog = {
  current: '0.1.0',
  released: [{ tag: '0.1.0', label: 'v0.1.0 — first release' }],
};

export default versions;
