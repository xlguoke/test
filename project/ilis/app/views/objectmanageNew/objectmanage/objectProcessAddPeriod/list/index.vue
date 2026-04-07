<template>
  <div>
    <div v-if="!detail" style="padding-bottom: 10px">
      <a-button
        v-permission="'addProcessObjectPeriod'"
        type="primary"

        style="margin-right: 5px"
        @click="add"
      >
        新增
      </a-button>
      <a-button
        v-permission="'delObjectPeriod'"

        @click="deleteData"
      >
        删除
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :row-selection="rowSelection"
      :data-source="data"
      bordered
      :pagination="false"
      :row-class-name="rowClassName"
      :loading="loading"
      row-key="id"
      :custom-row="customRow"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'producer'">
          <span>
            <span v-if="record.editable">
              <a-button
                style="float: right"
                @click="
                  () => {
                    $refs.SelectPersonnel.showModal()
                  }
                "
              >选择</a-button>
              <div style="line-height: 28px">{{ text }}</div>
            </span>
            <span v-else>{{ text }}</span>
          </span>
        </template>

        <template v-if="column.dataIndex === 'testParamName'">
          <span>
            <span v-if="record.editable">
              <a-select
                mode="multiple"
                style="width: 100%"
                :dropdown-match-select-width="false"
                @change="(e) => handleChange(e, record.id, 'testParamName')"
              >
                <a-select-option
                  v-for="item in paramsData"
                  :key="item.testObjectParamId"
                  :value="item.testObjectParamId"
                >
                  {{ item.testParamName }}
                </a-select-option>
              </a-select>
            </span>
            <span v-else>{{ text }}</span>
          </span>
        </template>

        <template v-if="column.dataIndex === 'formingDate'">
          <span>
            <a-date-picker
              v-if="record.editable"
              @change="
                (time, time2) => {
                  handleChange(time2, record.id, 'formingDate')
                }
              "
            />
            <span v-else>{{
              text && formatTime(text, 'YYYY-MM-DD')
            }}</span>
          </span>
        </template>

        <template v-if="['periodCode', 'days', 'description'].includes(column.dataIndex)">
          <div>
            <a-input
              v-if="record.editable"
              style="margin: -5px 0"
              :value="text"
              @change="(e) => handleChange(e.target.value, record.id, column.dataIndex)"
            />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>
      </template>
    </a-table>
    <div v-if="isAdd" style="padding-top: 10px">
      <a-button type="primary" style="margin-right: 5px" @click="save">
        保存
      </a-button>
      <a-button @click="cancel">
        取消
      </a-button>
    </div>
    <SelectPersonnel
      ref="SelectPersonnel"
      :callback="getPerson"
      :multiple="false"
    />
  </div>
</template>

<script>
import qs from 'qs'

import { formatTime, getQueryVariable } from '~/providers/common/utils'

import SelectPersonnel from '~/providers/components/selectPersonnel.vue'

const columns = [
  {
    title: '制件人',
    dataIndex: 'producer',
    width: '15%',
    scopedSlots: { customRender: 'producer' },
  },
  {
    title: '制样参数',
    dataIndex: 'testParamName',
    width: '20%',
    scopedSlots: { customRender: 'testParamName' },
  },
  {
    title: '试件编号',
    dataIndex: 'periodCode',
    width: '20%',
    scopedSlots: { customRender: 'periodCode' },
  },
  {
    title: '制样日期',
    dataIndex: 'formingDate',
    width: '15%',
    scopedSlots: { customRender: 'formingDate' },
  },
  {
    title: '龄期（天）',
    dataIndex: 'days',
    width: '10%',
    scopedSlots: { customRender: 'days' },
  },
  {
    title: '制样情况描述',
    dataIndex: 'description',
    width: '20%',
    scopedSlots: { customRender: 'description' },
  },
]

