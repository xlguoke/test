import { UseBase } from '~/views/consign/component/selectSample/modules/UseBase.ts'
import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/MainController.ts'

export class SamplingInfoEntity {
  /** 取样地点 */
  samplingPlace = ''
  /** 取样时间 */
  samplingDate = ''
  /** 取样单位 */
  samplingCompany = ''
  /** 取样人 */
  samplingPerson = ''
  /** 取样人证号 */
  samplingPersonNumber = ''
}

/**
 * 收样信息
 */
export class UseSamplingInfo extends UseBase<SamplingInfoEntity> {
  constructor() {
    super(new SamplingInfoEntity())
  }

  /** 回显元数据 */
  setData(metaData: MetaDataEntity) {
    const data = new SamplingInfoEntity()

    data.samplingPlace = metaData.samplingPlace
    data.samplingDate = metaData.samplingDate
    data.samplingCompany = metaData.samplingCompany
    data.samplingPerson = metaData.samplingPerson
    data.samplingPersonNumber = metaData.samplingPersonNumber

    this.data = data
  }
}
