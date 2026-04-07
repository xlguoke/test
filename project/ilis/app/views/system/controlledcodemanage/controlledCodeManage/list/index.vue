<template>
  <div class="controlledCodeManage">
    <p class="query_box">
      <a-space>
        <a-input
          v-model:value="controlledCodeInput"
          placeholder="请输入受控码"
          @keyup.enter="queryTable"
        />

        <a-input
          v-model:value="sheetInput"
          placeholder="请输入sheet"
          @keyup.enter="queryTable"
        />

        <a-input
          v-model:value="fromNameInput"
          placeholder="请输入表单名称"
          @keyup.enter="queryTable"
        />

        <a-input
          v-model:value="testItemName"
          placeholder="请输入检测项目"
          @keyup.enter="queryTable"
        />

        <a-button type="primary" @click="queryTable">
          查询
        </a-button>
        <a-button @click="resetQuery">
          重置
        </a-button>
      </a-space>
    </p>
    <div class="controlledCodeManage-btn">
      <a-button

        :disabled="loading || updateLoading2"
        :loading="updateLoading"
        @click="updateCategoryData(false)"
      >
        获取/更新当前大类下表单
      </a-button>
      <a-button

        :disabled="loading || updateLoading"
        :loading="updateLoading2"
        @click="openUpdateModal"
      >
        获取/更新当前项目下表单
      </a-button>
      <a-button
        v-permission="'syncCenterCode'"

        :disabled="loading"
        :loading="syncLoading"

        @click="onSyncCenterCode"
      >
        同步数据中心受控码
      </a-button>
      <a-button :disabled="loading" @click="deleteData">
        删除
      </a-button>
      <a-button :disabled="loading" @click="onExport">
        导出
      </a-button>
      <a-upload
        :disabled="importLoading"
        accept=".xlsx, .xls"
        :show-upload-list="false"
        name="file"
        :multiple="true"
        :action="importUrl"
        @change="onImport"
      >
        <a-button :disabled="loading" :loading="importLoading">
          导入
        </a-button>
      </a-upload>
    </div>
    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="dataSource"
      bordered
      :pagination="false"
      :loading="loading"
      row-key="id"
      :row-class-name="rowClassName"
      :scroll="{ y: tableHeight }"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="['categoryId', 'templateType', 'sheetName', 'templateName', 'controlCode', 'enableData', 'remark'].includes(column.dataIndex)">
          <div v-if="record.isAdd">
            <div
              v-if="
                [
                  'categoryId',
                  'templateType',
                  'sheetName',
                  'templateName',
                  'controlCode',
                  'enableData',
                  'remark',
                ].includes(column.dataIndex)
              "
            >
              <a-tree-select
                v-if="column.dataIndex === 'categoryId'"
                v-model:value="record[column.dataIndex]"
                :tree-data="categoryList"
                style="width: 100%"
                :disabled="record.isLoading"
                :dropdown-style="{ maxHeight: '350px', overflow: 'auto' }"
                placeholder="请选择"
                allow-clear
                tree-default-expand-all
                :field-names="{ children: 'children', label: 'name', value: 'id' }"
              />
              <a-select
                v-else-if="column.dataIndex === 'templateType'"
                v-model:value="record[column.dataIndex]"
                style="width: 100%"
                :disabled="record.isLoading"
                placeholder="请选择"
              >
                <a-select-option
                  v-for="item in templateTypeList"
                  :key="item.value"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
              <a-date-picker
                v-else-if="column.dataIndex === 'enableData'"
                v-model:value="record[column.dataIndex]"
                style="width: 100%"
                :disabled="record.isLoading"
                value-format="YYYY-MM-DD"
              />
              <a-input
                v-else
                v-model:value="record[column.dataIndex]"
                :disabled="record.isLoading"
                placeholder="请输入"
              />
            </div>
          </div>

          <div v-if="record.isEdit">
            <div
              v-if="['controlCode', 'enableData', 'remark'].includes(column.dataIndex)"
            >
              <a-date-picker
                v-if="column.dataIndex === 'enableData'"
                v-model:value="record[column.dataIndex]"
                style="width: 100%"
                :disabled="record.isLoading"
                value-format="YYYY-MM-DD"
              />
              <a-input
                v-else
                v-model:value="record[column.dataIndex]"
                :disabled="record.isLoading"
              />
            </div>
            <div v-else>
              <span v-if="column.dataIndex === 'categoryId'">{{ record.categoryName }}</span>
              <span v-else-if="column.dataIndex === 'templateType'">{{
                record.templateTypeName
              }}</span>
              <span v-else>{{ record[column.dataIndex] }}</span>
            </div>
          </div>

          <div v-if="!record.isEdit && !record.isAdd">
            <span v-if="column.dataIndex === 'categoryId'">{{ record.categoryName }}</span>
            <span v-else-if="column.dataIndex === 'templateType'">{{
              record.templateTypeName
            }}</span>
            <span v-else>{{ record[column.dataIndex] }}</span>
          </div>
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <div class="controlledCodeManage-icon table-handle">
            <a
              v-if="!isAdd && !isEdit"
              title="编辑"
              @click="onEditRow(record)"
            >编辑</a>
            <a
              v-if="record.isAdd || record.isEdit"
              title="保存"
              @click="onCheckCode(record)"
            >保存</a>
            <a
              v-if="(record.isAdd || record.isEdit) && !record.isLoading"
              title="取消"
              style="color: red"
              @click="onCancelRow(record)"
            >取消</a>
            <a
              v-if="!isAdd && !isEdit"
              title="查看受控码版本"
              @click="onCheckRecord(record)"
            >查看受控码版本</a>
          </div>
        </template>
      </template>
    </a-table>
    <PlusCircleOutlined
      v-if="!isAdd && !isEdit && !loading && !importLoading"
      class="controlledCodeManage-add"
      @click="onAddRow"
    />

    <Record :id="recordId" v-model:value="recordVisible"></Record>

    <ht-modal
      :open="visibleItem"
      title="选择检测项目"
      :mask-closable="false"
      @ok="updateCategoryDataByProject"
      @cancel="visibleItem = false"
    >
      <a-spin :spinning="testItemLoading">
        <div style="padding: 0 15px">
          <a-checkbox
            :indeterminate="indeterminate"
            :checked="checkAll"
            @change="onCheckAllChange"
          >
            全选
          </a-checkbox>
          <div>
            <a-checkbox-group
              v-model:value="checkedTestItems"
              :options="testItemDatas"
              @change="onChange"
            />
          </div>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import { PlusCircleOutlined } from '@ant-design/icons-vue'
