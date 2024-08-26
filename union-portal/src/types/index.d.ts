import { z } from 'zod'

interface Obj {
  [key: string]: string
}
// 状态
export const STATUSOPT: Obj = {
  OPEN: '待处理',
  IN_PROGRESS: '进行中',
  DONE: '已完成',
  CLOSED: '关闭',
}

// 打开方式
export const OPENTYPE: obj = {
  _SELF: '当前窗口',
  _BLANK: '新窗口',
}

// 优先级
export const PRIORITY: Obj = {
  0: '较低',
  1: '普通',
  2: '紧急',
  3: '非常紧急',
}

// 公告板
export const NOTICE = 'NOTICE'
// 消息提醒
export const NEWS = 'NEWS'
// 待办
export const WAITDONE = 'TODO'

// 类别
const category = z.union([z.literal(NOTICE), z.literal(NEWS), z.literal(WAITDONE)])

// 打开方式
const openType = z.union([z.literal('_SELF'), z.literal('_BLANK')])

// 待办
const noticeItem = z.object({
  id: z.string(),
  application: z.string(), // 系统名称
  category,
  username: z.string(), // 用户名
  title: z.string(), // 标题
  details: z.string().optional(), // 详情
  detailUrl: z.string().optional(), // 详情页跳转地址
  status: z.string().optional(), // 状态
  openType,
  priority: z.number().optional(), // 优先级
  createdAt: z.string().optional(), // 创建日期：格式化后的日期，来于 auditMeta.createdAt
  auditMeta: z.object({
    createdAt: z.string(), // 创建日期
  }).optional(),
})

// 查询参数
const query = z.object({
  title: z.string().optional(),
  status: z.string().optional(),
  category,
})

export type Query = z.infer<typeof query>
export type Category = z.infer<typeof category>
export type OpenType = z.infer<typeof openType>
export type Notice = z.infer<typeof noticeItem>
