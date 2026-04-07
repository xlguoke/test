<template>
  <div class="auditProcess">
    <div class="auditProcess-tab">
      <span :class="`${tabIndex}` === '10' ? 'active' : ''" @click="tab('10')">
        待我审核{{ totalObj['10'] ? `(${totalObj['10']})` : '' }}
      </span>
      <span :class="`${tabIndex}` === '20' ? 'active' : ''" @click="tab('20')">
        我已审批{{ totalObj['20'] ? `(${totalObj['20']})` : '' }}
      </span>
      <span :class="`${tabIndex}` === '30' ? 'active' : ''" @click="tab('30')">
        我发起的{{ totalObj['30'] ? `(${totalObj['30']})` : '' }}
      </span>
      <span :class="`${tabIndex}` === '40' ? 'active' : ''" @click="tab('40')">
        抄送我的{{ totalObj['40'] ? `(${totalObj['40']})` : '' }}
      </span>
    </div>
    <a-form layout="inline" :model="formState">
      <a-form-item label="发起时间" name="startTime">
        <a-range-picker
          v-model:value="formState.startTime"
          style="width: 100%"
          value-format="YYYY-MM-DD HH:mm:ss"
          :show-time="{
            defaultValue: [
              dayjs('00:00:00', 'HH:mm:ss'),
              dayjs('23:59:59', 'HH:mm:ss'),
            ],
          }"
          @change="(e) => changeQueryForm(e, 'startTime')"
        />
      </a-form-item>
      <a-form-item v-show="tabIndex !== '10'" label="完成时间" name="endTime">
        <a-range-picker
          v-model:value="formState.endTime"
          style="width: 100%"
          value-format="YYYY-MM-DD HH:mm:ss"
          :show-time="{
            defaultValue: [
              dayjs('00:00:00', 'HH:mm:ss'),
              dayjs('23:59:59', 'HH:mm:ss'),
            ],
          }"
          @change="(e) => changeQueryForm(e, 'endTime')"
        />
      </a-form-item>
      <a-form-item label="流程类型" name="businessType">
        <a-select
          v-model:value="formState.businessType"
          style="width: 180px"
          placeholder="请选择流程类型"
          allow-clear
          show-search
          :filter-option="(inputValue, option) => {
            return option?.label?.toLowerCase().includes(inputValue.toLowerCase())
          }"
          @change="(e) => changeQueryForm(e, 'businessType')"
        >
          <a-select-option
            v-for="item in allProcessList"
            :key="item.businessType"
            :value="item.businessType"
            :label="item.businessName"
          >
            {{ item.businessName }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <!-- 暂不提供关键字检索功能，因为大多数业务检索的数据都在流程变量中。那是一个很大的表（到后期可能有上百万千万的数据）在其中模糊匹配无法走索引，查询效率非常堪忧。
      <a-form-item label="关键字检索" name="quickQry">
        <a-input
          v-model:value="formState.quickQry"
          style="width: 300px"
          placeholder="请输入流程标题、摘要和发起人关键字"
          @keypress.enter="search"
        />
      </a-form-item> -->
      <a-form-item>
        <a-button type="primary" style="margin-right: 10px" @click="search">
          查询
        </a-button>
        <a-button @click="reset">
          重置
        </a-button>
      </a-form-item>
    </a-form>
    <div class="handle-box">
      <template v-if="tabIndex === '10'">
        <a-button
          v-permission="'COMMON_PROCESS_AUDIT_BATCH'"
          type="primary"
          @click="batchChoose"
        >
          批量选择
        </a-button>
        <a-button
          v-permission="'COMMON_PROCESS_AUDIT_BATCH'"
          type="primary"
          @click="batchAudit"
        >
          批量审批
        </a-button>
        <a-button @click="auditTransmit">
          转交
        </a-button>
      </template>
      <a-button v-show="tabIndex === '30'" type="primary" @click="initAudit">
        发起审批
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :row-selection="tabIndex === '10' ? {
        selectedRowKeys,
        onChange: selectedChange,
      } : null"
      :data-source="data"
      bordered
      :pagination="pagination"
      :loading="loading"
      :row-key="
        (record) => {
          return record.id ? record.id : record.processInstanceId
        }
      "
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'processSummary'">
          <div>
            <div v-if="text">
              <div
                v-for="(item, index) in Object.keys(JSON.parse(text))"
                :key="index"
              >
                {{ `${item}:${JSON.parse(text)[item]}` }}
              </div>
            </div>
            <div v-else></div>
          </div>
        </template>
        <template v-if="column.dataIndex === 'taskName'">
          <div v-if="record.end">
            <span v-if="record.isPass">已通过</span>
            <span v-else>未通过</span>
          </div>
          <span v-else>
            <span>审核中</span>
          </span>
        </template>
        <template v-if="column.dataIndex === 'currentAuditor'">
          <span>{{ record.currentAuditor }}</span>
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <div class="table-handle">
            <a @click="viewDetail(record)">详情</a>
            <a @click="(e) => viewLog(e, record)">日志</a>
            <a @click="(e) => viewProcess(record)">流程</a>
            <a v-if="tabIndex === '10'" @click="audit(record)">审批</a>
            <a
              v-if="tabIndex === '30' && ['submit_application'].includes(record.taskDefKey)"
              @click="submitProcess(record)"
            >
              提交
            </a>
            <a
              v-if="tabIndex === '30' && ['submit_application'].includes(record.taskDefKey)"
              style="color: red"
              @click="delProcess(record)"
            >
              删除
            </a>
          </div>
        </template>
      </template>
    </a-table>
    <InitAudit ref="initAudit" :key="key1" />
    <AudioDetail ref="AudioDetail" :callback="search" />
    <Logs ref="Logs" />
    <Transmit ref="transmit" :callback="search"></Transmit>
    <ht-modal
      v-model:open="detailVisible"
      title="详情"
      width="80%"
      hide-confirm
      fixed-height
      @cancel="handleCancel"
    >
      <iframe
        style="border: 0"
        width="100%"
        height="100%"
        :src="detailUrl"
      ></iframe>
    </ht-modal>

    <ht-modal
      title="确认删除这条数据？"
      :open="delVisible"
      width="300px"
      :confirm-loading="loading"
      @cancel="delVisible = false"
      @ok="confirmDelete"
    >
      <a-textarea
        v-model:value="delReason"
        :rows="3"
        placeholder="请输入删除原因"
      ></a-textarea>
    </ht-modal>

    <!-- 设备送检登记审批 -->
    <EquipmentCheckSendAuditDetails
      v-model:show="equipmentCheckSendAuditDetailsVisible"
      :data="equipmentCheckSendAuditDetailsData"
      :is-detail="true"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.js'
