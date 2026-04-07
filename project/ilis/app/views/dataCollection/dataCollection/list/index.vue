<template>
  <BaseSpinWrapper :spinning="spinning">
    <div class="dataCollection-search">
      <div v-if="allSearch">
        <a-form ref="formRef" :model="formState">
          <a-form-item
            label="主题类型"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-select
              v-model:value="formState.themeType"
              placeholder="请选择主题类型"
            >
              <a-select-option value="undefined">
                全部
              </a-select-option>
              <a-select-option
                v-for="(item, index) in type"
                :key="index"
                :value="item.typename"
              >
                {{ item.typename }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="主题名称"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.queryParam"
              placeholder="请输入主题名称"
            />
          </a-form-item>
          <a-form-item
            label="启动日期"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-range-picker v-model:value="formState.stamp" value-format="YYYY-MM-DD" />
          </a-form-item>
          <a-form-item
            label="状态"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-select
              v-model:value="formState.themeStatus"
              placeholder="请选择状态"
            >
              <a-select-option value="2">
                全部
              </a-select-option>
              <a-select-option
                v-for="(item, index) in themeStatusData"
                :key="index"
                :value="item.value"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="是否完成"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-radio-group v-model:value="formState.complete" name="radioGroup">
              <a-radio :value="undefined">
                全部
              </a-radio>
              <a-radio :value="true">
                已完成
              </a-radio>
              <a-radio :value="false">
                未完成
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item
            label="是否有超期未上报"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-radio-group v-model:value="formState.overdue" name="radioGroup">
              <a-radio :value="undefined">
                全部
              </a-radio>
              <a-radio :value="true">
                有
              </a-radio>
              <a-radio :value="false">
                否
              </a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item
            label="负责人名称"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 10 }"
          >
            <a-input
              v-model:value="formState.chargeName"
              placeholder="请输入负责人名称"
            />
          </a-form-item>
          <a-form-item :wrapper-col="{ span: 20, offset: 3 }">
            <a-button type="primary" @click="search(true)">
              查询
            </a-button>
            <a-button
              @click="
                () => {
                  searchType(false)
                }
              "
            >
              切换普通查询
            </a-button>
            <a-button
              @click="
                () => {
                  formState = {}
                  queryParams = {}
                  getData()
                }
              "
            >
              重置
            </a-button>
          </a-form-item>
        </a-form>
      </div>
      <div v-else>
        <a-space>
          <a-input
            v-model:value="queryParam"
            placeholder="请输入主题名称"
            class="dataCollection-search-all"
            @press-enter="search(true)"
          />
          <a-button type="primary" @click="search(true)">
            查询
          </a-button>
          <a-button
            @click="
              () => {
                searchType(true)
              }
            "
          >
            切换高级查询
          </a-button>
        </a-space>
      </div>
    </div>

    <HtButtonGroup>
      <a-button type="primary" @click="openModal('add')">
        新增
      </a-button>
      <a-button @click="openModal('edit')">
        编辑
      </a-button>
      <a-button @click="deleteRow()">
        删除
      </a-button>
      <a-button @click="end()">
        结束主题
      </a-button>
      <a-button
        v-permission="'dataCollectionCustomize'"

        @click="() => (propertyProfileVisible = true)"
      >
        主题信息项配置
      </a-button>
      <a-button @click="setQuoteType">
        引用类型配置
      </a-button>
    </HtButtonGroup>

    <a-table
      v-if="data.length > 0"
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      :row-class-name="rowClassName"
      bordered
      :pagination="pagination"
      row-key="id"
      :custom-row="customRow"
      :scroll="{ x: 1200 }"
      @change="sorterChange"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'pendingContent'">
          <div
            :title="text"
            style="
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
              "
          >
            {{ text }}
          </div>
        </template>
        <template v-if="column.dataIndex === 'isComplete'">
          <span v-if="text === '已完成'" style="color: green">
            <span
              class="dataCollection-ball"
              style="background: green"
            ></span>
            {{ text }}
          </span>
          <span v-else-if="text === '未设置周期'" style="color: gray">
            <span class="dataCollection-ball" style="background: gray"></span>
            {{ text }}
          </span>
          <span v-else-if="text === '未完成'" style="color: red">
            <span class="dataCollection-ball" style="background: red"></span>
            {{ text }}
          </span>
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <a href="javascript:" @click="openConfig(record.id)">配置</a>
            <a href="javascript:" @click="viewDetail(record.id)">查看</a>
          </div>
        </template>
      </template>
    </a-table>

    <AddModal
      ref="AddModal"
      :modal-type="modalType"
      :callback="search"
      :type="type"
    />
    <ht-modal
      v-model:open="propertyProfileVisible"
      title="主题信息项配置"
      :mask-closable="false"
      @ok="handleProfile"
    >
      <CustomProperty customize-type="data-collection-property" />
    </ht-modal>
    <DetailComponent />
    <ConfigComponent
      ref="ConfigComponent"
      :add-node="addNode"
      :get-data="search"
    />
    <AddNode ref="AddNode" :callback="openConfig" />
    <QuoteType ref="QuoteType" :callback="openConfig" />
  </BaseSpinWrapper>
