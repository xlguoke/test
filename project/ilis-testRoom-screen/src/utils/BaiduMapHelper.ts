export interface BaiduPositionDTO {
  accuracy: null
  altitude: null
  altitudeAccuracy: null
  heading: null
  latitude: "29.723915581207667"
  longitude: "106.63779863868203"
  speed: null
  timestamp: null
  point: {
    lng: 106.63779863868203
    lat: 29.723915581207667
    pf: "inner"
  }
  address: {
    city: "重庆市"
    city_code: 0
    district: "渝北区"
    province: "重庆市"
    street: ""
    street_number: ""
  }
}

export class BaiduMapHelper {
  static server_ak = "Zn38gzY5GFTHutcCvOnNX4nftnYfcABr"

  // 缓存的当前定位数据
  private static positionData?: BaiduPositionDTO

  /**
   * 获取当前位置经纬度
   */
  static getPosition(): Promise<BaiduPositionDTO> {
    return new Promise((resolve, reject) => {
      if (BaiduMapHelper.positionData) {
        resolve(BaiduMapHelper.positionData)
        return
      }

      const geolocation = new window.BMap.Geolocation()

      geolocation.getCurrentPosition(
        function (r: BaiduPositionDTO) {
          if (geolocation.getStatus() === window.BMAP_STATUS_SUCCESS) {
            BaiduMapHelper.positionData = r
            resolve(r)
          } else {
            reject(new Error("定位失败，请稍后重试！"))
          }
        },
        {
          SDKLocation: true
        }
      )
    })
  }

  /**
   * 获取地址
   */
  static async getLocation(longitude?: string | number, latitude?: string | number) {
    const geocoder = new window.BMap.Geocoder()

    let point

    if (longitude && latitude) {
      point = new window.BMap.Point(longitude, latitude)
    } else {
      const positionData = await this.getPosition()
      point = new window.BMap.Point(positionData.longitude, positionData.latitude)
    }

    return new Promise((resolve, reject) => {
      geocoder.getLocation(point, (result: any) => {
        if (result) {
          resolve(result)
        } else {
          reject(new Error("未找到对应地址"))
        }
      })
    })
  }
}
