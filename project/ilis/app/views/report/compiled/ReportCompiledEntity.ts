// import { CheckSendStatusDict } from '../equipment/check/checkSend'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

/** # 编制报告状态枚举 */
export enum EReportCompiledStatus {
  /** # 报告编制中 */
  COMPILE = 'compile',
  /** # 报告审批中 */
  AUDIT = 'audit',
  /** # 报告已批准 */
  APPROVED = 'approved',
  /** # 报告已作废 */
  INVALID = 'invalid',
}

/** # 编制报告类型枚举 */
export enum EReportCompiledType {
  /** # 正式报告 */
  FORMAL = 'formal',
  /** # 临时报告 */
  TEMPORARY = 'temporary',
  /** # 综合报告 */
  SYNTHESIS = 'synthesis',
  /** # 综合报告的临时报告 */
  SYNTHESIS_TEMP = 'synthesis_Temp',
}

/** # 编制报告实体类 */
export class ReportCompiledEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '输入编号/委托单位/工程项目后回车即可查询',
  })
  @SearchField()
  @CustomField('快捷查询')
  quickQryParam?: string

  @TableField({
    customRender: ({ record }: { record: ReportCompiledEntity }) => {
      return record.tipsIcon || ''
    },
  })
  @CustomField('标记')
  tipsIcon?: string

  @TableField({ sorter: true })
  @CustomField('报告编号')
  reportSn?: string

  @TableField()
  @CustomField('委托单位')
  unitName?: string

  @TableField()
  @CustomField('工程项目')
  projectName?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    sorter: true,
  })
  @CustomField('报告创建日期')
  declare createDate: Date

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    sorter: true,
  })
  @CustomField('报告提交时间')
  submitDate?: Date

  @TableField({
    customRender: ({ record }: { record: ReportCompiledEntity }) => {
      return ReportCompiledEntity.formatPersonInfo(record)
    },
  })
  @CustomField('创建人')
  createPerson?: string

  /** # 格式化人员信息 ⚙️ */
  static formatPersonInfo(record: ReportCompiledEntity): string {
    const personConfigs = [
      { field: 'createPerson', label: '报告创建人' },
      { field: 'dutyPerson', label: '报告负责人' },
      { field: 'compilePerson', label: '编写' },
      { field: 'auditPerson', label: '审核' },
      { field: 'approvePerson', label: '批准' },
    ]

    return personConfigs
      .filter(config => record[config.field as keyof ReportCompiledEntity])
      .map(config => `${config.label}：${record[config.field as keyof ReportCompiledEntity]}`)
      .join(';')
  }

  @TableField({
    isAlways: true,
    fixed: 'right',
  })
  @CustomField('操作')
  operation?: any

  /** # 自定义标记对象颜色文本ID */
  markObjectColorTextIds?: string

  /** # 报告类型 */
  reportType?: EReportCompiledType
}
