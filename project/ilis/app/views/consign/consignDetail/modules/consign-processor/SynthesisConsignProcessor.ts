import type { IGoDetailConfig } from '../../interface'
import type { IConsignDataDTO } from '~/api/consign/consign-management/types'
import type { ISystemParam } from '~/api/system/system-param/types'
import type { ConfirmResult } from '~/components/IframeLayer.vue'
import type { EventEmitter } from '~/utils/EventEmitter.ts'
import type { ConsignStorageManager } from '~/views/consign/consignDetail/modules/ConsignStorageManager.ts'
import type { PageStateService } from '~/views/consign/consignDetail/modules/PageStateService.ts'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { cacheDataToServer } from '~/api/common'
import { synthesisDefaultPersonApi, synthesisTaskPersonApi } from '~/api/consign/consign-management'
import IframeLayer from '~/components/IframeLayer.vue'
import sseRequestProgress from '~/components/sseRequestProgress'
import { modalError } from '~/utils/modalUtil'
import { BaseConsignProcessor } from '~/views/consign/consignDetail/modules/consign-processor/BaseConsignProcessor.ts'
import { ConsignFeeProcessor } from '../ConsignFeeProcessor'
import { ConsignOffineDataService } from '../ConsignOffineDataService'
import { ConsignSampleProcessor } from '../ConsignSampleProcessor'
import { ConsignUnitProcessor } from '../ConsignUnitProcessor'

/**
 * 综合试验委托处理器
 */
