/**
 * # 选择器输入框 配置
 */
export interface IInputSelectorConfig {
  /**
   * # 选择器视图组件
   * - 采用[AnyDialogHelper](../helper/AnyDialogHelper.ts)标准编写，具体参照[弹窗demo](../../views/demo/DialogDemo.vue)
   * - 适用{@link EFormItemType.INPUT_SELECTOR}
   */
  selectorView: any

  /**
   * # 回显选中的数据
   * - 参数1：表单数据
   */
  checkedRows?: (formData: any) => Promise<any[]>

  /**
   * # 是否多选
   */
  multiple?: boolean

  /**
   * # 选择器弹窗标题
   */
  title?: string

  /**
   * # 选择器选中值后的回调函数
   * - 参数1：选中的数据列表
   * - 参数2：表单数据
   */
  onSelect?: (value: any[], formData: any) => void
}
