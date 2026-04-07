import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/services/MetaDataBuilder.ts'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import type { UseTestParams } from '~/views/consign/component/selectSample/modules/UseTestParams.ts'
import type { IConsginPageParam } from '~/views/consign/consignDetail/interface'
import { message, Modal } from 'ant-design-vue'
import { EGenerateCode } from '~/api/consign/consign-management'
import { useIndustryStore } from '~/store/industryStore'
import {
  editCodes,
  generateObjectsCode,
  generateProvideToCustomerSampleCode,
  getDefaultQualification,
  parsCodesToProvideToCustomerSampleString,
  parsCodesToString,
} from '~/views/consign/component/selectSample/api.ts'
import { UseBase } from '~/views/consign/component/selectSample/modules/UseBase.ts'

export class ObjectCodeItem {
  // 样品编号主体
  objectCodeMainBody = ''
  // 自定义后缀
  objectCodeSuffix = ''
  // 样品编号（样品编号主体+自定义字段）
  testObjectCode = ''
}

/**
 * 注：样品编号/来样编号
 */
export class CodesInfoEntity {
  /** 样品编号明细 */
  objectCodeArr: ObjectCodeItem[] = []
  /** 样品编号 */
  multipleCode = ''
  /** 样品编号 */
  testObjectCode = ''
  /** 样品编号后缀：复制的委托保留样品编号后缀，去掉空后缀后缓存 */
  objectCodeSuffixArr: string[] = []
  /** 来样编号 */
  provideToCustomerSampleCode = ''
  provideToCustomerSampleMultipleCode = ''
}

/**
 * 样品编号/来样编号
 */
export class UseCodesInfo extends UseBase<CodesInfoEntity> {
  saveSampleOrConsign = inject('saveSampleOrConsign') as (isSave?: boolean, generateCode?: EGenerateCode) => Promise<MetaDataEntity[]>

  /** 是否开启样品编号输入框 */
  enableTestObjectCode = true
  /** 是否开启来样编号输入框 */
  enableProvideToCustomerSampleCode = false

  industryStore = useIndustryStore()

  constructor(private consginPageParam: IConsginPageParam) {
    super(new CodesInfoEntity())
  }

  init() {
    // 页面初始化数据获取
    this.checkEnableTestObjectCode()
    this.checkEnableProvideToCustomerSampleCode()
  }

  /** 检查是否展示样品编号 */
  checkEnableTestObjectCode() {
    const { SYSTEM_PARAM, pageState } = this.consginPageParam
    // [委托收样中增加生成修改样品编号的功能开发]
    // 项目检测不需要生成样品编号，即当项目检测创建任务，且系统控制参数-允许直接创建原材料试验=false时，样品信息填写界面不显示样品编号。
    if (!SYSTEM_PARAM.TEST_DETECTION_40 && pageState.isCreateTest) {
      this.enableTestObjectCode = false
    }
  }

  /** 检查是否展示来样编号 */
  checkEnableProvideToCustomerSampleCode() {
    // 来样编号
    getBusinessParam('ENABLE_PROVIDE_TO_CUSTOMER_SAMPLE_CODE').then((val) => {
      this.enableProvideToCustomerSampleCode = val
    })
  }

  /** 设置样品编号 */
  setObjectCodeArr(data: ObjectCodeItem[]) {
    const objectCodeArr = data.map(item => ({
      objectCodeMainBody: item.objectCodeMainBody || '',
      objectCodeSuffix: item.objectCodeSuffix || '',
      testObjectCode: (item.objectCodeMainBody || '') + (item.objectCodeSuffix || ''),
    }))

    const codes = objectCodeArr.filter(i => i.testObjectCode).map(i => i.testObjectCode).join(';')

    this.setDataField('objectCodeArr', objectCodeArr)
    this.setDataField('testObjectCode', codes)
    this.setDataField('multipleCode', codes)
    this.setDataField('objectCodeSuffixArr', objectCodeArr.map(i => i.objectCodeSuffix))
  }

