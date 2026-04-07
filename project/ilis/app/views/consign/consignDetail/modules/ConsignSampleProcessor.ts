import type { IConsignProcessor, IConsignSamples, IRenderSampleData } from '../interface'
import { cloneDeep } from '@unovis/ts'
import { deleteSampleApi, delExternalSampleApi, validateQualificationApi } from '~/api/consign/consign-management'
import { modalConfirm, modalError } from '~/utils/modalUtil'
import { SampleStatus } from '../interface'

/**
 * 委托样品处理器
 */
export class ConsignSampleProcessor {
  /** 委托样品数据 */
  protected sampleDatas: IConsignSamples[] = []
  /** 展开行键 */
  expandedRowKeys: string[] = []
  /** 选中样品 */
  selectedSample: Record<string, boolean> = {}
  /** 显示预设编号 */
  renderSampleDatas: IRenderSampleData[] = []
  /**
   * ## 有样品退回
   * @description 委托详情加载完成后不再变化，consignDetail.status === '45'
   */
  sampleRollback: boolean = false

  get consignSampleData() {
    return this.sampleDatas
  }

  /** ## 系统参数 */
  get systemParams() {
    return this.consignProcessor.systemParams
  }

  /** ## 页面状态服务 */
  get pageStateService() {
    return this.consignProcessor.pageStateService
  }

  get industryStore() {
    return this.consignProcessor.industryStore
  }

  /** ## 委托数据 */
  get consignData() {
    return this.consignProcessor.data
  }

  constructor(
    private consignProcessor: IConsignProcessor,
  ) {}

  /** 解析样品元数据 */
  parseSampleMetaData(str?: string) {
    try {
      return JSON.parse(str || '[]')
    }
    catch (e) {
      console.error(e)
    }

    return []
  }

  /**
   * 加载委托样品数据
   * @param meta 元数据
   */
  setConsignSampleData(meta: IConsignSamples[]) {
    this.sampleDatas = meta
  }

  /** ## 有样品退回 */
  get isSampleRollback() {
    return this.sampleRollback
  }

  setSampleRollback(val: boolean) {
    this.sampleRollback = val
  }

  /** 初始化复制报告逻辑 */
  initCloneReport() {
    const consignSampleData = this.sampleDatas

    for (let i = 0; i < consignSampleData.length; i++) {
      const metaItem = consignSampleData[i]

      delete metaItem.id
      delete metaItem.status

      metaItem.accessories = []
      metaItem.mark = generateGUID()
      metaItem.multipleCode = ''
      metaItem.testObjectCode = ''
      metaItem.provideToCustomerSampleCode = ''

      if (metaItem.objectCodeArr)
        metaItem.objectCodeArr = []
    }
  }

  /**
   * ## 处理样品数据，渲染列表
   * @description 此数据仅用于列表渲染，需要修改数据时，请修改 sampleDatas 数据，此处深拷贝处理，不影响 sampleDatas
   */
  initRenderSampleDatas() {
    const renderList = cloneDeep(this.sampleDatas) as IRenderSampleData[]
    this.expandedRowKeys = []
    const _each = (datas: IRenderSampleData[], parent?: IRenderSampleData) => {
      for (let i = 0; i < datas.length; i++) {
        const item = datas[i]
        // IlisTable行标识为id，新增样品没有id导致选择数据异常，将原id保存（编辑时存在），采用mark作为唯一标识
        item.originId = item.id
        item.id = item.mark

        if (parent) {
          item.parentStatus = parent.status as SampleStatus
          item.parentMark = parent.mark

          // 引用数据不显示费用，不参与费用计算
          if (!item.parentSampleId)
            item.testObjectPrice = 0
        }
        else {
          this.expandedRowKeys.push(item.mark)
        }

        // 单样品退回，正常状态样品禁用复选框
        if (this.consignProcessor.pageStateService.readonly || (this.isSampleRollback && item.status !== SampleStatus.ROLLBACK)) {
          item.disabled = true
        }

        if (!item.testObjectCode)
          item.testObjectCode = '未生成编号'

        if (!item.provideToCustomerSampleCode && this.consignProcessor.systemParams.ENABLE_PROVIDE_TO_CUSTOMER_SAMPLE_CODE)
          item.provideToCustomerSampleCode = '未生成编号'

        if (item.otherMaterials && item.otherMaterials.length) {
          _each(item.otherMaterials, item)
          item.children = item.otherMaterials
        }
      }
    }
    _each(renderList)

    return renderList
  }

