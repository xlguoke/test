/**
 * # 弹窗的props定义接口（不带参）
 * @param T 弹窗onConfirm时返回的参数类型
 */
export interface IDialogProps<T> {
  /** # 弹窗的确认按钮被点击事件 */
  onConfirm: (param: T) => void

  /**  # 弹窗的关闭事件 */
  onClosed: () => void
}

/**
 * # 弹窗的props定义接口（带参）
 * @param T 弹窗onConfirm时返回的参数类型
 * @param P 父窗体弹出当前窗体时传入的参数类型
 */
export interface IDialogPropsParam<T, P> extends IDialogProps<T> {
  /** # 父窗体弹出当前窗体时传入的参数 */
  param: P
}

/**
 * # 弹窗的props定义接口（选择器）
 * @param T 选择器返回的数据类型
 */
export interface IDialogPropsSelector<T> extends IDialogProps<T[]> {
  /** # 弹窗标题 */
  title?: string

  /** # 是否可以多选 */
  multiple?: boolean

  /** # 已选中的数据列表 */
  checkedRows?: T[]

  /** # 是否缓存选中数据 */
  isCacheSelect?: boolean

  /** # 查询时额外携带的参数 */
  payload?: Record<string, any>

  /**  # 自定义参数（如果你需要标准选择器参数以外的参数，用这个） */
  customParams?: Record<string, any>
}
