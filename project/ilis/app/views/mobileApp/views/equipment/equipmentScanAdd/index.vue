<template>
  <div class="equipment-add-wrap">
    <MobileTitleBar :title="title" left-arrow @click-left="$router.go(-1)"></MobileTitleBar>
    <div class="equipment-add-body">
      <p v-if="equipmentDatas.length === 0" class="hint">
        还未添加任何设备
      </p>
      <ul class="equipment-list">
        <li v-for="(item, i) in equipmentDatas" :key="item.id" class="item">
          <div class="item-left">
            <p class="name">
              {{ item.name }}
            </p>
            <p class="equipment-sn">
              {{ item.equipmentSn }}
            </p>
          </div>
          <van-icon class="item-right" name="cross" @click="delEquipment(i)" />
        </li>
      </ul>
    </div>
    <div class="scan-box">
      <div>
        <div class="scan-wrap">
          <van-icon
            class="scan-icon"
            color="#fff"
            size="40"
            name="scan"
            @click.stop="onScan"
          />
        </div>
        <div class="scan-tip">
          扫码添加设备
        </div>
      </div>
      <div>
        <div class="scan-wrap">
          <van-icon
            class="scan-icon"
            color="#fff"
            size="40"
            name="scan"
            @click.stop="onBatchScan"
          />
        </div>
        <div class="scan-tip">
          连续扫码添加设备
        </div>
      </div>
    </div>

    <div class="equipment-add-foot">
      <van-button type="primary" block @click="nextStep">
        下一步
      </van-button>
    </div>
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { qrCodeScanTool } from '~/views/mobileApp/provides/modules/qr-code-scan-tool'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useEquipmentStore } from '~/views/mobileApp/store/useEquipmentStore'

export default {
  name: 'equipmentScanAdd',
  components: {
    MobileTitleBar,
  },
  beforeRouteEnter(to, from, next) {
    const toPageState = useAppPageStateStore().getPage(to.name)
    const fromPageState = useAppPageStateStore().getPage(from.name)

    if (from.name === 'equipmentGoOut' || from.name === 'equipmentOutwardApplicationEdit') {
      toPageState.resetList = true
    }
    else if (fromPageState.updateBefore) {
      toPageState.resetList = true
      fromPageState.updateBefore = false
    }
    next()
  },
  data() {
    return {
      status: this.$route.params.status,
      title: `设备批量${this.$route.params.name}`,
      equipmentDatas: [],
      valid: null,
    }
  },
  activated() {
    const pageState = useAppPageStateStore().getPage('equipmentScanAdd')

    if (pageState.resetList) {
      this.resetPage()
      pageState.resetList = false
    }
  },
  methods: {
    resetPage() {
      this.equipmentDatas = []
      this.status = this.$route.params.status
      this.title = `设备批量${this.$route.params.name}`
      this.valid = this.validData()
    },
    // 扫码
    onScan() {
      qrCodeScanTool.scan(async (r) => {
        if (r.includes('equipment/goEquipmentDetail') || r.includes('eq/edt')) {
          const id = qrCodeScanTool.getParamByResult(r, 'id')

          const same = this.equipmentDatas.find(d => d.id === id)
          if (same) {
            showDialog({
              title: '提示',
              message: `${same.name}已添加，请勿重复扫描设备`,
            })
            return
          }

          this.scanRsult(id)
        }
        else {
          showDialog({
            title: '提示',
            message: '未识别到设备二维码，请重新扫描',
          })
        }
      })
    },
    onBatchScan() {
      qrCodeScanTool.scan(
        async (r, { scanToast }) => {
          if (r.includes('equipment/goEquipmentDetail') || r.includes('eq/edt')) {
            const url = new URL(r)
            const id = url.searchParams.get('id')

            const same = this.equipmentDatas.find(d => d.id === id)
            if (same) {
              scanToast(`${same.name}已添加，请勿重复扫描设备`)
              return
            }

            this.scanRsult(id, scanToast)
          }
          else {
            scanToast('未识别到设备二维码，请重新扫描')
          }
        },
        {
          enableKeepScan: true,
        },
      )
    },
    async scanRsult(id, scanToast) {
      const toastFn = scanToast || showToast
      const res = await mRequest({
        method: 'GET',
        url: api.eqEgressList.getEgressInfo,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          id,
        },
      })

      if (res.code && res.code === 20000) {
        const equipmentInfo = res.data.egressVo.equipmentVo
        try {
          const checkRes = this.valid(equipmentInfo)
          if (checkRes === true) {
            this.equipmentDatas.push(equipmentInfo)
            toastFn(`${equipmentInfo.name}已添加`)
          }
          else {
            toastFn(checkRes)
          }
        }
        catch (e) {
          // eslint-disable-next-line no-alert
          alert(e)
        }
      }
      else {
        toastFn(res.message)
      }
    },
    // 设备状态检查
    validData() {
      // 数据状态
      const statusName = {
        10: '在库',
        20: '外出待确认',
        30: '在库',
        40: '外出',
        50: '归还待确认',
        60: '外出',
      }
      const status = Number(this.status)
      const isValid = (egressStatus, info) => {
        if (egressStatus.includes(`${info.egressStatus}`))
          return true

        return `当前扫码设备的外出状态为${
          statusName[info.egressStatus]
        }，不能进行批量${this.$route.params.name}操作`
      }
      // 批量操作：外出:10，确认外出:20，拒绝外出:30，归还:40，确认归还:50，拒绝归还:60 设备外出申请：70(70这个状态是设备外出申请的状态,前端定义的)
      if (status === 10) {
        // 批量外出，仅允许设备状态为库存的设备
        return info => isValid(['10'], info)
      }
      else if (status === 20 || status === 30) {
        // 批量确认外出/批量拒绝外出，仅允许状态为外出待确认的设备
        return info => isValid(['20'], info)
      }
      else if (status === 40) {
        // 批量归还，仅允许状态为外出/归还被拒绝的设备
        return info => isValid(['40', '60'], info)
      }
      else if (status === 50 || status === 60) {
        // 批量确认归还/批量拒绝归还，仅允许状态为归还待确认的设备
        return info => isValid(['50'], info)
      }
      else if (Number(status) === 70) {
        // 设备外出申请
        const allowedStatus = JSON.parse(sessionStorage.getItem('allowedStatus_outward'))
        return info => isValid(allowedStatus, info)
      }
    },
    delEquipment(ind) {
      showConfirmDialog({
        title: '提示',
        message: '确认移除该设备？',
        confirmButtonText: '移除',
      }).then(() => {
        this.equipmentDatas.splice(ind, 1)
      })
    },
    nextStep() {
      const list = this.equipmentDatas
      if (list.length === 0) {
        showToast('请先扫码添加设备')
        return
      }

      const equipmentStore = useEquipmentStore()
      equipmentStore.updateEqData(list)

      let routerName = ''
      if (Number(this.status) === 70) {
        this.$router.go(-1)
        return
      }
      else if (Number(this.status) === 10) {
        routerName = 'addWarehouseOut'
      }
      else {
        routerName = 'warehouseOutDispose'
      }

      this.$router.push({
        name: routerName,
        params: {
          id: this.id,
          status: this.status,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
