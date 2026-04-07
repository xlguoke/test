import type { IConsignProcessor, IConsignSamples } from '../interface'
import type { IOfflineData } from '~/api/consign/consign-management/types'
/** # 离线数据 */
import { message } from 'ant-design-vue'
import { useIndustryStore } from '~/store/industryStore.ts'
import { modalConfirm } from '~/views/consign/consignList/modules/modalUtil'

const { term } = useIndustryStore()

export class ConsignOffineDataService {
  constructor(private consignProcessor: IConsignProcessor) {}

  get offlineDataId() {
    return this.consignProcessor.pageStateService.offlineDataId
  }

  get consignData() {
    return this.consignProcessor.data
  }

  get sampleDatas() {
    return this.consignProcessor.consignSampleProcessor.consignSampleData
  }

  get consignSampleProcessor() {
    return this.consignProcessor.consignSampleProcessor
  }

  /** 获取本地缓存的离线数据 */
  getOfflineData(): IOfflineData | null {
    const data = sessionStorage.getItem(this.offlineDataId)
    return data ? JSON.parse(data) : null
  }

  /**
   * 检查检测参数与离线数据是否一致
   * @param metaParams 元数据中的参数
   * @param params 离线数据中的参数
   * @return string
   */
  checkParams(metaParams: IConsignSamples['testParams'], params: IOfflineData['params']) {
    const metaObj: Record<string, IConsignSamples['testParams'][number]> = {}
    for (let j = 0; j < metaParams.length; j++) {
      const metaItem = metaParams[j]
      metaObj[metaItem.testParamId] = metaItem
    }
    for (let i = 0; i < params.length; i++) {
      const item = params[i]
      if (metaObj[item.testParamId]) {
        delete metaObj[item.testParamId]
      }
    }
    if (JSON.stringify(metaObj) === '{}') {
      return ''
    }
    let str = ''
    for (const k in metaObj) {
      str = (str ? ',' : '') + metaObj[k].displayName
    }
    return str
  }

  /**
   * 检查规程与离线数据是否一致
   * @param metaParams 元数据中的参数
   * @param params 离线数据中的参数
   * @return boolean
   */
  checkStandards(metaParams: IConsignSamples['testParams'], params: IOfflineData['params']) {
    const metaObj: Record<string, IConsignSamples['testParams'][number]> = {}
    for (let j = 0; j < metaParams.length; j++) {
      const metaItem = metaParams[j]
      metaObj[metaItem.testParamId] = metaItem
    }
    for (let i = 0; i < params.length; i++) {
      const item = params[i]
      if (metaObj[item.testParamId]) {
        const metaStandard = metaObj[item.testParamId].criterion
        for (let n = 0; n < metaStandard.length; n++) {
          const _ms = metaStandard[n]
          const _mskey = _ms.baseStandardName + _ms.baseStandardId
          const isItem = item.standards.find((s) => {
            const skey = s.standardName + s.standardId
            return skey === _mskey && s.standardType === _ms.baseStandardUseType
          })
          if (!isItem && _ms.baseStandardUseType)
            return false
        }
      }
    }
    return true
  }

  /** 离线数据创建任务前的数据检查 */
  async beforeCreateTest() {
    if (!this.offlineDataId || this.consignProcessor.isConfirmHint) {
      return true
    }
    if (this.sampleDatas.length === 0) {
      message.error(`请${term('添加样品')}`)
      return
    }
    const offlineData = this.getOfflineData()
    const projectId = this.consignData.project?.projectId
    const unitProjectId = this.consignData.unitProject?.unitProjectObjId
    // 检查工程项目
    if (projectId !== offlineData?.projectId || (offlineData?.unitProjectId && offlineData?.unitProjectId !== unitProjectId)) {
      const msg = h('div', {}, [
        '离线试验数据所属工程项目/工程划分为：',
        h('p', `${offlineData?.projectName} / ${offlineData?.unitProjectName}更换工程项目/工程划分后，试验任务将不能导入离线试验数据！`),
      ])
      const ok = await modalConfirm(msg, '请确认是否继续？')
      if (ok) {
        this.consignProcessor.isConfirmHint = true
        this.consignProcessor.consignSampleProcessor.removeHandbookRecordId()
        return true
      }
    }
    return true
  }

  /** 离线数据保存前的数据检查 */
  async beforeSaveCheckOffline(metaData: IConsignSamples) {
    if (!metaData.handbookRecordId)
      return true

    const offlineData = this.getOfflineData()
    if (!offlineData)
      return true

    // 检查检测参数
    const paramStr = this.checkParams(metaData.testParams, offlineData.params)
    if (paramStr) {
      const msg = h('div', {}, [
        '离线试验数据不包含检测参数：',
        h('p', paramStr),
        '试验任务将不能导入离线试验数据！',
      ])

      const isOk = await modalConfirm(msg, '请确认是否继续？')
      if (isOk) {
        this.consignProcessor.isConfirmHint = true
        delete metaData.handbookRecordId
      }
      return isOk
    }

    // 检查规程
    const valid = this.checkStandards(metaData.testParams, offlineData.params)
    if (!valid) {
      const dataNames = []
      for (let i = 0; i < offlineData.params.length; i++) {
        const item = offlineData.params[i]
        const standardStr = item.standards.map(d => d.standardName).join(',')
        dataNames.push(`${item.testParamName}（${standardStr}）`)
      }
      const msg = h('div', {}, [
        '离线试验数据规程：',
        h('p', dataNames.join('；')),
        '当前规程与以上规程不匹配，试验任务将不能导入离线试验数据！',
      ])

      const isOk = await modalConfirm(msg, '请确认是否继续？')
      if (isOk) {
        this.consignProcessor.isConfirmHint = true
        delete metaData.handbookRecordId
      }
      return isOk
    }
    return true
  }

  /** 离线数据添加多样品前的数据检查 */
  async beforeAddOfflineSampleCheck() {
    if (this.offlineDataId && this.consignProcessor.isConfirmHint && this.sampleDatas.length === 1) {
      const isOk = await modalConfirm(`添加多个${term('样品')}时，试验任务将不能导入离线试验数据！`, '请确认是否继续？')
      if (isOk)
        this.consignSampleProcessor.removeHandbookRecordId()
    }
  }
}
