import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/services/MetaDataBuilder.ts'
import type { IConsginPageParam } from '~/views/consign/consignDetail/interface'
import { getLastSamplingByConsignUnit } from '~/views/consign/component/selectSample/api.ts'
import { UseBase } from '~/views/consign/component/selectSample/modules/UseBase.ts'

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
  constructor(private _consginPageParam: IConsginPageParam) {
    super(new SamplingInfoEntity())
  }

  get consginPageParam() {
    return this._consginPageParam
  }

  /** 默认上次填写取样信息 */
  async setLastSampling() {
    const dataStr = localStorage.getItem('consignUnit-project-sampleSender')

    if (dataStr) {
      const data = JSON.parse(dataStr)

      if (data.consignUnit && data.consignUnit.id && data.project && data.project.id) {
        const res = await getLastSamplingByConsignUnit({
          cosnignUnitId: data.consignUnit.id,
          projectId: data.project.id,
        })

        const resData = res.data
        if (resData.success && resData.obj.length > 0) {
          const obj = resData.obj[0]

          this.data.samplingPerson = obj.samplingPerson
          this.data.samplingCompany = obj.samplingCompany
          this.data.samplingPlace = obj.samplingPlace
          this.data.samplingPersonNumber = obj.samplingPersonNumber
        }
      }
    }
  }

  /** 回显元数据 */
  setData(metaData: MetaDataEntity) {
    const data = new SamplingInfoEntity()

    data.samplingPlace = metaData.samplingPlace || ''
    data.samplingDate = metaData.samplingDate || ''
    data.samplingCompany = metaData.samplingCompany || ''
    data.samplingPerson = metaData.samplingPerson || ''
    data.samplingPersonNumber = metaData.samplingPersonNumber

    this.data = data
  }
}
