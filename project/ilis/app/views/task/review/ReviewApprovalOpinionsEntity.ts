import { CustomField } from '~/anyThing/decorator/CustomField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'

/**
 * # 检测任务entity
 */
export class ReviewApprovalOpinionsEntity extends AnyDataBaseEntity {
  @TableField({ width: 120 })
  @CustomField('报告编号')
  reportNumber?: string

  @TableField({ width: 120 })
  @CustomField('文件名称')
  reportFileName?: string

  @TableField({ width: 120 })
  @CustomField('问题')
  content?: string

  @TableField({ width: 120 })
  @CustomField('问题内容')
  type?: string

  @TableField({ width: 120 })
  @CustomField('严重程度')
  severity?: string

  @TableField({ width: 120 })
  @CustomField('提出人')
  createUserName?: string

  @TableField({ width: 120 })
  @CustomField('修正情况')
  status?: string

  @TableField({ width: 120 })
  @CustomField('修正人')
  amendUserName?: string
}