export class SynthesisConsignProcessor extends BaseConsignProcessor {
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
   * @param consignStorageManager 数据缓存管理器
   * @param industryStore 领域状态管理器
   */
  constructor(
    public pageStateService: PageStateService,
    public systemParams: ISystemParam,
    public consignEventEmitter: EventEmitter,
    public consignStorageManager: ConsignStorageManager,
    public industryStore: any,
  ) {
    super(
      pageStateService,
      systemParams,
      consignEventEmitter,
      industryStore,
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

  /** ## 检查是否自动打印委托单：综合试验委托不支持自动打印 */
  checkAutoPrintConsignForm() {
    return false
  }

  /** ## 获取缓存的编号类别ID */
  getStorageSnType() {
    const storage = this.consignStorageManager.getSnTypeStorage()
    return storage.synthesisConsignSnTypeId || ''
  }

  /** ## 离线数据 */
  getOfflineData() {
    const data = sessionStorage.getItem(this.pageStateService.offlineDataId)
    return data ? JSON.parse(data) : null
  }

  getSampleIdOrParamId() {
    const sampleIds = []
    const paramIds = []
    ;(function _each(datas) {
      for (let i = 0; i < datas.length; i++) {
        const item = datas[i]
        sampleIds.push(item.testSampleId)
        if (item.testParams) {
          for (let j = 0; j < item.testParams.length; j++) {
            const par = item.testParams[j]
            paramIds.push(par.testParamId)
          }
        }

        if (item.otherMaterials?.length) {
          const subSample = item.otherMaterials.filter(d => d.type === 4)
          _each(subSample)
        }
      }
    })(this.consignSampleProcessor.consignSampleData)
    return {
      sampleIds,
      paramIds,
    }
  }

  /** 保存委托 */
  async submit(saveData: IConsignDataDTO) {
    const { sampleIds, paramIds } = this.getSampleIdOrParamId()
    const staffData: any[] = [
      { field: 'testPersonIds', staffname: [], required: true, typename: '检测人员', type: '0', pType: '0' },
      { field: 'principalIds', staffname: [], typename: '项目负责人', type: '1', pType: '7' },
      { field: 'reportPersonIds', staffname: [], typename: '报告编写人员', type: '2', pType: '2' },
      { field: 'recheckPersonIds', staffname: [], required: true, typename: '复核人员', type: '4', pType: '1' },
      { field: 'auditPersonIds', staffname: [], typename: '审核人员', type: '5', pType: '3' },
      { field: 'approverIds', staffname: [], required: true, typename: '批准人员', type: '5', pType: '4' },
    ]
    let contractId = saveData.unitProject?.unitProjectObjId
    const synthesisType = saveData.unitProject?.unitProjectType
    if (synthesisType === '1')
      contractId = ''
    try {
      // 验证人员
      if (this.pageStateService.cloneReport) {
        // 获取已设置的检测人员
        const { data } = await synthesisTaskPersonApi({ id: this.consignConstructParams?.taskId || '' })
        for (let i = 0; i < data.length; i++) {
          const d = data[i]
          const obj = { id: d.id, name: d.name }
          staffData.forEach((item) => {
            if (item.pType === `${d.type}`) {
              item.staffname.push(obj)
            }
          })
        }
      }
      else {
        // 获取默认检测人员
        const { data } = await synthesisDefaultPersonApi({
          projectId: saveData.unitProject?.unitProjectObjId,
          paramIds: paramIds.toString(),
          contractId,
          synthesisType,
        })
        // 设置默认检测人员
        await this.saveSetDefaultPerson(data, staffData)
      }
      // 缓存数据到服务器，获取缓存id
      const { data } = await cacheDataToServer({
        staffData,
        paramIds: paramIds.toString(),
        sampleIds: sampleIds.toString(),
      })
      await this.createTestSubmit(saveData, data)
    }
    catch (err) {
      console.error('创建综合，获取默认检测人员失败', err)
    }
  }

  /** ## 初始化SSE请求参数 */
  initSSERequestParam(users: any[], departInfo: any) {
    // 设置检测人员及部门
    const obj: any = {}
    for (let i = 0; i < users.length; i++) {
      const user = users[i]
      const _staffname = user.staffname.map((it: any) => it.id)
      obj[user.field] = _staffname.toString()
    }

    if (departInfo) {
      obj.departmentId = departInfo.id
      obj.department = departInfo.name
    }
    return obj
  }

  /** ## 创建综合试验 */
  async createTestSubmit(saveData: IConsignDataDTO, serverCacheId: string) {
    try {
      const res = await this.selectTestPerson(serverCacheId)
      if (!res)
        return

      const assignParams = this.initSSERequestParam(res.users, res.departInfo)

      sseRequestProgress.show({
        api: 'synthesisTestTaskController/createSynthesisTestTaskNew',
        method: 'post',
        data: {
          consign: saveData,
          assignParams,
        },
        onComplete: (res) => {
          this.save_finishCallback_createTest(res)
        },
        onError: (err) => {
          console.error(err)
          modalError(err.msg || err.message)
        },
      })
    }
    catch (err) {
      console.error('创建综合，缓存数据失败', err)
    }
  }

  /** ## 设置默认检测人员 */
  async saveSetDefaultPerson(data: any[], staffData: any[]) {
    for (let i = 0; i < data.length; i++) {
      const d = data[i]
      const obj: any = { id: d.personId, name: d.personName, departs: [] }
      // 获取默认值时，将默认的人员部门也传过去
      const departs = []
      if (d.departs && d.departs.length > 0) {
        for (let j = 0; j < d.departs.length; j++) {
          const departItem = d.departs[j]
          departs.push({
            id: departItem.id,
            name: departItem.departname,
          })
        }
      }
      obj.departs = departs

      staffData.forEach((item) => {
      // 默认人员设置，报告编写人员不需要默认
        if (d.personType !== '2' && item.pType === `${d.personType}`) {
          item.staffname.push(obj)
        }
      })
    }
    // 离线任务创建委托，默认检测人员为数据上传人员
    if (this.pageStateService.offlineDataId && !this.isConfirmHint) {
      const d = this.getOfflineData()
      if (d.uploadUserId && d.uploadUserName) {
        staffData[0].staffname.push({
          id: d.uploadUserId,
          name: d.uploadUserName,
          departs: [],
        })
      }
    }
  }

  /** ## 创建综合试验：选择检测人员 */
  async selectTestPerson(serverCacheId: string): Promise<null | { users: any[], departInfo: string | any, close: () => void }> {
    return new Promise((resolve) => {
      AnyDialogHelper.showModel(IframeLayer, {
        title: '设置人员',
        url: `reportCreateController.do?goPersonChoosePage&pageSource=1&serverCacheId=${serverCacheId || ''}&projectId=${this.pageStateService.projectId || ''}`,
        onConfirm: (res: ConfirmResult) => {
          if (!res)
            return resolve(null)

          res.iframeWindow?.InitObj.openCallback(null, async (_layerO: null, users: any[], depart: string | any) => {
            if (!users)
              return

            const departInfo = await this.selectTestDepart(depart)
            if (!departInfo)
              return

            resolve({ users, departInfo, close: res.close })
          })
        },
      })
    })
  }

  /** ## 创建综合使用：选择部门 */
  async selectTestDepart(data: string | any): Promise<null | any> {
    return new Promise((resolve) => {
      if (typeof data !== 'string')
        return resolve(data)

      // 选择部门
      AnyDialogHelper.showModel(IframeLayer, {
        title: '请选择检测部门',
        url: `assignedTaskController.do?goSelectDepartment&&getbyId=${data || ''}`,
        width: '500px',
        onConfirm: (res: ConfirmResult) => {
          if (!res)
            return
          res.iframeWindow?.InitObj.openCallback(null, (_d: null, departInfo: any) => {
            res.close()
            if (!departInfo)
              return
            resolve(departInfo)
          })
        },
      })
    })
  }

  /** ## 保存委托后处理逻辑 */
  async save_finishCallback_createTest(res: any) {
    if (!await this.afterSaveCheckSnRepeat(res))
      return

    // 缓存编号类别
    this.consignStorageManager.setStorageSnType('synthesisConsignSnTypeId', this.consignData.snTypeId)

    await this.synthesisTestCreateProgress(res, true, { isTesting: 'isTesting' })

    const config: IGoDetailConfig = {
      industryId: this.pageStateService.industryId,
      id: res,
      detail: 'detailPage',
      status: '20',
    }

    this.reOpenDetail('查看委托详情', config)
  }
}