  /**
   * 生成样品编号
   * @param type 样品编号-sample 来样编号-provideToCustomerSample
   */
  async generateCustomTestObjectCode(type: 'sample' | 'provideToCustomerSample', useBasicInfo: UseBasicInfo, useTestParams: UseTestParams) {
    const { SYSTEM_PARAM, sampleDatas, consignDetail, pageState } = this.consginPageParam
    const sampleAmount = useBasicInfo.data.sampleAmount
    const testUnitTestSampleId = useBasicInfo.data.testUnitTestSampleId
    const qualifications = useBasicInfo.data.qualifications
    const testParams = useTestParams.selectedRows

    if (!testParams.length) {
      Modal.warning({
        title: '提示',
        content: `请先勾选${this.industryStore.term('检测参数')}！`,
      })
      return
    }

    const data: any = {
      sampleAmount,
      testUnitTestSampleId,
      snCategory: consignDetail.snTypeId,
      projectId: consignDetail.project?.projectId || '',
      checkTypeId: consignDetail.checkTypeId,
      consignDate: consignDetail.consignDate,
      unitProjectObjId: consignDetail.unitProject?.unitProjectObjId || '',
      unitProjectType: consignDetail.unitProject?.unitProjectType || '',
      consignCode: consignDetail.consignCode || '',
      qualificationTypeId: undefined,
    }

    testParams.forEach((item, index) => {
      data[`paramIds[${index}]`] = item.id
    })

    // 如果是新增样品则要设置参数的默认资质用于生成样品编号
    if (pageState.isAddPage) {
      const paramsIds = testParams.map(i => i.id).join(',')
      const res = await getDefaultQualification(paramsIds)
      data.qualificationTypeId = res.data.map((i: any) => i.id).join(',')
    }
    else {
      data.qualificationTypeId = qualifications.map((i: any) => i.id).join(',')
    }

    const autoSaveConsign = SYSTEM_PARAM.AUTO_SAVE_CONSIGN_ON_CREATE_SAMPLE_SN
    let samples: MetaDataEntity[] = sampleDatas

    if (type === 'sample' && autoSaveConsign) {
      if (consignDetail.status)
        samples = await this.saveSampleOrConsign(true, EGenerateCode.AUTO_SAVE)
    }

    await this.createSampleCode(data, type, useBasicInfo, useTestParams, samples)

    // 手动生成样品编号，执行完成后需要主动保存一次委托
    if (type === 'sample' && autoSaveConsign) {
      await this.saveSampleOrConsign(true, EGenerateCode.MANUAL_CODE)
    }
  }

  /**
   * ## 获取全部样品编号
   * @description 接口新增传参，此委托所有样品的样品编号，避免生成重复样品编号
   */
  getAllTestObjectCode(sampleDatas: MetaDataEntity[], type: 'sample' | 'provideToCustomerSample') {
    const testObjectCode: string[] = []
    const testObjectOtherCode: string[] = []
    const provideToCustomerSampleCodes: string[] = []
    const provideToCustomerSampleOtherCodes: string[] = []
    sampleDatas.forEach((item: any) => {
      if (type === 'sample') {
        // 有后缀字段的新数据
        const isObjectCode = item.objectCodeArr
          ? item.objectCodeArr.filter((item: any) => {
              return item.objectCodeMainBody
            })
          : []
        if (isObjectCode.length > 0) {
          if (this.data.testObjectCode === item.testObjectCode) {
            item.objectCodeArr.forEach((d: any) => {
              testObjectCode.push(d.objectCodeMainBody)
            })
          }
          else {
            item.objectCodeArr.forEach((d: any) => {
              testObjectOtherCode.push(d.objectCodeMainBody)
            })
          }
        }
        else {
          // 无后缀字段的旧数据
          if (item.testObjectCode) {
            if (this.data.testObjectCode === item.testObjectCode) {
              testObjectCode.push(item.testObjectCode)
            }
            else {
              testObjectOtherCode.push(item.testObjectCode)
            }
          }
        }
      }
      else {
        if (item.provideToCustomerSampleCode) {
          if (item.provideToCustomerSampleCode === this.data.provideToCustomerSampleCode) {
            provideToCustomerSampleCodes.push(item.provideToCustomerSampleCode)
          }
          else {
            provideToCustomerSampleOtherCodes.push(item.provideToCustomerSampleCode)
          }
        }
      }
    })

    return {
      testObjectCode,
      testObjectOtherCode,
      provideToCustomerSampleCodes,
      provideToCustomerSampleOtherCodes,
    }
  }

