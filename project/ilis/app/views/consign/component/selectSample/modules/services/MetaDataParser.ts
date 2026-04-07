import type { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'

import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/services/MetaDataBuilder.ts'
import { compatibilityOldMetaData } from '../../utils/oldMetaDataSpecification.ts'

/**
 * 元数据解析类
 */
export class MetaDataParser {
  constructor(private mainController: MainController) {}

  /**
   * 解析元数据，并赋值到各个模块
   */
  async parseMetaData(metaData: MetaDataEntity) {
    this.mainController.metaDataBuilder.metaData = metaData
    this.mainController.useBasicInfo.setData(metaData)
    this.mainController.useCodesInfo.setData(metaData)
    this.mainController.useTestParams.setData(metaData)
    this.mainController.useSamplingInfo.setData(metaData)
    this.mainController.useSampleInfo.setData(metaData)
    await this.mainController.useTestOtherInfo.setData(metaData)
    this.mainController.useAdditionalFee.setData(metaData)
    this.mainController.usePeriod.setData(metaData)
    this.mainController.useAttachment.setData(metaData)

    if (!this.mainController.useSampleInfo.data.specificationConfig) {
      this.mainController.useSampleInfo.setDataField('specificationConfig', compatibilityOldMetaData(metaData))
    }
  }
}
