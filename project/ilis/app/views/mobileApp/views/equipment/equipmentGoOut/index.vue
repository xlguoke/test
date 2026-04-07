<template>
  <div class="equipmentGoOut">
    <div class="equipmentGoOut-header">
      <MobileTitleBar left-arrow @click-left="$router.go(-1)">
        <template #right>
          <div v-if="isAuth" class="scan-register">
            <span class="title" @click.stop="showMenu = !showMenu">扫码登记</span>
            <ul :class="`scan-dropdown ${showMenu ? 'open-dropdown' : ''}`">
              <li
                v-for="item in batchHandle"
                :key="item.value"
                v-permission="item.authCode"
                class="item"
                @click="chooseHandle(item)"
              >
                {{ item.name }}
              </li>
            </ul>
          </div>
          <img
            class="icon-scan"
            style="margin-left: 10px"
            :src="scanSvg"
            width="20"
            @click="onScan"
          />
        </template>
      </MobileTitleBar>
      <van-search
        v-model.trim="query.quickQryParam"
        placeholder="请输入设备名称或编号"
        @search="onSearch"
      />
    </div>
    <div class="equipmentGoOut-body">
      <div class="equipmentGoOut-left">
        <van-sidebar
          v-model="activeKey"
          style="width: 100px"
          @change="onSearch"
        >
          <van-sidebar-item title="全部" :disabled="disabledSidebar" />
          <van-sidebar-item title="在库" :disabled="disabledSidebar" />
          <van-sidebar-item title="外出" :disabled="disabledSidebar" />
          <van-sidebar-item title="外出待确认" :disabled="disabledSidebar" />
          <van-sidebar-item title="转交待确认" :disabled="disabledSidebar" />
          <van-sidebar-item title="归还待确认" :disabled="disabledSidebar" />
        </van-sidebar>
      </div>
      <div id="equipmentList" class="equipmentGoOut-right">
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          class="equipmentGoOut-list p-2"
          @load="onLoad"
        >
          <ListCard
            v-for="(item, ind) in list"
            :key="item.id + ind"
            v-model:checked="checkedIds[item.id]"
            :enable-checkbox="checkboxOpen"
            :rows="[
              { label: '设备编号', value: item.equipmentSn },
              { label: '规格型号', value: item.standard },
              { label: '外出状态', value: EgressStatusDict.getLabelByKey(item.egressStatus) },
            ]"
            :title="`${item.name}${item.isExtension === '1' ? '(延)' : ''}`"
          >
            <template #title>
              <div class="w-full flex justify-between items-center">
                <div>
                  {{ item.name }}
                </div>
                <div class="text-sm text-gray-400" @click="goDetail(item)">
                  详情 >
                </div>
              </div>
            </template>
            <template #footer>
              <ListCardAction>
                <van-button
                  v-if="[EgressStatus.OUTGOING,
                         EgressStatus.OUTGOING_DELAY,
                         EgressStatus.DELAY_REJECTED,
                         EgressStatus.RETURN_REJECTED,
                         EgressStatus.TRANSFER_REJECTED,
                  ].includes(item.egressStatus)"
                  size="small"
                  type="primary"
                  @click.stop="$router.push({ name: 'postponeEq', params: { id: item.id } })"
                >
                  延期
                </van-button>
                <van-button
                  v-if="item.transitionStatus === TransitionStatus.SUCCESS
                    && [EgressStatus.OUTGOING,
                        EgressStatus.OUTGOING_DELAY,
                        EgressStatus.DELAY_REJECTED,
                        EgressStatus.RETURN_REJECTED,
                        EgressStatus.TRANSFER_REJECTED,
                    ].includes(item.egressStatus)
                    && item.transitionUserId === userInfo.id
                  "
                  v-permission="'mobile_equipmentHandover'"
                  size="small"
                  type="primary"
                  @click.stop="goDetail(item, { type: 'handOver' })"
                >
                  转交
                </van-button>
                <van-button
                  v-if="[EgressStatus.OUTGOING,
                         EgressStatus.RETURN_REJECTED,
                         EgressStatus.OUTGOING_DELAY,
                         EgressStatus.DELAY_REJECTED,
                         EgressStatus.TRANSFER_REJECTED,
                  ].includes(item.egressStatus)
                    && item.transitionStatus !== TransitionStatus.SUCCESS
                  "
                  v-permission="'mobile_equipmentHandoverConfirm'"
                  size="small"
                  type="primary"
                  @click.stop="confirmHandle(EgressStatus.OUTGOING, 'warehouseOutDispose', item)"
                >
                  归还
                </van-button>
                <van-button
                  v-if="[
                    EgressStatus.TRANSFER_PENDING,
                  ].includes(item.egressStatus)
                    && item.transitionUserId === userInfo.id
                  "
                  v-permission="'mobile_equipmentHandoverReject'"
                  size="small"
                  type="primary"
                  @click.stop="confirmHandle(EgressStatus.TRANSFER_REJECTED, 'warehouseOutDispose', item)"
                >
                  拒绝
                </van-button>
                <van-button
                  v-if="[EgressStatus.TRANSFER_PENDING,
                  ].includes(item.egressStatus)
                    && item.transitionUserId === userInfo.id
                  "
                  size="small"
                  type="primary"
                  @click.stop="confirmHandle(EgressStatus.TRANSFER_PENDING, 'warehouseOutDispose', item)"
                >
                  确认
                </van-button>
              </ListCardAction>
            </template>
          </ListCard>
        </van-list>
      </div>
    </div>
    <div v-if="checkboxOpen" class="equipmentGoOut-foot">
      <van-checkbox
        v-model="checkedAll"
        type="square"
        @click="changeCheckedAll"
      >
        全选
      </van-checkbox>
      <van-button
        v-if="activeKey === 1"
        v-permission="'mobile_equipmentEgress'"
        type="primary"
        block
        round
        @click="confirmBatchHandle('10', 'addWarehouseOut')"
      >
        批量外出
      </van-button>
      <van-button
        v-if="activeKey === 2"
        v-permission="'mobile_equipmentReturn'"
        type="primary"
        block
        round
        @click="confirmBatchHandle('40', 'warehouseOutDispose')"
      >
        批量归还
      </van-button>
      <van-button
        v-if="activeKey === 3"
        v-permission="'mobile_equipmentEgressConfirm'"
        type="warning"
        block
        round
        plain
        @click="confirmBatchHandle('30', 'warehouseOutDispose')"
      >
        批量拒绝外出
      </van-button>
      <van-button
        v-if="activeKey === 3"
        v-permission="'mobile_equipmentEgressConfirm'"
        type="primary"
        block
        round
        @click="confirmBatchHandle('20', 'warehouseOutDispose')"
      >
        批量确认外出
      </van-button>
      <van-button
        v-if="activeKey === 4"
        v-permission="'mobile_equipmentHandoverReject'"
        type="warning"
        block
        round
        plain
        @click="confirmBatchHandle('120', 'warehouseOutDispose')"
      >
        批量拒绝转交
      </van-button>
      <van-button
        v-if="activeKey === 4"
        v-permission="'mobile_equipmentHandoverConfirm'"
        type="primary"
        block
        round
        @click="confirmBatchHandle('110', 'warehouseOutDispose')"
      >
        批量同意转交
      </van-button>
      <van-button
        v-if="activeKey === 5"
        v-permission="'mobile_equipmentReturnConfirm'"
        type="warning"
        block
        round
        plain
        @click="confirmBatchHandle('60', 'warehouseOutDispose')"
      >
        批量拒绝归还
      </van-button>
      <van-button
        v-if="activeKey === 5"
        v-permission="'mobile_equipmentReturnConfirm'"
        type="primary"
        block
        round
        @click="confirmBatchHandle('50', 'warehouseOutDispose')"
      >
        批量确认归还
      </van-button>
    </div>
  </div>
