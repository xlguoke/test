<template>
  <div class="deviceRecord-wrap">
    <!-- <van-sticky> -->
    <MobileTitleBar
      title="设备授权控制"
      left-arrow
      @click-left="$router.go(-1)"
      @click-right="handleCalick"
    >
      <template #right>
        <img
          :src="scanSvg"
          width="20px"
          style="margin-right: 6px"
        />
      </template>
    </MobileTitleBar>
    <van-search
      v-model.trim="params.q"
      :show-action="InAndroid"
      placeholder="请输入设备名称或设备编号"
      class="serch"
      @search="onSearch"
    ></van-search>
    <div id="contentWrap" class="container" @scroll="handleScroll">
      <div v-if="list && list.length">
        <div
          v-for="item in list"
          :key="item.keyId"
          style="background-color: #fff"
          class="item"
        >
          <div
            v-if="['已停用', '已报废'].includes(item.status)"
            class="status-tag warning"
          >
            <span>{{ item.status }}</span>
          </div>
          <div
            v-else-if="['正常'].includes(item.status) && !item.checkingExpired"
            class="status-tag normal"
          >
            <span>{{ item.status }}</span>
          </div>
          <div v-else-if="item.checkingExpired" class="status-tag warning">
            <span>校检过期</span>
          </div>
          <div v-else class="status-tag">
            <span>{{ item.status }}</span>
          </div>
          <div class="flex just-space item1">
            <h3>{{ item.name }}</h3>
          </div>
          <div class="flex just-space item1">
            <div>
              <span class="itemtitle">设备编号:</span>
              <span>{{ item.sn }}</span>
            </div>
            <!-- <div>
                日志
              </div> -->
            <!-- 未绑定智能装置 -->
            <div
              v-if="item.isSwitchDevice === false"
              style="color: #154bd0"
              @click="handleClickUnlock(item)"
            >
              立即解锁
            </div>
          </div>
          <!-- 绑定智能装置 -->
          <div v-if="item.iotDevice" class="flex just-space item1">
            <div>
              <span class="itemtitle">关联智能开关:</span>
              <span>
                {{ item.iotDevice.name }}
                <span
                  v-if="item.iotSwitchDevice === false"
                  style="color: #ff0000"
                >
                  (未找到对应设备)
                </span>
              </span>
            </div>

            <template v-if="item.iotSwitchDevice">
              <template v-if="item.iotSwitchDevice.switch">
                <div class="flex align">
                  <span class="circle success"></span>
                  已开启
                </div>
                <div style="color: #154bd0" @click="handleClickEnd(item)">
                  远程关闭
                </div>
              </template>
              <template v-else>
                <div class="flex align">
                  <span class="circle error"></span>
                  未开启
                </div>
                <div style="color: #154bd0" @click="handleClickStart(item)">
                  远程开启
                </div>
              </template>
            </template>
          </div>
          <div class="flex just-space item1">
            <div>
              <span class="itemtitle">所属功能室:</span>
              <span>{{ item.laboratoryName }}</span>
            </div>
          </div>
        </div>
        <div
          v-if="finished"
          style="
            color: #969799;
            font-size: 14px;
            line-height: 50px;
            text-align: center;
          "
        >
          没有更多了
        </div>
      </div>
      <div v-else>
        <van-empty description="暂无数据" />
      </div>
    </div>
    <div v-show="loading" class="loading">
      加载中...
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { v4 } from 'uuid'
import {
  showConfirmDialog,
  showDialog,
  showLoadingToast,
} from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { qrCodeScanModule } from '~/views/mobileApp/provides/modules/qr-code-scan-module'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { InAndroid } from '~/views/mobileApp/provides/utils/referrer'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

