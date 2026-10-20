interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_BOOK_API_BASE_URL?: string;
  readonly VITE_MAX_LOAN_DAYS?: string;
  readonly VITE_BACKEND_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
