import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { Modal } from 'ant-design-vue'
import { UseBase } from '~/views/consign/component/selectSample/modules/UseBase.ts'
import type { ViewTestParamsItem } from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'
import type { MetaDataEntity } from '~/views/consign/component/selectSample/modules/MainController.ts'

/** 制样信息 */
export class PeriodMetaDataItem {
  /** 索引是唯一标识符 */
  index: number = 0
  /** 试件编号 */
  periodCode: string = ''
  /** 龄期 */
  days: number | undefined = undefined
  /** 制样情况描述 */
  description: string = ''
  /** 制样日期 操作时是dayjs类型，最后保存进元数据时要转成string */
  formingDate: string | Dayjs = ''
  /** 制样参数id */
  testParamId: string = ''
  testParamId_TEMP: string[] | undefined = []
  /** 制样参数名称 */
  testParamName: string = ''
  /** 检测组数标记 */
  objectGroupNum: string = '1'
  /** TODO 疑似没用 */
  mark: string = ''
}

/** 制样信息 */
export class PeriodEntity {
  /** 龄期信息 */
  periods: PeriodMetaDataItem[] = []
}

/**
 * 制样信息/龄期
 */
export class UsePeriod extends UseBase<PeriodEntity> {
  constructor() {
    super(new PeriodEntity())
  }

  /** 构建元数据存储信息 */
  getMetaData(): PeriodEntity {
    const metaData = new PeriodEntity()
    const periods = this.data.periods

    metaData.periods = periods.map(item => ({
      ...item,
      // 删除辅助字段（元数据会执行JSON.stringify，把值赋为undefined会自动丢失）
      testParamId_TEMP: undefined,
      // 格式化时间
      formingDate: item.formingDate ? dayjs(item.formingDate).format('YYYY-MM-DD') : '',
    }))

    return metaData
  }

  /**
   * index为制样信息的唯一标识，操作制样信息数组后，重置index字段
   * 注：这里直接操作data对象的数据，而不是从getData里获取数据来操作，主要原因是getData的简单拷贝操作会导致时间格式丢失，目前先这样搞
   */
  formatPeriods() {
    this.data.periods = this.data.periods.map((item, index) => ({
      ...item,
      index,
    }))
  }

  /** 添加制样信息 */
  addPeriods(item: PeriodMetaDataItem) {
    this.data.periods.push(item)
    this.formatPeriods()
  }

  /** 更新制样参数 */
  updatePeriods(index: number, item: PeriodMetaDataItem) {
    this.data.periods.splice(index, 1, item)
    this.formatPeriods()
  }

  /** 删除已选的制样信息 */
  delPeriods(indexs: number[]) {
    this.data.periods = this.data.periods.filter(item => !indexs.includes(item.index))
    this.formatPeriods()
  }

  /** 删除制样信息中的参数信息 */
  delPeriodTestParam(index: number, testParamId: string) {
    const item = this.data.periods.find(i => i.index === index)

    if (!item) {
      return
    }

    const testParamIds = item.testParamId.split(',')
    const testParamNames = item.testParamName.split(',')

    const delIndex = testParamIds.findIndex(i => i === testParamId)
    if (delIndex !== -1) {
      testParamIds.splice(delIndex, 1)
      testParamNames.splice(delIndex, 1)

      item.testParamId = testParamIds.join(',')
      item.testParamName = testParamNames.join(',')
    }
  }

  /**
   * 检查制样信息中是否有关联未选中的参数
   * @param testParams 当前选中的参数
   */
  checkDelParams(testParams: ViewTestParamsItem[]) {
    const periods = this.data.periods
    const testParamIds = testParams.map(i => i.id)
    let delIndexArr: number[] = []

    if (!periods.length) {
      return
    }

    if (!testParamIds.length) {
      delIndexArr = periods.map(i => i.index)
    }
    else {
      periods.forEach((periodItem) => {
        const ids = periodItem.testParamId.split(',')

        // 不破坏循环，从最后一个删
        for (let i = ids.length - 1; i >= 0; i--) {
          const paramId = ids[i]
          if (!testParamIds.includes(paramId)) {
            this.delPeriodTestParam(periodItem.index, paramId)
          }
        }

        if (!periodItem.testParamId) {
          if (!delIndexArr.includes(periodItem.index)) {
            delIndexArr.push(periodItem.index)
          }
        }
      })
    }

    delIndexArr.reverse().forEach((index) => {
      periods.splice(index, 1)
    })

    this.formatPeriods()

    if (delIndexArr.length > 0) {
      Modal.info({
        title: '提示',
        content: `制样信息中第 ${delIndexArr.reverse().map(it => it + 1)} 行，制样参数已被清空，已删除当前制样信息，请注意！`,
      })
    }
  }

  /** 回显元数据 */
  setData(metaData: MetaDataEntity) {
    const data = new PeriodEntity()

    const periods = metaData.periods || []
    // 历史数据兼容处理
    periods.forEach((item, index) => {
      item.index = index
      if (!item.testParamId) {
        item.testParamId = ''
      }
      if (!item.testParamName) {
        item.testParamName = ''
      }
      if (!item.testParamId_TEMP) {
        item.testParamId_TEMP = item.testParamId.split(',')
      }
    })

    data.periods = periods

    this.data = data
  }
}