export default {
  components: {
    SelectPersonnel,
  },
  data() {
    return {
      formatTime,
      data: [],
      cacheData: [],
      paramsData: [],
      columns,
      loading: false,
      isAdd: false,
      selectedRowKeys: [],
      selectedRows: [],
      defaultTester: '',
      processObjectId: getQueryVariable('processObjectId'),
      detail: getQueryVariable('detail'),
      processObjectSn: getQueryVariable('processObjectSn'),
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.id]
            this.selectedRows = [record]
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        type: 'radio',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  created() {
    this.getData()
    this.getParamsListData()
    this.getDefaultPerson()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      const { processObjectId } = this
      this.loading = true
      window.$oAjax
        .get(window.$oApi.objectProcessAddPeriod.list, {
          params: {
            processObjectId,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.rows) {
            this.data = res.rows
            this.selectedRows = []
            this.selectedRowKeys = []
            this.cacheData = this.data.map(item => ({ ...item }))
            this.loading = false
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
            this.loading = false
          }
        })
    },
    getDefaultPerson() {
      window.$oAjax
        .get(window.$oApi.objectProcessAddPeriod.getDefaultPerson, {
          params: {
            processObjectIds: this.processObjectId,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.success) {
            if (res.obj && res.obj.length > 0) {
              if (res.obj[0].testers && res.obj[0].testers.length > 0) {
                this.defaultTester = res.obj[0].testers[0].realName
              }
            }
          }
        })
    },
    getParamsListData() {
      const { processObjectId } = this
      this.loading = true
      window.$oAjax
        .get(window.$oApi.objectProcessAddPeriod.paramsList, {
          params: {
            processObjectId,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.success) {
            this.paramsData = res.obj
            this.loading = false
          }
          else {
            this.loading = false
          }
        })
    },
    // 新增
    add() {
      if (this.isAdd) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先完成当前新增!'))
        return
      }

      this.isAdd = true
      this.data.push({
        id: '_add',
        editable: true,
        producer: this.defaultTester,
      })
    },
    // 删除
    deleteData() {
      if (this.isAdd) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先保存或取消当前新增'))
        return
      }
      if (this.selectedRows.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择要删除的龄期'))
        return
      }
      const data = this.selectedRows[0]
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax({
            method: 'POST',
            url: window.$oApi.objectProcessAddPeriod.delete,
            data: qs.stringify({
              periodId: data.id,
            }),
          }).then((res) => {
            if (res && res.success) {
              window.$oAntdMessage.success('删除成功')
              this.getData()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
          })
        },
      })
    },
    handleChange(value, id, column) {
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        target[column] = value
        this.data = newData
      }
    },
    save() {
      const data = this.data.find(item => item.id == '_add')

      if (Array.isArray(data.testParamName) && data.testParamName.length > 0) {
        const obj = {}
        // eslint-disable-next-line array-callback-return
        this.paramsData.map((item) => {
          obj[item.testObjectParamId] = item.testParamName
        })
        data.testObjectParamIds = data.testParamName.toString()
        data.testParamName = data.testParamName
          .map(item => obj[item])
          .toString()
      }

      data.processObjectId = this.processObjectId
      data.processObjectSn = this.processObjectSn

      if (!data.producer) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择制件人'))
        return
      }
      else if (!data.testObjectParamIds && !data.testParamName) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择制样参数'))
        return
      }
      else if (!data.formingDate) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择制样日期'))
        return
      }

      window.$oAjax({
        method: 'POST',
        url: window.$oApi.objectProcessAddPeriod.add,
        data: qs.stringify(data),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          window.$oAntdMessage.success('操作成功')
          this.getData()
          this.isAdd = false
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    cancel() {
      this.data = this.data.filter(item => item.id !== '_add')
      this.isAdd = false
      this.selectedRows = []
      this.selectedRowKeys = []
    },
    amend(record) {
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.taskAddPeriod.changeStatus,
        params: {
          periodId: record.id,
          isTested: record.isTested == '0' ? '1' : '0',
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          window.$oAntdMessage.success('操作成功')
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    getPerson(data) {
      this.data = this.data.map((item) => {
        if (item.id !== '_add') {
          return item
        }
        else {
          return {
            ...item,
            producer: data.name,
          }
        }
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
