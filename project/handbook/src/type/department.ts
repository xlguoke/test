import { z } from 'zod'

/** 任务参数绑定的物联设备 */
export const Department = z.object({
  id: z.string(),
  value: z.string().optional(),
  text: z.string(),
  iconCls: z.string().nullable(),
  checked: z.boolean().nullable(),
  attributes: z.any().nullable(),
  children: z.array(z.any()).optional(),
  state: z.string().nullable(),
  orderNum: z.number().nullable(),
  parentId: z.string().nullable(),
  childrenIds: z.string().nullable(),
  chkDisabled: z.any().nullable(),
  expired: z.any().nullable(),
  pid: z.string().nullable(),
})

export type DepartmentEntity = z.infer<typeof Department>
