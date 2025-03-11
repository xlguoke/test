export { default as CommonSystemLog } from '~/components/commonSystemLog/LogList.vue'

export const columns = [
  {
    title: '内容',
    dataIndex: 'content',
    width: '30%',
  },
  {
    title: '处理意见',
    dataIndex: 'opinion',
    width: '20%',
  },
  {
    title: '对象编号',
    dataIndex: 'objectSn',
    width: '20%',
  },
  {
    title: '处理人',
    dataIndex: 'createName',
    width: '10%',
  },
  {
    title: '时间',
    dataIndex: 'createDate',
    width: '20%',
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD_HH_MM_SS)
    },
  },
]

export interface ILog {
  id: '4028b242920d6f0801920d8ff779000a'
  sysCompanyCode: 'A03'
  createName: '管理员'
  createBy: 'admin'
  createDate: 1726804392000
  content: '设备送检,批次号：1'
  opinion: '发起审批'
  objectType: '286'
  objectId: '1'
  objectSn: null
  sourceClass: 'AuditProcessServiceImpl'
  sourceMethod: 'addProcessLog'
  remark: null
}
