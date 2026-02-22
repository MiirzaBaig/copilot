/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_COPILOT_CLOUD_API_KEY: string
  readonly VITE_COPILOT_RUNTIME_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
