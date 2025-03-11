/**
 * # 字典接口
 */
export interface IDictionary {
  /**
   * # 字典键（通常对应枚举值）
   */
  key: string | number | symbol | boolean

  /**
   * # 字典值（通常对应枚举描述翻译）
   */
  label: any

  /**
   * # 字典描述（通常对应枚举额外补充描述）
   */
  description?: string

  /**
   * # 字典颜色（通常对应枚举状态颜色）
   */
  color?: string
}