  /**
   * 生成样品编号
   */
  async createSampleCode(
    data: any,
    type: 'sample' | 'provideToCustomerSample',
    useBasicInfo: UseBasicInfo,
    useTestParams: UseTestParams,
    sampleDatas: MetaDataEntity[],
  ) {
    const { consignDetail } = this.consginPageParam

    // 接口新增传参，此委托所有样品的样品编号，避免生成重复样品编号
    const codeObj = this.getAllTestObjectCode(sampleDatas, type)
    const testObjectCode = codeObj.testObjectCode.join(';')
    const testObjectOtherCode = codeObj.testObjectOtherCode.join(';')
    const provideToCustomerSampleCodes = codeObj.provideToCustomerSampleCodes.join(';')
    const provideToCustomerSampleOtherCodes = codeObj.provideToCustomerSampleOtherCodes.join(';')

    let api = generateObjectsCode
    if (type === 'sample') {
      data.testObjectCodes = testObjectCode
      data.testObjectOtherCode = testObjectOtherCode
    }
    else {
      api = generateProvideToCustomerSampleCode
      data.provideToCustomerSampleCodes = provideToCustomerSampleCodes || undefined
      data.provideToCustomerSampleOtherCodes = provideToCustomerSampleOtherCodes || undefined
    }
    // 获取自定义字段
    const customAttributes_ = consignDetail.customAttributes
    if (customAttributes_) {
      data.customValues = customAttributes_.map(item => ({
        columnId: item.attributeId,
        columnValue: item.attributeValue,
      }))
    }

    const hide = message.loading('编号生成中...', 0)
    const res = await api(data).finally(() => {
      hide()
    })

    // eslint-disable-next-line no-console
    console.log('生成编号的请求参数：', data)

    if (res.data) {
      const result = res.data.data

      if (type === 'sample') {
        message.success(`${this.industryStore.term('样品编号')}生成成功`)

        const objectCodeArr = this.data.objectCodeArr
        if (objectCodeArr.length > useBasicInfo.data.sampleAmount) {
          objectCodeArr.length = useBasicInfo.data.sampleAmount
        }

        result.forEach((obj: any, index: number) => {
          const item = objectCodeArr[index]

          if (item) {
            objectCodeArr[index].testObjectCode = obj.testObjectCode + (item.objectCodeSuffix || '')
            objectCodeArr[index].objectCodeMainBody = obj.testObjectCode
          }
          else {
            objectCodeArr.push({
              testObjectCode: obj.testObjectCode,
              objectCodeMainBody: obj.testObjectCode,
              objectCodeSuffix: '',
            })
          }
        })

        this.setObjectCodeArr(objectCodeArr)
        this.setDataField('objectCodeSuffixArr', [])
        await this.formatTestObjectCodes(useBasicInfo.data.sampleAmount, useTestParams.selectedRowKey)
      }
      else {
        message.success(`${this.industryStore.term('来样编号')}生成成功`)

        if (result.length > 0) {
          this.setDataField('provideToCustomerSampleCode', result[0].provideToCustomerSampleCodes)
          this.setDataField('provideToCustomerSampleMultipleCode', result.map((i: any) => i.provideToCustomerSampleCode).join(';'))
        }
        else {
          this.setDataField('provideToCustomerSampleCode', '')
          this.setDataField('provideToCustomerSampleMultipleCode', '')
        }
      }
      await nextTick()
    }
    else {
      message.error(`${this.industryStore.term('样品编号')}生成失败`)
    }
  }

  /** 格式化样品编号 */
  async formatTestObjectCodes(sampleAmount: number, paramIds: string[]) {
    const consignDetail = this.consginPageParam.consignDetail
    const codes = this.data.objectCodeArr.map(i => i.testObjectCode).join(';')
    const quaIds = (consignDetail.qualificationTypeId as string[]).join(',')

    const res = await parsCodesToString({
      sampleAmount,
      'paramIds[0]': paramIds.length > 0 ? paramIds[0] : undefined,
      'snCategory': consignDetail.snTypeId,
      'qualificationTypeId': quaIds,
      'projectId': consignDetail.project?.projectId || '',
      'checkTypeId': consignDetail.checkTypeId,
      'testType': consignDetail.testType,
      'testObjectCodes': codes.replace(/(^\s*)|(\s*$)/g, ''),
    })

    this.setDataField('testObjectCode', res.data.data)
  }

