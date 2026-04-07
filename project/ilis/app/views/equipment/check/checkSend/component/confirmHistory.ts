import type { ColumnsType } from 'ant-design-vue/es/table'

export { default as ConfirmHistory } from './ConfirmHistory.vue'

export interface IConfirmHistoryEntity { // 与表单编辑界面返回一致
  detailOpinion: '1'
  correctValue: null
  preCheckDate: 1719936000000
  checkedInfo: ''
  useEquipment: ''
  applyParam: ''
  skillLimit: '测试（02）'
  remark: '测试（07）'
  applyRegulations: '测试（03）'
  confirmTime: null// 确认时间
  checkUnit: '测试（05）'
  url: 'http://192.168.2.65:8080/fileShare/gfzx/A03/images/2023/00ab3541-d881-421e-b929-9e4a7140c3df.pdf' // 检校证书附件
  checkItemId: '402882c1906da422019076bab47c061d'
  checkCertificateSn: '测试（06）'
  nextCheckTime: null
  confirmResults: null
  checkTime: null// 检校时间
  id: '4028b242921d81ab01921d971a9a0018'
  checkItemName: '测试（01）'
  isCorrect: null
}

export const columns: ColumnsType = [
  {
    title: '检校项目/参数',
    dataIndex: 'checkItemName',
    ellipsis: true,
    width: '140px',
  },
  {
    title: '适用参数',
    dataIndex: 'applyParam',
    ellipsis: true,
  },
  {
    title: '确认依据',
    dataIndex: 'applyRegulations',
    ellipsis: true,
  },
  {
    title: '技术要求',
    dataIndex: 'skillLimit',
    ellipsis: true,
  },
  {
    title: '检校结果',
    dataIndex: 'checkedInfo',
    ellipsis: true,
  },
  {
    title: '确认时间',
    dataIndex: 'confirmTime',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
  {
    title: '是否使用修正因子',
    dataIndex: 'isCorrect',
    ellipsis: true,
  },
  {
    title: '修正值',
    dataIndex: 'correctValue',
    ellipsis: true,
  },
  {
    title: '检校时间',
    dataIndex: 'checkTime',
    ellipsis: true,
    customRender: ({ text }: any) => {
      return AnyDateTimeHelper.format(text, EDateFormatType.YYYY_MM_DD)
    },
  },
  {
    title: '检校证书',
    dataIndex: 'checkCertificateSn',
    ellipsis: true,
  },
  {
    title: '备注说明',
    dataIndex: 'remark',
    ellipsis: true,
  },
  {
    title: '操作',
    dataIndex: 'operation',
    ellipsis: true,
    width: '150px',
    fixed: 'right',
  },
]
