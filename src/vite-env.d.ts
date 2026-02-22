/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COPILOT_CLOUD_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
