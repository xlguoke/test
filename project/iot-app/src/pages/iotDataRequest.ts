import { usePermissionStore } from '@/stores'
import { IsNeedAuth } from '@/stores/modules/permissionStore'
import request from '@/utils/request'

export interface TsSubCmdItem {
  /** 唯一实体类型标识支持实类型: TENANT, CUSTOMER, USER, DASHBOARD, ASSET, DEVICE, ALARM */
  entityType: string
  /** 唯一实体标识符 */
  entityId: string
  /** 文档上没标记这是什么，但是又传了值，我们先不管 */
  // scope: "LATEST_TELEMETRY",
  /** 命令唯一标识（在相应的Websocket连接中）  */
  cmdId: number
}

export interface TemHumData {
  data: {
    humidity?: [number, string][]
    temperature?: [number, string][]
  }
  errorCode: number
  errorMsg: string
  subscriptionId: number
}

/**
 * 获取物联网数据
 * 注：无需监听时，需主动关闭连接
 */
export class IotDataRequest {
  /** 物联网token */
  iotToken?: string

  webSocket?: WebSocket

  /** 获取物联网平台token */
  async getIotToken() {
    const { isNeedAuth } = usePermissionStore()
    const apiUrl = isNeedAuth === IsNeedAuth.YES ? `/rest/eq/iots/token` : `/api/indoor-screen/eq/iots/token`
    const res = await request.get<string>(apiUrl)
    this.iotToken = res.data
  }

  /** 关闭webSocket连接 */
  closeWebSocket() {
    if (this.webSocket) {
      this.webSocket.close()
      this.webSocket = undefined
    }
  }

  /** 监听数据更新 */
  async listenDataUpdate(tsSubCmds: TsSubCmdItem[], callback: (data: TemHumData) => void) {
    if (!this.iotToken) {
      await this.getIotToken()
    }

    this.closeWebSocket()

    const webSocket = new WebSocket(`wss://iot.qdm123.com/api/ws/plugins/telemetry?token=${this.iotToken}`)
    this.webSocket = webSocket

    webSocket.onopen = function () {
      const object = {
        tsSubCmds,
        historyCmds: [],
        attrSubCmds: [],
      }

      const data = JSON.stringify(object)
      webSocket.send(data)
    }

    webSocket.onmessage = function (event) {
      if (event && event.data) {
        callback(JSON.parse(event.data))
      }
    }
  }
}
