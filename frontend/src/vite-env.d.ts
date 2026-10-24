/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_DATA_SOURCE: 'mock' | 'live';
  readonly VITE_API_PROXY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
