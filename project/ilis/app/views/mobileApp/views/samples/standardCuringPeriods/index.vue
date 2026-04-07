<template>
  <div class="standardCuringWarehouseManage">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" @click-right="onScan">
        <template #right>
          <div v-if="hasBtnAuth">
            扫码登记
            <van-icon
              class-prefix="iconfont"
              name="scan"
              size="16"
              style="margin-left: 4px"
            />
          </div>
        </template>
      </MobileTitleBar>
      <van-tabs
        v-model:active="activeKey"
        color="#154bd0"
        title-active-color="#154bd0"
      >
        <van-tab title="待入库" :disabled="loading"></van-tab>
        <van-tab title="待出库" :disabled="loading"></van-tab>
      </van-tabs>
      <van-search
        v-model.trim="query.quickQry"
        style="border-top: solid 1px #f5f5f5"
        placeholder="搜索"
        @search="onSearch"
      />
    </van-sticky>

    <div class="standardCuringWarehouseManage-list">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        @load="onLoad"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="standardCuringWarehouseManage-box"
        >
          <div class="standardCuringWarehouseManage-boxHeader">
            <van-row :gutter="10" type="flex" align="center">
              <van-col>
                <van-checkbox
                  v-model="item.checked"
                  :disabled="!hasBtnAuth"
                  @click="allCheckChange(item)"
                ></van-checkbox>
              </van-col>
              <van-col span="16">
                <div class="textOverflow" style="font-weight: bold">
                  {{ item.testObjectName }}
                </div>
                <div class="textOverflow" style="color: gray; font-size: 13px">
                  {{ item.testObjectSn }}
                </div>
                <div v-if="activeKey === 1" style="color: gray; font-size: 13px">
                  存放位置：{{ item.saveSite }}
                </div>
              </van-col>
              <van-col
                v-if="activeKey !== 0"
                span="5"
                @click="queryPoint(item.periods)"
              >
                <van-button
                  icon="location-o"
                  plain
                  hairline
                  size="mini"
                  type="primary"
                >
                  查找
                </van-button>
              </van-col>
            </van-row>
          </div>
          <div class="standardCuringWarehouseManage-boxBody">
            <template
              v-for="(period, periodIndex) in item.periods"
              :key="period.id"
            >
              <van-checkbox
                v-model="period.checked"
                :disabled="!hasBtnAuth"
                @change="
                  (val) => {
                    periodCheck(val, item)
                  }
                "
              >
                <div class="standardCuringWarehouseManage-period">
                  <div class="textOverflow" style="width: 45%">
                    <span v-if="period.periodCode">{{
                      period.periodCode
                    }}</span>
                    <span
                      v-else-if="!period.periodCode && period.sourceFrom === '1'"
                    >[委托方制件]试件{{ periodIndex + 1 }}</span>
                    <span v-else>试件{{ periodIndex + 1 }}</span>
                  </div>
                  <div class="textOverflow" style="width: 35%">
                    {{ period.formingDate }}
                  </div>
                  <div class="textOverflow" style="width: 20%">
                    <span v-if="period.days">{{ period.days }}天</span>
                  </div>
                </div>
              </van-checkbox>
            </template>
          </div>
        </div>
      </van-list>
    </div>

    <van-button
      v-if="hasBtnAuth"
      type="primary"
      square
      block
      class="standardCuringWarehouseManage-btn"
      @click="submit"
    >
      <span v-if="activeKey === 0">入库登记</span>
      <span v-else>出库登记</span>
    </van-button>
  </div>
</template>

<script>
import { mapWritableState } from 'pinia'
import qs from 'qs'
import {
  showDialog,
} from 'vant'
import { usePermissionStore } from '~/store/permissionStore'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { qrCodeScanTool } from '~/views/mobileApp/provides/modules/qr-code-scan-tool'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useSampleStore } from '~/views/mobileApp/store/useSampleStore'

