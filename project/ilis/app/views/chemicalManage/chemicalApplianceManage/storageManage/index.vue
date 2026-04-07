<!-- eslint-disable vue/valid-v-for -->
<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form layout="inline">
          <a-form-item label="入库类型">
            <a-select
              v-model:value="search.inventoryType"
              placeholder="请选择入库类型"
              allow-clear
              style="width: 150px"
            >
              <a-select-option v-for="t in $types" :value="t">
                {{
                  t
                }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-input
              v-model:value="search.quickQry"
              placeholder="请输入化学品名称、化学品编号后回车即可"
              style="width: 350px"
              @press-enter="handleSearch()"
            />
          </a-form-item>
          <a-form-item>
            <a-button type="primary" style="width: 60px" @click="handleSearch">
              查询
            </a-button>
            <a-button @click="advancedOpen">
              高级查询
            </a-button>
          </a-form-item>
        </a-form>
        <div class="btns">
          <a-button v-permission="'storage:manage::edit'" type="primary" @click="addEditRow('新增', '')">
            新增
          </a-button>
          <a-button v-permission="'storage:manage::add-apply'" @click="addByRequest">
            按申请新增
          </a-button>
          <a-button v-permission="'storage:manage::import'" @click="importFun">
            导入
          </a-button>
          <a-button v-permission="'storage:manage::export'" :loading="exportLoading" @click="exportData">
            导出
          </a-button>
          <a-button v-permission="'storage:manage::custom'" @click="customVisible = true">
            自定义字段配置
          </a-button>
          <a-button @click="columnScreen">
            列筛选
          </a-button>
        </div>
        <a-table
          :columns="tableColumns"
          :data-source="data"
          :pagination="data.length > 0 ? pagination : false"
          :row-selection="rowSelection"
          :row-class-name="rowClassName"
          :scroll="{ x: 1200, y: scrollHeight }"
          bordered
          row-key="id"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'allowChangeContainer'">
              {{ text ? '是' : '否' }}
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <span class="table-handle">
                <a v-if="record.inventoryStatus === STATUS_CREATE" v-permission="'storage:manage::edit'" @click="addEditRow('编辑', record.id)">
                  编辑
                </a>
                <a @click="addEditRow('查看', record.id)">查看</a>
                <!-- <a-button type="link" @click="(e) => viewLog(e, record)">日志</a-button> -->
                <a
                  v-if="record.inventoryStatus !== STATUS_GET"
                  v-permission="'storage:manage::delete'"
                  style="color: red"
                  @click="(e) => deleteRow(e, record)"
                >
                  删除
                </a>
                <a v-if="record.inventoryType === '采购'" v-permission="'storage:manage::print'" @click="onPrint(record)">
                  打印入库验收单
                </a>
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>

    <ht-modal
      :open="customVisible"
      width="50%"
      title="自定义字段配置"
      :mask-closable="false"
      :closable="false"
      :destroy-on-close="true"
    >
      <CustomProperty customize-type="chemicalInventoryIn" />
      <template #footer>
        <div class="modal-footer" style="height: 30px">
          <a-button type="primary" @click="customOk">
            确定
          </a-button>
        </div>
      </template>
    </ht-modal>

    <Logs ref="Logs" />
    <AdvancedQuery2 ref="advancedQueryRef" @ok="advancedQueryCB" />
    <CustomColumn ref="CustomColumn" @ok-btn="initFun"></CustomColumn>
    <AddEditComponent ref="addEditRef" :key="editKey" />
    <Import ref="import" />
    <AddByRequest ref="AddByRequestRef" @on-save="getData()" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import {
  storageInDelete,
  storageInExport,
  storageInPageList,
} from '~/providers/api/chemicals'
import { downloadFile, formatTime } from '~/providers/common/utils'
import CustomColumn from '~/providers/components/customColumn/CustomColumn.vue'
import CustomProperty from '~/providers/components/CustomProperty.vue'
import Logs from '~/providers/components/logs.vue'
import AddByRequest from './components/addByRequest.vue'
import AddEditComponent from './components/addEdit.vue'
import AdvancedQuery2 from './components/advancedQuery.vue'
import Import from './components/import.vue'

const defaultColumns = [
  {
    title: '化学名称',
    dataIndex: 'name',
    width: 100,
  },
  {
    title: '品名',
    dataIndex: 'standard',
    width: 100,
  },
  {
    title: '品名编号',
    dataIndex: 'manufacturer',
    width: 100,
  },
  {
    title: '管理级别',
    dataIndex: 'depart',
    width: 100,
  },
  {
    title: '纯度',
    dataIndex: 'price',
    width: 100,
  },
  {
    title: '用途',
    dataIndex: 'amount',
    width: 100,
  },
  {
    title: '化学品来源',
    dataIndex: 'totalPrice',
    width: 100,
  },
  {
    title: '计量单位',
    dataIndex: 'reason',
    width: 100,
  },
  {
    title: '生产日期',
    dataIndex: 'useRule',
    width: 100,
  },
  {
    title: '失效日期',
    dataIndex: '1',
    width: 100,
  },
  {
    title: '入库批号',
    dataIndex: '2',
    width: 100,
  },
  {
    title: '入库类型',
    dataIndex: '3',
    width: 100,
  },
  {
    title: '入库数量',
    dataIndex: '4',
    width: 100,
  },
  {
    title: '入库日期',
    dataIndex: '5',
    width: 100,
  },
  {
    title: '保管人',
    dataIndex: '6',
    width: 100,
  },
  {
    title: '操作',
    width: 200,
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    Logs,
    CustomProperty,
    AdvancedQuery2,
    CustomColumn,
    AddEditComponent,
    Import,
    AddByRequest,
  },
  data() {
    return {
      dayjs,
      customVisible: false,
      exportLoading: false,
      editKey: 100000,
      data: [],
      detailData: [],
      tableColumns: defaultColumns,
      customFields: [],
      search: {
        orderBy: '',
        order: '',
      },
      queryForm: {},
      spinning: false,
      page: 1,
      size: 10,
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.size = size
          this.page = 1
          this.getData()
        },
      },
      selectedRowKeys: [],
      scrollHeight: 500,
      $types: ['采购', '自配', '自配直接使用', '领用返还'],
      CAIGOU: '采购',
      ZIPEI: '自配',
      // 状态
      STATUS_CREATE: '创建中',
      STATUS_INSTOCK: '已入库',
      STATUS_GET: '已领取',
    }
  },
  computed: {
    rowSelection() {
      return {
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        },
      }
    },
  },
  created() {
    this.scrollHeight = (window.innerHeight || document.body.clientHeight) - 220
    this.initFun()
  },
  methods: {
    onPrint(record) {
      const UDRPrint = new IlisPrintUdr()
      UDRPrint.commonPrint([record.id], 'ChemicalInletAcceptance')
    },
    addByRequest() {
      this.$refs.AddByRequestRef.open()
    },
    customOk() {
      this.customVisible = false
    },
    columnScreen() {
      this.$refs.CustomColumn.showModal(
        'chemicalInventoryIn',
        '自定义列配置',
        false,
      )
    },
    handleChange(info) {
      if (info.file.status !== 'uploading') { /* empty */ }
      if (info.file.status === 'done') {
        const res = info.file.response
        if (res.code === 20000 && res.succeed) {
          window.$oAntdMessage.success('导入成功')
          this.getData()
        }
        else {
          res.data.failRows.forEach((it) => {
            window.$oAntdModal.warning(window.$oMsgTips.info(it.failReason))
          })
        }
      }
      else if (info.file.status === 'error') {
        window.$oAntdModal.warning(window.$oMsgTips.info(`${info.file.name} 文件上传失败`))
      }
    },
    async initFun() {
      await this.getColumn()
      await this.getData()
    },
    // 获取自定义列
    async getColumn() {
      const apiUrl = `${window.$oApi.customColumn.getSelectColumns}?type=chemicalInventoryIn`
      try {
        const res = await window.$oAjax.get(apiUrl)
        if (res.code !== 20000 || res.data.length === 0) {
          window.$oAntdMessage.warning(res.message || res.msg || '获取自定义列失败')
          return
        }
        const list = []
        for (let i = 0; i < res.data.length; i++) {
          const item = res.data[i]
          item.title = item.columnName
          item.key = item.columnKey
          item.dataIndex = item.columnKey
          item.width = 100
          if (item.columnKey === 'inventoryStatus') {
            item.fixed = 'left'
            item.width = 80
            list.unshift(item)
            continue
          }
          if (['allowChangeContainer'].includes(item.columnKey)) {
            item.scopedSlots = { customRender: item.columnKey }
          }
          list.push(item)
        }
        list.push({
          title: '操作',
          key: 'operation',
          width: 200,
          fixed: 'right',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
        })
        this.tableColumns = list
      }
      catch (err) {
        window.$oAntdMessage.warning(err.message || err.msg || '获取自定义列异常')
      }
    },
    getData(flag) {
      this.spinning = true
      if (flag) {
        this.page = 1
      }
      const { page, size } = this
      const params = {
        page,
        size,
        ...this.search,
        ...this.queryForm,
      }
      storageInPageList(params)
        .then((res) => {
          if (res.code === 20000) {
            const list = res.data.rows
            for (let i = 0; i < list.length; i++) {
              const customField = list[i].customValues || []
              if (!customField || customField.length === 0)
                continue
              customField.forEach((d) => {
                list[i][d.columnId] = d.columnValue
              })
            }
            this.data = list
            this.pagination.total = res.data.count || 0
            this.pagination.current = page
            this.pagination.pageSize = size
          }
          else {
            this.data = []
          }
          this.spinning = false
        })
        .catch(() => {
          this.spinning = false
        })
    },
    // 查询
    handleSearch() {
      // this.queryForm = {}
      this.getData(true)
    },
    advancedOpen() {
      this.$refs.advancedQueryRef.showModal()
    },
    // 高级查询
    advancedQueryCB(data) {
      this.queryForm = { ...data }
      this.page = 1
      this.getData()
    },
    // 表格斑马线
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 获取自定义字段
    getCustomFields(flag) {
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: 'equipBuyPlanEdit',
          },
        })
        .then((res) => {
          this.customFields = res.data || []
          this.getData(flag)
        })
    },
    // 导入
    importFun() {
      this.$refs.import.openModal()
    },
    // 导出
    exportData() {
      this.exportLoading = true
      storageInExport(this.search)
        .then((res) => {
          const blob = new Blob([res])
          const href = window.URL.createObjectURL(blob)
          const dateTime = formatTime(new Date(), 'YYYY-MM-DD')
          downloadFile(href, `化学品入库记录 ${dateTime}.xlsx`)
          this.exportLoading = false
        })
        .catch(() => {
          this.exportLoading = false
        })
    },
    // 新增、编辑、查看
    addEditRow(title, recordId) {
      const isDetail = title === '查看'
      this.editKey++
      window.$oNextTick(() => {
        this.$refs.addEditRef.openModel(title, recordId, isDetail)
      })
    },
    handleOk() {
      this.$refs.AddEditComponent.handleOk()
    },
    handleCancel() {
      this.$refs.AddEditComponent.handleCancel()
    },
    deleteRow(e, record) {
      e.stopPropagation()
      e.preventDefault()
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确定要删除吗?',
        onOk() {
          self.spinning = true
          storageInDelete(record.id)
            .then((res) => {
              self.spinning = false
              if (res.code === 20000) {
                window.$oAntdMessage.success('删除成功')
                self.getData()
              }
              else {
                window.$oAntdMessage.error(res.message)
              }
            })
            .catch(() => {
              self.spinning = false
            })
        },
        onCancel() {},
      })
    },
    // 查看日志
    viewLog(e, data) {
      this.$refs.Logs.showModal(data.id, '11')
    },
  },
}
</script>

<style lang="less" scoped>
.btns {
  padding: 10px 0;
  .ant-btn {
    margin-right: 5px;
  }
}
.ant-form-item-control {
  .ant-btn {
    margin-right: 10px;
  }
}
.more-header {
  padding: 8px;
  border-bottom: 1px dashed;
  margin-bottom: 10px;
  color: var(--colorPrimary);
}
:deep(.ant-pagination) {
  margin-bottom: 0;
}
</style>
