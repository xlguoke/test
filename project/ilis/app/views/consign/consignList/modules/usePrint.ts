import type { ConsignSampleData } from '../api'
import type { ConsignListEntity } from '../ConsignListEntity'
import { message } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { systemPrintTemplateApi } from '~/api/consign/consign-management'
import { useIndustryStore } from '~/store/industryStore'
import { IlisPrintUdr } from '~/utils/IlisPrintUdr'
import SampleLabelNum from '../components/SampleLabelNum.vue'
import { CONSIGN_STATUS } from '../dict'
import { modalConfirm, modalError } from './modalUtil'

const udrPrint = new IlisPrintUdr()

/** 打印类型 */
export enum PRINT_TYPE {
  /** ## 委托单 */
  CONSIGNORDER = 'consignOrder',
  /** ## 样品标签 */
  SAMPLELABEL = 'sampleLabel',
  /** ## 样品标签（按试件打印） */
  SAMPLELABELNUM = 'sampleLabelNum',
  /** ## 样品标签（条形码） */
  SAMPLE_LABEL_BARCODE = 'sampleLabelBarcode',
  /** ## 样品标签（按试件打印-条形码） */
  SAMPLE_LABEL_NUM_BARCODE = 'sampleLabelNumBarcode',
  /** ## 样品流转标签 */
  SAMPLELABLEFLOW = 'SampleLableFlow',
  /** ## 样品机器识别标签（按试件打印） */
  SHORTSAMPLELABLENUM = 'ShortSampleLableNum',
  /** ## 留样标签 */
  REMAINEDSAMPLELABEL = 'remainedSampleLabel',
  /** ## 万能机样品标签 */
  PERIODLABEL = 'PeriodLabel',
  /** ## 万能机样品标签(华龙) */
  PERIODLABELHL = 'PeriodLabelHL',
  /** ## 盲样处理单 */
  BLINDSAMPLETREATMENTSHEET = 'BlindSampleTreatmentSheet',
  /** ## 委托费用清单 */
  CONSIGNFEELIST = 'consignFeeList',
  /** ## 委托费用清单(合并为一个单据) */
  CONSIGNFEELISTMERGE = 'consignFeeListMerge',
  /** ## 检测收费通知单 */
  TESTFEENOTICE = 'testFeeNotice',
  /** ## 检测收费通知单（多记录） */
  TESTFEENOTICEMULTI = 'testFeeNoticeMulti',
  /** ## 延后付费申请单 */
  PAYMENTDELAYAPPLY = 'paymentDelayApply',
  /** ## 档案袋标签 */
  ARCHIVEBAGLABEL = 'ArchiveBagLabel',
  /** ## 任务单 */
  TASKDISTRIBUTION = 'taskDistribution',
  /** ## 委托台账 */
  CONSIGNLEDGER = 'ConsignStandingBook',
}

/** 模板类型：仅枚举了与打印类型不一致的项 */
export enum TEMPLATE_TYPE {
  /** ## 委托单 */
  T_CONSIGNORDER = 'printConsign',
  /** ## 样品标签 */
  T_SAMPLELABEL = 'sampleLable',
  /** ## 留样标签 */
  T_REMAINEDSAMPLELABEL = 'RemainedSampleLable',
  /** ## 委托费用清单 */
  T_CONSIGNFEELIST = 'feeDetailTable',
  /** ## 委托费用清单(合并为一个单据) */
  T_CONSIGNFEELISTMERGE = 'feeDetailTableMerge',
  /** ## 检测收费通知单 */
  T_TESTFEENOTICE = 'TestPaymentNotice',
  /** ## 延后付费申请单 */
  T_PAYMENTDELAYAPPLY = 'PaymentDelayApply',
  /** ## 任务单 */
  T_TASKDISTRIBUTION = 'ConsignPrintDistribution',
}

