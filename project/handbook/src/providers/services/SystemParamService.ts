import { z } from 'zod'
import { request } from '@/axios'

export enum SystemParamType {
  '审核批准时查看记录报告的方式' = 'REPORT_MANAGE_23',
  '提交报告时，若试验任务不合格且未通过不合格上报时的提示策略' = 'TASK_NONCONFORMITY_INFORM_STRATEGY',
  '现场检测报告附件上传，生成仪器设备使用记录附表' = 'EQUIPMENT_SCHEDULE',
  '设置报告签发日期时，不可选择超过当前日期' = 'REPORT_SIGN_DATE_OVER_TODAY_REFUSE',
  '报告设置资质章时，资质对应报告参数' = 'REPORT_QUA_SEAL_QUERY',
  '提交报告时,复核日期必填' = 'REPORT_MANAGE_REVIEW_DATE_REQUIRED',
  '允许提交报告时设置报告审核日期' = 'REPORT_MANAGE_AUDIT_DATE',
  '允许提交报告时设置报告复核日期' = 'REPORT_MANAGE_REVIEW_DATE',
  '批准报告时签发日期使用实际日期' = 'REPORT_MANAGE_46',
  '提交报告页面预签发日期默认设置的延后天数' = 'REPORT_MANAGE_SIGN_DATE_number',
  '提交报告页面预复核日期默认设置的延后天数' = 'REPORT_MANAGE_REVIEW_DATE_number',
  '工程部位/用途不盲样' = 'TEST_DETECTION_BUT_PARTANDUSE',
  '检测时间显示' = 'TEST_DATETIME_FORMAT_SHOW',
}

export enum SystemParamEnableType {
  '开启' = 'Y',
  '关闭' = 'N',
}

/**
 * 系统参数
 */
export class SystemParamService {
  static _install?: SystemParamService

  // 缓存
  private cache: { [key: string]: string } = {}

  constructor() {
    if (SystemParamService._install)
      return SystemParamService._install

    SystemParamService._install = this
  }

  // 清除缓存
  clearCache() {
    this.cache = {}
  }

  // 获取系统参数
  async getBusinessParam(key: string) {
    if (Object.prototype.hasOwnProperty.call(this.cache, key))
      return this.cache[key]

    const res = await request({
      url: `/ilis2/tSBusinessParamController.do?getBusinessParam`,
      params: {
        key,
      },
      schema: z.object({
        success: z.boolean(),
        obj: z.string(),
      }),
    })

    if (res.success) {
      const obj = res.obj
      this.cache[key] = obj

      return this.cache[key]
    }
  }
}