  /** ## 删除样品中的离线数据记录id */
  removeHandbookRecordId() {
    this.sampleDatas.forEach((item) => {
      delete item.handbookRecordId
    })
  }

  /**
   * ## 通过mark获取元数据
   * @returns 返回编辑的样品，引用关系
   * @description renderSampleDatas数据经过处理，仅作为前端渲染，编辑数据时还是使用 sampleDatas
   */
  getMetaDataItemByMark(mark: string) {
    function _each(datas: IConsignSamples[]): IConsignSamples | undefined {
      for (let i = 0; i < datas.length; i++) {
        const item = datas[i]
        if (item.mark === mark)
          return item

        if (item.otherMaterials && item.otherMaterials.length) {
          const res = _each(item.otherMaterials)
          if (res)
            return res
        }
      }
    }
    return _each(this.sampleDatas)
  }

  /** ## 更新样品资质： 修改委托资质，同步样品上的资质信息 */
  updateQulificationByConsign(qualificationIds: string[]) {
    const qualifications = JSON.parse(localStorage.getItem('qualifications') || '[]')
    const selectedQualifications = qualifications.filter((i: any) => qualificationIds.includes(i.id))
    this.sampleDatas.forEach((item) => {
      item.qualifications = selectedQualifications
    })
  }

  /** ## 更新资质信息： 按样品设置资质时，更新样品资质信息 */
  async updateQulifications(record: IRenderSampleData, qualifications: any[]) {
    const sample = this.getMetaDataItemByMark(record.mark)
    if (!sample)
      return modalError('未找到需要操作的数据')

    const updateData = () => {
      sample.qualifications = qualifications
      this.updateConsignQualifications()
    }

    const res = await this.checkQualificationForEditConsign([sample])
    if (!res)
      return updateData()

    const msg = h('div', {}, [
      h('p', { class: 'mb-1 text-[#ff7c04]' }, `${this.industryStore.term('样品')} ${sample.testSampleDisplayName} 中：`),
      res,
    ])
    // 无需覆盖时，做确认提示，否则阻断提示
    if (this.systemParams.REPORT_QUA_SEAL_QUERY === 'NONE') {
      const ok = await modalConfirm(msg, '请注意')
      if (ok)
        updateData()
    }
    else {
      modalError(msg, '请注意')
    }
  }

  /** ## 按样品设资质：添加委托资质，取样品上的资质并集，作为委托详情资质显示 */
  updateConsignQualifications() {
    if (!this.systemParams.SET_QUA_WITH_OBJECT)
      return

    const selQuaIds: string[] = []
    this.sampleDatas.forEach((item) => {
      if (item.qualifications && item.qualifications.length) {
        item.qualifications.forEach((qua) => {
          if (!selQuaIds.includes(qua.id)) {
            selQuaIds.push(qua.id)
          }
        })
      }
    })
    this.consignProcessor.setConsignData({
      qualificationTypeId: selQuaIds,
    })
  }

  /** ## 开启了按样品参数添加资质后，编辑样品需要对资质进行验证 */
  async checkQualificationForEditConsign(metaDatas: IConsignSamples[]) {
    const msgs: string[] = []
    for (let i = 0; i < metaDatas.length; i++) {
      const metaData = metaDatas[i]
      if (!this.systemParams.SET_QUA_WITH_OBJECT || !metaData.qualifications || !metaData.qualifications.length)
        break

      const paramIds = metaData.testParams.map(d => d.testParamId).join(',')
      const quaIds = metaData.qualifications.map(d => d.id).join(',')

      try {
        const { data } = await validateQualificationApi({ paramIds, quaIds })
        if (!data)
          break

        msgs.push(...data.split('<br/>').filter((d: any) => !!d))
      }
      catch (error) {
        console.error(error)
        break
      }
    }
    return msgs.length ? h('ul', {}, msgs.map(d => [h('li', d)])) : undefined
  }

