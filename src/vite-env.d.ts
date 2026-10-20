/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "true" — запустить моки MSW в браузере. */
  readonly VITE_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
