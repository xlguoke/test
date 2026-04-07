<template>
  <div>
    <a-space wrap class="pb-4">
      <a-select
        v-model:value="formState.egressStatus"
        class="!w-[220px]"
        placeholder="请选择外出状态"
        title="外出状态"
        allow-clear
      >
        <a-select-option
          v-for="(item, index) in egressStatusData"
          :key="index"
          :value="item.value"
        >
          {{ item.name }}
        </a-select-option>
      </a-select>
      <a-range-picker
        v-model:value="formState.back"
        title="归还时间"
        class="!w-[320px]"
        :show-time="{
          defaultValue: [
            dayjs('00:00:00', 'HH:mm:ss'),
            dayjs('23:59:59', 'HH:mm:ss'),
          ],
        }"
        :placeholder="['请选择开始归还时间', '请选择结束归还时间']"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
      />
      <a-range-picker
        v-model:value="formState.stamp"
        title="外出时间"
        class="!w-[320px]"
        :show-time="{
          defaultValue: [
            dayjs('00:00:00', 'HH:mm:ss'),
            dayjs('23:59:59', 'HH:mm:ss'),
          ],
        }"
        :placeholder="['请选择开始外出时间', '请选择结束外出时间']"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
      />
      <a-input
        v-model:value="formState.borrowUser"
        title="借用人"
        class="!w-[220px]"
        placeholder="请输入借用人"
        autocomplete="off"
      />
      <a-input
        v-model:value="formState.consignProject"
        title="工程项目"
        placeholder="请输入工程项目"
        class="!w-[220px]"
        autocomplete="off"
      />
      <a-input
        v-model:value="formState.quickQry"
        title="设备名称/设备编号/档案编号/资产编号/借用人"
        placeholder="请输入设备名称/设备编号/档案编号/资产编号/借用人进行查询"
        class="!w-[420px]"
        autocomplete="off"
      />
      <a-button type="primary" @click="search">
        查询
      </a-button>
      <a-button @click="resetForm">
        重置
      </a-button>
    </a-space>

    <div style="padding-bottom: 10px">
      <a-button
        v-permission="'newEgress'"
        type="primary"
        @click="add"
      >
        新增外出
      </a-button>
      <a-button @click="printBook">
        打印
      </a-button>
      <a-button v-permission="'eqEgress:EquipmentEgressTable'" @click="printInRegisterRecord">
        打印出入库登记表
      </a-button>
      <a-dropdown v-if="showBatchHandle()" :trigger="['click']">
        <template #overlay>
          <a-menu @click="handleMenuClick">
            <a-menu-item
              v-for="(item, i) in batchHandle"
              :key="i"

              v-permission="item.authCode"
            >
              {{ item.name }}
            </a-menu-item>
          </a-menu>
        </template>
        <a-button>
          批量操作
          <DownOutlined style="vertical-align: middle" />
        </a-button>
      </a-dropdown>
      <a-button :loading="downloadLoading" @click="handleDownloadAttachment(selectedRowKeys)">
        下载附件
      </a-button>

      <a-button @click="onExport">
        导出
      </a-button>
      <a-button @click="columnScreen">
        列筛选
      </a-button>
    </div>
    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :pagination="data.length ? pagination : false"
      :data-source="data"
      bordered
      :row-class-name="rowClassName"
      row-key="id"
      :scroll="{
        x: 1500,
        y: 530,
      }"
      :loading="spinning"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'egressTime'">
          {{ EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS ? dayjs(record.egressTime).format('YYYY-MM-DD HH:mm:ss') : dayjs(record.egressTime).format('YYYY-MM-DD') }}
        </template>
        <template v-if="column.dataIndex === 'egressAuditUser'">
          <span v-if="record.status == 70">{{ record.egressAuditUser }} （延）</span>
          <span v-else>{{ record.egressAuditUser }}</span>
        </template>
        <template v-if="column.dataIndex === 'testTaskSn'">
          <span>{{ record.testTaskSn }}</span>
        </template>
        <template v-if="column.dataIndex === 'qualificationTypeName'">
          <span v-if="record.qualificationType">
            {{ getQuaDisplayName(record.qualificationType) }}
          </span>
          <span v-else></span>
        </template>

        <template v-if="column.dataIndex === 'expectReturnTime'">
          <span v-if="record.status == 70">
            {{
              record.expectReturnTime
                ? dayjs(record.expectReturnTime).format(EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD')
                : ''
            }}
            （延）
          </span>
          <span v-else>
            {{
              record.expectReturnTime
                ? dayjs(record.expectReturnTime).format(EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD')
                : ''
            }}
          </span>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <span class="table-handle">
            <a
              v-if="record.transitionStatus === TransitionStatus.SUCCESS
                && [EgressStatus.OUTGOING,
                    EgressStatus.OUTGOING_DELAY,
                    EgressStatus.DELAY_REJECTED,
                    EgressStatus.RETURN_REJECTED,
                    EgressStatus.TRANSFER_REJECTED,
                ].includes(record.status)
                && record.borrowUserId === userInfo.userId
              "
              v-permission="'egress::handover'"
              @click="handleHandOver(record, 'handover')"
            >
              转交
            </a>
            <a
              v-if="record.status === EgressStatus.TRANSFER_PENDING && record.transitionUserId === userInfo.userId"
              v-permission="'egress::handover_confirm'"
              @click="handleHandOver(record, 'confirm')"
            >
              确认转交
            </a>
            <a
              v-if="record.status === EgressStatus.TRANSFER_PENDING && record.transitionUserId === userInfo.userId"
              v-permission="'egress::handover_reject'"
              @click="handleHandOver(record, 'reject')"
            >
              拒绝转交
            </a>
            <a
              v-if="record.status == '20'"
              v-permission="'egressConfirm'"

              @click="egressDispose(record, '20')"
            >
              确认外出
            </a>
            <a
              v-if="record.status == '20'"
              v-permission="'egressConfirm'"

              @click="egressDispose(record, '30')"
            >
              拒绝外出
            </a>
            <a
              v-if="[EgressStatus.OUTGOING,
                     EgressStatus.OUTGOING_DELAY,
                     EgressStatus.DELAY_REJECTED,
                     EgressStatus.RETURN_REJECTED,
                     EgressStatus.TRANSFER_REJECTED,
              ].includes(record.status) && record.transitionStatus !== TransitionStatus.SUCCESS"
              v-permission="'equipmentReturn'"
              @click="handleReturn(record)"
            >
              归还
            </a>
            <a
              v-if="record.status == '50'"
              v-permission="'returnConfirm'"

              @click="handleConfirmReturn(record)"
            >
              确认归还
            </a>
            <a
              v-if="record.status == '50'"
              v-permission="'returnConfirm'"

              @click="egressDispose(record, '60')"
            >
              拒绝归还
            </a>

            <a
              v-if="
                [EgressStatus.OUTGOING,
                 EgressStatus.OUTGOING_DELAY,
                 EgressStatus.DELAY_REJECTED,
                 EgressStatus.RETURN_REJECTED,
                 EgressStatus.TRANSFER_REJECTED,
                ].includes(record.status)
              "
              v-permission="'eqPostpone'"

              @click="openPostponeModle(record, 80)"
            >
              延期
            </a>
            <a
              v-if="record.status == '80'"
              v-permission="'eqPostponeConfirm'"

              @click="egressDispose(record, '90')"
            >
              确认延期
            </a>
            <a
              v-if="record.status == '80'"
              v-permission="'eqPostponeConfirm'"

              @click="egressDispose(record, '95')"
            >
              拒绝延期
            </a>
            <a @click="viewDetail(record)">详情</a>
            <a
              v-if="record.status == '30'"
              v-permission="'egressDel'"

              @click="egressDel(record)"
            >
              删除
            </a>
            <span
              v-permission="'rollback-egress'"
            >
              <a
                v-if="(
                  record.status !== '20'
                  && record.status !== '30'
                  && record.status !== EgressStatus.OUTGOING_TRANSFER
                  && record.status !== EgressStatus.TRANSFER_PENDING
                  && record.status !== EgressStatus.TRANSFER_REJECTED
                )
                  || (record.status === EgressStatus.TRANSFER_REJECTED && record.transitionStatus === TransitionStatus.NO)
                "
                @click="rollback(record)"
              >
                撤回
              </a>
            </span>
          </span>
        </template>
      </template>
    </a-table>

    <Add ref="Add" :key="addKey" :callback="getData" />

    <Postpone ref="postponeRef" :key="postponeKey" :callback="getData" />
    <Dispose ref="Dispose" :callback="getData" />
    <BatchDispose ref="batchDispose" :callback="getData" />
    <Detail
      ref="Detail"
      :egress-status-data="egressStatusData"
      :callback="getData"
    />
    <ht-modal title="确认" :open="confirmVisible" width="400px">
      备注：
      <a-textarea
        :row="4"
        :maxlength="200"
        placeholder="请输入"
        style="width: 300px; vertical-align: top"
      ></a-textarea>
    </ht-modal>
    <ht-modal
      title="撤回"
      :open="rollbackVisible"
      width="40%"
      :mask-closable="false"
      @ok="handleRollback"
      @cancel="cancelRollback"
    >
      <p>
        <span style="color: red">*</span>
        请输入撤回的原因：
      </p>
      <div style="margin-top: 10px">
        <a-textarea
          v-model:value="rollbackRecord.comment"
          :row="4"
          :max-length="200"
          placeholder="请输入撤回原因..."
          style="width: 100%; min-height: 100px; vertical-align: top"
        ></a-textarea>
      </div>
    </ht-modal>
    <CustomColumn ref="CustomColumn" @ok-btn="initFun"></CustomColumn>
  </div>
