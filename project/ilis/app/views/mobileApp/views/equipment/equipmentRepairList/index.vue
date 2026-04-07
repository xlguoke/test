<template>
  <div class="equipment">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
      <van-row class="equipment-row">
        <van-col span="12" @click="openScreen(1)">
          <van-icon size="18" name="filter-o" />
          筛选
        </van-col>
        <van-col span="12" @click="openScreen(2)">
          <van-icon size="18" class-prefix="iconfont" name="sort" />
          排序
        </van-col>
      </van-row>
    </van-sticky>

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      class="p-4"
      @load="onLoad"
    >
      <ListCard
        v-for="item in list"
        :key="item.id"
        :rows="[
          { label: '设备信息', value: `${item.equipmentName}(${item.equipmentSn})` },
          { label: '故障现象', value: item.phenomenon },
          { label: '科室', value: item.departname },
          { label: '申请人', value: item.createName },
          { label: '申请时间', value: item.createDate ? dayjs(item.createDate).format('YYYY-MM-DD') : '' },
          { label: '状态', value: applyStatusObj[item.status] },
        ]"
      >
        <template #title>
          {{ item.repairSn }}
          <span v-if="!item.repairSn" class="text-[#999]">/</span>
        </template>
        <template #footer>
          <ListCardAction>
            <van-button v-if="['10', '20', '50'].includes(item.status)" type="primary" size="small" @click="onSubmit(item)">
              提交
            </van-button>
            <van-button size="small" @click="onMore(item)">
              更多
            </van-button>
          </ListCardAction>
        </template>
      </ListCard>
    </van-list>

    <ActionBar>
      <van-button type="primary" block @click="onAdd">
        新增
      </van-button>
    </ActionBar>

    <van-action-sheet
      v-model:show="screenVisible"
      title="排序"
      :actions="screenList"
      :round="false"
      @select="onSortSelect"
    />

    <van-action-sheet
      v-model:show="moreBtnVisible"
      :actions="moreBtnList"
      cancel-text="取消"
      close-on-click-action
      @cancel="moreBtnVisible = false"
      @select="onSelectAction"
    />

    <EquipmentSearch
      v-model:value="searchVisible"
      :inital-data="moreCondition"
      @callback="getMoreSearch"
    />

    <CommonAudit
      v-model:value="auditVisible"
      :audit-type-id="auditTypeId"
      @on-submit="onAuditSubmit"
    >
      <FormItemPerson
        v-model:value="copyToPersons"
        label="抄送人"
        enable-multiple
      />
      <van-field
        v-model="submitFormData.remark"
        label="备注"
        placeholder="请输入"
        input-align="right"
        :rows="2"
        autosize
        type="textarea"
      />
    </CommonAudit>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import {
  showConfirmDialog,
  showDialog,
  showLoadingToast,
} from 'vant'
import CommonAudit from '~/views/mobileApp/components/commonAudit.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import EquipmentSearch from '../components/repairRecordSearch.vue'

