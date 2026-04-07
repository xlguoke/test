<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <!-- <a-button @click="printData">okBtn</a-button> -->
        <!-- <div style="padding:10px;text-align: right;color: green;">
            注：标签数量为0或空时，该样品不打印样品标签
          </div> -->
        <a-table
          id="tableBox"
          :columns="columns"
          :pagination="false"
          :data-source="data"
          bordered
          :custom-row="customRow"
          row-key="id"
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a-input-number
                v-if="record.processObjectId"
                type="number"
                :value="record.operation"
                @change="
                  (e) => numberChange(e, record.processObjectId, 'operation')
                "
              />
              <span v-else>需完成委托后才能打印该样品</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

const columns = [
  {
    title: '委托编号',
    dataIndex: 'consignCode',
    width: '25%',
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
    width: '25%',
  },
  {
    title: '样品名称',
    dataIndex: 'testObjectName',
    width: '25%',
  },
  {
    title: '标签数量',
    dataIndex: 'operation',
    width: '25%',
  },
]

export default {
  components: {},
  data() {
    return {
      data: [],
      columns,
      spinning: false,

      queryParam: null,
      consignIds: getQueryVariable('consignIds') || '', // 模块id
      processObjectIds: getQueryVariable('processObjectIds') || '', // 样品id
      page: 1,
      size: 10,
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
              if (!record.children) {
                this.selectedRowKeys.push(record.id)
                this.selectedRows.push(record)
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
        type: 'checkbox',
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
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    top.GetSelAgeSpecimenResult = () => {
      return self.data
    }
  },
  methods: {
    printData() {

    },
    isNumber(value) {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      const reg = /(^\d+$)/
      if (value && !reg.test(value)) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请输入正整数'))
        return false
      }
      return true
    },

    numberChange(value, id, column) {
      if (!this.isNumber(value)) {
        setTimeout(() => {
          this.handleChange('', id, column)
        }, 0)
      }
      else {
        this.handleChange(value, id, column)
      }
    },

    handleChange(value, rowId, column) {
      const newData = [...this.data]
      const target = newData.filter(item => rowId === item.processObjectId)[0]
      if (target) {
        target[column] = value
        this.data = newData
      }
    },

    unSelect(id) {
      this.acceptData = this.acceptData.filter(item => item.id != id)
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size } = this
      const params = {
        consignIds:
            this.consignIds
            || '402882c18bad7f8a018bad9076d2033f,402882c18ba2c82f018ba34ae36f287f',
        // page: 1,
        // size: 999
      }
      if (this.processObjectIds) {
        params.processObjectIds = this.processObjectIds
      }
      this.spinning = true
      window.$oAjax({
        url: 'testObjectController.do?getProcessObjectByConsign',
        method: 'GET',
        params,
      }).then((res) => {
        this.spinning = false
        this.data = []
        if (res.success === false) {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
          return
        }
        if (res.success && res.obj && res.obj.length > 0) {
          this.data = []
          this.data = res.obj.map((item, index) => ({
            ...item,
            index,
          }))
        }

        // this.spinning = false;
        // this.data = [];
        // if (res.code === '20000') {
        //   window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg));
        //   return;
        // }
        // if (res.code && res.data.rows && res.data.rows.length > 0) {
        //   this.data = [];
        //   this.data = res.data.rows.map((item, index) => ({
        //     ...item,
        //     index: index
        //   }));
        //   this.data.sort(function(a,b){
        //     return a.consignCode==b.consignCode?-1:1
        //   });
        // }
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
.more-header {
  padding: 8px;
  border-bottom: 1px dashed;
  margin-bottom: 10px;
  color: var(--colorPrimary);
}
@import './index.less';
</style>
