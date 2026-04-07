import type { AxiosResponse } from 'axios'
import { message } from 'ant-design-vue'

export interface SampleVideoEntity {
  id: '402882c197bf6cf70197bfe5bbde311a'
  labId: '2c9120818ab58877018ab5b5825f0028'
  objectId: '402882c19a51ed1c019a520177f814e0'
  videoUrl: null
  labName: '功能室'
  equName: '监控'
  equType: 'HKICLabColumn'
  equVendor: '摄像头-海康综合安防平台'
  interfaceUrl: 'https://px.scsgjc.com:11443/hik/artemis'
  configParam: '{"appSecret":"K7e1BHq7S3lYNF7rQqs4","appKey":"22703469","deviceSerial":"4ba4e8f6fc6a40f086f17737d0933501","protocol":"wss"}'
  remark: null
  appSecret: ''
  appKey: ''
  startDate: '2025-07-03 16:56:50'
  endDate: '2025-07-03 16:57:10'
  useLogIds: null
  isMain: null
  equipmentName: null
  equipmentCode: null
  testTaskParamDisplayName: null
  testTaskParamId: null
  temperatureValue: null
  humidityValue: null
  otherInfo: {
    depot: '样品仓'
    obj: '样品入库单'
    location: 'SGYP1322'
    type: '出入库'
  }
  viewDateTimeStr: null
}

/**
 * # 获取留样视频
 */
export function getSampleVideoList(testObjectId: string): Promise<AxiosResponse<SampleVideoEntity[]>> {
  return ilisAxios.get<any>(`/rest/consignVideoController/sample/${testObjectId}`).catch((err) => {
    message.error(err.message)
    throw err
  })
}
