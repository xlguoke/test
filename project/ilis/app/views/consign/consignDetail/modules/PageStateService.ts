import type { IGoDetailConfig } from '../interface'
import { useIndustryStore } from '~/store/industryStore'

/** ## 只读属性：页面状态 */
export class PageStateService {
  private urlParams: IGoDetailConfig

  constructor() {
    const params = useUrlSearchParams() as IGoDetailConfig
    this.urlParams = { ...params }
  }

  /** ## 样品id */
  get sampleId() {
    return this.urlParams.sampleId || ''
  }

  /** ## 委托id */
  get consignId() {
    return this.urlParams.id || ''
  }

  /** ## 领域id */
  get industryId() {
    return useIndustryStore().industryId || this.urlParams.industryId || ''
  }

  /** ## 只读 */
  get readonly() {
    return this.urlParams.detail === 'detailPage'
  }

  /** ## 项目检测详情跳转 */
  get isTestProject() {
    return this.urlParams.testProject === '1'
  }

  /** ## 创建综合试验 */
  get isCreateTest() {
    return this.urlParams.createTest === '1'
  }

  /** ## 离线数据id，创建综合试验 */
  get offlineDataId() {
    return this.urlParams.offlineDataId || ''
  }

  /** ## 是否是试验检测任务阶段打开 */
  get isTaskRedirect() {
    return this.urlParams.isTaskRedirect === 'true'
  }

  get isTaskAssigned() {
    return this.urlParams.isTaskassigned === 'true'
  }

  /** ## 显示单位工程/工程划分 */
  get showUnitProject() {
    return this.urlParams.showUnitProject === '1'
  }

  /** ## 克隆报告 */
  get cloneReport() {
    return this.urlParams.cloneReport === '1'
  }

  /** ## 项目id： 项目检测详情创建任务时，传入的项目id */
  get projectId() {
    return this.urlParams.projectId || ''
  }

  /** ## 项目名称： 项目检测详情创建任务时，传入的项目名称 */
  get projectName() {
    return this.urlParams.projectName || ''
  }

  /** ## 非委托页面 */
  get notConsignPage() {
    return this.urlParams.notConsignPage === '1'
  }

  /** ## 是否显示预设编号 */
  get presetNumber() {
    return this.urlParams.presetNumber === '1'
  }

  /** ## 完成委托后，校验是否绑定电子标签 */
  get checkBindElectronLabel() {
    return this.urlParams.checkBindElectronLabel === '1'
  }

  /** ## 现场取样id */
  get extractSampleId() {
    return this.urlParams.extractSampleId
  }

  /** ## 是否有修订报告 */
  get hasRevisedReport() {
    return this.urlParams.hasRevisedReport === 'true'
  }
}
