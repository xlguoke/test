<template>
  <div>
    <div class="table-operations">
      <a-button
        style="margin: 10px 0px 10px 10px"
        type="primary"
        @click="showModalAddEdit"
      >
        添加
      </a-button>
      <ht-modal
        :title="editId ? '编辑环境记录' : '新增环境记录'"
        centered
        :mask-closable="false"
        :open="visibleRules"
        :confirm-loading="false"
        width="90%"
        height="80%"
        @ok="handleOkAddEdit"
        @cancel="
          () => {
            handleCancelAddEdit()
          }
        "
      >
        <AddEditComponent
          ref="addeditchild"
          :visible-rules="visibleRules"
          :edit-id="editId"
          :callback="handleOkAddEditCall"
        />
      </ht-modal>
    </div>
    <a-table
      bordered
      :data-source="data"
      row-key="id"
      :columns="columns"
      :pagination="false"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'temperature'">
          <template v-if="record.minTemperature && !record.maxTemperature">
            ≥{{ record.minTemperature }}
          </template>
          <template v-else-if="!record.minTemperature && record.maxTemperature">
            ≤{{ record.maxTemperature }}
          </template>
          <template v-else-if="record.minTemperature && record.maxTemperature">
            {{ record.minTemperature }} - {{ record.maxTemperature }}
          </template>
          <template v-else>
            /
          </template>
        </template>

        <template v-if="column.dataIndex === 'humidity'">
          <template v-if="record.minHumidity && !record.maxHumidity">
            ≥{{ record.minHumidity }}
          </template>
          <template v-else-if="!record.minHumidity && record.maxHumidity">
            ≤{{ record.maxHumidity }}
          </template>
          <template v-else-if="record.minHumidity && record.maxHumidity">
            {{ record.minHumidity }} - {{ record.maxHumidity }}
          </template>
          <template v-else>
            /
          </template>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <div class="table-handle">
            <a @click="() => editRow(record.id)">编辑</a>
            <a-popconfirm
              v-if="data.length"
              title="确定要删除?"
              placement="left"
              @confirm="() => deleteRow(record.id, record.key)"
            >
              <a href="javascript:;">删除</a>
            </a-popconfirm>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script>
import { ajaxRequest, formatTime, getQueryVariable } from '~/providers/common/utils.js'
import AddEditComponent from '../addEdit/index.vue'
/*
 * EditableCell Code https://github.com/vueComponent/ant-design-vue/blob/master/components/table/demo/EditableCell.vue
 */
function formatTimeHtml({ text }) {
  return text ? formatTime(text, 'YYYY-MM-DD HH:mm') : ''
}
const columns = [
  {
    title: '开始使用时间',
    dataIndex: 'beginUseTime',
    customRender: formatTimeHtml,
  },
  {
    title: '截止使用时间',
    dataIndex: 'endUseTime',
    customRender: formatTimeHtml,
  },
  { title: '记录时间', dataIndex: 'recordTime', customRender: formatTimeHtml },
  { title: '记录人', dataIndex: 'createName' },
  { title: '检测室名称', dataIndex: 'laboratoryName' },
  { title: '检测参数', dataIndex: 'testObjectParamDisplayName' },
  {
    title: '温度要求(°C)',
    dataIndex: 'temperature',
    scopedSlots: { customRender: 'temperature' },
  },
  { title: '试验时温度(°C)', dataIndex: 'temperatureWhenTest' },
  {
    title: '湿度要求(%RH)',
    dataIndex: 'humidity',
    scopedSlots: { customRender: 'humidity' },
  },
  { title: '试验时湿度(%RH)', dataIndex: 'humidityWhenTest' },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 100,
    scopedSlots: { customRender: 'operation' },
  },
]
export default {
  components: {
    AddEditComponent,
  },
  data() {
    return {
      columns,
      data: [],
      visibleRules: false,
      editId: '', // 环境记录id
      testTaskId: getQueryVariable('testTaskId'),
    }
  },
  created() {
    this.getData()
  },
  methods: {
    formatTime,
    ajaxRequest,
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData(pages) {
      const data = {
        page: pages || 1,
        rows: 10,
      }
      const formData = { ...data, testTaskId: this.testTaskId }
      ajaxRequest(
        window.$oApi.environment.tableUrl,
        window.$oQs.stringify(formData),
        this.getDataCall,
      )
    },
    getDataCall(res) {
      this.data = res.rows
    },
    handleTableChange(page) {
      this.getData(page)
    },
    showModalAddEdit() {
      this.visibleRules = true
      this.editId = ''
    },
    handleCancelAddEdit() {
      this.visibleRules = false
      this.$refs.addeditchild.clearValidate()
      this.$refs.addeditchild.formState = {}
      this.$refs.addeditchild.valueRemark = ''
      this.$refs.addeditchild.queryParams = {}
      this.$refs.addeditchild.data = []
      this.$refs.addeditchild.conflict = false
    },
    handleOkAddEdit() {
      this.$refs.addeditchild.handleSubmit()
    },
    handleOkAddEditCall(res) {
      if (res.success) {
        this.visibleRules = false
        this.getData()
      }
    },
    editRow(did) {
      this.editId = did
      this.visibleRules = true
    },
    deleteRow(did) {
      if (did) {
        ajaxRequest(
          window.$oApi.environment.delUrl,
          window.$oQs.stringify({ id: did }),
          this.deleteRowCall,
        )
      }
    },
    deleteRowCall(res) {
      if (res.success) {
        this.getData()
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
      }
    },
  },
}
</script>

<style scoped></style>
