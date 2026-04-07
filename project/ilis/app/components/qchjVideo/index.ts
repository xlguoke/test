import type { ColumnType } from 'ant-design-vue/es/table'

export { default as QchjVideo } from './VideoList.vue'

export const columns: ColumnType[] = [
  {
    title: '序号',
    dataIndex: 'orderNum',
    align: 'center',
    width: '80px',
    ellipsis: true,
    customRender: ({ index }) => index + 1,
  },
  {
    title: '功能室名称',
    align: 'center',
    dataIndex: 'labName',
    ellipsis: true,
  },
  {
    title: '开始时间',
    align: 'center',
    dataIndex: 'startDate',
    sorter: true,
    ellipsis: true,
  },
  {
    title: '结束时间',
    align: 'center',
    dataIndex: 'endDate',
    sorter: true,
    ellipsis: true,

  },
  {
    title: '温度（℃）',
    align: 'center',
    dataIndex: 'temperatureValue',
    ellipsis: true,
  },
  {
    title: '湿度（%RH）',
    align: 'center',
    dataIndex: 'humidityValue',
    ellipsis: true,
  },
  {
    title: '操作',
    align: 'center',
    width: '100px',
    dataIndex: 'operation',
    ellipsis: true,
  },
]

export interface IVideoEntity {
  id: '4028b2438a9bcbc6018a9c0a61850002'
  labId: '2c9284d57757b85c01775c347a8002d3'
  labName: '标养室123'
  equName: '设备1234'
  equType: string
  equVendor: '录像机'
  interfaceUrl: 'http://gb28181.qdm123.com:18080/api/playback/start'
  configParam: '{"password":"hitek1998^&*","loginUrl":"http://gb28181.qdm123.com:18080/api/user/login","startTime":"2023-09-17 00:00:00","endTime":"2023-09-18 00:00:00","deviceId":"34020000001110000001","channelId":"34020000001310000071","username":"admin"}'
  remark: null
  appSecret: ''
  appKey: ''
  startDate: '2023-11-15 16:59:45'
  endDate: '2023-11-15 16:59:50'
  useLogIds: null
  isMain: '0'
  equipmentName: '恒温恒湿标准养护室'
  equipmentCode: '746303-1063'
  testTaskParamDisplayName: '水泥混凝土配合比验证'
  testTaskParamId: '402882c18bb1ff80018bb2107ca60930'
  viewDateTimeStr: null
  temperatureValue: null
  humidityValue: null
}
