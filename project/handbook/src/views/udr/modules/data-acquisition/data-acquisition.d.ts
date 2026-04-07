import { z } from 'zod'

/** 下拉待选项 */
const pickerColumn = z.object({
  text: z.string(),
  value: z.string(),
})

const column = z.object({
  /** 列名称 */
  displayName: z.string(),
  /** 列属性 */
  filedCode: z.string(),
  /** 可编辑列，值保存在valueKey中 */
  valueKey: z.string().optional(),
  /** 可编辑列，是否默认值 */
  isDefault: z.boolean().optional(),
  /** 可编辑列，下拉选项 */
  linkOpts: z.array(pickerColumn).optional(),
})

/** 下拉待选项 */
export type PickerColumn = z.infer<typeof pickerColumn>

/** 表格列数据 */
export type Column = z.infer<typeof column>
