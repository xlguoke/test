<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div
          style="
            margin: 5px 0;
            padding: 5px 0;
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
          "
        >
          <a-button type="primary" @click="(e) => addEditRow(e, '', false)">
            批量设置检测部门
          </a-button>
        </div>
        <a-table
          id="tableBox"
          :row-selection="rowSelection"
          :columns="columns"
          :pagination="dataSource.length > 0 ? pagination : false"
          :data-source="dataSource"
          bordered
          :custom-row="customRow"
          row-key="id"
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'department'">
              <span>
                <a-input type="text" :value="text || ''">
                  <template #suffix>
                    <a-tooltip @click="(e) => delRow(e, record)">
                      <CloseOutlined
                        style="color: #aaa; font-size: 12px; margin-right: 0"
                      />
                    </a-tooltip>
                  </template>
                  <template #addonAfter>
                    <a-tooltip @click="(e) => addEditRow(e, record, true)">
                      选择
                    </a-tooltip>
                  </template>
                </a-input>
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
    <ht-modal
      :title="addEditTitle"
      centered
      :open="visible"
      :mask-closable="false"
      width="600px"
      @cancel="handleCancel"
    >
      <Add ref="Add" :callback="getDepartment" />
      <template #footer>
        <div>
          <a-button @click="handleCancel">
            取消
          </a-button>
          <a-button type="primary" @click="handleOk">
            确定
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import { CloseOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import Add from './components/addEdit.vue'

const columns = [
  {
    title: '委托编号',
    dataIndex: 'consignCode',
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
  },
  {
    title: '样品名称',
    dataIndex: 'sampleName',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
  },
  {
    title: '检测参数',
    dataIndex: 'testParams',
  },
  {
    title: '检测部门',
    dataIndex: 'department',
    scopedSlots: { customRender: 'department' },
  },
]

export default {
  components: {
    Add,
    CloseOutlined,
  },
  props: ['pConsignIds'],
  data() {
    return {
      dayjs,
      visible: false,
      dataSource: [],
      columns,
      spinning: false,
      queryParam: null,
      page: 1,
      size: 10,
      addEditTitle: '',
      acceptData: [],
      consignIds: getQueryVariable('consignIds') || '297e1e297640716a0176422c2ed3017a',
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
      selectedRows: [],
      customRow: (record) => {
        return {
          onClick: () => {
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
              this.selectedRowKeys.push(record.id)
              this.selectedRows.push(record)
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
        // type: this.selectPage,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  created() {
    this.getData()
  },
  mounted() {
    // 将GetResult方法绑定到window下面，提供给外部调用\
    window.GetResult = (layerI, successFunc) => {
      successFunc(layerI, [])
    }
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData(flag) {
      // eslint-disable-next-line ts/no-unused-expressions
      flag ? (this.page = 1) : ''
      const { page, size } = this
      // eslint-disable-next-line unused-imports/no-unused-vars
      const params = {
        page,
        rows: size,
        ...this.queryParam,
      }
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.taskAllocationDepartment.getConsignDistribute,
        method: 'get',
        params: { consignIds: this.pConsignIds || this.consignIds },
      }).then((res) => {
        this.selectedRowKeys = []
        this.selectedRows = []
        if (res.code === 20000) {
          this.dataSource = res.data
          // this.pagination.total = res.total || 0;
          this.pagination.current = page
          this.pagination.pageSize = size
        }
        else {
          this.dataSource = []
        }
        this.spinning = false
      })
    },
    getDepartment(idsPerson, acceptData) {
      // if (acceptData.length>0) {
      const idArr = idsPerson.split(',')
      let data = []
      if (acceptData.length > 0) {
        data = idArr.map((item) => {
          return {
            objectId: item,
            departmentId: acceptData[0].id,
            department: acceptData[0].name,
          }
        })
      }
      else {
        data = idArr.map((item) => {
          return {
            objectId: item,
          }
        })
      }

      this.spinning = true
      window.$oAjax({
        url: window.$oApi.taskAllocationDepartment.setDepartments,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        data,
      }).then((res) => {
        this.selectedRowKeys = []
        this.selectedRows = []
        if (res.code === 20000) {
          const msg = acceptData.length === 0 ? '删除成功' : '修改成功'
          window.$oAntdMessage.success(msg)
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
      // }
      this.visible = false
    },
    addEditRow(e, record, isRow) {
      let idsPerson = ''
      let acceptData = []
      if (isRow) {
        idsPerson = record.id
        this.addEditTitle = '选择检测部门'
        acceptData = [
          {
            id: record.departmentId,
            name: record.department,
          },
        ]
      }
      else {
        if (this.selectedRowKeys.length === 0) {
          window.$oAntdModal.warning(window.$oMsgTips.info('请先选择数据'))
          return
        }
        idsPerson = this.selectedRowKeys.join(',')
        this.addEditTitle = '批量设置检测部门'
      }
      this.visible = true
      window.$oNextTick(() => {
        this.$refs.Add.showModal(
          'radio',
          idsPerson,
          JSON.parse(JSON.stringify(acceptData)),
        )
      })
    },
    delRow(e, record) {
      e.stopPropagation()
      e.preventDefault()
      this.getDepartment(record.id, [])
    },
    handleOk() {
      this.$refs.Add.handleOk()
    },
    handleCancel() {
      this.visible = false
      this.$refs.Add.handleCancel()
    },
  },
}
</script>

<style lang="less">
.container-search-all {
  width: 400px;
  margin-right: 5px;
  .ant-table-thead {
    .ant-checkbox {
      display: none;
    }
  }
}
.more-header {
  padding: 8px;
  border-bottom: 1px dashed;
  margin-bottom: 10px;
  color: var(--colorPrimary);
}
@import './index.less';
</style>