import { ProcessType } from '~/components/commonProcess/index.js'
import { formatTime, getQueryVariable } from '~/providers/common/utils'
import Logs from '~/providers/components/logs.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import ChemicalWasteHandleAuditDetails from '~/views/chemical/waste/handle/components/CreateForm.vue'
import EquipmentAllotAuditDetails from '~/views/equipment/allot/component/Detail.vue'
import EquipmentAeestsAllotAuditDetails from '~/views/equipment/assets-allot/component/Detail.vue'
import EquipmentCheckSendAuditDetails from '~/views/equipment/check/checkSend/component/Edit.vue'
import PurchaseAcceptanceDetailModal from '~/views/equipment/material/purchase-acceptance/components/PurchaseAcceptanceDetailModal.vue'
import PurchaseApplyDetailModal from '~/views/equipment/material/purchase-apply/components/PurchaseApplyDetailModal.vue'
import EquipmentRentAuditDetails from '~/views/equipment/rent/component/Detail.vue'
import inspectionCapacityDetail from '~/views/testbusiness/inspectioncapacity/inspectionCapacityManage/component/WarningDispose.vue'
import ArchiveEditModal from '~/views/testbusiness/testitem/testItemDetail/archive-manage/components/ArchiveEditModal.vue'
import AudioDetail from './components/audioDetail.vue'
import InitAudit from './components/initAudit.vue'
import Process from './components/process.vue'
import Transmit from './components/transmit.vue'

