import type { Component } from 'vue'
import type { WidgetCategory, WidgetList } from '~/views/admin/screen/editor/widgets'

/**
 * # 智慧屏配置组件实现接口
 */
export interface IWidget {
  /** # 组件名称（目前也用作渲染唯一标识，所以注意名称不要重复） */
  name: string

  /** # 组件标识，用于授权设备屏对应渲染模块 */
  key?: WidgetList

  /** # 组件分类 */
  category: WidgetCategory

  /** # 渲染组件路径 */
  component: Component

  /** # 缩略组件路径(没有就渲染名字) */
  thumbnailComponent?: Component

  /** # 组件对应配置表单组件路径 */
  configComponent?: Component

  /** # 配置表单数据 */
  configFormState?: Record<string, any>
}
