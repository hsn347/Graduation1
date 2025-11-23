/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_WHATSAPP_ACCESS_TOKEN: string
  readonly VITE_WHATSAPP_APP_ID: string
  readonly VITE_WHATSAPP_PHONE_NUMBER_ID: string
  readonly VITE_WHATSAPP_BUSINESS_ACCOUNT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
