import type { ColumnsType } from 'ant-design-vue/es/table'

export { default as Main } from './main.vue'

export const columns: ColumnsType = [
  {
    title: '管理级别',
    dataIndex: 'name',
    key: 'name',
    ellipsis: true,
  },
  {
    title: '显示名称',
    dataIndex: 'displayName',
    key: 'displayName',
    ellipsis: true,
  },
  {
    title: '管理级别说明',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true,
  },
  {
    title: '是否启用',
    dataIndex: 'enabled',
    key: 'enabled',
    ellipsis: true,
  },
  {
    title: '操作',
    dataIndex: 'Action',
    ellipsis: true,
  },
]

// 数据实例

export class RecordEntity {
  description = ''
  displayName = ''
  enabled = false
  id = ''
  name = ''
  workflowId = ''
}
