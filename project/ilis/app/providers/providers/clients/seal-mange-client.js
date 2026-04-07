/* eslint-disable eqeqeq */
import { TypeService } from '../services/type'

/**
 * 印章管理
 */
export class SealMangeClient {
  constructor() {
    this.typeService = new TypeService()

    // 盖章方式
    this.signTypeEnum = {}

    this.tableColumns = [
      {
        title: '序号',
        dataIndex: 'order',
        width: 55,
        align: 'center',
        customRender: ({ index }) => index + 1,
      },
      {
        title: '印章名称',
        width: 160,
        dataIndex: 'name',
        ellipsis: true,
        scopedSlots: { customRender: 'name' },
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
        title: '打印即标记已签章',
        dataIndex: 'autoSign',
        width: 150,
        ellipsis: true,
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
      {
        title: '操作',
        dataIndex: 'action',
        width: 80,
        align: 'center',
        scopedSlots: { customRender: 'action' },
      },
    ]

    this.versionTableColumns = [
      { title: '启用日期', dataIndex: 'startDate', width: 90, ellipsis: true },
      { title: '截止日期', dataIndex: 'endDate', width: 90, ellipsis: true },
      {
        title: '印章图片',
        dataIndex: 'sealStampFilePath',
        width: 90,
        ellipsis: true,
        align: 'center',
        scopedSlots: { customRender: 'sealStampFilePath' },
      },
      {
        title: '纵向坐标',
        dataIndex: 'verticalLocation',
        width: 85,
        ellipsis: true,
        scopedSlots: { customRender: 'verticalLocation' },
      },
      {
        title: '横向坐标',
        dataIndex: 'horizontalLocation',
        width: 85,
        ellipsis: true,
        scopedSlots: { customRender: 'horizontalLocation' },
      },
      {
        title: '电子章信息',
        dataIndex: 'chapter',
        ellipsis: true,
        width: 150,
      },
      {
        title: '资质证书',
        dataIndex: 'qualificationCertificateFilePath',
        width: 160,
        ellipsis: true,
        scopedSlots: { customRender: 'qualificationCertificateFilePath' },
      },
    ]

    this.getSignTypeEnum()
  }

  /** 获取签章类型 */
  async getSignTypeEnum() {
    const list = await this.typeService.getTypesByGroupCode('chapterSignType')
    const obj = {}

    list.forEach((item) => {
      obj[item.typeCode] = item.typeName
    })

    this.signTypeEnum = obj
  }
}