  /** ## 跨项目收样检查 */
  crossProjectSampleCheck(metaData: IConsignSamples) {
    const params = metaData.testParams
    const testItemIds: string[] = []
    for (let j = 0; j < params.length; j++) {
      const param = params[j]
      const testItemId = param.testItemId || ''
      if (!testItemIds.includes(testItemId)) {
        testItemIds.push(testItemId)
      }
      param.basis = param.basis.replace(/<span.*?<\/span>/g, '')
    }
    if (testItemIds.length > 1 && !this.systemParams.COMPOUND_ITEMS) {
      modalError('不允许收取不同检测项目下的参数，请重新选择(可在系统控制参数中，设置为允许跨检测项目收样)')
      return false
    }
    metaData.testSampleId = metaData.testSampleId || metaData.testUnitTestSampleId
    return true
  }

  /** ## 复制子样品以及关联样品 */
  copySubSample(otherMaterials: IConsignSamples[]) {
    for (let i = 0; i < otherMaterials.length; i++) {
      const subSample = otherMaterials[i]
      subSample.mark = generateGUID()

      if (!isEqual(subSample.type, 3) && !isEqual(subSample.type, 4))
        continue

      delete subSample.id
      if (isEqual(subSample.type, 4)) {
        subSample.testObjectCode = ''
        subSample.provideToCustomerSampleCode = ''
        subSample.accessories = []
      }
      else {
        // 复制样品下如果有外来样品，则设置为引用外来样品2021-9-26_lijing 工单:#28061
        subSample.referred = true
        // 复制的均不可占用编号
        subSample.needOccupation = false
      }

      const _periods = subSample.periods
      if (_periods && _periods.length > 0) {
        for (let l = 0; l < _periods.length; l++) {
          _periods[l].periodCode = ''
        }
      }
    }
  }

  /** ## 删除样品数据 */
  async deleteSampleDatas(row: IRenderSampleData) {
    async function _each(samples: IConsignSamples[], child?: boolean) {
      for (let i = 0; i < samples.length; i++) {
        const item: IConsignSamples | any = samples[i]
        // 删除主样品
        if (item.mark === row.mark) {
          // 如果不是引用的外来样品则需要调接口删除
          if (child && !item.referred && item.externalObjectId)
            await delExternalSampleApi(item.externalObjectId)

          samples.splice(i, 1)
          return item
        }

        // 删除子样品、关联样品
        if (item.otherMaterials && item.otherMaterials.length) {
          const d: any = await _each(item.otherMaterials, true)
          if (d)
            return d
        }
      }
    }
    await _each(this.sampleDatas)
  }

  /**
   * ## 删除样品
   * @param {IRenderSampleData} row 样品数据
   * @param {string} opinion 删除原因
   * @param {boolean} isDelete 是否为删除 true-删除 false-作废
   */
  async commonDeleteSample(row: IRenderSampleData, opinion: string, isDelete: boolean) {
    await deleteSampleApi({
      mark: row.mark,
      delete: isDelete,
      opinion,
    })
    await this.deleteSampleDatas(row)
    delete this.selectedSample[row.mark]
  }

  /** ## 复制样品 */
  async handleCloneSample(selMarks: string[]) {
    selMarks.forEach((mark) => {
      const sample = this.getMetaDataItemByMark(mark)
      if (!sample)
        return
      const cloneSample = cloneDeep(sample) as IConsignSamples
      cloneSample.mark = generateGUID()
      cloneSample.multipleCode = ''
      if (!isEqual(cloneSample.type, 3) && !isEqual(cloneSample.type, 4)) {
        cloneSample.testObjectCode = ''
        cloneSample.provideToCustomerSampleCode = ''
        cloneSample.accessories = []
        delete cloneSample.id
        if (cloneSample.periods && cloneSample.periods.length > 0) {
          for (let l = 0; l < cloneSample.periods.length; l++) {
            cloneSample.periods[l].periodCode = ''
          }
        }
      }
      if (cloneSample.otherMaterials && cloneSample.otherMaterials.length > 0) {
        this.copySubSample(cloneSample.otherMaterials)
      }
      if (cloneSample.objectCodeArr && cloneSample.objectCodeArr.length > 0) {
        cloneSample.objectCodeArr = []
      }
      this.sampleDatas.push(cloneSample)
    })
  }

