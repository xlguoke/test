<template>
  <div>
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        title="盘点登记"
        left-arrow
        @click-left="$router.go(-1)"
        @click-right="onScan"
      >
        <template #right>
          <van-icon
            class-prefix="iconfont"
            name="scan"
            size="16"
            style="margin-left: 4px"
          />
        </template>
      </MobileTitleBar>
      <OrderCard :data="detail" style="margin-bottom: 0"></OrderCard>
      <van-row class="filter-row">
        <van-col span="12" @click="openScreen(1)">
          <van-icon size="18" class-prefix="iconfont" name="search" />
          搜索
        </van-col>
        <van-col span="12" @click="openScreen(2)">
          <van-icon size="18" class-prefix="iconfont" name="sort" />筛选
        </van-col>
      </van-row>
      <van-search
        v-if="quickSearchVisible"
        v-model.trim="query.queryCode"
        placeholder="请输入资产名称/资产编号"
        @search="onSearch"
      />
    </van-sticky>
    <van-list
      v-model:loading="loading"
      finished-text="没有更多了"
      :finished="finished"
      @load="onLoad()"
    >
      <div class="list">
        <div
          v-for="item in list"
          :key="item.id"
          is-link
          class="card"
          @click="handleEdit(item)"
        >
          <div class="title">
            <div class="name">
              {{ item.equipmentName }}
            </div>
            <div
              class="status"
              :style="{
                backgroundColor:
                  statusMap[item.status] && statusMap[item.status].color,
              }"
            >
              {{ statusMap[item.status] && statusMap[item.status].label }}
            </div>
          </div>
          <van-row gutter="20">
            <van-col span="24">
              <div class="line">
                <span class="label">设备编号：</span>
                <span>{{ item.equipmentSn }}</span>
              </div>
            </van-col>
            <van-col span="24">
              <div class="line">
                <span class="label">资产编号：</span>
                <span>{{ item.assetSn }}</span>
              </div>
            </van-col>
            <van-col span="24">
              <div class="line">
                <span class="label">所属部门：</span>
                <span>{{ item.departName }}</span>
              </div>
            </van-col>
          </van-row>
        </div>
      </div>
    </van-list>

    <!-- 搜索组件 -->
    <MakeInventorySearch
      v-model:value="searchVisible"
      :inital-data="moreCondition"
      @callback="getMoreSearch"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { BaiduMapTool } from '~/views/mobileApp/provides/modules/baidu-map-tool'
import { qrCodeScanTool } from '~/views/mobileApp/provides/modules/qr-code-scan-tool'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'
import MakeInventorySearch from '../component/MakeInventorySearch.vue'
import OrderCard from '../component/OrderCard.vue'

