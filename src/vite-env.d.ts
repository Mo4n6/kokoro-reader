/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ENABLE_URL_INGEST?: string;
  readonly VITE_EXTRACT_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
