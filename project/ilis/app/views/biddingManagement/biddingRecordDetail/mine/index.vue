<template>
  <div style="padding: 15px 0">
    <a-spin :spinning="spinning">
      <div>
        <a-row>
          <a-col span="12">
            报价：
            <a-inputNumber
              v-model:value="baseData.quoteAmount"
              style="width: 200px"
              :min="0"
              @blur="saveBaseInfo"
            />
            元
          </a-col>
          <a-col span="12">
            投标时间：
            <a-date-picker
              v-model:value="baseData.tenderTime"
              style="width: 200px"
              format="YYYY-MM-DD HH:mm:ss"
              :show-time="{ defaultValue: dayjs('00:00:00', 'HH:mm:ss') }"
              @ok="saveBaseInfo"
            />
          </a-col>
        </a-row>
        <div style="padding-top: 15px; font-weight: bold; font-size: 14px">
          投标文件：
        </div>
        <div
          v-for="file in baseData.unitAttach || []"
          :key="file.id"
          style="padding-bottom: 5px"
        >
          <a
            href="javascript:;"
            style="text-decoration: underline"
            @click="downloadAccessory(file.attachmentId)"
          >{{ file.name }}</a>
          <a
            href="javascript:;"
            style="color: red; margin-left: 5px"
            title="删除"
            @click="deleteUnitAttach(file)"
          >删除</a>
        </div>
        <a-button type="primary" class="mt-2" @click="uploadFile">
          上传文件
        </a-button>

        <div style="border-bottom: solid 1px #e2e2e2; padding-top: 20px"></div>

        <div style="padding-top: 15px; font-weight: bold; font-size: 14px">
          人员信息：
        </div>
        <div style="padding-bottom: 5px; padding-top: 5px">
          <a-table
            :columns="personColumns"
            :data-source="personList"
            :loading="personLading"
            bordered
            :scroll="{ y: 300 }"
            :pagination="false"
            row-key="id"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="column.dataIndex === 'quoteIndex'">
                <span>
                  <a-input
                    :value="text"
                    @change="
                      (e) => {
                        editTableData(
                          'personList',
                          record.id,
                          'quoteIndex',
                          e.target.value,
                        )
                      }
                    "
                    @blur="saveEditPerson(record)"
                  />
                </span>
              </template>
              <template v-if="column.dataIndex === 'biddingPersonName'">
                <span>
                  <a-button
                    style="float: right; height: 22px"
                    size="small"
                    @click="changePerson(record)"
                  >选择</a-button>
                  <a href="javascript:;" @click="goPersonDetail(record)">{{
                    text
                  }}</a>
                </span>
              </template>
              <template v-if="column.dataIndex === 'referenceRole'">
                <span>
                  <a-input
                    :value="text"
                    @change="
                      (e) => {
                        editTableData(
                          'personList',
                          record.id,
                          'referenceRole',
                          e.target.value,
                        )
                      }
                    "
                    @blur="saveEditPerson(record)"
                  />
                </span>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <div class="table-handle">
                  <a
                    href="javascript:;"
                    title="删除"
                    style="margin-right: 5px"
                    @click="deletePersonRow(record.id)"
                  >
                    删除
                  </a>
                </div>
              </template>
            </template>
          </a-table>
        </div>
        <a-button
          type="primary"

          size="small"
          style="height: 22px"
          @click="addPerson"
        >
          添加
        </a-button>

        <div style="border-bottom: solid 1px #e2e2e2; padding-top: 20px"></div>

        <div style="padding-top: 15px; font-weight: bold; font-size: 14px">
          投标使用业绩：
        </div>
        <div style="padding-bottom: 5px; padding-top: 5px">
          <a-table
            :columns="performanceColumns"
            :data-source="performanceList"
            :loading="performanceLoading"
            bordered
            :scroll="{ y: 300 }"
            :pagination="false"
            row-key="id"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="column.dataIndex === 'quoteIndex'">
                <span>
                  <a-input
                    :value="text"
                    @change="
                      (e) => {
                        editTableData(
                          'performanceList',
                          record.id,
                          'quoteIndex',
                          e.target.value,
                        )
                      }
                    "
                    @blur="saveEditPerformance(record)"
                  />
                </span>
              </template>
              <template v-if="column.dataIndex === 'performanceName'">
                <span>
                  <a-button
                    style="float: right; height: 22px"
                    size="small"
                    @click="changePerformance(record)"
                  >选择</a-button>
                  {{ text }}
                </span>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <div class="table-handle">
                  <a
                    href="javascript:;"
                    title="删除"
                    style="margin-right: 5px"
                    @click="deletePerformanceRow(record.id)"
                  >
                    删除
                  </a>
                </div>
              </template>
            </template>
          </a-table>
        </div>
        <a-button
          type="primary"

          size="small"
          style="height: 22px"
          @click="addPerformance"
        >
          添加
        </a-button>

        <div style="border-bottom: solid 1px #e2e2e2; padding-top: 20px"></div>

        <div style="padding-top: 15px; font-weight: bold; font-size: 14px">
          其他说明：
        </div>
        <a-textarea
          v-model:value="baseData.otherDescription"
          @blur="saveBaseInfo"
        />
      </div>
    </a-spin>
    <UploadComponent
      ref="UploadComponent"
      :max="5"
      :uploadcall="uploadcall"
      :file-lists="fileLists"
    />
    <EditPersonModal
      ref="EditPersonModal"
      :unit-id="unitId"
      :record-id="id"
      :callback="getPersonData"
    />
    <EditPerformanceModal
      ref="EditPerformanceModal"
      :unit-id="unitId"
      :record-id="id"
      :callback="getPerformanceData"
    />
    <SelectPerson ref="SelectPerson" :callback="changePersonCallBack" />
    <SelectPerformance
      ref="SelectPerformance"
      :callback="changePerformanceCallBack"
    />
  </div>
