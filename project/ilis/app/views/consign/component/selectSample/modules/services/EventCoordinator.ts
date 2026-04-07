import type { SampleInfoEntity } from '../UseSampleInfo'
import type { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'
import type { SelectSampleParamEntity } from '~/views/consign/component/selectSampleParam'
import { VIEW_TYPE } from '~/views/consign/component/selectSpecification'

/**
 * 事件协调器
 */
export class EventCoordinator {
  constructor(private mainController: MainController) {}

  /**
   * 事件中心，监听并统一处理各个模块之间业务
   * 中介者
   */
  initEmitCenter() {
    const {
      useTestParams,
      useBasicInfo,
      useTestOtherInfo,
      useSampleInfo,
      useCodesInfo,
      useAdditionalFee,
    } = this.mainController

    /** 监听参数列表变动 */
    useTestParams.subscribeFieldChange('testParams', () => {
      // 获取样品描述下拉项
      useSampleInfo.initDescriptionOptions(useBasicInfo.data.testUnitTestSampleId, useTestParams.selectedRowKey)

      // 计算脚本价格
      if (!useBasicInfo.enableSamplePrice)
        useTestParams.calcScriptPrice(useSampleInfo, useTestOtherInfo)
    })

    /** 监听检测组数 */
    useBasicInfo.subscribeFieldChange('sampleAmount', (sampleAmount) => {
      // 重新计算参数小记
      useTestParams.sampleAmount = sampleAmount
      useTestParams.refreshViewData()

      // 增加/减少样品组数 重新整理/生成编号
      useCodesInfo.arrangementTestObjectCodes(sampleAmount, useTestParams.selectedRowKey)
    })

    /** 监听选择样品参数 */
    useBasicInfo.subscribeFieldChange('onSelectTestParams', async (selectData: SelectSampleParamEntity) => {
      // 选择的参数
      const testParams = selectData.testParams

      const testItemIds = [...new Set(testParams.map(i => i.testItemId))].join(',')

      /** 是否切换了样品 */
      const isChangeTestSample = !useSampleInfo.data.testSampleDisplayName || useBasicInfo.data.isChangeUnitTestSampleId

      // 选择样品参数后，清空打包参数选项
      useTestParams.paramPackId = undefined

      // 选择样品参数后，重新加载收样辅助信息
      await useTestOtherInfo.initOtherInfos(selectData.testUnitTestSampleId, testItemIds)

      // 样品名称 - 未切换样品时，不更新样品名称，避免用户手动修改样品信息中的样品名称后，修改参数把修改后的样品名称覆盖了
      if (isChangeTestSample) {
        useSampleInfo.setDataField('testSampleDisplayName', selectData.Sample.attributes.displayName)

        //  切换样品清空规格型号配置
        useTestOtherInfo.specificationsView = VIEW_TYPE.ADD
        useSampleInfo.sampleLevelName = selectData.Sample.attributes.sampleLevelName
        useSampleInfo.sampleAttributeName = selectData.Sample.attributes.name
        useSampleInfo.setDataField('specificationConfig', [])

        // 切换样品清空附加费用
        useAdditionalFee.updateAdditionalFee({
          additionalFees: [],
          additionalFeesData: [],
        })
      }

      // 计算脚本价格
      if (!useBasicInfo.enableSamplePrice)
        useTestParams.calcScriptPrice(useSampleInfo, useTestOtherInfo)

      // 获取单位样品信息，并赋值
      useSampleInfo.setUnitSampleData()

      // 设置默认资质
      this.mainController.qualificationManager.setDefaultQualifications(testParams)
    })

    /** 监听样品所有信息变化 */
    useSampleInfo.subscribeFieldChange('data', (sampleInfoData: SampleInfoEntity) => {
      // 赋值样品数量和代表数量
      useSampleInfo.setDataField('sampleNum', (sampleInfoData.sampleNumVal || '') + (sampleInfoData.sampleNumUnit || ''))
      useSampleInfo.setDataField('delegatesNum', (sampleInfoData.delegatesNumVal || '') + (sampleInfoData.delegatesNumUnit || ''))

      // 根据样品信息填写的数据赋值收样辅助信息
      useTestOtherInfo.updateValueBySampleInfo(sampleInfoData)

      // 计算脚本价格
      if (!useBasicInfo.enableSamplePrice)
        useTestParams.calcScriptPrice(useSampleInfo, useTestOtherInfo)
    })

    /** 监听收样辅助信息变化 */
    useTestOtherInfo.subscribeFieldChange('otherInfos', () => {
      // 计算脚本价格
      if (!useBasicInfo.enableSamplePrice)
        useTestParams.calcScriptPrice(useSampleInfo, useTestOtherInfo)
    })
  }
}