  /** 选择的样品参数是否含有现场试验参数，确认是否设置现场试验选中 */
  async checkLocalTestParam(metaDatas: IConsignSamples[]) {
    for (let i = 0; i < metaDatas.length; i++) {
      const metaData = metaDatas[i]

      const params = metaData.testParams.filter(d => d.isLocaleItem === 'true')
      if (!params.length)
        break

      if (!this.consignProcessor.isLocalTest && this.consignProcessor.contralConfirm === '3') {
        const names = params.map(d => d.displayName).join('、')
        const paramTerm = this.industryStore.term('参数')
        const isOk = await modalConfirm(`当前${this.industryStore.term('样品')}${paramTerm}中包含有现场试验${paramTerm}:（${names}），是否设置为现场试验？`)
        if (isOk)
          this.consignProcessor.isLocalTest = true

        break
      }
    }
  }

  /** ## 数据更新到列表前处理 */
  beforeSaveSample(metaData: IConsignSamples) {
    // 外来样品旧数据处理：增加新功能引用外来样品，referred字段区分录入和引用的标识，之前旧数据全部默认变成引用标识
    metaData.otherMaterials.forEach((subItem) => {
      if (!Object.prototype.hasOwnProperty.call(subItem, 'referred')) {
        subItem.referred = true
      }
    })
  }

  /** ## 新增子样品数据 */
  addChildSample(metaData: IConsignSamples) {
    const parentSample = this.sampleDatas.find(item => this.selectedSample[item.mark])
    if (!parentSample) {
      modalError('未找到需要操作的数据')
      return
    }

    metaData.type = 4
    metaData.parentSampleId = parentSample.testSampleId || parentSample.testUnitTestSampleId

    if (!parentSample.otherMaterials || parentSample.otherMaterials.length === 0) {
      parentSample.otherMaterials = [metaData]
    }
    else {
      const ind = parentSample.otherMaterials.findIndex(item => item.mark === metaData.mark)
      if (ind > -1)
        parentSample.otherMaterials[ind] = metaData
      else
        parentSample.otherMaterials.push(metaData)
    }
  }

  /**
   * ## 保存样品
   * @param {object} param 保存样品参数
   * @param {IConsignSamples} param.metaDatas 样品数据
   * @param {boolean} param.isAddChild 是否为添加子样品
   * @param {boolean} param.isSaveConsign 是否保存委托 - 生成样品编号时是否自动保存委托
   */
  async saveSample(param: {
    metaDatas: IConsignSamples[]
    isAddChild?: boolean
    isSaveConsign?: boolean
  }) {
    for (let i = 0; i < param.metaDatas.length; i++) {
      const metaData = param.metaDatas[i]
      if (!await this.consignProcessor.consignOffineDataService.beforeSaveCheckOffline(metaData))
        return

      // 跨项目收样检查
      if (!this.crossProjectSampleCheck(metaData))
        return
      // 数据更新到列表前处理
      await this.beforeSaveSample(metaData)

      // 是否为添加子样品
      if (param.isAddChild) {
        this.addChildSample(metaData)
      }
      else {
      // 更新样品到列表
        const index = this.sampleDatas.findIndex(item => item.mark === metaData.mark)
        if (index === -1) {
          this.sampleDatas.push(metaData)
        }
        else {
          this.sampleDatas[index] = metaData
        }
      }
    }

    // 按样品设置资质，将样品资质设置到委托资质上
    this.updateConsignQualifications()

    // 开启了按样品参数添加资质后，编辑样品需要对资质进行验证（异步执行）
    this.checkQualificationForEditConsign(param.metaDatas).then((res) => {
      if (res)
        modalError(res, '请注意')
    })

    // 选择的样品参数是否含有现场试验参数，确认是否设置现场试验选中
    this.checkLocalTestParam(param.metaDatas)
  }
}
