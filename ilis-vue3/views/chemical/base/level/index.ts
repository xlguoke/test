import type { ColumnsType } from 'ant-design-vue/es/table'

export { default as Main } from './main.vue'

export const columns: ColumnsType = [
  {
    title: '管理级别',
    dataIndex: 'name',
    key: 'name',
    width: '300px',
    ellipsis: true,
  },
  {
    title: '显示名称',
    dataIndex: 'displayName',
    key: 'displayName',
    width: '160px',
    ellipsis: true,
  },
  {
    title: '管理级别说明',
    dataIndex: 'description',
    key: 'description',
    width: '200px',
    ellipsis: true,
  },
  {
    title: '是否启用',
    dataIndex: 'enabled',
    key: 'enabled',
    width: '120px',
    ellipsis: true,
  },
  {
    title: '操作',
    dataIndex: 'Action',
    width: '120px',
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
