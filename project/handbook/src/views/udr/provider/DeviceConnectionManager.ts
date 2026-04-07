import { h, ref } from 'vue'
import type { IotDeviceDto } from '../modules/equipment-collection'
import { udrCore } from './UdrCore'
import { request } from '@/axios'

enum MsgType {
  '请求连接' = 'request',
  '拒绝连接' = 'reject',
  '同意连接' = 'agree',
}

interface SSEReponseData {
  current: number
  total: number
  complete: boolean
  notice: string
  data: any
}

/**
 * 基于SSE控制设备使用连接
 */
export class DeviceConnectionManager {
  private androidId = udrCore?.$global?.getAndroidId()

  // 使用中的设备
  private useDevice: IotDeviceDto | null = null

  // 心跳检测，告诉SSE我还在
  private pingTimer: NodeJS.Timeout | null = null

  constructor(private onCancelSelectDevice: () => void) {}

  /**
   * 连接设备
   */
  connectDevice(device: IotDeviceDto): Promise<boolean> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve) => {
      // 当前有连接状态的设备
      if (this.useDevice) {
        resolve(false)
        return
      }

      const cLoading = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const result = await request(`/ilis2/receiver/connect/${device.id}/check`).finally(cLoading.close)

      if (!result) {
        this.createUseConnect(device)
        resolve(true)
        return
      }

      // 创建抢占请求长连接
      this.createRequestConnect().then((res) => {
        // 关闭抢占请求长连接
        this.closeRequestConnect()

        if (res === true) {
          this.createUseConnect(device)
          resolve(true)
        }
        else {
          showDialog({
            title: '提示',
            message: `您的申请已被拒绝，设备连接失败`,
          })
          resolve(false)
        }
      }).catch((err) => {
        showDialog({
          title: '检测失败',
          message: err.message,
        })
        resolve(false)
      })

      // 发送抢占请求
      this.send(device.id, MsgType.请求连接)
    })
  }

  // 建立设备抢占请求长连接
  private createRequestConnect(): Promise<boolean> {
    return new Promise((resolve) => {
      // 等待提示
      const waitLoading = showLoadingToast({
        duration: 0,
        forbidClick: true,
        message: `该设备已连接到其他平板，正在申请连接（10s）`,
      })

      let second = 10

      const timer = setInterval(() => {
        second--

        if (second > 0) {
          waitLoading.message = `该设备已连接到其他平板，正在申请连接（${second}s）`
        }
        else {
          clearInterval(timer)
          waitLoading.close()
          resolve(true)
        }
      }, 1000)

      // 请求长连接
      request({
        method: 'POST',
        url: `/ilis2/receiver/connect/${this.androidId}`,
        headers: {
          Accept: 'text/event-stream',
        },
        onDownloadProgress: (res) => {
          const data = this.parseResponse(res.event.target.responseText)
          if (data && data.notice) {
            const msg = (data.notice || '').split(':')
            const msgType = msg[1]

            if (msgType === MsgType.同意连接) {
              clearInterval(timer)
              waitLoading.close()
              resolve(true)
            }

            if (msgType === MsgType.拒绝连接) {
              clearInterval(timer)
              waitLoading.close()
              resolve(false)
            }
          }
        },
      })
    })
  }

  // 设备使用后，建立使用长连接
  private createUseConnect(device: IotDeviceDto) {
    this.useDevice = device

    request({
      method: 'POST',
      url: `/ilis2/receiver/connect/${device.id}`,
      headers: {
        Accept: 'text/event-stream',
      },
      onDownloadProgress: (res) => {
        const data = this.parseResponse(res.event.target.responseText)

        if (data && data.notice) {
          const msg = (data.notice || '').split(':')
          const androidId = msg[0]
          const msgType = msg[1]

          if (this.useDevice && msgType === MsgType.请求连接) {
            udrCore.$this.setUdrVisibility(false)

            const second = ref(10)

            // 倒计时自动同意
            let timer: any = setInterval(() => {
              second.value -= 1

              if (second.value <= 0) {
                clearInterval(timer)
                timer = null

                closeDialog()

                // 自动同意后，无需发送同意消息，取消当前使用设备信息即可
                this.onCancelSelectDevice()
                this.closeUseConnect(true)
              }
            }, 1000)

            const useDeviceName = this.useDevice.name

            showConfirmDialog({
              title: '提示',
              message: () => h('div', {}, [
                h('div', {}, `有新的设备申请连接${useDeviceName}，是否同意断开当前连接？（${second.value}s后将自动确认）`),
              ]),
            }).then(() => {
              // 取消设备选中，清空设备连接状态等
              this.onCancelSelectDevice()
              this.closeUseConnect(true)

              this.send(androidId, MsgType.同意连接)
            }).catch(() => {
              this.send(androidId, MsgType.拒绝连接)
            }).finally(() => {
              clearInterval(timer)
              timer = null
              udrCore.$this.setUdrVisibility(true)
            })
          }
        }
      },
    })

    this.startSendPing()
  }

  /**
   * 关闭设备抢占请求连接
   */
  private async closeRequestConnect() {
    await request(`/ilis2/receiver/connect/${this.androidId}/close`)
  }

  /**
   * 关闭设备使用连接
   * @param hasOtherUser 是否其他用户抢占导致的关闭使用连接
   */
  closeUseConnect(hasOtherUser = false) {
    if (!this.useDevice)
      return

    // 如果是其他用户抢占导致的关闭使用连接，无需调用关闭接口，避免把其他用户的连接给关闭了
    if (!hasOtherUser)
      request(`/ilis2/receiver/connect/${this.useDevice.id}/close`)

    this.useDevice = null

    this.stopSendPing()
  }

  /**
   * 发送消息
   */
  private async send(deviceId: string, msg: MsgType) {
    await request(`/ilis2/receiver/connect/${deviceId}/send`, {
      params: {
        msg: `${this.androidId}:${msg}`,
      },
    })
  }

  /**
   * 开始进行心跳检测
   * 前端25秒向后端发送一次检查，告诉后端当前用户处于活跃状态，后端在60秒内没收到消息就会关闭连接
   */
  private startSendPing() {
    this.pingTimer = setInterval(() => {
      if (this.useDevice)
        request(`/ilis2/receiver/connect/${this.useDevice.id}/use`)
      else
        this.stopSendPing()
    }, 25 * 1000)
  }

  private stopSendPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
      this.pingTimer = null
    }
  }

  private parseResponse(responseText: string): SSEReponseData | null {
    const events = (responseText || '').split('\n')
    const dataLines = events.filter(i => i.includes('data:'))
    dataLines.reverse()

    for (let i = 0; i < dataLines.length; i++) {
      const dataItem = dataLines[i]

      try {
        const dataJson = JSON.parse(dataItem.replace('data:', ''))
        return dataJson
      }
      catch (e) {}
    }

    return null
  }
}
