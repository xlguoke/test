import type { EquipmentRentSignStatus } from './EquipmentRentEntity'
import { EquipmentRentType, EquipmentRentTypeDict } from './EquipmentRentEntity'
import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { AnyDataBaseEntity } from '~/anyThing/entity/AnyDataBaseEntity'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EDateFormatType } from '~/utils/EDateFormatType'

export class EquipmentReturnEntity extends AnyDataBaseEntity {
  @FormField({
    formType: EFormItemType.RADIO,
    disabled: true,
  })
  @CustomField('借用类型', EquipmentRentTypeDict)
  rentType = EquipmentRentType.OUT_RENT

  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
  })
  @CustomField('设备编号')
  equipmentSn?: string

  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
  })
  @CustomField('设备名称')
  equipmentName?: string

  @FormField({
    formType: EFormItemType.INPUT,
    disabled: true,
  })
  @CustomField('设备规格')
  eqStandard?: string

  @CustomField('借用记录ID')
  rentId?: string

  @FormField({
    formType: EFormItemType.SELECT,
    required: true,
  })
  @CustomField('设备状态')
  eqStatus?: string

  @CustomField('确认人ID')
  confirmUserId?: string

  @FormField({
    formType: EFormItemType.INPUT,
    required: true,
  })
  @CustomField('归还确认人')
  confirmUserName?: string

  @FormField({
    formType: EFormItemType.DATE,
    dateFormat: EDateFormatType.YYYY_MM_DD,
    required: true,
  })
  @CustomField('归还时间')
  returnTime?: Date

  @FormField()
  @CustomField('归还人')
  returnUser?: string

  @CustomField('归还ID')
  returnId?: string

  @CustomField('归还附件')
  returnFiles?: any[]

  @FormField()
  @CustomField('存放位置')
  returnOrg?: string

  @CustomField('存放位置ID')
  returnOrgId?: string

  @FormField()
  @CustomField('备注')
  returnRemark?: string

  @CustomField('签名图片')
  signerImgData?: string

  @CustomField('文件ID')
  attachmentIds?: string

  signerStatus?: EquipmentRentSignStatus
  returnSignerFile?: any
}