</template>

<script>
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { downloadAccessory, getQueryVariable } from '~/providers/common/utils'
import UploadComponent from '~/providers/components/uploadComponent.vue'
import EditPerformanceModal from './components/editPerformanceModal.vue'
import EditPersonModal from './components/editPersonModal.vue'
import SelectPerformance from './components/selectPerformance.vue'
import SelectPerson from './components/selectPerson.vue'

const personColumns = [
  {
    title: '序号',
    dataIndex: 'quoteIndex',
    width: '5%',
  },
  {
    title: '人员姓名',
    dataIndex: 'biddingPersonName',
    width: '20%',
  },
  {
    title: '本次投标时角色',
    dataIndex: 'referenceRole',
    width: '15%',
  },
  { title: '部门', dataIndex: 'department', width: '10%' },
  { title: '职称', dataIndex: 'jobTitle', width: '10%' },
  { title: '专业', dataIndex: 'profession', width: '10%' },
  { title: '持证专业', dataIndex: 'certificateNames', width: '10%' },
  { title: '被引用次数(中标)', dataIndex: 'winQuoteNum', width: '10%' },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
  },
]
const performanceColumns = [
  {
    title: '序号',
    dataIndex: 'quoteIndex',
    width: '5%',
  },
  {
    title: '业绩名称',
    dataIndex: 'performanceName',
    width: '30%',
  },
  { title: '业绩类型', dataIndex: 'performanceType', width: '15%' },
  { title: '合同金额', dataIndex: 'performanceAmount', width: '10%' },
  { title: '时间年限', dataIndex: 'performanceYearLimit', width: '10%' },
  { title: '地区', dataIndex: 'performanceArea', width: '10%' },
  { title: '被引用次数(中标)', dataIndex: 'performanceNum', width: '10%' },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
  },
]