export default {
  name: 'standardCuringPeriods',
  components: {
    MobileTitleBar,
  },
  beforeRouteEnter(to, from, next) {
    if (from.name === 'menuPage' || from.name === 'menuSearch') {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.scrollTop = 0
      pageState.resetPage = true
    }

    next()
  },
  beforeRouteLeave(to, from, next) {
    if (from.name === 'standardCuringWarehouseManage') {
      const pageState = useAppPageStateStore().getPage(from.name)
      pageState.scrollTop = document.documentElement.scrollTop || 0
    }
    next()
  },
  data() {
    return {
      formatDate,
      list: [],
      activeKey: 0,
      query: {
        quickQry: '',
        page: 0,
        size: 10,
      },
      finished: false,
      loading: false,
      hasBtnAuth: false,
    }
  },
  computed: {
    ...mapWritableState(useSampleStore, ['standardCuringStorageInfo']),
  },
  watch: {
    activeKey() {
      this.checkBtnAuth()
      this.onSearch()
    },
  },
  activated() {
    const pageState = useAppPageStateStore().getPage('standardCuringPeriods')
    const { scrollTop, resetPage } = pageState

    window.scrollTo(0, scrollTop || 0)

    if (resetPage === true || resetPage === undefined || resetPage === null) {
      this.resetPage()
      pageState.resetPage = false
    }
  },
  created() {
    this.checkBtnAuth()
  },
  methods: {
    // 检查页面是否有操作权限
    checkBtnAuth() {
      const { hasPermission } = usePermissionStore()

      if (
        (this.activeKey === 0 && hasPermission('mobile_standardStorageEnter'))
        || (this.activeKey === 1 && hasPermission('mobile_standardStorageOut'))
      ) {
        this.hasBtnAuth = true
      }
      else {
        this.hasBtnAuth = false
      }
    },
    queryPoint(rows) {
      const fun = []
      const errIndex = []
      rows.forEach((item, index) => {
        if (item.saveSiteId) {
          fun.push(this.ajaxForFind(item.saveSiteId))
        }
        else {
          errIndex.push(index + 1)
        }
      })
      if (errIndex.length > 0) {
        let str = ''
        errIndex.forEach((item) => {
          str += `试件${item},`
        })
        showToast(`${str}未配置样品定位器`)
      }
      if (fun.length > 0) {
        const toast = showLoadingToast({
          message: '呼叫中...',
          forbidClick: true,
          duration: 0,
        })
        Promise.all(fun)
          .then((res) => {
            if (res) {
              showDialog({ message: '呼叫成功' })
            }
          })
          .finally(toast.close)
      }
    },
    ajaxForFind(id) {
      return new Promise((resolve, reject) => {
        mRequest
          .post(
            api.samples.findSpecimen,
            qs.stringify({
              siteId: id,
            }),
          )
          .then((res) => {
            if (res.code === 20000) {
              resolve(true)
            }
            else {
              // eslint-disable-next-line prefer-promise-reject-errors
              reject(false)
              showDialog({ message: res.message || res.msg })
            }
          })
      })
    },
    onScan() {
      qrCodeScanTool.scan(async (result) => {
        let url = ''
        if (this.activeKey === 0) {
          url = api.samples.waitStoragePeriodsByBarcode
        }
        else {
          url = api.samples.storagePeriodsByBarcode
        }

        const loadingToast = showLoadingToast({
          message: '数据处理中...',
          duration: 0,
          forbidClick: true,
        })

        mRequest
          .post(
            url,
            qs.stringify({
              barcode: result,
            }),
            {},
          )
          .then(async (res) => {
            if (res && res.code !== 20010) {
              const data = res.data
              let standardCuringStorageInfo = this.standardCuringStorageInfo
              if (standardCuringStorageInfo.length === 0) {
                this.standardCuringStorageInfo = [data]
                await this.$router.push({
                  name: 'standardCuringStorage',
                  params: {
                    type,
                  },
                })
              }
              else {
                standardCuringStorageInfo = JSON.parse(
                  JSON.stringify(standardCuringStorageInfo),
                )
                const flag = standardCuringStorageInfo.find(
                  item => item.id === data.id,
                )
                if (!flag) {
                  standardCuringStorageInfo.unshift({ ...data })
                  this.standardCuringStorageInfo = standardCuringStorageInfo
                }
              }
            }
            else {
              showDialog({
                title: '提示',
                message: res.message || res.msg,
              })
            }
          })
          .catch((err) => {
            // eslint-disable-next-line no-alert
            alert(JSON.stringify(err))
          })
          .finally(() => {
            loadingToast.close()
          })
      })
    },
    resetPage() {
      window.scrollTo(0, 0)
      this.query = {
        quickQry: '',
        page: 0,
        size: 10,
      }

      this.onSearch()
    },
    onSearch() {
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true

      let url
      if (this.activeKey === 0) {
        url = api.samples.waitStoragePeriods
      }
      else if (this.activeKey === 1) {
        url = api.samples.storagePeriods
      }

      const res = await mRequest.post(url, qs.stringify(this.query))

      if (res.data && res.data.length > 0) {
        if (this.activeKey === 1) {
          this.list = [...this.list, ...res.data].map((item) => {
            const site = []
            item.periods.forEach((period) => {
              if (!site.includes(period.saveSite)) {
                site.push(period.saveSite)
              }
            })
            return {
              ...item,
              saveSite: site.join(','),
            }
          })
        }
        else {
          this.list = [...this.list, ...res.data]
        }
      }

      if (res.data && res.data.length === 0) {
        this.finished = true
      }
      this.loading = false
    },
    allCheckChange(item) {
      item.periods = item.periods.map(period => ({
        ...period,
        checked: item.checked,
      }))
      this.$forceUpdate()
    },
    periodCheck(checked, item) {
      if (checked === false) {
        item.checked = false
      }
      else if (checked === true) {
        const checkedList = item.periods.filter(period => period.checked)
        if (checkedList.length === item.periods.length) {
          item.checked = true
        }
      }
      this.$forceUpdate()
    },
    submit() {
      const data = this.list.filter((item) => {
        if (item.checked === true) {
          return true
        }
        const periods = item.periods.filter(period => period.checked === true)
        if (periods.length > 0) {
          return true
        }
        else {
          return false
        }
      })

      if (data.length === 0) {
        showDialog({ message: '请勾选要登记的试件，或直接扫码' })
        return
      }

      this.standardCuringStorageInfo = data
      this.$router.push({
        name: 'standardCuringStorage',
        params: {
          type: this.activeKey,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index';
</style>
