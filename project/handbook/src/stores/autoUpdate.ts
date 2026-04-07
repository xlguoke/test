/// <reference types="cordova-plugin-network-information" />
import { defineStore } from 'pinia'
import { LoggerWrapper } from '@ilis/cordova-plugin-log4c'
import baseData from './baseData'
import { useResourceFetch } from '@/composables/useResources'

const log = new LoggerWrapper('baseData.autoUpdate')

let timer = null as any
export default defineStore('autoUpdate', {
  state: () => {
    return {
      autoUpdateNetwrok: 'all' as string,
      autoUpdateTime: 1 as number,
      networkType: '' as string,
    }
  },
  actions: {
    // 网络类型
    getNetWorkType() {
      const networkType = navigator.connection.type || ''
      return networkType.toLowerCase()
    },
    // 检查当前网络类型是否自动更新
    checkNetWorkType() {
      const _type = this.getNetWorkType()
      this.networkType = _type
      if (!_type || _type === 'unknown' || _type === 'none')
        return false
      else if (this.autoUpdateNetwrok === 'all')
        return true
      else if (_type === 'wifi')
        return _type === this.autoUpdateNetwrok
      else if (this.autoUpdateNetwrok === 'cellular')
        return ['2g', '3g', '4g', '5g', 'cellular'].includes(_type)
      else
        return false
    },
    // 初始化自动更新
    initAutoUpdate() {
      if (this.autoUpdateTime === 0 || !this.checkNetWorkType()) {
        log.info(`no automatic update, automatic update time: ${this.autoUpdateTime}h, network: ${this.networkType}`)
        return
      }
      this.stop()
      timer = setInterval(() => {
        const datas = baseData().dataVersions
        for (let i = 0; i < datas.length; i++) {
          const d = datas[i]
          ;((type) => {
            useResourceFetch(type, true)
          })(d.type)
        }
      }, this.autoUpdateTime * 3600000)
    },
    stop() {
      timer && clearInterval(timer)
    },
    setUpdateTime(t: number) {
      this.autoUpdateTime = t
      if (t === 0)
        this.stop()
      else
        this.initAutoUpdate()
    },
    setNetWork(type: string) {
      this.autoUpdateNetwrok = type
      this.initAutoUpdate()
    },
  },
})
