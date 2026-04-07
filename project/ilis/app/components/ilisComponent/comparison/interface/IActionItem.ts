export interface IActionItem {
  icon: string | (() => VNode)
  label: string
  isShow?: () => boolean
  onClick: () => void
}
