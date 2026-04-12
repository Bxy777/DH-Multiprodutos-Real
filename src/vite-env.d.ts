/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_WHATSAPP: string
  readonly VITE_ADMIN_PASSWORD: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