export default {
  components: {
    EditPersonModal,
    UploadComponent,
    SelectPerson,
    EditPerformanceModal,
    SelectPerformance,
  },
  data() {
    return {
      id: getQueryVariable('id'),
      spinning: false,
      dayjs,
      data: [],
      fileLists: [],
      downloadAccessory,
      personColumns,
      performanceColumns,
      personLading: false,
      performanceLoading: false,
      baseData: {},
      unitId: '',
      personList: [],
      performanceList: [],
      editPersonId: '',
      editPerformanceId: '',
    }
  },
  created() {
    this.getBaseInfo()
    this.getPersonData()
    this.getPerformanceData()
  },
  methods: {
    getBaseInfo() {
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.biddingRecord.unitList, {
          params: { recordId: this.id, type: 0 },
        })
        .then((res) => {
          if (res && res.success) {
            if (res.obj && res.obj.length > 0) {
              this.baseData = res.obj[0]
              this.baseData.tenderTime = this.baseData.tenderTime
                ? dayjs(this.baseData.tenderTime)
                : null
              this.unitId = res.obj[0].id
            }
          }
          this.spinning = false
        })
    },
    getPersonData() {
      this.personLading = true
      window.$oAjax
        .get(window.$oApi.biddingRecord.personList, {
          params: { recordId: this.id },
        })
        .then((res) => {
          if (res && res.success) {
            this.personList = res.obj
          }
          this.personLading = false
        })
    },
    getPerformanceData() {
      this.performanceLoading = true
      window.$oAjax
        .get(window.$oApi.biddingRecord.performanceList, {
          params: { recordId: this.id },
        })
        .then((res) => {
          if (res && res.success) {
            this.performanceList = res.obj
          }
          this.performanceLoading = false
        })
    },
    uploadFile() {
      this.$refs.UploadComponent.showModal()
    },
    uploadcall(res) {
      if (res.length == 0) {
        return
      }

      let unitAttach = res.map(item => ({
        attachmentId: item.id,
        name: item.attachmenttitle,
        url: item.realpath,
      }))

      unitAttach = [
        ...unitAttach,
        ...this.baseData.unitAttach.map(item => ({
          attachmentId: item.attachmentId,
          name: item.name,
          url: item.url,
        })),
      ]

      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.biddingRecord.unitOperation}`,
        data: {
          unitAttach,
          id: this.unitId,
          unitType: 0,
          recordId: this.id,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res && res.success) {
          message.success(res.message || res.msg)
          this.fileLists = []
          this.getBaseInfo()
        }
        else {
          message.error(res.message || res.msg)
        }
      })
    },
    editTableData(dataName, id, field, value) {
      this[dataName] = this[dataName].map((item) => {
        if (item.id == id) {
          return { ...item, [field]: value }
        }
        else {
          return { ...item }
        }
      })
    },
    addPerson() {
      this.$refs.EditPersonModal.showModal()
    },
    addPerformance() {
      this.$refs.EditPerformanceModal.showModal()
    },
    changePerson(record) {
      this.editPersonId = record.id
      this.$refs.SelectPerson.showModal()
    },
    changePerformance(record) {
      this.editPerformanceId = record.id
      this.$refs.SelectPerformance.showModal()
    },
    changePersonCallBack(data) {
      let pData = {}
      if (data && data.length > 0) {
        pData = {
          id: data[0].id,
          name: data[0].personName,
        }
      }

      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.biddingRecord.personOperation}`,
        data: {
          id: this.editPersonId,
          recordId: this.id,
          unitId: this.unitId,
          biddingPersonId: pData.id,
          biddingPersonName: pData.name,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res && res.success) {
          message.success(res.message || res.msg)
          this.getPersonData()
        }
        else {
          message.error(res.message || res.msg)
        }
      })
    },
    changePerformanceCallBack(data) {
      let bId
      if (data && data.length > 0) {
        bId = data[0].id
      }

      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.biddingRecord.performanceOperation}`,
        data: {
          id: this.editPerformanceId,
          recordId: this.id,
          unitId: this.unitId,
          biddingPerformanceId: bId,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res && res.success) {
          message.success(res.message || res.msg)
          this.getPerformanceData()
        }
        else {
          message.error(res.message || res.msg)
        }
      })
    },
    saveEditPerson(record) {
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.biddingRecord.personOperation}`,
        data: {
          id: record.id,
          recordId: this.id,
          unitId: this.unitId,
          referenceRole: record.referenceRole,
          biddingPersonId: record.biddingPersonId,
          biddingPersonName: record.biddingPersonName,
          quoteIndex: record.quoteIndex,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res && res.success) {
          message.success(res.message || res.msg)
          this.getPersonData()
        }
        else {
          message.error(res.message || res.msg)
        }
      })
    },
    saveEditPerformance(record) {
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.biddingRecord.performanceOperation}`,
        data: {
          id: record.id,
          recordId: this.id,
          unitId: this.unitId,
          biddingPerformanceId: record.biddingPerformanceId,
          quoteIndex: record.quoteIndex,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res && res.success) {
          message.success(res.message || res.msg)
          this.getPerformanceData()
        }
        else {
          message.error(res.message || res.msg)
        }
      })
    },
    // 删除人员
    deletePersonRow(id) {
      Modal.confirm({
        title: '删除',
        content: `确认删除此条信息吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.personLading = true
          window.$oAjax({
            method: 'get',
            url: `${window.$oApi.biddingRecord.personDelete}`,
            params: { id },
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'content-type': 'application/json',
            },
          }).then((res) => {
            if (res && res.success) {
              message.success(res.message || res.msg)
              this.getPersonData()
            }
            else {
              message.error(res.message || res.msg)
              this.personLading = false
            }
          })
        },
      })
    },
    deletePerformanceRow(id) {
      Modal.confirm({
        title: '删除',
        content: `确认删除此条信息吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.performanceLoading = true
          window.$oAjax({
            method: 'get',
            url: `${window.$oApi.biddingRecord.performanceDelete}`,
            params: { id },
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'content-type': 'application/json',
            },
          }).then((res) => {
            if (res && res.success) {
              message.success(res.message || res.msg)
              this.getPerformanceData()
            }
            else {
              message.error(res.message || res.msg)
              this.performanceLoading = false
            }
          })
        },
      })
    },
    saveBaseInfo() {
      const data = {
        id: this.unitId,
        unitType: 0,
        recordId: this.id,
        tenderTime: this.baseData.tenderTime
          ? new Date(this.baseData.tenderTime).getTime()
          : undefined,
        quoteAmount: this.baseData.quoteAmount,
        otherDescription: this.baseData.otherDescription,
      }

      if (this.baseData.unitAttach && this.baseData.unitAttach.length > 0) {
        data.unitAttach = this.baseData.unitAttach.map(item => ({
          attachmentId: item.attachmentId,
          name: item.name,
          url: item.url,
        }))
      }

      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.biddingRecord.unitOperation}`,
        data,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res && res.success) {
          this.getBaseInfo()
          message.success(res.message || res.msg)
        }
        else {
          message.error(res.message || res.msg)
        }
      })
    },
    deleteUnitAttach(file) {
      const data = {
        id: this.unitId,
        unitType: 0,
        recordId: this.id,
      }

      Modal.confirm({
        title: '删除',
        content: `确认删除该附件吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          data.unitAttach = this.baseData.unitAttach
            .filter(item => item.id !== file.id)
            .map(item => ({
              attachmentId: item.attachmentId,
              name: item.name,
              url: item.url,
            }))

          window.$oAjax({
            method: 'POST',
            url: `${window.$oApi.biddingRecord.unitOperation}`,
            data,
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
              'content-type': 'application/json',
            },
          }).then((res) => {
            if (res && res.success) {
              this.getBaseInfo()
              message.success(res.message || res.msg)
            }
            else {
              message.error(res.message || res.msg)
            }
          })
        },
      })
    },
    goPersonDetail(record) {
      top.addTabs
      && top.addTabs({
        id: record.biddingPersonId,
        title: '人员详情',
        close: false,
        url: `biddingController.do?biddingPersonDetail&id=${record.biddingPersonId}`,
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
