/* eslint-disable eqeqeq */
/**
 * 资质管理
 */
export class QualificationMangeClient {
  constructor() {
    this.tableColumns = [
      {
        title: '序号',
        dataIndex: 'order',
        width: 65,
        align: 'center',
        fixed: 'left',
        customRender: ({ index }) => index + 1,
      },
      { title: '资质名称', width: 150, dataIndex: 'name', ellipsis: true },
      { title: '资质掩码', width: 150, dataIndex: 'code', ellipsis: true },
      {
        title: '证书编号',
        width: 150,
        dataIndex: 'certificateNo',
        ellipsis: true,
      },
      {
        dataIndex: 'defaultFlag',
        width: 120,
        ellipsis: true,
        scopedSlots: { customRender: 'defaultFlag' },
      },
      {
        dataIndex: 'auto',
        width: 140,
        ellipsis: true,
        scopedSlots: { customRender: 'auto' },
      },
      {
        title: '生效日期',
        dataIndex: 'statementEnableDate',
        width: 120,
      },
      {
        dataIndex: 'statementExpiredDate',
        width: 120,
      },
      { title: '备注', dataIndex: 'remark', ellipsis: true, width: 180 },
    ]

    this.realtionSealTableColumns = [
      {
        title: '印章名称',
        dataIndex: 'sealName',
        ellipsis: true,
        scopedSlots: { customRender: 'sealName' },
      },
      {
        title: '签章方式',
        dataIndex: 'signType',
        width: 85,
        ellipsis: true,
        customRender: ({ text }) => {
          if (text === 'notSign')
            return '不签章'
          if (text === 'picSign')
            return '图片签章'
          if (text === 'eleSign')
            return '电子签章'
          return ''
        },
      },
      {
        dataIndex: 'autoSign',
        width: 140,
        customRender: ({ text: val }) => {
          return val ? '是' : '否'
        },
      },
      {
        title: '默认签章页',
        dataIndex: 'formatType',
        width: 130,
        ellipsis: true,
        customRender: ({ text: val }) => {
          if (val == '10')
            return '不签章'
          if (val == '20')
            return '每页均签章'
          if (val == '30')
            return '固定页码签章'
          if (val == '40')
            return '除固定页码外均签章'
          if (val == '50')
            return '除首尾页码外均签章'
          if (val == '60')
            return '除尾页外均签章'
          return ''
        },
      },
    ]
  }
}
