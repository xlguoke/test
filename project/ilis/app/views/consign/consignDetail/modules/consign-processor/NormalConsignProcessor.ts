import type { IGoDetailConfig, IOverQualificationCheckParam, ISaveConsignRes } from '../../interface'
import type { ConsignPrintService } from '../ConsignPrintService'
import type { IConsignDataDTO } from '~/api/consign/consign-management/types'
import type { ISystemParam } from '~/api/system/system-param/types'
import type { EventEmitter } from '~/utils/EventEmitter.ts'
import type { ConsignStorageManager } from '~/views/consign/consignDetail/modules/ConsignStorageManager.ts'
import type { PageStateService } from '~/views/consign/consignDetail/modules/PageStateService.ts'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { EGenerateCode, overQualificationApi, saveConsignDetailApi } from '~/api/consign/consign-management'
import { modalError } from '~/utils/modalUtil'
import { BaseConsignProcessor } from '~/views/consign/consignDetail/modules/consign-processor/BaseConsignProcessor.ts'
import { ConsignSampleProcessor } from '~/views/consign/consignDetail/modules/ConsignSampleProcessor.ts'
import { ConsignUnitProcessor } from '~/views/consign/consignDetail/modules/ConsignUnitProcessor.ts'
import { modalConfirm } from '~/views/consign/consignList/modules/modalUtil'
import { useCompleteConsign } from '~/views/consign/consignList/modules/useCompleteConsign'
import { SnChange } from '../../components'
import { ConsignFeeProcessor } from '../ConsignFeeProcessor'
import { ConsignOffineDataService } from '../ConsignOffineDataService'

/**
 * 普通委托处理器
 */
export class NormalConsignProcessor extends BaseConsignProcessor {
  /** 委托单位工程项目控制器 */
  public consignUnitProcessor: ConsignUnitProcessor
  /** 委托样品控制器 */
  public consignSampleProcessor: ConsignSampleProcessor
  /** 离线数据服务 */
  public consignOffineDataService: ConsignOffineDataService
  /** 实例化委托费用控制器 */
  public consignFeeProcessor: ConsignFeeProcessor

  /**
   * 依赖注入
   * @param pageStateService 页面状态服务
   * @param systemParams 系统参数
   * @param consignEventEmitter 委托事件订阅/发布器
   * @param industryStore 领域状态管理器
   * @param consignStorageManager 数据缓存服务
   * @param consignPrintService 委托打印服务
   */
  constructor(
    public pageStateService: PageStateService,
    public systemParams: ISystemParam,
    public consignEventEmitter: EventEmitter,
    public industryStore: any,
    public consignStorageManager: ConsignStorageManager,
    public consignPrintService: ConsignPrintService,
  ) {
    super(
      pageStateService,
      systemParams,
      industryStore,
      consignEventEmitter,
      consignStorageManager,
    )

    // 实例化委托单位控制器
    this.consignUnitProcessor = new ConsignUnitProcessor(this)

    // 实例化委托费用控制器
    this.consignFeeProcessor = new ConsignFeeProcessor(this)

    // 实例化委托样品控制器
    this.consignSampleProcessor = new ConsignSampleProcessor(this)

    // 实例化离线数据服务
    this.consignOffineDataService = new ConsignOffineDataService(this)
  }

  /** 检查是否自动打印委托单 */
  checkAutoPrintConsignForm() {
    // 判断逻辑，在详情页或样品退回时，开启了【完成委托是否自动打印委托单】系统参数
    return (this.pageStateService.readonly || this.consignSampleProcessor.isSampleRollback) && this.systemParams.FINISH_DELE_2
  }

  /** 获取缓存的编号类别ID */
  getStorageSnType() {
    const storage = this.consignStorageManager.getSnTypeStorage()
    return storage.consignSnTypeId || ''
  }