</template>

<script>
import qs from 'qs'
import { useTableHeight } from '~/hooks/useTableHeight'
import { formatTime } from '~/providers/common/utils'
import CustomProperty from '~/providers/components/CustomProperty.vue'
import AddModal from './components/addModal.vue'
import AddNode from './components/addNode.vue'
import ConfigComponent from './components/config.vue'
import DetailComponent from './components/detail.vue'
import QuoteType from './components/quoteType.vue'

// eslint-disable-next-line unused-imports/no-unused-vars
const baseColumns = [
  {
    title: '主题类型',
    dataIndex: 'themeType',
    width: '15%',
  },
  {
    title: '主题名称',
    dataIndex: 'themeName',
    width: '15%',
  },
  {
    title: '状态',
    dataIndex: 'themeStatus',
    width: '10%',
    customRender: ({ text }) => {
      return text === '1' ? '结束' : '进行中'
    },
  },
  {
    title: '启动日期',
    dataIndex: 'startDate',
    width: '10%',
    customRender: ({ text }) => {
      return text ? formatTime(text, 'YYYY-MM-DD') : ''
    },
  },
  {
    title: '本阶段是否已完成',
    dataIndex: 'isComplete',
    width: '14%',
    scopedSlots: { customRender: 'isComplete' },
  },
  {
    title: '是否有超期未上报',
    dataIndex: 'isOverdue',
    width: '14%',
  },
  {
    title: '负责人',
    dataIndex: 'chargeName',
    width: '10%',
  },
  {
    title: '创建人',
    dataIndex: 'createName',
    width: '10%',
  },
]

