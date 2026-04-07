import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/services/MetaDataBuilder.ts'
import type { IConsginPageParam } from '~/views/consign/consignDetail/interface'
import { UseBase } from '~/views/consign/component/selectSample/modules/UseBase.ts'

/** 附加费用项 */
export interface AdditionalFeeItem {
  id: string
  name: string
  price: number
  priceUnit: string
  testParamDisplayName: string
  testParamId: string
  remark: string
}

/** 附加费用，元数据格式 */
export interface AdditionalFeeMetaDataItem extends AdditionalFeeItem {
  /** 数量 */
  count: number
}

/** 新增附加费用实体 */
export class AddAdditionalFeeEntity {
  name = ''
  price = 0
  priceUnit = ''
  remark = ''
}

/** 附加费用 */
export class AdditionalFeeEntity {
  /** 附加费用 - 已添加数据 */
  additionalFees: AdditionalFeeMetaDataItem[] = []
  /** 附加费用 - 全部数据 */
  additionalFeesData: AdditionalFeeItem[] = []
}

/**
 * 附加费用
 */
export class UseAdditionalFee extends UseBase<AdditionalFeeEntity> {
  /** 附加费用 */
  get additionalFeePrice() {
    return this.data.additionalFees.reduce((sum, item) => (sum + (item.price || 0)), 0)
  }

  get consginPageParam() {
    return this._consginPageParam
  }

  constructor(private _consginPageParam: IConsginPageParam) {
    super(new AdditionalFeeEntity())
  }

  /** 更新附加费用 */
  updateAdditionalFee(data: {
    additionalFees: AdditionalFeeMetaDataItem[]
    additionalFeesData: AdditionalFeeItem[]
  }) {
    const { additionalFees, additionalFeesData } = data
    this.data.additionalFees = additionalFees || []
    this.data.additionalFeesData = additionalFeesData || []
  }

  /** 删除已选的附加费用 */
  delAdditionalFee(ids: string[]) {
    const additionalFees = this.data.additionalFees
    this.data.additionalFees = additionalFees.filter(item => !ids.includes(item.id))
  }

  /** 回显元数据 */
  setData(metaData: MetaDataEntity) {
    const data = new AdditionalFeeEntity()

    data.additionalFees = metaData.additionalFees || []
    data.additionalFeesData = metaData.additionalFeesData || []

    this.data = data
  }
}