  /** 保存委托 */
  async submit(saveData: IConsignDataDTO, isComplete?: boolean) {
    const { data } = await saveConsignDetailApi(saveData)

    const isOk = await this.afterSaveCheckSnRepeat(data)
    if (!isOk)
      return

    // 缓存编号类别
    this.consignStorageManager.setStorageSnType('consignSnTypeId', this.consignData.snTypeId)

    this.consignData.id = data.consignId
    this.consignData.consignCode = data.consignCode

    // 处理生成编号
    await this.handleGenerateCode(data.generateCode, data.consignId)

    // 检查样品编号是否修改
    await this.inspectCodeSame(data)

    if (isComplete)
      await this.completeFinishCallback()
    else
      await this.saveFinishCallback(data)
  }

  /** ## 处理生成编号 */
  async handleGenerateCode(generateCode: EGenerateCode, consignId: string) {
    if (generateCode === EGenerateCode.CONSIGN_CODE) {
      const code = await this.generateConsignCode(consignId)
      if (code) {
        this.consignData.consignCode = code
        message.success('生成编号成功')
      }
      return Promise.resolve(true)
    }
    if (generateCode === EGenerateCode.SAMPLE_CODE) {
      // 保存后执行打印操作
      const isOk = await modalConfirm('委托尚未完成，暂未生成委托编号。是否需要生成委托编号？', '', {
        okText: '生成并预览',
        cancelText: '直接预览',
      })
      if (isOk) {
        const code = await this.generateConsignCode(consignId)
        this.consignPrintService.printConsignOrder(consignId)
        this.consignData.consignCode = code
      }
      else {
        this.consignPrintService.printConsignOrder(consignId)
      }

      return Promise.reject(new Error('委托尚未完成，暂未生成委托编号，无法保存。'))
    }
  }

  /** ## 检查样品编号是否修改，改动前后编号是否一致 */
  async inspectCodeSame(res: ISaveConsignRes['data']) {
    const datas = res.snMonitors || []
    if (datas.length > 0) {
      await AnyDialogHelper.showModel(SnChange, {
        datas,
      })
    }
  }

  /** 保存委托回调 */
  async saveFinishCallback(res: ISaveConsignRes['data']) {
    // 生成样品编号保存委托
    const refresh = !this.consignData.status || this.refreshConsignList
    /** 是否为样品页面保存委托 */
    const samplePageSave = this.consignData.generateCode === EGenerateCode.MANUAL_CODE || this.consignData.generateCode === EGenerateCode.AUTO_SAVE

    if (res && res.isSave && res.consignId && refresh) {
      if (!samplePageSave) {
        const config: IGoDetailConfig = {
          industryId: this.pageStateService.industryId,
          id: res.consignId,
          status: this.consignData.status,
        }
        this.reOpenDetail('修改委托', config)
      }
    }

    const generateCode = res.generateCode
    if (!this.pageStateService.isCreateTest && generateCode !== EGenerateCode.RECEIVE_CODE) {
      if (generateCode !== EGenerateCode.CONSIGN_CODE && !samplePageSave) {
        message.success(res.msg || '保存成功')
      }
    }
  }

  /** 完成委托回调 */
  async completeFinishCallback() {
    const isCheck = await this.completeCheckQualifications()
    if (isCheck)
      await this.completeCheckConsignDate()
  }

