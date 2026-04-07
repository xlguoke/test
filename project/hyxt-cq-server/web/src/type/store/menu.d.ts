export interface MenuTreeType {
  name: string // 系统菜单名称
  seq: number //系统菜单序号
  path: string // 跳转路径
  icon?: string //系统菜单图标
  disableClose: boolean //是否允许关闭
  description?: string //系统菜单说明
  id?: string | null //菜单id
  pid?: string | null //父级id
  type: number //层级类型  1:层级菜单  2:跳转菜单
  component?: string //组件地址
  children?: Array<MenuTreeType> //子级
}