export default {
  components: {
    MakeInventorySearch,
    OrderCard,
    MobileTitleBar,
  },
  data() {
    return {
      geolocation: null,
      loading: false,
      finished: false,
      list: [],
      query: {
        page: 0,
        size: 10,
        queryCode: '',
      },
      quickSearchVisible: false,
      searchVisible: false,
      moreCondition: {},
      statusMap: {
        10: { label: '待盘点', color: '#555555' },
        20: { label: '正常', color: '#70b407' },
        30: { label: '盘点异常', color: '#d9001b' },
        40: { label: '位置异常', color: '#f59a23' },
      },
      lnglat: [],
      detail: {},
      count: 0,
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['userInfo']),
    inventoryProgress() {
      return `${this.detail.inventoryCount}/${this.count}`
    },
  },
  watch: {
    inventoryProgress(val) {
      this.detail.inventoryProgress = val
    },
  },
  created() {
    this.getGeolocation()
    this.getDetail(this.$route.query.id)
  },
  methods: {
    onScan() {
      if (!this.lnglat || !this.lnglat.length) {
        return showFailToast('未获取到设备位置信息,请检查定位权限')
      }

      qrCodeScanTool.scan((r) => {
        this.handleScanRsult(r)
      })
    },

    openScreen(type) {
      if (type === 1) {
        this.quickSearchVisible = !this.quickSearchVisible
      }
      else if (type === 2) {
        this.searchVisible = !this.searchVisible
      }
    },
    async getDetail(id) {
      const { data, code } = await mRequest.get(
        api.equipmentInventory.detail(id),
      )
      if (code === 20000) {
        this.detail = data
        this.getStatic(data)
      }
    },
    async getStatic(row) {
      const { data, code } = await mRequest.get(
        api.equipmentInventory.static,
        {
          params: { inventoryId: row.id },
        },
      )
      if (code === 20000) {
        // row[20] = data[20] || 0
        // row[30] = data[30] || 0
        // row[40] = data[40] || 0
        row.inventoryProgress = data.inventoryProgress || ''
        row['20'] = data['20'] || 0
        row['30'] = data['30'] || 0
        row['40'] = data['40'] || 0
      }
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true
      const id = this.$route.query.id
      const res = await mRequest.get(
        api.equipmentInventory.devicePageList,
        {
          params: {
            inventoryId: id,
            ...this.query,
            ...this.moreCondition,
          },
        },
      )
      if (res.code !== 20000) {
        showFailToast(res.message || '获取列表数据失败')
        return
      }
      if (res.data.rows && res.data.rows.length > 0) {
        this.list = [...this.list, ...res.data.rows]
      }

      if ((res.data.rows && res.data.rows.length === 0) || !res.data.rows) {
        this.finished = true
      }
      this.loading = false

      if (this.list.length >= res.data.count) {
        this.finished = true
      }
      this.count = res.data.count
    },
    handleEdit(item) {
      // if (item.status === '10') {
      //   return showFailToast('无盘点信息!')
      // }
      this.$router.push({
        name: 'equipmentInventoryDetail',
        query: {
          id: item.id,
          inventoryId: this.$route.query.id,
        },
      })
    },
    async handleScanRsult(res) {
      if (!(res.includes('equipment/goEquipmentDetail') || res.includes('eq/edt')) && !(res.includes('asset/detail'))) {
        showDialog({
          title: '提示',
          message: '请扫描资产二维码',
        })

        return
      }

      if (!res.includes('http')) {
        res = `http://${res}`
      }

      const id = qrCodeScanTool.getParamByResult(res, 'id')
      if (!id) {
        showDialog({
          title: '提示',
          message: '未识别到资产id',
        })

        return
      }

      showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const { code, data, msg, message } = await mRequest
        .get(api.equipmentInventory.axis, {
          params: { assetId: id },
        })
        .catch((err) => {
          throw err
        })
        .finally(() => {
          closeToast()
        })

      if (code !== 20000) {
        showDialog({
          title: '提示',
          message: msg || message || '获取资产位置信息失败',
        })
        return
      }

      const { path } = data
      const device = this.list.find((item) => {
        return item.assetId === id || item.eqId === id
      })

      if (!device) {
        showDialog({
          title: '提示',
          message: '未在盘点单中找到该资产!',
        })

        return
      }

      const chcekInId = device.id

      if (!path) {
        await this.checkIn(chcekInId, 20, device)
      }
      else {
        const polygon = new BMap.Polygon(JSON.parse(path))
        const inPolygon = BMapLib.GeoUtils.isPointInPolygon(
          this.lnglat,
          polygon,
        )

        if (inPolygon) {
          await this.checkIn(chcekInId, 20, device)
        }
        else {
          await this.checkIn(chcekInId, 40, device)
        }
      }

      this.onSearch()
      this.getDetail(this.$route.query.id)
    },
    // 状态 10-未盘点 20-已盘点 30-盘点异常 40-位置异常
    async checkIn(id, status, device) {
      const inventorId = this.$route.query.id
      const loadingToast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      await mRequest
        .post(
          api.equipmentInventory.register,
          {
            inventorId,
            inventoryAssets: [
              {
                id,
                status,
                inventoryTime: Date.now(),
                inventoryUserId: this.userInfo.id,
                inventoryUserName: this.userInfo.realName,
              },
            ],
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )
        .finally(() => {
          loadingToast.close()
        })

      if (String(status) === '20') {
        showToast(`资产: ${device.equipmentName}盘点正常`)
      }
      else {
        showConfirmDialog({
          title: '提示',
          message: `资产: ${device.equipmentName}盘点位置异常，如需添加备注或上传附件，请点击确认前往！`,
        })
          .then(async () => {
            this.$router.push({
              name: 'equipmentInventoryDetail',
              query: {
                id,
                inventoryId: this.$route.query.id,
              },
            })
          })
          .catch(() => {})
      }
    },
    onSearch() {
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    getMoreSearch(data) {
      this.moreCondition = { ...data }
      this.onSearch()
    },
    async getGeolocation() {
      const baiduMapTool = new BaiduMapTool()

      showLoadingToast({
        message: '定位中...',
        duration: 0,
        forbidClick: true,
      })

      const data = await baiduMapTool.getLocation().finally(() => {
        closeToast()
      })

      const position = data.point
      this.lnglat = [position.lng, position.lat]
    },
  },
}
</script>

<style lang="less" scoped>
.list {
  padding: 12px;
  .card {
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 12px;
    margin-bottom: 16px;
    background-color: #fff;
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #e5e5e5;
      padding-bottom: 8px;
      margin-bottom: 8px;
      .name {
        flex: 1;
        font-weight: 700;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .status {
        font-size: 12px !important;
        color: #fff;
        border-radius: 4px;
        padding: 0px 8px;
        background-color: #555555;
      }
    }
  }
}
.line {
  display: flex;
  align-items: center;
}
.label {
  display: inline-block;
  color: #888;
  width: 70px !important;
  text-align: right;
  white-space: nowrap;
}
.filter-row {
  .van-col {
    padding: 10px 0;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    border-bottom: solid 1px #f5f5f5;
    color: #777;

    .iconfont {
      margin-right: 4px;
    }
  }
}
</style>
