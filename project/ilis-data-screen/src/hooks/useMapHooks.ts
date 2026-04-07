import { getBaiduWeather } from "@/api/common.api"
import { BaiduMapHelper } from "@/utils/BaiduMapHelper"

export interface NowWeatherDTO {
  text: "晴"
  temp: 29
  feels_like: 30
  rh: 45
  wind_class: "1级"
  wind_dir: "东北风"
  prec_1h: 0
  clouds: 0
  vis: 30000
  aqi: 31
  pm25: 3
  pm10: 6
  no2: 7
  so2: 3
  o3: 99
  co: 0.2
  wind_angle: 59
  uvi: 6
  pressure: 1003
  dpt: 16
  uptime: "20250813160000"
}

export const useMapHooks = () => {
  /**
   * 获取当前城市名称
   */
  async function getCurrentCity() {
    const positionData = await BaiduMapHelper.getPosition()
    return positionData.address.city
  }

  /**
   * 获取当前城市天气信息
   */
  async function getCurrentCityWeather(): Promise<NowWeatherDTO | undefined> {
    const positionData = await BaiduMapHelper.getPosition()
    const res = await getBaiduWeather(
      BaiduMapHelper.server_ak,
      positionData.longitude,
      positionData.latitude
    )

    if (res.status === 0) {
      return res.result.now
    }
  }

  return {
    getCurrentCity,
    getCurrentCityWeather
  }
}
