export interface MenuTreeType {
  name: string // 组件名称
  path: string //路由
  component: string // 组件地址
  children?: Array<MenuTreeType> //子级
  pid?: string
  hidden?: boolean
  meta: {
    title: string //名称
    icon?: string //图标
    auths?: string[] // 操作权限编码
    keepAlive: boolean // 是否缓存
  }
}