  /** 格式化来样编号 */
  async formatToProvideToCustomerCode(sampleAmount: number, paramIds: string[]) {
    const consignDetail = this.consginPageParam.consignDetail
    const codes = this.data.provideToCustomerSampleMultipleCode
    const quaIds = (consignDetail.qualificationTypeId as string[]).join(',')

    const res = await parsCodesToProvideToCustomerSampleString({
      'sampleAmount': sampleAmount,
      'paramIds[0]': paramIds.length > 0 ? paramIds[0] : undefined,
      'snCategory': consignDetail.snTypeId,
      'qualificationTypeId': quaIds,
      'projectId': consignDetail.project?.projectId || '',
      'checkTypeId': consignDetail.checkTypeId,
      'testType': consignDetail.testType,
      'provideToCustomerSampleCodes': codes?.replace(/(^\s*)|(\s*$)/g, ''),
    })

    this.setDataField('provideToCustomerSampleCode', res.data.data)
  }

  /** 增加/减少样品组数 重新整理/生成编号 */
  async arrangementTestObjectCodes(sampleAmount: number, paramIds: string[]) {
    const consignDetail = this.consginPageParam.consignDetail
    const testObjectCodes = this.data.objectCodeArr.map(i => i.testObjectCode).join(';')
    const provideToCustomerSampleMultipleCode = this.data.provideToCustomerSampleMultipleCode
    const quaIds = (consignDetail.qualificationTypeId as string[]).join(',')

    const res = await editCodes({
      'sampleAmount': sampleAmount,
      'paramIds[0]': paramIds.length > 0 ? paramIds[0] : undefined,
      'snCategory': consignDetail.snTypeId,
      'consignDate': consignDetail.consignDate || '',
      'qualificationTypeId': quaIds,
      'projectId': consignDetail.project?.projectId || '',
      'checkTypeId': consignDetail.checkTypeId,
      'testType': consignDetail.testType,
      'testObjectCodes': testObjectCodes.replace(/(^\s*)|(\s*$)/g, ''),
      'provideToCustomerSampleCodes': provideToCustomerSampleMultipleCode?.replace(/(^\s*)|(\s*$)/g, ''),
    })

    const data = res.data.data

    if (data.length > 0) {
      const objectCodeArr = this.objectCodeAddSuffix(data)
      this.setObjectCodeArr(objectCodeArr)
      this.setDataField('provideToCustomerSampleMultipleCode', data[0].provideToCustomerSampleCodes)
      this.setDataField('provideToCustomerSampleCode', data[0].provideToCustomerSampleCodes)

      this.formatTestObjectCodes(sampleAmount, paramIds)
      this.formatToProvideToCustomerCode(sampleAmount, paramIds)
    }
    else {
      this.setObjectCodeArr([])
      this.setDataField('provideToCustomerSampleMultipleCode', '')
      this.setDataField('provideToCustomerSampleCode', '')
    }
  }

  /** 重新生成的样品编号没有后缀，对比缓存数据添加后缀 */
  objectCodeAddSuffix(data: any[]) {
    if (!data.length) {
      return []
    }

    const objectCodeArr = this.data.objectCodeArr

    if (!objectCodeArr.length) {
      return data.map(obj => ({
        testObjectCode: obj.testObjectCode || '',
        objectCodeMainBody: obj.testObjectCode || '',
        objectCodeSuffix: '',
      }))
    }

    const newArr = []

    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      const sameObj = objectCodeArr.find(d => (d.objectCodeMainBody === data[i].testObjectCode))
      let suffix = ''

      if (sameObj && sameObj.objectCodeSuffix) {
        suffix = sameObj.objectCodeSuffix
      }

      newArr.push({
        testObjectCode: (item.testObjectCode || '') + suffix,
        objectCodeMainBody: item.testObjectCode || '',
        objectCodeSuffix: suffix,
      })
    }
    return newArr
  }

  /** 回显 */
  setData(metaData: MetaDataEntity) {
    const data = new CodesInfoEntity()

    data.objectCodeArr = metaData.objectCodeArr
    data.multipleCode = metaData.multipleCode
    data.testObjectCode = metaData.testObjectCode
    data.objectCodeSuffixArr = metaData.objectCodeSuffixArr
    data.provideToCustomerSampleCode = metaData.provideToCustomerSampleCode
    data.provideToCustomerSampleMultipleCode = metaData.provideToCustomerSampleMultipleCode

    this.data = data
  }
}
