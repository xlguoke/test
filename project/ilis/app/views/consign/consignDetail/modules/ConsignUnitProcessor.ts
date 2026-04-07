import type { IConsignProcessor, IConsignUnitProject } from '../interface'
import type { IConsignDataDTO } from '~/api/consign/consign-management/types'

/** ## 保存委托接口中的数据结构 */
export interface SaveConsignUnitProject {
  /** 委托单位信息 */
  consignUnit: IConsignDataDTO['consignUnit']
  /** 工程项目信息 */
  project: IConsignDataDTO['project']
  sampleSender: IConsignDataDTO['sampleSender']
}

/**
 * 委托单位处理器
 */
export class ConsignUnitProcessor {
  /**
   * 依赖注入
   */
  constructor(
    private consignProcessor: IConsignProcessor,
  ) {}

  get consignStorageManager() {
    return this.consignProcessor.consignStorageManager
  }

  /** 获取单位工程缓存 */
  getConsignUnitStorage(): IConsignUnitProject | null {
    return this.consignProcessor.consignStorageManager.getConsignUnitStorage()
  }

  /** 更新缓存的委托单位工程项目信息 */
  updateConsignUnitStorage(data: {
    projectId?: string
    buildWitnesses: IConsignDataDTO['witnesses']
    witnesses: IConsignDataDTO['witnesses']
  }) {
    const cacheData = this.getConsignUnitStorage()
    if (!cacheData)
      return

    if (data.projectId && data.projectId !== cacheData.project?.consignProject?.id)
      return

    cacheData.project.buildWitnesses = (data.buildWitnesses || []).map(d => ({
      witness: d.witness,
      witnessNum: d.witnessLicenseNumber,
      witnessPhone: d.witnessPhone,
      selected: true,
    }))

    cacheData.project.witnesses = (data.witnesses || []).map(d => ({
      witness: d.witness,
      witnessNum: d.witnessLicenseNumber,
      witnessPhone: d.witnessPhone,
      selected: true,
    }))

    this.consignStorageManager.setConsignUnitStorage(cacheData)
  }

  /** 转换委托单位、工程项目字段为保存委托的数据结构 */
  transformUnitProjectData(data?: IConsignUnitProject): SaveConsignUnitProject {
    if (!data) {
      return {
        consignUnit: { name: '', consignUnitId: '', consignUnitName: '' },
        project: { name: '', projectTenderName: '', projectId: '' },
        sampleSender: { name: '', sampleSenderName: '', sampleSenderId: '' },
      }
    }

    const { consignUnit, project, sampleSender } = data

    return {
      consignUnit: {
        name: consignUnit.name,
        consignUnitName: consignUnit.name,
        consignUnitId: consignUnit.id,
        consignUnitAddress: consignUnit.contactAddress,
      },
      project: {
        name: project?.consignProject?.name || '',
        projectTenderName: project?.consignProject?.name || '',
        projectId: project?.consignProject?.id || '',
        projectAddress: project?.consignProject?.projectAddress || '',
      },
      sampleSender: {
        name: sampleSender.name,
        sampleSenderName: sampleSender.name,
        sampleSenderId: sampleSender.id,
        sampleSenderPhone: sampleSender.contactPhone,
      },
    }
  }

  /** ## 处理委托单位、工程项目对象数据，提供脚本价格使用 */
  consignUnitProjectObjToArray(data: IConsignDataDTO) {
    return [
      { name: 'consignUnitName', value: data.consignUnit.name },
      { name: 'consignUnit.id', value: data.consignUnit.consignUnitId },
      { name: 'projectTenderName', value: data.project?.name },
      { name: 'project?.id', value: data.project?.projectId },
      { name: 'projectAddress', value: data.project?.projectAddress },
      { name: 'sampleSenderName', value: data.sampleSender.name },
      { name: 'sampleSenderPhone', value: data.sampleSender.sampleSenderPhone },
      { name: 'sampleSender.id', value: data.sampleSender.sampleSenderId },
    ]
  }
}