</template>

<script>
import { usePermissionStore } from '~/store/permissionStore'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { qrCodeScanTool } from '~/views/mobileApp/provides/modules/qr-code-scan-tool'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useEquipmentStore } from '~/views/mobileApp/store/useEquipmentStore'
import { EgressStatus, EgressStatusDict, TransitionStatus } from '../../../../equipmentNew/egress/eqEgressList/list/OperationEntity'

const equipmentState = {
  0: undefined,
  1: '10,30',
  2: '40,60,70,90,120',
  3: '20',
  4: '110',
  5: '50',
}

const batchHandle = [
  { name: '外出', value: 10, authCode: 'mobile_equipmentEgress' },
  { name: '确认外出', value: 20, authCode: 'mobile_equipmentEgressConfirm' },
  { name: '拒绝外出', value: 30, authCode: 'mobile_equipmentEgressConfirm' },
  { name: '归还', value: 40, authCode: 'mobile_equipmentReturn' },
  { name: '确认归还', value: 50, authCode: 'mobile_equipmentReturnConfirm' },
  { name: '拒绝归还', value: 60, authCode: 'mobile_equipmentReturnConfirm' },
]
let timer = null
export default {
  name: 'equipmentGoOut',
  components: {
    MobileTitleBar,
    ListCard,
    ListCardAction,
  },
  beforeRouteEnter(to, from, next) {
    const pageState = useAppPageStateStore().getPage('equipmentGoOut')
    const fromPageState = useAppPageStateStore().getPage(from.name)

    if (from.name === 'menuPage' || from.name === 'menuSearch') {
      pageState.scrollTop = 0
      pageState.resetPage = true
    }
    else if (from.name === 'equipmentGoOutDetail') {
      pageState.scrollTop = 0
      pageState.resetList = true
    }
    else if (fromPageState.updateBefore) {
      pageState.scrollTop = 0
      pageState.resetList = true
      fromPageState.updateBefore = false
    }
    next()
  },
  beforeRouteLeave(to, from, next) {
    if (from.name === 'equipmentGoOut') {
      const pageState = useAppPageStateStore().getPage('equipmentGoOut')
      pageState.scrollTop = document.getElementById('equipmentList').scrollTop || 0
    }
    next()
  },
  data() {
    return {
      userInfo: JSON.parse(localStorage.getItem('appUser') || '{}')?.userInfo,
      TransitionStatus,
      EgressStatus,
      EgressStatusDict,
      scanSvg: new URL(`~/views/mobileApp/assets/icon/scan.svg`, import.meta.url).href,
      value: '',
      activeKey: 0,
      list: [],
      showMenu: false, // 批量操作下拉控制开关
      loading: false,
      finished: false,
      disabledSidebar: false,
      query: {
        quickQryParam: '',
        page: 0,
        size: 10,
      },
      batchHandle,
      batchBtnText: [''],
      checkedAll: false,
      checkedIds: {},
      isAuth: false,
    }
  },
  computed: {
    checkboxOpen() {
      return this.activeKey !== 0
    },
  },
  watch: {
    disabledSidebar: {
      deep: true,
      immediate: true,

      handler(val) {
        if (val) {
          if (timer) {
            clearTimeout(timer)
          }
          timer = setTimeout(() => {
            this.disabledSidebar = false
            clearTimeout(timer)
          }, 5000)
        }
      },
    },
    checkedIds: {
      handler(val) {
        this.checkedAll = (Object.values(val).filter(Boolean).length === this.list.length) && this.list.length > 0
      },
      deep: true,
    },
  },
  activated() {
    const pageState = useAppPageStateStore().getPage('equipmentGoOut')
    const { scrollTop, resetPage, resetList } = pageState

    const ele = document.getElementById('equipmentList')
    if (ele) {
      ele.scrollTop = scrollTop
    }

    if (resetPage === true || resetPage === undefined || resetPage === null) {
      this.resetPage()
      pageState.resetPage = false
    }
    else if (resetList === true) {
      if (ele) {
        ele.scrollTop = 0
      }
      this.onSearch()
    }
  },
  created() {
    const { hasPermission } = usePermissionStore()
    this.isAuth = hasPermission('mobile_equipmentEgress')
  },
  mounted() {
    document.body.onclick = () => {
      this.showMenu = false
    }
  },
  methods: {
    // 扫码
    onScan() {
      qrCodeScanTool.scan((r) => {
        if (r.includes('equipment/goEquipmentDetail') || r.includes('eq/edt') !== -1) {
          const id = qrCodeScanTool.getParamByResult(r, 'id')
          this.$router.push({
            name: 'equipmentGoOutDetail',
            params: {
              id,
            },
          })
        }
        else {
          showDialog({
            title: '提示',
            message: '无效二维码！',
            confirmButtonText: '确定',
          })
        }
      })
    },
    resetPage() {
      const ele = document.getElementById('equipmentList')
      if (ele) {
        ele.scrollTop = 0
      }
      this.query = {
        quickQryParam: '',
        page: 0,
        size: 10,
      }

      this.activeKey = 0
      this.onSearch()
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true
      this.disabledSidebar = true
      const res = await mRequest.get(api.equipment.list, {
        params: {
          ...this.query,
          egressStatus: equipmentState[this.activeKey],
          isTransition: 1,
        },
      })
      this.disabledSidebar = false
      const rows = res.rows || []
      if (rows.length > 0) {
        await this.setUserInfo(rows)
        if (this.checkedAll) {
          for (let i = 0; i < rows.length; i++) {
            this.checkedIds[rows[i].id] = true
          }
        }
        this.list = [...this.list, ...rows]
      }

      this.loading = false

      if (rows.length === 0 || this.list.length >= res.total) {
        this.finished = true
      }
    },
    /** # 设置借用人、转交人信息 */
    async setUserInfo(rows) {
      // 有设备外出申请在走的不用查外出记录
      const eqIds = rows?.filter(item => !['12', '14', '16'].includes(item.egressStatus)).map(item => item.id)
      const { data } = await IlisApiHelper.post('/rest/eqEgress/egress-record/equipment', { equipmentIds: eqIds })
      eqIds.forEach((id) => {
        if (data[id]) {
          const target = rows.find(item => item.id === id)
          target.borrowUserId = data[id]?.borrowUserId
          target.transitionUserId = data[id]?.transitionUserId
        }
      })
    },
    onSearch() {
      this.finished = false
      this.query.page = 0
      this.list = []
      this.checkedAll = false
      this.checkedIds = {}
      this.onLoad()
    },
    onSelect(id) {
      if (this.activeKey === 0)
        return
      if (this.checkedIds[id]) {
        this.checkedIds[id] = false
      }
      else {
        this.checkedIds[id] = true
      }
      const sel = Object.values(this.checkedIds).filter(d => d)
      this.checkedAll = sel.length === this.list.length
    },
    goDetail(row, query) {
      const equipmentStore = useEquipmentStore()
      equipmentStore.updateEqData([row])
      this.$router.push({
        name: 'equipmentGoOutDetail',
        params: {
          id: row.id,
        },
        query,
      })
    },
    // 全选
    changeCheckedAll() {
      if (this.checkedAll) {
        this.checkedIds = this.list.reduce((acc, cur) => {
          acc[cur.id] = true
          return acc
        }, {})
      }
      else {
        this.checkedIds = {}
      }
    },
    // 选择批量操作
    chooseHandle(e) {
      this.$router.push({
        name: 'equipmentScanAdd',
        params: {
          status: e.value,
          name: e.name,
        },
      })
    },
    async confirmHandle(status, pathName, row) {
      const equipmentStore = useEquipmentStore()
      equipmentStore.updateEqData([row])
      this.$router.push({
        name: pathName,
        params: {
          id: row.id,
          status,
        },
      })
    },
    //  多选模式—确认操作
    async confirmBatchHandle(status, pathName) {
      const rows = this.list.filter(item => this.checkedIds[item.id])
      if (rows.length === 0) {
        showToast('请选择设备')
        return
      }
      // 转交确认、拒绝的批量操作需要对选中的设备进行判断，接收人是否当前登录用户
      if (status === EgressStatus.TRANSFER_PENDING || status === EgressStatus.TRANSFER_REJECTED) {
        const cannotTransfer = rows.filter(item => item.transitionUserId !== this.userInfo.id)
        if (cannotTransfer.length > 0) {
          showDialog({
            title: '提示',
            message: `设备${cannotTransfer.map(item => item.name).join('、')}的接收人不是当前登录用户，不能进行操作`,
            confirmButtonText: '确定',
          })
          return
        }
      }

      const equipmentStore = useEquipmentStore()
      equipmentStore.updateEqData(rows)

      this.$router.push({
        name: pathName,
        params: {
          id: status,
          status,
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
