<!-- eslint-disable vue/valid-v-for -->
<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="选择设备"
      centered
      :force-render="true"
      :mask-closable="false"
      width="80%"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content select-allot-eq">
          <a-form layout="inline">
            <a-form-item label="申领状态">
              <a-select
                v-model:value="queryParams.transferApplyStatus"
                placeholder="请选择申领状态"
                allow-clear
                style="width: 140px"
              >
                <a-select-option v-for="(k, v) in APPLY_STATUS" :value="v">
                  {{
                    k
                  }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="所在位置">
              <a-cascader
                v-model:value="serveLocationIds"
                :options="serveLocationDatas"
                :field-names="{
                  label: 'name',
                  value: 'id',
                  children: 'children',
                }"
                allow-clear
                style="width: 240px"
                placeholder="请选择所在位置"
                change-on-select
                :display-render="displayRender"
              ></a-cascader>
            </a-form-item>
            <a-form-item label="预计归还日期">
              <a-range-picker
                v-model:value="queryParams.transferDate"
                value-format="YYYY-MM-DD"
                style="width: 180px"
              />
            </a-form-item>
            <a-form-item>
              <a-input
                v-model:value="queryParams.quickQryParam"
                placeholder="请输入设备名称、编号、规格型号后回车即可查询"
                style="width: 300px"
                @keypress.enter="handleSearch"
              />
            </a-form-item>
            <a-form-item>
              <a-button type="primary" @click="handleSearch()">
                查询
              </a-button>
              <a-button class="toolBtn-bar" @click="handleReset">
                重置
              </a-button>
            </a-form-item>
          </a-form>
          <a-table
            id="tableBox"
            :key="tableKey"
            :columns="columns"
            :pagination="data.length > 0 ? pagination : false"
            :data-source="data"
            bordered
            :custom-row="customRow"
            :row-selection="rowSelection"
            row-key="id"
            :row-class-name="rowClassName"
            :scroll="{ y: tableHeight, x: 1400 }"
            @change="changeTable"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'applyQuantity'">
                <div @click.stop="() => {}">
                  <a-input-number
                    v-model:value="record.applyQuantity"
                    :max="record.quantity"
                    :min="1"
                    style="width: 100%"
                  />
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  components: {},
  props: ['callback', 'applyType'],
  data() {
    return {
      dayjs,
      data: [],
      tableKey: '',
      visible: false,
      tableHeight: 300,
      columns: [],
      serveLocationIds: [],
      queryParams: {
        transferApplyStatus: '00',
      },
      spinning: false,
      serveLocationDatas: [],
      page: 1,
      rows: 10,
      selectPage: 'radio', // 单选或者多选
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, rows) => {
          this.page = 1
          this.rows = rows
          this.getData()
        },
      },
      sortOrder: {},
      selectedRowKeys: [],
      selectedRows: [],
      acceptData: [],
      // 调拨状态 40:"已安装", 50: "已移交"
      ALLOT_STATUS: { 10: '闲置中', 20: '调拨中', 30: '使用中' },
      // 申领状态
      APPLY_STATUS: {
        '00': '待选取',
        '10': '审核中',
        '20': '待邮寄',
        '30': '待确认',
      },
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectPage === 'radio') {
              this.selectedRowKeys = [record.id]
              this.selectedRows = [record]
            }
            else {
              if (this.selectedRowKeys.includes(record.id)) {
                const arr = this.selectedRowKeys
                arr.splice(
                  arr.findIndex(item => item === record.id),
                  1,
                )
                this.selectedRows = this.selectedRows.filter(
                  item => item.id !== record.id,
                )
              }
              else {
                if (!record.children) {
                  this.selectedRowKeys.push(record.id)
                  this.selectedRows.push(record)
                }
              }
            }
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        type: this.selectPage,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
        getCheckboxProps: record => ({
          props: {
            disabled: !!record.disabled,
          },
        }),
      }
    },
  },
  created() {
    this.tableHeight = (window.innerHeight || window.body.clientHeight) - 350
    this.initColumns()
  },
  methods: {
    initColumns(flag) {
      const columns = [
        {
          title: '序号',
          dataIndex: 'orderNum',
          width: 45,
          fixed: 'left',
          customRender: ({ index }) => index + 1,
        },
        {
          title: '设备名称',
          dataIndex: 'name',
          width: 120,
          fixed: 'left',
        },
        {
          title: '设备编号',
          sorter: true,
          width: 100,
          dataIndex: 'equipmentSn',
        },
        {
          title: '使用人',
          dataIndex: 'userName',
        },
        {
          title: '部门保管人',
          dataIndex: 'keeperName',
        },
        {
          title: '所处位置',
          dataIndex: 'serveLocation',
        },
        {
          title: '预计归还日期',
          dataIndex: 'transferEnd',
          width: 115,
          sorter: true,
          customRender: ({ text }) =>
            text ? dayjs(text).format('YYYY-MM-DD') : '',
        },
        {
          title: '设备数量',
          dataIndex: 'quantity',
        },
        {
          title: '申领数量',
          dataIndex: 'applyQuantity',
        },
        {
          title: '设备状态',
          dataIndex: 'status',
        },
        {
          title: '申领状态',
          dataIndex: 'transferApplyStatus',
          customRender: ({ text }) => this.APPLY_STATUS[text || '00'],
        },
        {
          title: '设备类别',
          dataIndex: 'type',
        },
        {
          title: '规格型号',
          dataIndex: 'standard',
        },
        {
          title: '出厂编号',
          dataIndex: 'factorySn',
        },
        {
          title: '所属部门',
          dataIndex: 'departName',
        },
        {
          title: '量程/精度',
          dataIndex: 'eqRange',
          customRender: ({ record }) => {
            return `${record.eqRange || ''}${
              record.eqRange && record.accuracy ? '/' : ''
            }${record.accuracy || ''}`
          },
        },
        {
          title: '下次检校',
          dataIndex: 'nextCheckDate',
          width: 100,
          sorter: true,
          customRender: ({ text }) =>
            text ? dayjs(text).format('YYYY-MM-DD') : '',
        },
      ]
      if (flag == 1) {
        this.columns = columns
      }
      else {
        this.columns = columns.filter(d => d.dataIndex != 'applyQuantity')
      }
    },
    displayRender({ labels }) {
      const name = labels[labels.length - 1]
      this.queryParams.location = name
      return name
    },
    formatTreeData(data) {
      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          data[i].title = data[i].text
          data[i].value = data[i].id
          data[i].key = data[i].id
          if (data[i].children && data[i].children.length > 0) {
            data[i].children = this.formatTreeData(data[i].children)
          }
        }
      }
      return data
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    handleOk() {
      if (this.selectedRows.length === 0) {
        window.$oAntdMessage.warning('请选择设备')
        return
      }
      let flagMsg = ``
      const ids = this.acceptData.map(d => d.equipmentId)
      for (let i = 0; i < this.selectedRows.length; i++) {
        const item = this.selectedRows[i]
        if (ids.includes(item.id))
          continue
        if (item.transferApplyStatus != '00') {
          flagMsg += `【${item.name}】${
            this.APPLY_STATUS[item.transferApplyStatus] || ''
          };`
        }
      }
      if (flagMsg) {
        window.$oAntdModal.warning(
          window.$oMsgTips.info(
            `只能选择申领状态为待选取的设备，请重新选择：${flagMsg}`,
          ),
        )
        return
      }
      this.callback(this.selectedRows)
    },
    handleCancel() {
      this.clearRows()
      this.visible = false
    },
    /**
     * @param type String 选择类型 checkbox、radio
     * @param acceptData Array 选中的数据集合
     * @param column Boolean 是否展示申请数量列（调拨申请使用）
     */
    showModal(type, acceptData = [], column) {
      this.handleReset()
      this.visible = true
      this.selectPage = type || 'radio'
      this.acceptData = acceptData
      this.selectedRows = acceptData
      this.selectedRowKeys = acceptData.map(d => d.id)

      column && this.initColumns(1)
      this.getLocationData()
    },
    changeTable(pagination, filters, sorter) {
      if (!sorter.field)
        return
      let order = ''
      switch (sorter.order) {
        case 'ascend':
          order = 'asc'
          break
        case 'descend':
          order = 'desc'
          break
        default:
          order = ''
          break
      }
      this.sortOrder = {
        order,
        sort: order ? sorter.field : '',
      }
      this.getData()
    },
    getData() {
      this.selectedRows = []
      this.selectedRowKeys = []
      const { page, rows } = this
      const params = {
        page,
        rows,
        ...this.queryParams,
        ...this.sortOrder,
      }
      if (params.transferDate && params.transferDate.length > 0) {
        params.transferEndDateBegin = params.transferDate[0]
        params.transferEndDateEnd = params.transferDate[1]
      }
      // if (!params.transferStatus || params.transferStatus.length === 0) {
      //   params.transferStatus = "10, 20, 30"
      // } else {
      //   params.transferStatus = params.transferStatus.join(",")
      // }
      if (this.applyType === '设备归还') {
        // 申请类型为设备归还
        params.isReturnEq = 1
      }

      delete params.transferDate
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.equipCommon.equipList,
        params,
      }).then((res) => {
        if (res && res.total > 0) {
          res.rows.forEach((d) => {
            if (!d.quantity)
              d.quantity = 1
            d.applyQuantity = d.quantity
          })
          this.data = res.rows
          setTimeout(() => {
            // 打包后行错位，延迟赋值重置一下
            this.data = res.rows
            this.spinning = false
          }, 200)
          this.pagination.total = res.total || 0
          this.pagination.current = page
          this.pagination.pageSize = rows
        }
        else {
          this.spinning = false
          this.data = []
        }
      })
    },
    // 获取所在位置
    getLocationData() {
      window.$oAjax({
        url: window.$oApi.equipAllotApply.projectOrg,
        method: 'get',
      }).then((res) => {
        let tree = res.data || []
        for (let i = 0; i < tree.length; i++) {
          const d = tree[i]
          if (!d.id)
            d.id = `root${i}`
        }
        if (this.applyType == '设备出库') {
          tree = tree.filter(d => d.name !== '工程项目')
        }
        else if (
          this.applyType == '设备流转'
          || this.applyType == '设备归还'
        ) {
          tree = tree.filter(d => d.name !== '组织机构')
        }
        this.serveLocationDatas = tree
      })
    },
    clearRows() {
      this.selectedRows = []
      this.selectedRowKeys = []
      this.rowSelection.selectedRowKeys = []
    },
    handleReset() {
      this.page = 1
      this.queryParams = {
        transferApplyStatus: '00',
      }
      this.serveLocationIds = []
      this.handleSearch()
    },
    handleSearch() {
      this.page = 1
      this.getData()
      this.clearRows()
    },
  },
}
</script>

<style lang="less" scoped>
.select-allot-eq {
  :deep(.ant-form-item) {
    margin-bottom: 6px;
  }
}
.container-search-all {
  width: 400px;
  margin-right: 5px;
  .ant-table-thead {
    .ant-checkbox {
      display: none;
    }
  }
}
:deep(.ant-table-thead) {
  > tr > th {
    white-space: nowrap;
  }
}
</style>
