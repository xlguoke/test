const weatherData = {
  province: "重庆",
  city: "重庆市",
  adcode: "500000",
  weather: "多云",
  temperature: 32,
  windDirection: "东南",
  windPower: "≤3",
  humidity: "61",
  reportTime: "2024-07-31 13:31:40",
  info: "OK"
}

export type WeatherEntity = typeof weatherData

export interface IUnitInfoEntity {
  /** 检测机构简称，用于检测报告二维码扫描title等 */
  companyShortName?: string
  /** 单位编码 */
  companyCode?: string
  /** 名称 */
  departname?: string
  /** 二级名称 */
  extendname?: string
  /** 描述,说明 */
  description?: string
  /** 联系地址 */
  address?: string
  /** 邮编 */
  postcode?: string
  /** 传真 */
  fax?: string
  /** 电子邮件地址(申诉电子邮箱) */
  email?: string
  /** 联系电话 */
  phone?: string
  /** 查询电话 */
  queryPhone?: string
  /** 申诉电话 */
  explainPhone?: string
  /** 联系人 */
  contacts?: string
  /** 联系人电话 */
  mobile?: string
}
