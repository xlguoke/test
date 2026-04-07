import type { CustomMarkManagePage, CustomMarkRange, MarkTypeCode } from '~/components/ilisComponent'

export interface IUseCustomMarkConfig {
  /** # 自定义标记模块 */
  module: CustomMarkManagePage
  /** # 自定义标记范围（从模块所有标签中筛选指定范围） */
  range: CustomMarkRange
  /** # 自定义标记类型（标记的时候需要传递） */
  markType: MarkTypeCode
}