export default {
  components: {
    ActionBar,
    FormItemPerson,
    ListCardAction,
    ListCard,
    EquipmentSearch,
    CommonAudit,
    MobileTitleBar,
  },
  data() {
    return {
      dayjs,
      formatDate,
      list: [],
      loading: false,
      finished: false,
      searchVisible: false,
      screenVisible: false,
      query: {
        page: 0,
        rows: 10,
      },
      screenList: [
        { name: '默认排序', color: '#154bd0' },
        { name: '按时间排序', field: 'date' },
        { name: '按编号排序', field: 'sn' },
      ],
      moreCondition: {},
      sorting: {},
      applyStatusObj: {
        10: '填写中',
        20: '填写完成',
        30: '审批中',
        40: '维修中',
        50: '维修完成',
        60: '验证审批中',
        70: '完成',
      },
      moreBtnVisible: false,
      auditVisible: false,
      selectedRow: {},
      submitFormData: {},
      copyToPersons: [],
    }
  },
  computed: {
    auditTypeId() {
      if (this.selectedRow && ['40', '50'].includes(this.selectedRow.status)) {
        return '120'
      }
      return '110'
    },
    moreBtnList() {
      const { selectedRow } = this
      const status = selectedRow.status
      const list = []

      if (!selectedRow.id) {
        return list
      }

      if (['10', '20', '50', '40'].includes(status)) {
        list.push({ name: '删除', color: '#ff0000' })

        if (status === '40') {
          list.push({ name: '维修完成' })
        }
        else {
          list.push({ name: '编辑' })
        }
      }
      list.push({ name: '详情' })

      return list
    },
  },
  methods: {
    onMore(row) {
      this.selectedRow = row
      this.moreBtnVisible = true
    },
    onSubmit(row) {
      this.selectedRow = row
      this.auditVisible = true
    },
    async onAuditSubmit(processUserTaskList, formPropertyJson) {
      const { selectedRow, submitFormData } = this
      const api
        = this.auditTypeId === '120'
          ? 'eqRepairController.do?submitRepairVerify'
          : 'eqRepairController.do?submitRepair'

      const copyToUsers = this.copyToPersons.map(i => i.account)
      const copyToIds = this.copyToPersons.map(i => i.id)

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest
        .post(
          api,
          qs.stringify({
            id: selectedRow.id,
            presetAuditers: JSON.stringify(processUserTaskList),
            formPropertyJson: JSON.stringify({
              ...formPropertyJson,
              copyTo: copyToUsers.join(','),
            }),
            copyToIds: copyToIds.join(','),
            remark: submitFormData.remark,
          }),
        )
        .finally(() => {
          toast.close()
        })

      if (res.code !== 20010) {
        showSuccessToast('操作成功！')
        this.onRefresh()
        this.auditVisible = false
      }
      else {
        showDialog({ message: res.message })
      }
    },
    getMoreSearch(data) {
      this.moreCondition = { ...data }
      this.list = []
      this.query.page = 0
      this.onLoad()
    },
    openScreen(type) {
      if (type === 1) {
        this.searchVisible = !this.searchVisible
      }
      else if (type === 2) {
        this.screenVisible = true
      }
    },
    onSelectAction(row) {
      switch (row.name) {
        case '删除':
          this.onDel(this.selectedRow)
          break
        case '编辑':
          this.onEdit(this.selectedRow)
          break
        case '详情':
          this.onDetail(this.selectedRow)
          break
        case '维修完成':
          this.repairComplete(this.selectedRow)
          break
      }
    },
    // 选择排序
    onSortSelect(row) {
      if (row.field === 'date') {
        this.sorting.orderColumn = 'create_date'
        this.sorting.order = 'asc'
      }
      else if (row.field === 'sn') {
        this.sorting.orderColumn = 'repair_sn'
        this.sorting.order = 'asc'
      }
      else {
        this.sorting = {}
      }
      this.screenVisible = false
      this.onRefresh()
    },
    onRefresh() {
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    async onLoad() {
      const {
        repairServiceEndTimeStart,
        repairServiceEndTimeEnd,
        commonDateBegin,
        commonDateEnd,
      } = this.moreCondition

      this.query.page += 1
      this.loading = true

      const res = await mRequest.get(api.equipment.repairList, {
        params: {
          rows: 10,
          page: this.query.page,
          ...this.moreCondition,
          repairServiceEndTimeStart: repairServiceEndTimeStart
            ? `${repairServiceEndTimeStart} 00:00:00`
            : undefined,
          repairServiceEndTimeEnd: repairServiceEndTimeEnd
            ? `${repairServiceEndTimeEnd} 23:59:59`
            : undefined,
          commonDateBegin: commonDateBegin
            ? `${commonDateBegin} 00:00:00`
            : undefined,
          commonDateEnd: commonDateEnd
            ? `${commonDateEnd} 23:59:59`
            : undefined,
          ...this.sorting,
        },
      })

      if (res.rows && res.rows.length > 0) {
        this.list = [...this.list, ...res.rows]
      }
      if (res.rows && res.rows.length === 0) {
        this.finished = true
      }
      this.loading = false
      if (this.list.length >= res.total) {
        this.finished = true
      }
    },
    onAdd() {
      this.$router.push({
        name: 'equipmentRepairAdd',
      })
    },
    onEdit(record) {
      this.$router.push({
        name: 'equipmentRepairAdd',
        query: {
          id: record.id,
          status: 1,
        },
      })
    },
    repairComplete(record) {
      this.$router.push({
        name: 'equipmentRepairAdd',
        query: {
          id: record.id,
          status: 2,
        },
      })
    },
    onDetail(record) {
      this.$router.push({
        name: 'equipmentRepairAdd',
        query: {
          id: record.id,
          status: 3,
        },
      })
    },
    onDel(record) {
      showConfirmDialog({
        title: '提示',
        message: '确认删除吗？',
      })
        .then(async () => {
          const toast = showLoadingToast({
            duration: 0,
            message: '处理中...',
            forbidClick: true,
          })
          const res = await mRequest
            .get(api.equipment.delRepir, {
              params: {
                repairId: record.id,
              },
            })
            .finally(() => {
              toast.close()
            })

          if (res.success) {
            showSuccessToast('操作成功！')
            this.onRefresh()
          }
        })
        .catch(() => {})
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
