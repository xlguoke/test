/// <reference types="vite/client" />

import { AndroidInterface } from "./utils/AndroidTools"

declare module "*.vue" {
  import type { DefineComponent } from "vue"
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module "minio" {
  const minio: any
  export default minio
}

declare global {
  //设置全局属性
  interface Window {
    //window对象属性
    AMap: any
    _AMapSecurityConfig: any
    AndroidInterface: AndroidInterface
  }
}
export {}