export default {
  components: {
    AddModal,
    DetailComponent,
    ConfigComponent,
    AddNode,
    QuoteType,
    CustomProperty,
  },
  setup() {
    const { tableBoxRef, tableHeight } = useTableHeight()

    return {
      tableBoxRef,
      tableHeight,
    }
  },
  data() {
    return {
      modalType: 'add',
      data: [],
      columns: [],
      configVisible: false,
      queryParam: '',
      formLayout: 'horizontal',

      allSearch: false,
      spinning: false,
      page: 1,
      size: 10,
      type: [],
      queryParams: {},
      sortedInfo: null,
      selectedRowKeys: [],
      selectedRows: [],
      customFields: [],
      fields: [
        { title: '主题类型', dataIndex: 'themeType', sorter: true, width: 100 },
        { title: '主题名称', dataIndex: 'themeName', sorter: true, width: 150 },
        { title: '状态', dataIndex: 'themeStatus', sorter: true, width: 80 },
        { title: '启动日期', dataIndex: 'startDate', sorter: true, width: 100 },
        {
          title: '本阶段需要上报的资料',
          dataIndex: 'pendingContent',
          scopedSlots: { customRender: 'pendingContent' },
          width: 180,
        },
        { title: '本阶段是否已完成', dataIndex: 'isComplete', sorter: true, width: 150 },
        { title: '是否有超期未上报', dataIndex: 'isOverdue', sorter: true, width: 150 },
        { title: '部门负责人', dataIndex: 'chargeName', width: 100 },
        { title: '创建人', dataIndex: 'createName', width: 100 },
      ],
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
      },
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.id]
            this.selectedRows = [record]
          },
        }
      },
      themeStatusData: [
        { name: '进行中', value: '0' },
        { name: '已结束', value: '1' },
      ],
      propertyProfileVisible: false,
      formState: {},
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
    this.getTypeData()
    this.getCustomFields()
    // this.getData();
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    sorterChange(pagination, filters, sorter) {
      if (sorter) {
        const sorterObj = { ascend: 'asc', descend: 'desc' }
        const tableItemI = this.fields.findIndex(
          item => item.dataIndex === sorter.field,
        )
        const data = {
          orderBy: sorterObj[sorter.order] || '',
        }
        if (tableItemI > -1) {
          data.order = data.orderBy ? sorter.field : ''
        }
        else {
          data.orderColumnId = data.orderBy ? sorter.field : ''
        }
        this.sortedInfo = data
        this.getData()
      }
    },
    getTypeData() {
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictionaryData,
        data: qs.stringify({ dictGroupId: '402882846e7c792d016e7c8606340005' }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          this.type = res.obj
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    getCustomFields(flag) {
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: 'data-collection-property',
          },
        })
        .then((res) => {
          this.customFields = res.data || []
          this.getData(flag)
        })
    },
    getData(flag) {
      if (flag) {
        this.page = 1
      }
      const { page, size, queryParams } = this
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.dataCollection.list, {
          params: {
            page,
            size,
            themeStatus: 2,
            // ...data,
            ...queryParams,
            ...this.sortedInfo,
          },
        })
        .then((res) => {
          if (res.success) {
            this.columns = this.fields.map((item) => {
              const _item = {
                title: item.title,
                dataIndex: item.dataIndex,
                width: item.width || 120,
              }
              if (item.sorter) {
                _item.sorter = item.sorter
              }
              if (item.dataIndex === 'startDate') {
                _item.customRender = ({ text }) =>
                  text ? formatTime(text, 'YYYY-MM-DD') : ''
              }
              if (item.dataIndex === 'pendingContent') {
                _item.scopedSlots = item.scopedSlots
              }
              if (item.dataIndex === 'themeStatus') {
                _item.customRender = ({ text }) => {
                  if (text === '1') {
                    return '结束'
                  }
                  else {
                    return '进行中'
                  }
                }
              }
              return _item
            })
            // eslint-disable-next-line array-callback-return
            this.customFields.map((item) => {
              this.columns.push({
                title: item.columnName,
                dataIndex: item.id,
                sorter: true,
                width: 120,
              })
            })
            this.columns.push({
              title: '操作',
              dataIndex: 'operation',
              width: 150,
              fixed: 'right',
              scopedSlots: { customRender: 'operation' },
            })

            this.data = res.obj.rows
            // eslint-disable-next-line array-callback-return
            this.data.map((data) => {
              if (
                data.customizeValueEntities
                && data.customizeValueEntities.length > 0
              ) {
                // eslint-disable-next-line array-callback-return
                data.customizeValueEntities.map((item) => {
                  data[item.columnId] = item.columnValue
                })
              }
              if (
                this.selectedRowKeys.length > 0
                && this.selectedRowKeys[0] === data.id
              ) {
                this.selectedRows = [data]
              }
            })
            this.pagination.total = res.obj.count
            this.pagination.current = page
            this.pagination.pageSize = size
          }
          this.spinning = false
        })
    },
    // 搜索
    async search(flag) {
      if (flag) {
        this.page = 1
      }
      let data = {}
      if (this.allSearch) {
        await this.$refs.formRef.validateFields().then(() => {
          const values = { ...this.formState }
          let stamp = []
          if (values.stamp && Array.isArray(values.stamp)) {
            stamp = values.stamp.map((item, index) => {
              let time = item
              if (index === 0) {
                time = `${time} 00:00:00`
              }
              else {
                time = `${time} 23:59:59`
              }
              // return new Date(time).getTime()
              return time
            })
          }

          data = {
            ...values,
          }

          if (stamp.length === 2) {
            data.startDateBegin = stamp[0]
            data.startDateEnd = stamp[1]
          }

          if (data.themeType === 'undefined') {
            delete data.themeType
          }
          data.themeStatus = data.themeStatus || 2

          delete data.stamp
        })
      }
      else {
        data.queryParam = this.queryParam.trim()
      }
      this.queryParams = data
      this.getCustomFields(data)
    },
    // 切换搜索类型
    searchType(bool) {
      this.allSearch = bool
    },
    // 删除
    deleteRow() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择一条数据'))
        return
      }

      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除这条数据吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.spinning = true
          window.$oAjax({
            method: 'get',
            url: window.$oApi.dataCollection.delete,
            params: {
              id: this.selectedRowKeys[0],
            },
          }).then((res) => {
            if (res.success) {
              window.$oAntdMessage.success(res.message || res.msg || '操作成功')
              this.selectedRows = []
              this.selectedRowKeys = []
              this.page = 1
              this.getData()
              this.spinning = false
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              this.spinning = false
            }
          })
        },
      })
    },
    openModal(type) {
      if (type === 'edit') {
        if (this.selectedRowKeys.length === 0) {
          window.$oAntdModal.warning(window.$oMsgTips.info('请选择一条数据'))
          return
        }
        this.modalType = type
        // this.$refs.AddModal.showModal(this.selectedRowKeys[0]);
        this.$refs.AddModal.showModal(this.selectedRows)
        return
      }
      this.modalType = type
      this.$refs.AddModal.showModal()
    },
    setting() {
      this.$refs.CustomInfo.showModal()
    },
    setQuoteType() {
      this.$refs.QuoteType.showModal()
    },
    getQuoteType() {

    },
    // 结束主题
    end() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择一条数据'))
        return
      }
      window.$oAntdConfirm({
        title: '结束主题',
        content: `确认结束主题吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.spinning = true
          window.$oAjax({
            method: 'get',
            url: window.$oApi.dataCollection.end,
            params: {
              id: this.selectedRowKeys[0],
            },
          }).then((res) => {
            if (res.success) {
              window.$oAntdMessage.success(res.message || res.msg || '操作成功')
              this.page = 1
              this.getData()
              this.spinning = false
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              this.spinning = false
            }
          })
        },
      })
    },
    viewDetail(id) {
      this.$refs.ConfigComponent.showModal(id, 'detail')
    },
    openConfig(id) {
      this.$refs.ConfigComponent.showModal(id)
    },
    addNode(id, type, data, editId, beforeNodeDate, nextNodeDate) {
      this.$refs.AddNode.showModal(
        id,
        type,
        data,
        editId,
        beforeNodeDate,
        nextNodeDate,
      )
    },
    handleProfile() {
      this.propertyProfileVisible = false
      this.getCustomFields(true)
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
