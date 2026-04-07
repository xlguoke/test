/// <reference types="vite/client" />
declare const __DEV__: boolean
declare const __PROD__: boolean
/**
 * ilis authorization center base url
 */
declare const __AUTH_BASE__: string
declare const __VERSION__: string

interface ImportMetaEnv {
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'md5';