import { notification } from 'ant-design-vue'
import dayjs from 'dayjs'
import { formatTime, getQueryVariable, getUUID } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import openHitekUdrTool from '~/providers/libs/openHitekUdrTool'
import {
  addCode,
  checkCodeExist,
  codeExport,
  deleteCode,
  editCode,
  getBigCategoryList,
  getCodeList,
  getStatus,
  syncCenterCode,
} from '../api'
import Record from './components/record.vue'

const columns = [
  {
    title: '检测大类',
    dataIndex: 'categoryId',
    width: '10%',
    sorter: (a, b) => {
      const a1 = a.categoryName || ''
      const b1 = b.categoryName || ''
      return a1.localeCompare(b1)
    },
    sortDirections: ['descend', 'ascend'],
    scopedSlots: { customRender: 'categoryId' },
  },
  {
    title: '检测项目',
    dataIndex: 'testItemName',
    width: '10%',
    sorter: (a, b) => {
      const a1 = a.testItemName || ''
      const b1 = b.testItemName || ''
      return a1.localeCompare(b1)
    },
    sortDirections: ['descend', 'ascend'],
  },
  {
    title: '检测项目ID',
    dataIndex: 'testItemId',
    width: '10%',
  },
  {
    title: '模板类型',
    dataIndex: 'templateType',
    width: '10%',
    scopedSlots: { customRender: 'templateType' },
  },
  {
    title: 'Sheet名称',
    dataIndex: 'sheetName',
    width: '10%',
    sorter: (a, b) => {
      const a1 = a.sheetName || ''
      const b1 = b.sheetName || ''
      return a1.localeCompare(b1)
    },
    sortDirections: ['descend', 'ascend'],
    scopedSlots: { customRender: 'sheetName' },
  },
  {
    title: '表单名称',
    dataIndex: 'templateName',
    width: '10%',
    sorter: (a, b) => {
      const a1 = a.templateName || ''
      const b1 = b.templateName || ''
      return a1.localeCompare(b1)
    },
    sortDirections: ['descend', 'ascend'],
    scopedSlots: { customRender: 'templateName' },
  },
  {
    title: '受控码',
    dataIndex: 'controlCode',
    width: '10%',
    sorter: (a, b) => {
      const a1 = a.controlCode || ''
      const b1 = b.controlCode || ''
      return a1.localeCompare(b1)
    },
    sortDirections: ['descend', 'ascend'],
    scopedSlots: { customRender: 'controlCode' },
  },
  {
    title: '启用日期',
    dataIndex: 'enableData',
    width: '10%',
    scopedSlots: { customRender: 'enableData' },
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: '10%',
    scopedSlots: { customRender: 'remark' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
    scopedSlots: { customRender: 'operation' },
  },
]

let updateTimer = null
let updateCount = 0

export default {
  components: {
    Record,
    PlusCircleOutlined,
  },
  data() {
    return {
      formatTime,
      tableDataAll: [],
      controlledCodeInput: '',
      sheetInput: '',
      fromNameInput: '',
      testItemName: '',
      categoryId: getQueryVariable('categoryId'),
      dataSource: [],
      updateType: 1,
      visibleItem: false,
      indeterminate: false,
      checkAll: false,
      testItemDatas: [],
      checkedTestItems: [],
      categoryList: [],
      templateTypeList: [
        { value: 2, name: '原始记录' },
        { value: 3, name: '检测报告' },
      ],
      columns,
      selectedRowKeys: [],
      selectedRows: [],
      loading: false,
      isAdd: false,
      isEdit: false,
      importUrl: `/rest/controlCode/import`,
      recordVisible: false,
      recordId: null,
      importLoading: false,
      updateLoading: false,
      updateLoading2: false,
      testItemLoading: false,
      syncLoading: false,
      messageId: null,
      cacheRow: null,
      tableHeight: 450,
    }
  },
  computed: {
    rowSelection() {
      return {
        type: 'checkbox',
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
    // 设置表格高度
    this.tableHeight = document.body.clientHeight - 200
    window.onresize = () => {
      this.tableHeight = document.body.clientHeight - 200
    }

    this.getData()
    this.getBigCategoryList()
  },
  methods: {
    onChange(checkedList) {
      this.indeterminate
        = !!checkedList.length && checkedList.length < this.testItemDatas.length
      this.checkAll = checkedList.length === this.testItemDatas.length
    },
    onCheckAllChange(e) {
      Object.assign(this, {
        checkedTestItems: e.target.checked
          ? this.testItemDatas.map(d => d.value)
          : [],
        indeterminate: false,
        checkAll: e.target.checked,
      })
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 获取检测大类下拉列表
    async getBigCategoryList() {
      try {
        const res = await getBigCategoryList(this.categoryId)
        if (res) {
          this.categoryList = [res]
        }
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
      }
    },
    // 新增时根据当前时间生成一个id
    getRowId() {
      return new Date().getTime()
    },
    // 获取受控码列表
    async getData() {
      this.loading = true
      try {
        const res = await getCodeList({
          categoryId: this.categoryId,
        })
        this.testItemDatas = []
        this.loading = false
        if (res.code !== 20010) {
          this.dataSource = res.data.map((item) => {
            const obj = { ...item }

            const templateTypeObj = this.templateTypeList.find(
              t => t.value == item.templateType,
            )
            if (templateTypeObj) {
              obj.templateTypeName = templateTypeObj.name
            }
            obj.enableData = obj.enableData
              ? formatTime(obj.enableData, 'YYYY-MM-DD')
              : ''
            return obj
          })

          this.tableDataAll = JSON.parse(JSON.stringify(this.dataSource))
          this.selectedRowKeys = []
          this.selectedRows = []
          this.isAdd = false
          this.isEdit = false
        }
      }
      catch (e) {
        this.loading = false
        // eslint-disable-next-line no-console
        console.log(e)
      }
    },
    resetQuery() {
      this.controlledCodeInput = ''
      this.fromNameInput = ''
      this.testItemName = ''
      this.sheetInput = ''
      this.dataSource = this.tableDataAll
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    queryTable() {
      this.selectedRowKeys = []
      this.selectedRows = []
      // eslint-disable-next-line array-callback-return
      const data = this.tableDataAll.filter((item) => {
        this.controlledCodeInput = this.controlledCodeInput.replace(
          /(^\s*)|(\s*$)/g,
          '',
        )
        this.fromNameInput = this.fromNameInput.replace(/(^\s*)|(\s*$)/g, '')
        this.testItemName = this.testItemName.replace(/(^\s*)|(\s*$)/g, '')
        this.sheetInput = this.sheetInput.replace(/(^\s*)|(\s*$)/g, '')
        if (
          (this.controlledCodeInput == ''
            || (item.controlCode
              && item.controlCode.includes(this.controlledCodeInput)))
            && (this.fromNameInput == ''
              || (item.templateName
                && item.templateName.includes(this.fromNameInput)))
              && (this.sheetInput == ''
                || (item.sheetName && item.sheetName.includes(this.sheetInput)))
              && (this.testItemName == ''
                || item.testItemName.includes(this.testItemName))
        ) {
          return item
        }
      })
      this.dataSource = data
    },
    // 新增行
    onAddRow() {
      if (this.isAdd || this.isEdit) {
        window.$oAntdModal.warning(
          window.$oMsgTips.info('当前存在正在编辑的数据，请先完成编辑'),
        )
      }
      else {
        this.dataSource.push({
          isAdd: true,
          enableData: dayjs(new Date()).format('YYYY-MM-DD'),
          id: this.getRowId(),
        })
        window.$oForceUpdate()
        this.isAdd = true

        window.$oNextTick(() => {
          const ele = document.getElementsByClassName('ant-table-body')[0]
          ele.scrollTop = ele.scrollHeight
        })
      }
    },
    // 编辑行
    onEditRow(row) {
      if (this.isAdd || this.isEdit) {
        window.$oAntdModal.warning(
          window.$oMsgTips.info('当前存在正在编辑的数据，请先完成编辑'),
        )
      }
      else {
        this.cacheRow = { ...row }
        row.isEdit = true
        this.isEdit = true
      }
    },
    // 取消行编辑
    onCancelRow(row) {
      window.$oAntdConfirm({
        title: '提示',
        content: `确认取消编辑吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          if (this.isAdd === true) {
            this.isAdd = false
            this.dataSource = this.dataSource.filter(item => !item.isAdd)
          }

          if (this.isEdit === true) {
            this.isEdit = false
            const keys = Object.keys(this.cacheRow)
            // eslint-disable-next-line array-callback-return
            keys.map((key) => {
              row[key] = this.cacheRow[key]
            })
            row.isEdit = false
            window.$oForceUpdate()
          }
        },
      })
    },
    // 保存行之前校验必填和检查受控码
    async onCheckCode(row) {
      if (row.isLoading) {
        return
      }

      const messageList = []
      // 新增时，要求sheet名称、表单名称必填；
      if (row.isAdd) {
        if (!row.sheetName) {
          messageList.push('sheet名称为必填项')
        }
        if (!row.templateName) {
          messageList.push('表单名称为必填项')
        }
      }

      // 新增和编辑时 受控码、启用日期必填
      if (!row.controlCode) {
        messageList.push('受控码为必填项')
      }
      if (!row.enableData) {
        messageList.push('启用日期为必填项')
      }

      if (messageList.length > 0) {
        window.$oAntdModal.warning({
          title: '提示',
          content: h(
            'div',
            {},
            messageList.map(m => h('p', m)),
          ),
        })
        return
      }

      try {
        // 将改行置为不可编辑状态
        row.isLoading = true
        window.$oForceUpdate()

        const loading = window.$oAntdMessage.loading('受控码检查中...', 0)
        const res = await checkCodeExist({
          uniqueMark: row.uniqueMark,
          controlCode: row.controlCode,
        })

        setTimeout(loading, 0)
        if (res.code !== 20010) {
          if (res.data.exist === true) {
            window.$oAntdConfirm({
              title: '提示',
              content: `本次填写的受控码在系统中已存在，${res.data.message} 是否继续？`,
              okText: '确认',
              cancelText: '取消',
              onOk: async () => {
                this.onSaveRow(row)
              },
              onCancel: () => {
                row.isLoading = false
                window.$oForceUpdate()
              },
            })
          }
          else {
            this.onSaveRow(row)
          }
        }
        else {
          row.isLoading = false
          window.$oAntdModal.warning(
            window.$oMsgTips.info(res.msg || res.message || '请求异常，请稍后再试'),
          )
        }
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
        setTimeout(loading, 0)
        row.isLoading = false
        window.$oAntdModal.warning(window.$oMsgTips.info('请求异常，请稍后再试'))
      }

      window.$oForceUpdate()
    },
    // 保存行
    async onSaveRow(row) {
      const formData = { ...row }
      formData.enableData = dayjs(formData.enableData).format('YYYY-MM-DD')

      const loading = window.$oAntdMessage.loading('数据保存中...', 0)
      try {
        let res = {}
        if (row.isAdd) {
          delete formData.id
          res = await addCode(formData)
        }
        else {
          res = await editCode(formData)
        }
        setTimeout(loading, 0)
        if (res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          await this.getData()
          this.isAdd = false
          this.isEdit = false
        }
        else {
          row.isLoading = false
          window.$oAntdModal.warning(
            window.$oMsgTips.info(res.msg || res.message || '保存失败，请稍后再试'),
          )
        }
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {
        setTimeout(loading, 0)
        row.isLoading = false
        window.$oAntdModal.warning(window.$oMsgTips.info('保存失败，请稍后再试'))
      }
      window.$oForceUpdate()
    },
    // 查看受控码变更记录
    onCheckRecord(row) {
      this.recordId = row.uniqueMark
      this.recordVisible = true
    },
    // 删除
    deleteData() {
      if (this.selectedRows.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择需要删除的项目'))
        return
      }

      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除勾选的受控码吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          for (let i = 0; i < this.selectedRows.length; i++) {
            const row = this.selectedRows[i]
            await deleteCode(row.uniqueMark)
          }

          window.$oAntdMessage.success('操作成功')
          this.getData()
        },
      })
    },
    // 获取/更新当前大类下表单
    updateCategoryData(flag = false) {
      if (this.syncLoading === true) {
        return
      }
      let projectIds = ''
      if (flag) {
        this.updateType = 2
        projectIds = this.checkedTestItems.join(',')
      }
      else {
        this.updateType = 1
      }
      this.messageId = getUUID()
      const url = `${location.origin}${rootUrl}/controlCode.do?goControlledCodeUpdateContainer&categoryId=${this.categoryId}&messageId=${this.messageId}&projectIds=${projectIds}`
      openHitekUdrTool(url, 'hide', true)
      if (flag) {
        this.updateLoading2 = true
      }
      else {
        this.updateLoading = true
      }
      // 设置间隔，10秒后再开始轮询
      setTimeout(() => {
        this.getStatusByMessageId()
      }, 10 * 1000)
    },
    // 获取/更新当前项目下表单
    openUpdateModal() {
      this.checkAll = false
      this.indeterminate = false
      this.checkedTestItems = []
      this.getTestItemsData()
      this.visibleItem = true
    },
    // 根据大类获取检测项目
    async getTestItemsData() {
      this.testItemLoading = true
      await window.$oAjax({
        url: '/rest/controlCode/categoryItemInfo',
        method: 'get',
        params: { categoryId: this.categoryId },
      }).then((res) => {
        this.testItemLoading = false
        if (res.code !== 20010) {
          const list = res.data.map(d => ({
            label: d.testItemName,
            value: d.testItemId,
          }))
          this.testItemDatas = list
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    updateCategoryDataByProject() {
      if (this.checkedTestItems.length === 0) {
        window.$oAntdMessage.warning('请选择检测项目')
        return
      }
      this.updateCategoryData(true)
      this.visibleItem = false
    },
    // 同步数据中心受控码
    async onSyncCenterCode() {
      this.syncLoading = true
      try {
        const res = await syncCenterCode(this.categoryId)
        this.syncLoading = false
        if (res.code !== 20010) {
          window.$oAntdMessage.success('同步成功')
          this.getData()
        }
        else {
          window.$oAntdMessage.error(res.message || res.msg || '请求异常，请稍后再试')
        }
      }
      catch (e) {
        this.syncLoading = false
        // eslint-disable-next-line no-console
        console.log(e)
      }
    },
    // 导出
    onExport() {
      codeExport(this.categoryId)
    },
    // 导入
    onImport(info) {
      if (info.file.status !== 'uploading') { /* empty */ }
      this.importLoading = true
      if (info.file.status === 'done') {
        this.importLoading = false
        const res = info.file.response
        if (res.code !== 20010) {
          window.$oAntdMessage.success('导入成功')
          this.getData()
        }
        else {
          window.$oAntdMessage.error(res.message || res.msg || '导入失败，请稍后再试')
        }
      }
      else if (info.file.status === 'error') {
        this.importLoading = false
        window.$oAntdMessage.error(`${info.file.name} 文件上传失败`)
      }
    },
    // 获取更新状态, 5秒来一次
    getStatusByMessageId() {
      updateTimer = setInterval(async () => {
        updateCount++
        const res = await getStatus(this.messageId)
        // 10-执行中 20-操作完成 00-未知状态
        if (res.code === 20000) {
          if (res.data == '20') {
            this.messageId = null
            this.updateLoading = false
            this.updateLoading2 = false
            clearInterval(updateTimer)
            updateTimer = null
            updateCount = 0
            notification.open({
              message:
                this.updateType == 1
                  ? '获取/更新当前大类下表单'
                  : '获取/更新当前项目下表单',
              description: '已执行完成',
            })
            this.getData()
          }

          // 查询5次之后，结果还是未知状态，说明用户可能打开udr时点了取消，此处则取消轮询，并于产品确认不需要给用户任何提示
          if (res.data == '00') {
            if (updateCount >= 6) {
              this.updateLoading = false
              this.updateLoading2 = false
              clearInterval(updateTimer)
              updateTimer = null
              updateCount = 0
            }
          }
        }
      }, 5 * 1000)
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
