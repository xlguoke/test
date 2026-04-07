declare module 'vue-router' {
  interface RouteMeta {
    /** page title */
    title?: string
    /** i18n key */
    i18n?: string
    /** keepalive */
    keepAlive?: boolean
    /** 隐藏页面的导航栏 */
    hiddenNavBar?: boolean
  }
}
export {}
