import type { IssueWay } from '../listEntity'
import type { Attachment } from '~/components/attachmentList'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { IssueWayDict } from '../listEntity'

/** 报告信息 */
export class ReportInfoEntity extends AnyDataBaseEntity {
  @TableField({
    width: 70,
  })
  @CustomField('标记')
  mark?: string

  @TableField()
  @CustomField('报告编号')
  reportNumber?: string

  @TableField()
  @CustomField('委托编号')
  consignCode?: string

  @TableField()
  @CustomField('委托人')
  consignPerson?: string

  @CustomField('委托人手机号')
  consignPersonPhone?: string

  @TableField()
  @CustomField('样品名称')
  testObjectName?: string

  @TableField()
  @CustomField('报告份数')
  reportNum?: string

  @TableField()
  @CustomField('报告发放方式', IssueWayDict)
  reportHandOverType?: string

  // @TableField({
  //   width: 150,
  // })
  // @CustomField('签字')
  // receiverSignature?: string

  @TableField({
    width: 50,
    fixed: 'right',
  })
  @CustomField('操作')
  action?: string
}

/** 短信推送 */
export enum SmsPush {
  /** 是 */
  YES = '1',
  /** 否 */
  NO = '0',
}

/** 短信推送字典 */
export const SmsPushDict = AnyDictionaryHelper.createDictionaryArray([
  {
    key: SmsPush.YES,
    label: '是',
  },
  {
    key: SmsPush.NO,
    label: '否',
  },
])

/** 发放信息 */
export interface IssueForm {
  /** 发放方式 */
  issueWay: IssueWay
  /** 经办人 */
  operatorName: string
  /** 发放数量 */
  issueCount?: number | string
  /** 发放日期 */
  issueDate: string
  /** 领取人：自取、电子报告 */
  receiverone?: string
  /** 邮寄信息：邮寄 */
  mailPostId?: string
  /** 邮寄单名称：邮寄 */
  mainPostName?: string
  /** 收件人：邮寄 */
  receiverthree?: string
  /** 收件人电话：邮寄 */
  receiverPhone?: string
  /** 邮寄地址：邮寄 */
  mailAddress?: string
  /** 邮寄公司：邮寄 */
  mailCompany?: string
  /** 邮寄单号：邮寄 */
  mailNumber?: string
  /** 邮编：邮寄 */
  postCode?: string
  /** 传真号：传真 */
  faxNumber?: string
  /** 领取时限(天)：电子报告 */
  deadline?: number | string
  /** 短信推送：电子报告 */
  smsPush?: SmsPush
  /** 手机号：需要短信推送时显示 */
  receiverPhone2?: string
  /** 备注 */
  remark?: string
  /** 附件 */
  attachments?: string[]
  /** 附件信息：回显 */
  listFile?: Attachment[]
}
