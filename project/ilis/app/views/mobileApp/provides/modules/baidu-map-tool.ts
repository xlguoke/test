export class BaiduMapTool {
  constructor(id) {
    this.mapInstance = new window.BMap.Map(id)

    // 缓存的定位数据
    this.positionData = null
  }

  /**
   * 创建地图
   */
  async createMap() {
    const map = this.mapInstance

    const positionData = await this.getCurrentPoint()

    const point = new window.BMap.Point(positionData.longitude, positionData.latitude)
    map.centerAndZoom(point, 18)
    map.enableScrollWheelZoom(true)
  }

  /**
   * 获取当前位置经纬度
   */
  getCurrentPoint(): any {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line ts/no-this-alias
      const self = this

      if (self.positionData) {
        resolve(self.positionData)
        return
      }

      const geolocation = new window.BMap.Geolocation()

      // 开启SDK辅助定位
      geolocation.enableSDKLocation()

      geolocation.getCurrentPosition(function (r: any) {
        if (this.getStatus() === window.BMAP_STATUS_SUCCESS) {
          // {
          //   "accuracy": null,
          //   "altitude": null,
          //   "altitudeAccuracy": null,
          //   "heading": null,
          //   "latitude": "29.723915581207667",
          //   "longitude": "106.63779863868203",
          //   "speed": null,
          //   "timestamp": null,
          //   "point": {
          //       "lng": 106.63779863868203,
          //       "lat": 29.723915581207667,
          //       "pf": "inner"
          //   },
          //   "address": {
          //     "city": "重庆市",
          //     "city_code": 0,
          //     "district": "渝北区",
          //     "province": "重庆市",
          //     "street": "",
          //     "street_number": ""
          //   }
          // }
          self.positionData = r
          resolve(r)
        }
        else {
          reject(new Error('定位失败，请稍后重试！'))
        }
      })
    })
  }

  /**
   * 获取地址
   */
  async getLocation(longitude: any, latitude: any) {
    const geocoder = new window.BMap.Geocoder()
    let point

    if (longitude && latitude) {
      point = new window.BMap.Point(longitude, latitude)
    }
    else {
      const positionData = await this.getCurrentPoint()
      point = new window.BMap.Point(positionData.longitude, positionData.latitude)
    }

    return new Promise((resolve, reject) => {
      geocoder.getLocation(point, (result: any) => {
        if (result) {
          resolve(result)
        }
        else {
          reject(new Error('未找到对应地址'))
        }
      })
    })
  }
}
