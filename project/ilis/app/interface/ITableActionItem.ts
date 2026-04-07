import type { ButtonProps } from 'ant-design-vue'

/** # 表格操作项接口 ⚙️ */
export interface ITableActionItem<T> extends ButtonProps {
  /** 按钮文本 */
  label: string
  /** 点击事件处理函数 */
  fn: (record: T) => void
  /** 是否隐藏 */
  visible?: boolean | ((record: T) => boolean)
  /** 按钮权限 */
  permissions?: string[]
}

/** # 表格操作项类型 */
export type ITableAction<T> = ITableActionItem<T>[]
