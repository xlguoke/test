import type { QualificationEntity } from '~/views/consign/component/selectSample/interface/Qualification.ts'
import type { MainController } from '~/views/consign/component/selectSample/modules/MainController.ts'
import type {
  TestParamsMetaDataItem,
} from '~/views/consign/component/selectSample/modules/UseTestParams.ts'
import type { ViewTestParamsItem } from '~/views/consign/component/selectSampleParam/modules/BaseTestParams.ts'

import { Modal } from 'ant-design-vue'
import {
  checkQualificationUltra,
  getDefaultQualification,
  getQualificationByTestParams,
} from '~/views/consign/component/selectSample/api.ts'
import { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'

/**
 * 资质管理器
 */
export class QualificationManager {
  constructor(private mainController: MainController) {}

  /** 根据选择参数获取默认资质 */
  async setDefaultQualifications(testParams: ViewTestParamsItem[]) {
    /** 【系统参数】按样品设置资质 */
    const { SET_QUA_WITH_OBJECT } = this.mainController.SYSTEM_PARAM

    if (!SET_QUA_WITH_OBJECT) {
      return
    }

    const ids = testParams.map(i => i.id)
    const res = await getQualificationByTestParams(ids.join(','))

    if (res.data.length > 0) {
      this.setQualifications(ids.join(','), res.data)
    }
  }

  /** 设置选择资质 */
  async setQualifications(paramIds: string, rows: QualificationEntity[]) {
    const { useBasicInfo } = this.mainController

    const res = await checkQualificationUltra({
      paramIds,
      quaIds: rows.map(i => i.id).join(','),
    })

    if (res.data) {
      if (UseBasicInfo.REPORT_QUA_SEAL_QUERY === 'NONE') {
        Modal.confirm({
          title: '请注意',
          content: h('div', {
            innerHTML: res.data,
          }),
          cancelText: '取消',
          okText: '确定',
          onOk: () => {
            useBasicInfo.setDataField('qualifications', rows)
          },
        })
      }
      else {
        Modal.info({
          title: '请注意',
          content: h('div', {
            innerHTML: res.data,
          }),
        })
      }
    }
    else {
      useBasicInfo.setDataField('qualifications', rows)
    }
  }

  /** 设置资质元数据 */
  async getQualificationsMetaData(testParams: TestParamsMetaDataItem[]) {
    const { SYSTEM_PARAM, consignDetail } = this.mainController.consginPageParam
    if (SYSTEM_PARAM.SET_QUA_WITH_OBJECT) {
      // 根据所选参数生成默认资质，挂载到样品信息上
      const paramIds = testParams.map(i => i.testParamId)
      const res = await getDefaultQualification(paramIds.join(','))
      return res.data
    }
    else {
      const qualificationsList = JSON.parse(localStorage.getItem('qualifications') || '[]')
      const nowQualificationId = consignDetail.qualificationTypeId || []

      // 根据委托上资质挂载到新添加的样品上,
      return qualificationsList.filter((i: any) => nowQualificationId.includes(i.id))
    }
  }
}
