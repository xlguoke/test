import type { ColumnsType } from 'ant-design-vue/es/table'

export { default as TaskReferenceRecord } from './list.vue'

/** # 引用记录接口 */
export interface IReferenceRecord {
  testObjectCode: string
  testTaskCode: string
  testTaskParamId: string
  sysParamName?: string
  sysParamDisplayName: string
  equipmentId: string
  equipmentSn: string
  equipmentName: string
  equipmentStatus: string
  equipmentNextCheckDate: string
}

/** # 引用记录列表columns */
export const columns: ColumnsType = [
  {
    title: '检测样品编号',
    dataIndex: 'testObjectCode',
    ellipsis: true,
  },
  {
    title: '检测任务编号',
    dataIndex: 'testTaskCode',
    ellipsis: true,
  },
  {
    title: '检测任务参数ID',
    dataIndex: 'testTaskParamId',
    ellipsis: true,
  },
  {
    title: '系统参数显示名称',
    dataIndex: 'sysParamDisplayName',
    ellipsis: true,
  },
  {
    title: '设备ID',
    dataIndex: 'equipmentId',
    ellipsis: true,
  },
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
    ellipsis: true,
  },
  {
    title: '设备名称',
    dataIndex: 'equipmentName',
    ellipsis: true,
  },
  {
    title: '设备状态',
    dataIndex: 'equipmentStatus',
    ellipsis: true,
  },
  {
    title: '设备下次检校时间',
    dataIndex: 'equipmentNextCheckDate',
    ellipsis: true,
  },
]
