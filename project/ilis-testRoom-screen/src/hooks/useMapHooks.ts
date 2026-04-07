import { WeatherEntity } from "@/views/deviceSmallScreen/component"

const KEY = "d505baaf18da73d83d201e8eebebab2b"
const SECURITY_JS_CODE = "ed14917aab2a283820d999f862f4e4e5"

export const useMapHooks = () => {
  function loadAMapScript() {
    window._AMapSecurityConfig = {
      securityJsCode: SECURITY_JS_CODE
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = `//webapi.amap.com/maps?v=2.0&key=${KEY}`
      script.onload = resolve
      script.onerror = reject
      document.head.appendChild(script)
    })
  }

  // 使用CitySearch插件获取城市信息
  async function fetchCurrentCity(): Promise<string> {
    return new Promise((resolve, reject) => {
      window.AMap.plugin("AMap.CitySearch", () => {
        const citySearch = new window.AMap.CitySearch()
        citySearch.getLocalCity((status, result) => {
          if (status === "complete" && result.info === "OK") {
            if (result && result.city) {
              resolve(result.city)
            }
          } else {
            reject(new Error("获取当前城市失败"))
          }
        })
      })
    })
  }
  // 使用CitySearch插件获取城市信息
  async function fetchCurrentCityWeather(): Promise<WeatherEntity> {
    const currentCity = await fetchCurrentCity()
    return new Promise((resolve, reject) => {
      window.AMap.plugin("AMap.Weather", () => {
        const weather = new window.AMap.Weather()
        weather.getLive(currentCity, function (err, data) {
          if (!err) {
            console.log(data)
            resolve(data)
          } else {
            reject(new Error("获取当前城市天气失败"))
          }
        })
      })
    })
  }

  /**
   * 获取当前城市名称
   */
  async function getCurrentCity() {
    await loadAMapScript()
    return fetchCurrentCity()
  }

  /**
   * 获取当前城市天气信息
   */
  async function getCurrentCityWeather() {
    await loadAMapScript()
    return fetchCurrentCityWeather()
  }

  return {
    getCurrentCity,
    getCurrentCityWeather
  }
}