  /** ## 完成委托超资校验 */
  async completeCheckQualifications() {
    if (this.systemParams.NOT_ALLOWED_EMPTY_QUALIFICATION === 'none')
      return true

    const qId = this.consignData.qualificationTypeId as string[]
    const formData: IOverQualificationCheckParam = {
      samples: [],
      qualificationIds: [],
    }

    // 未开启按样品设置资质，才传递资质id参数
    // 因为委托信息和样品信息中的资质id会互相同步，此处前端控制逻辑避免后端被搞懵
    if (!this.systemParams.SET_QUA_WITH_OBJECT && qId && qId.length > 0) {
      formData.qualificationIds = qId
    }

    this.consignSampleProcessor.consignSampleData.forEach((item) => {
      const paramIds = item.testParams.map((paramItem) => {
        return paramItem.testParamId
      })
      let qualificationIds: string[] = []

      // 开启按样品设置资质，才在样品信息中传递资质id
      if (this.systemParams.SET_QUA_WITH_OBJECT) {
        qualificationIds = item.qualifications.map((qItem) => {
          return qItem.id
        })
      }

      formData.samples.push({
        sampleId: item.testUnitTestSampleId,
        paramIds,
        qualificationIds,
      })
    })

    const { hasEmpty, isEmptyQualification, content } = await this.completeOverQualificationCheck(formData)

    if (isEmptyQualification)
      return true

    if (hasEmpty && this.systemParams.NOT_ALLOWED_EMPTY_QUALIFICATION === 'block') {
      await modalError(h('div', {}, content))
    }
    else {
      return await modalConfirm(h('div', {}, content), '', {
        okText: '继续提交',
      })
    }
  }

  /** ## 超资检查 */
  async completeOverQualificationCheck(formData: IOverQualificationCheckParam) {
    const { data } = await overQualificationApi(formData)
    const content: VNode[] = []
    /** 资质为空 */
    let isEmptyQualification = true
    /** 该资质无检测参数 */
    let hasEmpty = false
    data.forEach((item: any) => {
      const sampleName = item.sampleName
      const overQualifications = item.overQualifications.filter((oItem: any) => {
        return oItem.empty || oItem.notCovered.length > 0
      })

      if (overQualifications.length > 0) {
        content.push(h('p', { style: {} }, `${this.industryStore.term('样品')}，${sampleName}中：`))

        overQualifications.forEach((oItem: any) => {
          const empty = oItem.empty
          const notCovered = oItem.notCovered
          const qualification = oItem.qualification
          isEmptyQualification = false
          if (empty) {
            hasEmpty = true
            content.push(h('p', {}, `资质：${qualification}，无检测参数！`))
          }
          else {
            content.push(h('p', {}, `资质：${qualification}，未覆盖参数：${notCovered.join('、')}`))
          }
        })
      }
    })
    return { hasEmpty, isEmptyQualification, content }
  }

  /** ## 完成委托验证委托日期 */
  async completeCheckConsignDate() {
    const nowDate = AnyDateTimeHelper.format(new Date(), EDateFormatType.YYYY_MM_DD)
    if (this.consignData.consignDate && AnyDateTimeHelper.format(this.consignData.consignDate, EDateFormatType.YYYY_MM_DD) !== nowDate) {
      const isOk = await modalConfirm('委托日期与当前日期不一致，是否继续？', '', {
        okText: '继续',
      })
      if (!isOk)
        return

      await this.completeTestParamSettingConfirm()
    }
    else {
      await this.completeTestParamSettingConfirm()
    }
  }

  /** ## 完成委托，检测参数设置确认 */
  async completeTestParamSettingConfirm() {
    const rowIds = ref([this.consignData.id as string])
    const { testParamSettingConfirm, checkSnRule, completeConsign } = useCompleteConsign(rowIds, this.isLocalTest)
    testParamSettingConfirm(async (param: any) => {
      const code = await checkSnRule({
        consignId: this.consignData.id as string,
        consignCode: this.consignData.consignCode as string,
      })

      this.isLocalTest = param.isLocalTest || false

      if (code)
        this.consignData.consignCode = code

      await completeConsign({
        expressions: '',
      })

      await this.synthesisTestCreateProgress(this.consignData.id as string)

      // 执行完成，重新打开委托详情页面
      this.completeFinishRefreshPage()
    })
  }

  /** ## 执行完成，重新打开委托详情页面 */
  completeFinishRefreshPage() {
    const config: IGoDetailConfig = {
      industryId: this.pageStateService.industryId,
      id: this.consignData.id as string,
      presetNumber: '1',
      checkBindElectronLabel: '1',
      detail: 'detailPage',
    }

    this.reOpenDetail('查看委托', config)
  }
}