const columns = [
  {
    title: '流程标题',
    dataIndex: 'processName',
    key: 'processName',
    width: '15%',
  },
  {
    title: '流程类型',
    dataIndex: 'processTypeName',
    key: 'processTypeName',
    width: '15%',
  },
  {
    title: '流程摘要',
    dataIndex: 'processSummary',
    key: 'processSummary',
    width: '22%',
  },
  {
    title: '发起人',
    dataIndex: 'processStartUserName',
    key: 'processStartUserName',
    width: '6%',
  },
  {
    title: '流程当前状态',
    dataIndex: 'taskName',
    key: 'taskName',
    width: '6%',
  },
  {
    title: '待审核人',
    dataIndex: 'currentAuditor',
    key: 'currentAuditor',
    width: '6%',
  },
  //   {
  //   title: '流程当前操作人',
  //   dataIndex: 'taskAssigneeName',
  //   width: '6%'
  // },
  {
    title: '流程发起时间',
    dataIndex: 'processStartTime',
    width: '10%',
    customRender: ({ text }) =>
      text ? formatTime(text, 'YYYY-MM-DD HH:mm:ss') : '',
  },
  {
    title: '流程完成时间',
    dataIndex: 'processEndTime',
    width: '10%',
    customRender: ({ text }) =>
      text ? formatTime(text, 'YYYY-MM-DD HH:mm:ss') : '',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
  },
]

