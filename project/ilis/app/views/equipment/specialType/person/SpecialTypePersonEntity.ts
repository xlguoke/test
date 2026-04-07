import { CustomField } from '~/anyThing/decorator/CustomField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { TableField } from '~/anyThing/decorator/TableField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EDateFormatType } from '~/utils/EDateFormatType'

/**
 * # 特种设备人员实体
 */
export class SpecialTypePersonEntity extends AnyDataBaseEntity {
  @SearchField()
  quickQryParam?: string

  @TableField({
    width: 120,
  })
  @CustomField('姓名')
  personName?: string

  @TableField({
    width: 120,
  })
  @CustomField('性别')
  gender?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    width: 120,
  })
  @CustomField('出生日期')
  dateOfBirth?: string

  @TableField({
    width: 120,
  })
  @CustomField('最高学历')
  education?: string

  @TableField({
    width: 120,
  })
  @CustomField('身份证号')
  identityNumber?: string

  @TableField({
    width: 120,
  })
  @CustomField('证书编号')
  certificateNumber?: string

  @TableField({
    width: 120,
  })
  @CustomField('发证单位')
  issueUnit?: string

  @TableField({
    width: 120,
  })
  @CustomField('专业范围')
  scopeExpertise?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    width: 120,
  })
  @CustomField('初领日期')
  firstCollectionDate?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    width: 120,
  })
  @CustomField('有效期')
  expirationDate?: string

  @TableField({
    dateFormat: EDateFormatType.YYYY_MM_DD,
    width: 120,
  })
  @CustomField('复审日期')
  reviewDate?: string
}
