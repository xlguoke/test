export interface IComparisonInfoCardOption {
  /** 选项标签 */
  label: string
  /** 选项值 */
  value?: string | (() => VNode)
  /** 是否隐藏 */
  hidden?: boolean
  /** 自定义渲染函数 */
  customRender?: (props: { label: string, value: string | (() => VNode) }) => VNode
}
