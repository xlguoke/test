import { CustomField } from '~/anyThing/decorator/CustomField'
import { FormField } from '~/anyThing/decorator/FormField'
import { SearchField } from '~/anyThing/decorator/SearchField'
import { EFormItemType } from '~/anyThing/enum/EFormItemType'
import { EquipmentAssetEntity } from '../../asset/EquipmentAssetEntity'

export class InventoryDeviceEntity extends EquipmentAssetEntity {
  @FormField({
    formType: EFormItemType.SELECT,
    isOnlySearch: true,
  })
  @SearchField()
  @CustomField('所属部门')
  departmentId?: string

  @FormField({
    formType: EFormItemType.INPUT,
    isOnlySearch: true,
    placeholder: '请输入设备编号/资产编号',
  })
  @SearchField()
  @CustomField('快捷查询')
  queryCode?: string
}
