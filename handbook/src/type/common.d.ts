import { z } from 'zod'
import type { basic } from 'custodian'

const selDataItemDTO = z.object({
  id: z.string(),
  name: z.string(),
})

// 基础数据 - 数据版本信息
export type DataVersionDTO = Override<
  Pick<basic.DataVersion, 'type'>,
  {
    title: string
  }
>

// 基础数据 - 数据版本状态信息
export type DataVersionStatusDTO = Override<
  Pick<basic.DataVersion, 'type'>,
  {
    status: string
    msg: string
  }
>

// 选择数据列表
export type SelDataItemDTO = z.infer<typeof selDataItemDTO>
