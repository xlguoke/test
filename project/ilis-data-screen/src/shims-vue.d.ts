/* eslint-disable */
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare interface Window {
  /**
   * 百度地图
   */
  BMap: any
  BMAP_STATUS_SUCCESS: number
}

declare module "*.js"