let timer = null
let func = null
let tim = null
export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      scanSvg: new URL(`~/views/mobileApp/assets/icon/scan.svg`, import.meta.url).href,
      InAndroid,
      list: [],
      loading: false,
      finished: false,
      total: 0,
      params: {
        page: 1,
        size: 20,
        q: '',
      },
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['userInfo']),
    realName() {
      return this.userInfo.realName
    },
  },
  mounted() {
    this.getData()
    func = this.cloneS()
  },
  destoryed() {
    clearInterval(timer)
    clearInterval(tim)
    func = null
  },
  methods: {
    onRefresh() {
      this.finished = false
      this.params.page = 1
      this.list = []
      this.getData()
    },
    onSearch() {
      this.onRefresh()
    },
    handleScroll() {
      const parentDom = document.getElementById('contentWrap')
      if (
        parentDom.scrollTop + parentDom.clientHeight + 50
        >= parentDom.scrollHeight
      ) {
        if (!this.finished && func) {
          func()
        }
      }
    },
    cloneS() {
      return () => {
        if (timer) {
          clearInterval(timer)
        }
        timer = setTimeout(() => {
          this.params.page++
          this.getData()
        }, 300)
      }
    },
    getData() {
      this.loading = true
      mRequest
        .get(api.equipment.deviceList, {
          params: this.params,
        })
        .then((res) => {
          if (res) {
            const templateData = res || []
            const addData = []
            // newId
            // eslint-disable-next-line array-callback-return
            templateData.map((item) => {
              const controllerDevices = item.devices.filter(
                i => i.active && i.type === 'CONTROLLER',
              )
              if (controllerDevices.length > 0) {
                // eslint-disable-next-line array-callback-return
                controllerDevices.map((ditem) => {
                  item.keyId = v4()
                  item.iotDevice = ditem
                  addData.push({ ...item })
                })
              }
              else {
                item.keyId = v4()
                addData.push(item)
              }
            })

            this.list = [...this.list, ...addData]
            this.loading = false

            this.$nextTick(() => {
              this.getDeviceAttr(addData)
            })

            if (templateData.length === 0) {
              this.finished = true
            }
          }
          else {
            showFailToast('获取信息失败！')
            this.loading = false
          }
        })
        .catch((_) => {
          this.loading = false
        })
    },
    getDeviceAttr(rows) {
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        const iotDevice = row.iotDevice

        if (iotDevice) {
          const url = api.equipment.getIotDeviceAttr(iotDevice.id)
          mRequest.get(url, { params: { raw: true } }).then((res) => {
            if (res.result === true) {
              const info = res.info
              const index = this.list.findIndex(j => j.keyId === row.keyId)
              const listItem = this.list[index]
              if (listItem) {
                this.list[index] = {
                  ...listItem,
                  isSwitchDevice: true,
                  iotSwitchDevice: {
                    switch: info.switch,
                    name: iotDevice.name,
                    id: iotDevice.id,
                  },
                }
              }
            }
            else {
              // this.list = this.list.filter(j => j.keyId !== row.keyId);
              const index = this.list.findIndex(j => j.keyId === row.keyId)
              const listItem = this.list[index]
              if (listItem) {
                this.list[index] = {
                  ...listItem,
                  iotSwitchDevice: false,
                }
              }
            }
          })
        }
        else {
          const index = this.list.findIndex(j => j.id === row.id)
          const listItem = this.list[index]
          if (listItem) {
            this.list[index] = {
              ...listItem,
              isSwitchDevice: false,
            }
          }
        }
      }
    },
    getTotal() {
      mRequest.get(api.equipment.deviceCount).then((res) => {
        if (res) {
          this.total = res
        }
      })
    },
    // 远程开启
    handleClickStart(item) {
      showConfirmDialog({
        title: '提示',
        message: '此操作将开启试验设备的电源，继续操作吗?',
        confirmButtonText: '继续',
        cancelButtonText: '取消',
      }).then(() => {
        tim = setTimeout(() => {
          const start = api.equipment.start(item.iotSwitchDevice.id, true)
          const toast = showLoadingToast({
            duration: 0,
            forbidClick: true,
          })
          mRequest.post(start).then((res) => {
            if (res.success) {
              showSuccessToast(res.message)
              this.onRefresh()
            }
            else {
              showDialog({ message: res.message })
            }
          }).finally(() => {
            toast.close()
          })
        }, 0)
      })
    },
    // 远程关闭
    handleClickEnd(item) {
      showConfirmDialog({
        title: '提示',
        message:
          '此操作可能对正在进行试验的其他人有影响操作之前请确认是否有其他人在做试验.',
        cancelButtonText: '取消',
        confirmButtonText: '继续',
      }).then(() => {
        tim = setTimeout(() => {
          const start = api.equipment.start(
            item.iotSwitchDevice.id,
            false,
          )
          const toast = showLoadingToast({
            duration: 0,
            forbidClick: true,
          })
          mRequest.post(start).then((res) => {
            if (res.success) {
              showSuccessToast(res.message)
              this.onRefresh()
            }
            else {
              showDialog({ message: res.message })
            }
          }).finally(() => {
            toast.close()
          })
        }, 0)
      })
    },
    // 立即解锁
    handleClickUnlock(item) {
      showConfirmDialog({
        title: '提示',
        message: '确认立即解锁吗？',
        confirmButtonText: '继续',
        cancelButtonText: '取消',
      }).then(() => {
        tim = setTimeout(() => {
          const start = api.equipment.startLock(item.id)
          const toast = showLoadingToast({
            duration: 0,
            forbidClick: true,
          })
          mRequest.post(start).then((res) => {
            if (res.success) {
              showSuccessToast(res.message)
              this.onRefresh()
            }
            else {
              showDialog({ message: res.message })
            }
          }).finally(() => {
            toast.close()
          })
        }, 0)
      })
    },
    handleCalick() {
      qrCodeScanModule.deviceAuthorization(this)
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
