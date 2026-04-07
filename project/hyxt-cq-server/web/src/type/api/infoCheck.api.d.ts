export interface checkPendingQuery {
  current: number | undefined //当前页
  size: number | undefined //页大小
  category?: string // 类别： udits/todo 分别代表审批和待办
  name?: string // 查询参数名称
  value?: string //参选参数值 与name形成key-value，两者均不为空时有效
}

export interface handleApprovalParams {
  labId?: string // 试验室id
  approved: boolean //是否批准
  text: string //意见
  applyId?: string // 申请记录id
  id?: string //业务id
  taskId?: string //任务id
  kind?: string // 审核类型（KEEP-备案，AMEND-变更，DELAY-延期，REVOKE-撤销）
  // attachmentUrl?: string
  // attachmentName?: string
  additional1?: string // 备案通知书编号
  attachments?: [] //附件
}