export default {
  components: {
    AudioDetail,
    InitAudit,
    Logs,
    Transmit,
    EquipmentCheckSendAuditDetails,
  },
  data() {
    return {
      dayjs,
      key1: 1000,
      tabIndex: getQueryVariable('tabStatus') || '10',
      data: [],
      lastSearchParam: {}, // 保存最近一次的查询参数
      allProcessList: [],
      selectedRowKeys: [],
      selectedRows: [],
      columns,
      totalObj: {},
      page: 1,
      size: 10,
      loading: false,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData(this.lastSearchParam)
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          this.getData(this.lastSearchParam)
        },
      },
      detailVisible: false,
      detailUrl: '',
      delVisible: false,
      processVisible: false,
      delId: '',
      delReason: '',
      formState: {},
      equipmentCheckSendAuditDetailsVisible: false,
      equipmentCheckSendAuditDetailsData: {},
    }
  },
  created() {
    window.closeDetailModal = this.handleCancel
    this.getAllProcessList()
  },
  methods: {
    // 从首页跳转到我发起的审核流程
    initTabindex() {
      const homeJumpInfo = JSON.parse(localStorage.getItem('iStartedProcessType'))
      if (homeJumpInfo && homeJumpInfo.type) {
        this.tabIndex = '30'
        const data = this.allProcessList.find((item) => {
          return item.businessName === homeJumpInfo.type
        })
        this.formState.businessType = data.businessType
        this.search()
        localStorage.removeItem('iStartedProcessType')
      }
      else {
        this.getData()
      }
    },
    // 修改查询条件
    changeQueryForm(e, queryKey) {
      this.formState[queryKey] = e
      this.search()
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getAllProcessList() {
      window.$oAjax
        .get(window.$oApi.auditProcessRelation.getRelations)
        .then((res) => {
          this.allProcessList = res.data || []
          this.initTabindex()
        })
    },
    getData(data) {
      const { page, size, tabIndex } = this
      this.loading = true
      this.selectedRowKeys = []
      this.selectedRows = []
      window.$oAjax
        .get(window.$oApi.auditProcess.list, {
          timeout: 30 * 1000,
          params: {
            page,
            size,
            ...data,
            queryType: tabIndex,
          },
        })
        .then((res) => {
          if (res.code && res.code !== 20010) {
            this.data = res.data.rows
            this.pagination.total = res.data.count
            this.totalObj = { [this.tabIndex]: this.pagination.total }
            this.pagination.current = page
            this.pagination.pageSize = size
            this.loading = false
          }
        })
    },
    // 查看日志
    viewLog(e, data) {
      if (!data.processTypeId || !data.businessKey) {
        window.$oAntdModal.warning(window.$oMsgTips.info('数据异常请选择其他数据'))
        return
      }
      if (data.businessKey && data.processTypeId) {
        this.$refs.Logs.showModal(data.businessKey, data.processTypeId, true)
      }
    },
    // 查看流程
    viewProcess(record) {
      AnyDialogHelper.showModel(Process, {
        processInstanceId: record.processInstanceId,
      })
    },
    // 查看详情
    viewDetail(record) {
      if (record.processTypeId === ProcessType.REPORT_ARCHIVE) {
        AnyDialogHelper.showModel(ArchiveEditModal, {
          isDetail: true,
          editId: record.businessKey,
        })
        return
      }
      // 设备送检登记审批
      if (ProcessType.EQ_CHECK_SEND === record.processTypeId) {
        this.equipmentCheckSendAuditDetailsData = { id: record.businessKey }
        this.equipmentCheckSendAuditDetailsVisible = true
        return
      }

      const detailMap = {
        // 废物处置
        [ProcessType.CHEMICAL_WASTE_HANDLE]: ChemicalWasteHandleAuditDetails,
        // 设备调拨信息审批
        [ProcessType.EQ_ALLOT]: EquipmentAllotAuditDetails,
        // 固定资产调拨信息审批
        [ProcessType.ASSET_ALLOT]: EquipmentAeestsAllotAuditDetails,
        // 设备租借信息审批
        [ProcessType.EQ_RENT]: EquipmentRentAuditDetails,
        // 量能预警处理
        [ProcessType.TEST_CAPACITY_WARNING_DISPOSE]: inspectionCapacityDetail,
        // 采购申请审批
        [ProcessType.PURCHASE_APPLY]: PurchaseApplyDetailModal,
        // 购置验收审批
        [ProcessType.PURCHASE_ACCEPTANCE]: PurchaseAcceptanceDetailModal,
      }

      if (Object.prototype.hasOwnProperty.call(detailMap, record.processTypeId)) {
        AnyDialogHelper.showModel(detailMap[record.processTypeId], {
          id: record.businessKey,
          isDetail: true,
        })
        return
      }

      this.detailVisible = true
      this.detailUrl = `${rootUrl}${window.$oApi.auditProcess.goDetail}?businessKey=${record.businessKey}&processTypeId=${record.processTypeId}&processInstanceId=${record.processInstanceId}&detail=detailPage`
    },
    // 发起审批
    initAudit() {
      this.key1++
      window.$oNextTick(() => {
        this.$refs.initAudit.showModal()
      })
    },
    // 转交
    auditTransmit() {
      // 获取当前选中行
      const selectedRows = this.selectedRows
      if (selectedRows.length === 0) {
        window.$oAntdMessage.warning('请选择需要转交的流程')
        return
      }
      this.$refs.transmit.showModal(this.selectedRows)
    },
    // 提交
    submitProcess(record) {
      this.key1++
      window.$oNextTick(() => {
        this.$refs.initAudit.showModal(record.processInstanceId)
      })
    },
    // 删除
    delProcess(record) {
      this.delReason = ''
      this.delId = record.processInstanceId
      this.delVisible = true
    },
    // 确认删除
    confirmDelete() {
      if (!this.delReason) {
        window.$oAntdMessage.warning('请输入删除原因!')
        return
      }
      this.loading = true
      window.$oAjax({
        url: `${window.$oApi.auditProcess.delete}/${this.delId}?deleteReason=${this.delReason}`,
        method: 'delete',
      })
        .then((res) => {
          this.loading = false
          if (res.code !== 20000) {
            window.$oAntdMessage.error(res.message || '删除失败')
            return
          }
          window.$oAntdMessage.success('删除成功')
          this.delVisible = false
          this.search()
        })
        .catch((err) => {
          this.loading = false
          window.$oAntdMessage.error(err.message || '删除失败')
        })
    },
    // 审批
    audit(record) {
      this.$refs.AudioDetail.showModal(record.id, false, record.processType)
    },
    //    批量选择
    batchChoose() {
      if (this.data.length === 0)
        return
      const selectedRows = this.selectedRows
      let _typeId = this.data[0].processTypeId
      let taskDefKey = this.data[0].taskDefKey
      if (selectedRows.length > 0) {
        _typeId = selectedRows[0].processTypeId
        taskDefKey = selectedRows[0].taskDefKey
      }
      const filterRows = this.data.filter(
        d => d.processTypeId === _typeId && d.taskDefKey === taskDefKey,
      )
      const ids = filterRows.map(d => d.id)
      this.selectedRowKeys = ids
      this.selectedRows = filterRows
    },
    // 批量审批
    batchAudit() {
      const selectedRows = this.selectedRows
      if (selectedRows.length === 0) {
        window.$oAntdMessage.warning('请选择需要审批的流程')
        return
      }
      const _typeId = selectedRows[0].processTypeId
      const taskDefKey = selectedRows[0].taskDefKey
      const isUniform = selectedRows.every(
        d => d.processTypeId === _typeId && d.taskDefKey === taskDefKey,
      )
      if (!isUniform) {
        window.$oAntdMessage.warning(
          '只有流程类型、流程当前状态都一致才能批量审批，请重新选择！',
        )
        return
      }
      this.$refs.AudioDetail.showModal(this.selectedRows, true)
    },
    tab(index) {
      this.tabIndex = index
      this.page = 1
      this.formState = {}
      this.getData()
    },
    search() {
      const data = { ...this.formState }
      if (data.startTime && data.startTime.length === 2) {
        data.startTimeBegin = formatTime(
          new Date(data.startTime[0]).getTime(),
          'YYYY-MM-DD HH:mm:ss',
        )
        data.startTimeEnd = formatTime(
          new Date(data.startTime[1]).getTime(),
          'YYYY-MM-DD HH:mm:ss',
        )
        delete data.startTime
      }
      if (data.endTime && data.endTime.length === 2) {
        data.endTimeBegin = formatTime(
          new Date(data.endTime[0]).getTime(),
          'YYYY-MM-DD HH:mm:ss',
        )
        data.endTimeEnd = formatTime(
          new Date(data.endTime[1]).getTime(),
          'YYYY-MM-DD HH:mm:ss',
        )
        delete data.endTime
      }

      this.page = 1
      this.lastSearchParam = data
      this.getData(data)
    },
    reset() {
      this.page = 1
      this.formState = {}
      this.getData()
    },
    handleCancel() {
      this.detailUrl = ''
      this.detailVisible = false
    },
    selectedChange(selectedRowKeys, selectedRows) {
      this.selectedRows = selectedRows
      this.selectedRowKeys = selectedRowKeys
    },
  },
}
</script>

<style scoped lang="less">
.auditProcess {
  .auditProcess-tab {
    border-bottom: solid 1px var(--colorBorder);

    & > span {
      display: inline-block;
      padding: 10px 15px;
      border-bottom: solid 2px transparent;
      cursor: pointer;

      &.active {
        border-color: var(--colorPrimary);
        color: var(--colorPrimary);
      }
    }
  }
  .ant-form{
    padding-bottom: 10px;
    .ant-form-item{
      margin-top: 8px;
    }
  }

  .table-handle a{
    margin: 0 4px;
  }
}

.handle-box{
  margin-bottom:5px;
  button {
    margin-right: 10px;
  }
}

.audit-detail .ant-modal-body{
  height: calc(100vh - 150px);
}
</style>
