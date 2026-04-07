/**
 * 批量入库保存
 */
export class PurchaseStoreEntity {
  _id?: string
  name?: string
  standard?: string
  type?: string
  recordCount?: number
  amountUnit?: string
  recordDate?: string
  consumableId?: string
  site?: string
  depart?: string
  operatorId?: string
  managerId?: string
  auditPersonId?: string
  recordType = 1
  operatorName?: string
  managerName?: string
  auditPersonName?: string
  departId?: string
  snPlaceholderId?: string
  sn?: string
}

export class InventoryInVO {
  'batchSn'?: string
  'batch'?: string
  'type'?: string
  'amount'?: number
  'putawayDate'?: string
  'id'?: string
}

export class PurchaseChemicalStoreEntity extends InventoryInVO {
  _id?: string
  'categoryName'?: string
  'categoryId'?: string
  'name'?: string
  'sn'?: string
  'manageLevel'?: string
  'manageLevelId'?: string
  'unit'?: string
  'purity'?: string
  'concentration'?: string
  'specification'?: string
  'effect'?: string
  'sourceFrom'?: string
  'status'?: string
  'acronym'?: string
  'productionDate'?: string
  'invalidDate'?: string
  'remark'?: string
  'keepers'?: string
  'keeperIds'?: string
  'managers'?: string
  managerIds?: string
  'allowChangeContainer'?: string
  'storageLocation'?: string
}
