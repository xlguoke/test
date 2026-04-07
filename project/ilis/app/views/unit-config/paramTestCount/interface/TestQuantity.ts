export interface SetTestQuantityEntity {
  paramId: string
  testQuantity?: number
}

export interface SetUnitMeasureEntity {
  bigCategoryId: string
  unitMeasure: string
  downward: boolean
}

export class SetShareTestQuantityEntity {
  paramIds: string[] = []
  shareTestQuantity?: number
  shareTestQuantityIdent?: string
}
