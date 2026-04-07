import request from '@/utils/request'

export interface MessageDTO {
  id: string
  title: string
  content: string
  beenRead: '1' | '0'
  createTime: string
  sendTime: string
  sendWay: string
  sendStatus: string
}

export const ReadStatusDict = [
  { name: '全部', values: undefined },
  { name: '未读', value: '0' },
  { name: '已读', value: '1' },
]

export function getMessage(data: Record<string, any>) {
  return request.get<any>('/rest/msgHistory/list', {
    params: data,
  })
}

export function getMessageDetail(msgId: string) {
  return request.get<MessageDTO>('/rest/msgHistory/getById', {
    params: { msgId },
  })
}

export function markRead(msgId: string) {
  return request.get<any>('/rest/msgHistory/markRead', {
    params: { msgId },
  })
}

export function markReadAll() {
  return request.get<any>('/rest/msgHistory/markRead/all', {
    params: {
      messageType: 'humiture',
    },
  })
}
