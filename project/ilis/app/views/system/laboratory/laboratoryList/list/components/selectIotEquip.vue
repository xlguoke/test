<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="选择设备"
      centered
      :force-render="true"
      :mask-closable="false"
      width="600px"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div class="min-h-[50vh]">
        <a-space class="mb-2">
          <a-input v-model:value.trim="searchValue" placeholder="请输入设备名称查询" @keypress.enter="handleSearch" />
          <a-button type="primary" @click="handleSearch">
            查询
          </a-button>
        </a-space>
        <a-table
          id="tableBox"
          :columns="columns"
          :data-source="data"
          :loading="loading"
          bordered
          :custom-row="customRow"
          :row-selection="rowSelection"
          row-key="rowKey"
          :row-class-name="rowClassName"
          :pagination="false"
          :scroll="{ y: 420 }"
        />
      </div>
    </ht-modal>
  </div>
</template>

<script>
const columns = [
  {
    title: '设备名称',
    dataIndex: 'toName',
  },
  {
    title: '设备编号',
    dataIndex: 'sn',
  },
  {
    title: '设备类别',
    dataIndex: 'type',
  },
]

export default {
  props: ['callback'],
  data() {
    return {
      data: [],
      originData: [],
      visible: false,
      columns,
      selectPage: 'radio', // 单选或者多选
      selectedRowKeys: [],
      selectedRows: [],
      loading: false,
      searchValue: '',
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectPage === 'radio') {
              this.selectedRowKeys = [record.rowKey]
              this.selectedRows = [record]
            }
            else {
              if (this.selectedRowKeys.includes(record.rowKey)) {
                const arr = this.selectedRowKeys
                arr.splice(
                  arr.findIndex(item => item === record.rowKey),
                  1,
                )
                this.selectedRows = this.selectedRows.filter(
                  item => item.rowKey !== record.rowKey,
                )
              }
              else {
                if (!record.children) {
                  this.selectedRowKeys.push(record.rowKey)
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
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    handleOk() {
      this.callback(this.selectedRows)
      this.handleCancel()
    },
    handleCancel() {
      this.visible = false
      this.data = []
      this.selectedRows = []
      this.selectedRowKeys = []
    },
    handleSearch() {
      if (!this.searchValue) {
        this.data = this.originData
      }
      else {
        const val = this.searchValue.toLocaleLowerCase()
        this.data = this.originData.filter((item) => {
          return item.toName.toLocaleLowerCase().includes(val)
        })
      }
    },
    /**
     * 打开弹窗
     * @param type 选择类型 checkbox 或 radio，默认为 radio
     * @param acceptData 已选数据
     * @param iotEqId 物联网系统房间id
     * @param iotEqType 物联网系统房间类型 1- 非调养箱 2-调养箱，默认为1
     */
    showModal(type, acceptData, iotEqId, iotEqType = 1) {
      this.selectPage = type || 'radio'
      this.selectedRows = acceptData || []
      this.selectedRowKeys = this.selectedRows.map(item => item.id)
      this.getData(iotEqId, iotEqType)
      this.visible = true
    },
    getData(iotEqId, iotEqType) {
      this.loading = true
      window.$oAjax({
        url: `rest/eq/iots/env/${iotEqId}`,
      }).then((res) => {
        let list = res.data || []
        if (iotEqType === 1) {
          list = list.filter(d => d.type !== '调养箱')
        }
        else if (iotEqType === 2) {
          list = list.filter(d => d.type === '调养箱')
        }
        this.data = list.map(item => ({
          ...item,
          sn: item?.additionalInfo?.code,
          rowKey: item.to.id,
        }))
        this.originData = JSON.parse(JSON.stringify(this.data))
        this.loading = false
      })
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
.content-table {
  height: 400px;
  overflow-y: auto;
}
</style>