/** 打印 */
export function usePrint(rows: Ref<ConsignListEntity[]>, jsonParams: Ref<any>) {
  /** 已选委托id */
  const rowIds = computed(() => rows.value.map(d => d.id))
  /** 控制参数：手动生成样品编号时占用编号 */
  const occupySerialNumber = async () => await getBusinessParam('OCCUPY_SERIAL_NUMBER')
  /** 存在填写中的委托 */
  const isUnFinished = computed(() => rows.value.some(d => d.consignStatus === CONSIGN_STATUS.WRITE))
  const { term } = useIndustryStore()

  async function printUdr(templateType: string) {
    for (let index = 0; index < rows.value.length; index++) {
      const row = rows.value[index]
      // 判断委托状态，状态为‘完成’的才有样品标签
      if (templateType === TEMPLATE_TYPE.T_TESTFEENOTICE
        || templateType === TEMPLATE_TYPE.T_CONSIGNFEELIST
        || templateType === TEMPLATE_TYPE.T_CONSIGNFEELISTMERGE
        || templateType === TEMPLATE_TYPE.T_SAMPLELABEL
        || templateType === TEMPLATE_TYPE.T_REMAINEDSAMPLELABEL
        || templateType === PRINT_TYPE.ARCHIVEBAGLABEL
        || templateType === TEMPLATE_TYPE.T_PAYMENTDELAYAPPLY
      ) {
        if (!occupySerialNumber && row.consignStatus === CONSIGN_STATUS.WRITE) {
          modalError('请先完成委托')
          return
        }
      }
    }
    // 收费通知单和延后付费单 需要将同单位的费用通知打到一张单子里
    if (templateType === TEMPLATE_TYPE.T_PAYMENTDELAYAPPLY || templateType === PRINT_TYPE.TESTFEENOTICEMULTI) {
      const consignIdObj: Record<string, string> = {}
      for (let index = 0; index < rows.value.length; index++) {
        const unitId = rows.value[index].consignUnitId || ''
        const consignId = rows.value[index].id
        if (consignIdObj[unitId]) {
          consignIdObj[unitId] += `,${consignId}`
        }
        else {
          consignIdObj[unitId] = consignId
        }
      }
      const consignIdsArr = Object.values(consignIdObj)

      if (templateType === PRINT_TYPE.TESTFEENOTICEMULTI) {
        udrPrint.commonPrint(consignIdsArr, TEMPLATE_TYPE.T_TESTFEENOTICE, {
          jsonParam: 'multi',
        })
      }
      else {
        udrPrint.commonPrint(consignIdsArr, templateType)
      }
    }
    // 打印UDR通用模板
    else if (templateType === TEMPLATE_TYPE.T_CONSIGNORDER
      || templateType === TEMPLATE_TYPE.T_TASKDISTRIBUTION
    ) {
      udrPrint.commonPrint(rowIds.value, templateType, {
        printTimes: 1,
      })
    }
    // 合并单据与不合并打印公用一个模板feeDetailTable
    else if (templateType === TEMPLATE_TYPE.T_CONSIGNFEELISTMERGE) {
      // 如果是打印费用清单（合并为一个单据），那么就要判断本次选择的是不是属于同一个委托单位，不是同一个委托单位给出提示，当不禁止他继续操作。
      const consignUnit = rows.value[0].consignUnitName
      const find = rows.value.find(row => row.consignUnitName !== consignUnit)
      if (find) {
        const isOk = await modalConfirm('您选择的委托分属不同单位，是否继续打印？')
        if (!isOk)
          return
      }
      udrPrint.printByJsonParam1(TEMPLATE_TYPE.T_CONSIGNFEELIST, rowIds.value)
    }
    else {
      udrPrint.commonPrint(rowIds.value, templateType)
    }
  }

  /** 设置标签数量，处理成保存参数 */
  function formatLabelNum(datas: ConsignSampleData[]) {
    const ids = []
    const printTimes = []
    for (let i = 0; i < datas.length; i++) {
      const d = datas[i]
      const strIds = `${d.consignId}SEPARATOR${d.processObjectId}`
      printTimes.push({
        [strIds]: d.operation,
      })
      ids.push(`${i}`)
    }
    return {
      ids,
      printTimes,
    }
  }

  /** 打印委托单 */
  async function printConsignOrder() {
    const needGenerateCodeConsignIds = []
    for (let i = 0; i < rows.value.length; i++) {
      const r = rows.value[i]
      if (!r.consignCode) {
        needGenerateCodeConsignIds.push(r.id)
      }
    }
    if (needGenerateCodeConsignIds.length > 0) {
      modalError('委托尚未完成，暂未生成委托编号')
    }
    const { data } = await systemPrintTemplateApi('printConsign')
    printUdr(data)
  }

  /** 样品标签（按试件打印） */
  async function prictSampleLabelNum(templateType: string) {
    if (isUnFinished.value)
      return message.warn('请先完成委托！')

    const datas: ConsignSampleData[] = await AnyDialogHelper.showModel(SampleLabelNum, {
      title: term('样品标签(按试件打印)'),
      describe: term('样品标签'),
      consignIds: rowIds.value,
    })
    const { ids, printTimes } = formatLabelNum(datas)
    udrPrint.commonPrint(ids, templateType, {
      printTimes,
    })
  }

  /** 样品机器识别标签（按试件打印） */
  async function printShortSampleLableNum() {
    if (isUnFinished.value)
      return message.warn('请先完成委托！')

    const datas: ConsignSampleData[] = await AnyDialogHelper.showModel(SampleLabelNum, {
      title: term('样品机器识别标签（按试件打印）'),
      describe: term('样品标签'),
      consignIds: rowIds.value,
    })
    const { ids, printTimes } = formatLabelNum(datas)
    udrPrint.commonPrint(ids, TEMPLATE_TYPE.T_SAMPLELABEL, {
      printTimes,
      flag: 'short',
    })
  }

  /** 留样标签 */
  async function printRemainedSampleLabel() {
    if (isUnFinished.value)
      return message.warn('请先完成委托！')

    const datas: ConsignSampleData[] = await AnyDialogHelper.showModel(SampleLabelNum, {
      title: term('留样标签打印'),
      describe: term('留样标签'),
      remained: true,
      consignIds: rowIds.value,
    })
    const { ids, printTimes } = formatLabelNum(datas)
    udrPrint.commonPrint(ids, TEMPLATE_TYPE.T_REMAINEDSAMPLELABEL, {
      printTimes,
    })
  }

  /** 万能机样品标签 */
  async function printPeriodLabel(hl?: string) {
    const datas: ConsignSampleData[] = await AnyDialogHelper.showModel(SampleLabelNum, {
      title: term('万能机样品标签'),
      describe: term('样品标签'),
      consignIds: rowIds.value,
    })
    // 华龙定制的样品标签
    if (hl === 'HL') {
      datas.forEach((d: any) => {
        d.manufacturer = 'HL'
      })
    }
    const url = `${location.origin}/ilis2/consign/print/wnjSampleLabel.do`
    udrPrint.execute(url, datas)
  }

  /** 打印 */
  function handlePrint(e: any) {
    if (rowIds.value.length === 0)
      return message.warning('请选择需要打印的委托！')

    const type = e.key as PRINT_TYPE
    switch (type) {
      case PRINT_TYPE.CONSIGNORDER:
        printConsignOrder()
        break
      case PRINT_TYPE.SAMPLELABEL:
        printUdr(TEMPLATE_TYPE.T_SAMPLELABEL)
        break
      case PRINT_TYPE.SAMPLELABELNUM:
        prictSampleLabelNum(TEMPLATE_TYPE.T_SAMPLELABEL)
        break
      case PRINT_TYPE.SAMPLE_LABEL_BARCODE:
        printUdr(PRINT_TYPE.SAMPLE_LABEL_BARCODE)
        break
      case PRINT_TYPE.SAMPLE_LABEL_NUM_BARCODE:
        prictSampleLabelNum(PRINT_TYPE.SAMPLE_LABEL_BARCODE)
        break
      case PRINT_TYPE.SAMPLELABLEFLOW:
        printUdr(type)
        break
      case PRINT_TYPE.SHORTSAMPLELABLENUM:
        printShortSampleLableNum()
        break
      case PRINT_TYPE.REMAINEDSAMPLELABEL:
        printRemainedSampleLabel()
        break
      case PRINT_TYPE.PERIODLABEL:
        printPeriodLabel()
        break
      case PRINT_TYPE.PERIODLABELHL:
        printPeriodLabel('HL')
        break
      case PRINT_TYPE.BLINDSAMPLETREATMENTSHEET:
        printUdr(type)
        break
      case PRINT_TYPE.CONSIGNFEELIST:
        printUdr(TEMPLATE_TYPE.T_CONSIGNFEELIST)
        break
      case PRINT_TYPE.CONSIGNFEELISTMERGE:
        printUdr(TEMPLATE_TYPE.T_CONSIGNFEELISTMERGE)
        break
      case PRINT_TYPE.TESTFEENOTICE:
        printUdr(TEMPLATE_TYPE.T_TESTFEENOTICE)
        break
      case PRINT_TYPE.TESTFEENOTICEMULTI:
        printUdr(type)
        break
      case PRINT_TYPE.PAYMENTDELAYAPPLY:
        printUdr(TEMPLATE_TYPE.T_PAYMENTDELAYAPPLY)
        break
      case PRINT_TYPE.ARCHIVEBAGLABEL:
        printUdr(type)
        break
      case PRINT_TYPE.TASKDISTRIBUTION:
        printUdr(TEMPLATE_TYPE.T_TASKDISTRIBUTION)
        break
      case PRINT_TYPE.CONSIGNLEDGER:
        udrPrint.printLedger(type, jsonParams.value)
        break
      default:
        console.error('打印类型错误：', type)
        modalError('打印类型错误')
    }
  }

  return { handlePrint }
}