</template>

<script>
import { DownOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import qs from 'qs'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import sseRequestProgress from '~/components/sseRequestProgress'
import { formatTime } from '~/providers/common/utils'
import CustomColumn from '~/providers/components/customColumn/CustomColumn.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import { usePermissionStore } from '~/store/permissionStore'
import { userStore } from '~/store/userStore'
import { PrintUdrTempleteType } from '~/utils/IlisPrintUdr.js'
import { queryQualificationApi } from './api'
import Add from './components/add.vue'
import BatchDispose from './components/batchDispose.vue'
import Detail from './components/detail.vue'
import Dispose from './components/dispose.vue'
import HandOverModal from './components/HandOverModal.vue'
import Postpone from './components/postpone.vue'
import { EgressStatus, TransitionStatus } from './OperationEntity'

const { userInfo } = userStore()

const egressStatusData = [
  { name: '库存', value: 10 },
  { name: '外出待确认', value: 20 },
  { name: '外出被拒绝', value: 30 },
  { name: '外出', value: 40 },
  { name: '归还待确认', value: 50 },
  { name: '归还被拒绝', value: 60 },
  { name: '外出延期', value: 70 },
  { name: '延期待确认', value: 80 },
  { name: '延期被拒绝', value: 90 },
  { name: '外出转交', value: 100 },
  { name: '转交待确认', value: 110 },
  { name: '转交被拒绝', value: 120 },
]

const batchHandle = [
  { name: '外出审批', value: '20', authCode: 'egressConfirm' },
  // {name: "拒绝外出", value: "30", authCode: 'egressConfirm'},
  { name: '申请归还', value: '40', authCode: 'equipmentReturn' },
  { name: '归还审批', value: '50', authCode: 'returnConfirm' },
  // {name: "拒绝归还", value: "60", authCode: 'returnConfirm'},
  { name: '撤回', value: '70', authCode: 'rollback-egress' },
  { name: '申请延期', value: '80', authCode: 'eqPostpone' },
  { name: '延期审批', value: '90', authCode: 'eqPostponeConfirm' },
]

export default {
  components: {
    Add,
    Dispose,
    BatchDispose,
    Detail,
    Postpone,
    DownOutlined,
    CustomColumn,
  },
  data() {
    return {
      userInfo,
      EgressStatus,
      TransitionStatus,
      postponeKey: '',
      dayjs,
      data: [],
      columns: [],
      // columns: getColumns.bind(this)(),
      selectedRowKeys: [],
      selectedRows: [],
      confirmVisible: false,
      rollbackRecord: {
        id: null,
        comment: null,
      },
      rollbackVisible: false,
      formLayout: 'horizontal',
      formState: {},
      spinning: false,
      page: 1,
      size: 10,
      isAdd: false,
      addKey: '',
      queryParams: null,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          this.getData()
        },
        downloadLoading: false,
      },
      egressStatusData,
      batchHandle,
      getBusinessParam,
      qualificationTypeData: [],
      allQualificationData: [],
      EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS: false, // 业务控制参数：控制外出时间、预还时间是否精确到时分秒
    }
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  async created() {
    const [EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS, _res1, _res2] = await Promise.all([
      this.getBusinessParam('EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS'),
      this.getqualificationTypeData(),
      this.getqualificationTypeDataAll(),
    ])
    this.EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS = EQUIPMENT_OUTINGS_OUTING_TIME_CONFIGURINGS
    this.initFun()
  },
  methods: {
    async handleReturn(record) {
      this.egressDispose(record, '40')
    },
    async handleConfirmReturn(record) {
      this.egressDispose(record, '50')
    },
    async handleDownloadAttachment(ids) {
      if (!ids?.length) {
        message.warning('请选择要下载的数据')
        return
      }
      sseRequestProgress.show({
        api: `rest/eqEgress/download`,
        method: 'post',
        data: { ids: ids.join(',') },
        onComplete: async (res) => {
          this.downloadLoading = true
          if (res.path) {
            await downloader.excute(res.path, '设备外出管理附件.zip').finally(() => {
              this.downloadLoading = false
            })
          }
          if (res?.list?.length) {
            const deviceName = res.list.map(i => `${i.name}(${dayjs(i.date).format('YYYY-MM-DD HH:mm:ss')})`)
            Modal.warning({
              title: '提示',
              content: `${deviceName.join('，')}，无附件下载`,
            })
          }
          this.downloadLoading = false
        },
      })
    },
    showBatchHandle() {
      const { hasPermission } = usePermissionStore()

      if (
        hasPermission('egressConfirm')
        || hasPermission('rollback-egress')
        || hasPermission('equipmentReturn')
        || hasPermission('returnConfirm')
        || hasPermission('modifyBorrower')
        || hasPermission('eqPostponeConfirm')
        || hasPermission('eqPostpone')
        || hasPermission('egressDel')
      ) {
        return true
      }

      return false
    },
    formatTime,
    initFun() {
      this.getColumn().then(() => {
        this.getData()
      })
    },
    columnScreen() {
      this.$refs.CustomColumn.showModal(
        'EqEgressManageList',
        '自定义列配置',
        false,
      )
    },
    async getqualificationTypeData() {
      const res = await queryQualificationApi(0)
      this.qualificationTypeData = res.data.rows || []
    },
    async getqualificationTypeDataAll() {
      const res = await queryQualificationApi(1)
      this.allQualificationData = res.data.rows || []
    },
    getQuaDisplayName(ids) {
      if (!ids) {
        return ''
      }
      const idArr = ids.split(',')
      return idArr.map((id) => {
        const qua = this.allQualificationData.find(item => item.id === id)
        return qua ? qua.name : id
      }).join(',')
    },
    async getColumn() {
      return new Promise((r, j) => {
        window.$oAjax.get('rest/common/chosen-columns?type=EqEgressManageList').then((res) => {
          if (res.code === 20000 && res.data.length > 0) {
            const list = res.data.map((item) => {
              item.title = item.columnName
              item.key = item.columnKey
              item.dataIndex = item.key
              if (item.columnKey == 'status') {
                item.customRender = ({ text }) =>
                  this.egressStatusData.find(item => item.value == text)
                    ? this.egressStatusData.find(item => item.value == text).name
                    : ''
              }
              if (item.columnKey == 'testTaskSn') {
                item.customRender = ({ text }) => {
                  let str = ''
                  if (text) {
                    const arr = text.split(',')
                    arr.forEach((item) => {
                      str += `<span>${item}</span><br/>`
                    })

                    const child = h('span', {
                      domProps: {
                        innerHTML: str,
                      },
                    })
                    return child
                  }
                  else {
                    return str
                  }
                }
              }

              if (item.columnKey == 'egressTime' || item.columnKey == 'returnTime') {
                item.customRender = ({ text: time }) => (time ? formatTime(time, 'YYYY-MM-DD HH:mm:ss') : '')
              }

              return item
            })
            list.push({
              title: '操作',
              dataIndex: 'operation',
              width: '180px',
              fixed: 'right',
              // scopedSlots: { customRender: 'operation' },
            })

            this.columns = list

            r(list)
          }
          else {
            j(res)
            this.$message.warning(res.message || res.msg || '请求错误')
          }
        })
      })
    },
    async handleHandOver(record, type) {
      await AnyDialogHelper.showModel(HandOverModal, { data: record, type })
      this.getData()
    },
    // 批量操作
    async handleMenuClick(e) {
      const rows = this.selectedRows
      if (rows.length === 0) {
        return window.$oAntdMessage.warning('请选择需要批量操作的设备')
      }
      const list = this.batchHandle
      const status = list[e.key].value
      let len = []
      // 批量操作：确认外出:20，拒绝外出:30，归还:40，确认归还:50，拒绝归还:60，撤回:70
      // 数据状态：库存:10，外出待确认:20，外出被拒绝:30，外出:40，归还待确认:50，归还被拒绝:60
      if (status == 20 || status == 30) {
        // 批量确认外出/批量拒绝外出，仅允许状态为外出待确认的设备
        len = rows.filter(d => d.status != 20)
        this.showMsgTip(
          len,
          '仅允许所选设备外出记录中外出状态为外出待确认的数据进行批量操作，请重新选择',
        )
      }
      else if (status == 40) {
        // 批量归还，仅允许状态为外出/归还被拒绝的设备
        len = rows.filter(
          d => d.status != 40 && d.status != 60 && d.status != 70,
        )
        this.showMsgTip(
          len,
          '仅允许所选设备外出记录中外出状态为外出/延期或归还被拒绝的数据进行批量操作，请重新选择',
        )
      }
      else if (status == 50 || status == 60) {
        // 批量确认归还/批量拒绝归还，仅允许状态为归还待确认的设备
        len = rows.filter(d => d.status != 50)
        this.showMsgTip(
          len,
          '仅允许所选设备外出记录中外出状态为归还待确认的数据进行批量操作，请重新选择',
        )
      }
      else if (status == 90) {
        // 批量延期审批
        len = rows.filter(d => d.status != 80)
        this.showMsgTip(
          len,
          '仅允许所选设备外出记录中外出状态为外出延期待确认的数据进行批量操作，请重新选择',
        )
      }
      else if (status == 70) {
        // 批量撤回时，需要先检查是否包含了同一台设备的多条外出记录
        for (let i = 0; i < rows.length; i++) {
          for (let j = i + 1; j < rows.length; j++) {
            if (rows[i].equipmentId === rows[j].equipmentId) {
              len.push(rows[i])
              break
            }
          }
        }
        if (len.length > 0) {
          let msgStr = ``
          len.forEach((d) => {
            msgStr += `[${d.equipmentName}][${d.equipmentSn}]`
          })
          this.showMsgTip(
            len,
            `${msgStr}同时选择了多条外出记录，不能同时撤回，请重新选择`,
          )
        }
        else {
          // 外出待确认和外出被拒绝状态设备不能撤回
          len = rows.filter(d => d.status == 20 || d.status == 30)
          this.showMsgTip(
            len,
            '所选设备外出记录中外出状态为外出待确认和外出被拒绝的数据不能进行撤回操作，请重新选择',
          )
        }
      }
      else if (status == 80) {
        // 申请延期，只允许状态为外出和 延期外出
        len = rows.filter(
          d => d.status != 40 && d.status != 70 && d.status != 90,
        )
        if (len.length) {
          this.showMsgTip(
            len,
            '仅允许所选设备外出记录中外出状态为外出/外出延期/外出延期被拒绝的数据进行批量操作，请重新选择',
          )
          return
        }

        this.postponeModal('批量外出延期', rows)
        return
      }

      len.length === 0
      && this.$refs.batchDispose.showModal(
        list[e.key].name,
        status,
        this.selectedRows,
      )
    },
    openPostponeModle(row) {
      this.postponeModal('外出延期', [row])
    },
    showMsgTip(datas, msg) {
      if (datas.length === 0)
        return
      window.$oAntdModal.warning(window.$oMsgTips.info(msg))
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    async getData() {
      const { page, size } = this
      this.spinning = true
      await window.$oAjax
        .get(`${window.$oApi.eqEgressList.list}`, {
          params: {
            page,
            size,
            ...this.queryParams,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'paramsIsTrim': true,
          },
        })
        .then((res) => {
          if (res && res.data) {
            this.data = res.data.rows.map((it) => {
              if (it.customizeValues && it.customizeValues.length) {
                it.customizeValues.forEach((cit) => {
                  it[cit.columnId] = cit.columnValue
                })
              }
              return it
            })
            this.pagination.total = res.data.count || 0
            this.pagination.current = page
            this.pagination.pageSize = size
            this.selectedRowKeys = []
            this.selectedRows = []
            this.spinning = false
          }
        })
    },
    add() {
      this.isAdd = true
      this.addKey = new Date().getTime()
      window.$oNextTick(() => {
        this.$refs.Add.showModal()
      })
    },
    postponeModal(tle, rows) {
      // this.isAdd = true;
      this.postponeKey = new Date().getTime()
      window.$oNextTick(() => {
        this.$refs.postponeRef.showModal(tle, rows)
      })
    },
    handleChange(info) {
      if (info.file.status !== 'uploading') { /* empty */ }
      if (info.file.status === 'done') {
        window.$oAntdMessage.success(`${info.file.name} 文件上传成功`)
        this.getData()
      }
      else if (info.file.status === 'error') {
        window.$oAntdModal.warning(window.$oMsgTips.info(`${info.file.name} 文件上传失败`))
      }
    },
    viewDetail(record) {
      this.$refs.Detail.showModal(record.id)
    },
    egressDel(record) {
      const id = record.id
      window.$oAntdConfirm({
        title: '删除设备外出申请记录！',
        content: '删除后无法恢复，您确定要删除这条设备外出申请记录吗？',
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          window.$oAjax
            .post(
              `${window.$oApi.eqEgressList.batchDel}`,
              qs.stringify({
                ids: id,
              }),
            )
            .then((res) => {
              if (res.code !== 20000) {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.message))
              }
              else {
                this.getData()
              }
            })
        },
      })
    },
    rollback(record) {
      this.rollbackRecord.id = record.id
      this.rollbackVisible = true
    },
    handleRollback() {
      let comment = this.rollbackRecord.comment
      if (comment === null || comment === '' || comment === undefined) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请输入撤回的原因'))
        return
      }
      else {
        comment = comment.toString().trim()
        if (comment === null || comment === '' || comment === undefined) {
          window.$oAntdModal.warning(window.$oMsgTips.info('请输入撤回的原因'))
          return
        }
      }
      window.$oAjax
        .get(
          `${window.$oApi.eqEgressList.rollback}/${this.rollbackRecord.id}?comment=${this.rollbackRecord.comment}`,
        )
        .then((res) => {
          if (res.code !== 20000) {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message))
          }
          else {
            this.getData()
          }
        })
      this.rollbackRecord = {
        id: null,
        comment: null,
      }
      this.rollbackVisible = false
    },
    cancelRollback() {
      this.rollbackRecord = {
        id: null,
        comment: null,
      }
      this.rollbackVisible = false
    },
    egressDispose(record, status) {
      this.$refs.Dispose.showModal(record, status)
    },
    resetForm() {
      this.formState = {}
      this.queryParams = {}
      this.getData()
    },
    // 搜索
    async search(e) {
      e && e.preventDefault()

      const values = { ...this.formState }
      const data = {}

      // eslint-disable-next-line ts/no-unused-expressions
      values.quickQry ? (data.quickQry = values.quickQry) : ''
      // eslint-disable-next-line ts/no-unused-expressions
      values.egressStatus ? (data.egressStatus = values.egressStatus) : ''
      // eslint-disable-next-line ts/no-unused-expressions
      values.borrowUser ? (data.borrowUser = values.borrowUser) : ''
      // eslint-disable-next-line ts/no-unused-expressions
      values.consignProject
        ? (data.consignProject = values.consignProject)
        : ''
      if (values.stamp && values.stamp.length == 2) {
        data.egressTimeBegin = formatTime(
          values.stamp[0],
          'YYYY-MM-DD HH:mm:ss',
        )
        data.egressTimeEnd = formatTime(
          values.stamp[1],
          'YYYY-MM-DD HH:mm:ss',
        )
      }
      if (values.back && values.back.length == 2) {
        data.returnTimeBegin = formatTime(
          values.back[0],
          'YYYY-MM-DD HH:mm:ss',
        )
        data.returnTimeEnd = formatTime(
          values.back[1],
          'YYYY-MM-DD HH:mm:ss',
        )
      }
      this.queryParams = data
      this.page = 1
      this.getData()
    },
    async onExport() {
      this.getData()
      if (this.data.length) {
        const idArr = this.selectedRowKeys
        const params = idArr.length
          ? { objId: idArr.slice(',') }
          : { ...this.queryParams }
        const keys = Object.keys(params)
        let exportUrl = `${rootUrl}/eqEgress.do?export`
        // eslint-disable-next-line array-callback-return
        keys.map((key) => {
          exportUrl += `&${key}=${params[key]}`
        })

        window.open(exportUrl)
      }
      else {
        window.$oAntdMessage.warning('未找到满足条件数据，暂不支持导出!')
      }
    },

    // 打印台账
    printBook() {
      const UDRPrint = new IlisPrintUdr()
      UDRPrint.printLedger('EquipmentEgressLedger', { ...this.queryParams })
    },
    printInRegisterRecord() {
      const UDRPrint = new IlisPrintUdr()
      UDRPrint.printLedger(PrintUdrTempleteType.设备出入库登记表, { ...this.queryParams })
    },
  },
}
</script>
