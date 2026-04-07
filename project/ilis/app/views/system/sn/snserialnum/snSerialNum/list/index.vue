<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div class="mb-3">
          <a-button
            type="primary"
            style="vertical-align: middle"

            @click="add"
          >
            新增
          </a-button>
        </div>
        <a-table
          :columns="columns"
          :data-source="dataSource"
          bordered
          :pagination="false"
          :row-class-name="rowClassName"
          row-key="uid"
          :custom-row="customRow"
          :scroll="{ y: 'calc(100vh - 120px)' }"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="editCol.includes(column.dataIndex)">
              <div>
                <a-input
                  style="margin: -5px 0"
                  :value="text"
                  :placeholder="dataPlaceholder[column.dataIndex]"
                  @change="(e) => handleChange(e.target.value, record.uid, column.dataIndex)"
                />
              </div>
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <div class="table-handle">
                <a-button type="link" @click="getSnNum(record)">
                  获取流水号
                </a-button>
                <a-button type="link" danger @click="deleteData(record)">
                  删除
                </a-button>
              </div>
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
    title: '操作',
    dataIndex: 'operation',
    width: '15%',
    align: 'center',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {},
  data() {
    return {
      spinning: false,
      dataSource: [],
      dataSourceOrg: {},
      dataPlaceholder: {},
      modelId: getQueryVariable('modelId') || '',
      editCol: [],
      columns: [],
      defaultSample: '',
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
                this.selectedRowKeys.push(record.id)
                this.selectedRows.push(record)
              }
            }
          },
        }
      },
    }
  },
  computed: {},

  mounted() {
    window.GetResult = this.save
  },
  created() {
    this.getData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.snSerialNum.list,
        method: 'post',
        data: window.$oQs.stringify({
          snModelId: this.modelId,
        }),
      }).then((res) => {
        if (res.code === 20000) {
          const uid = new Date().getTime()
          const dataObj = { uid, serialNumber: '' }
          const columnsChild = []
          // eslint-disable-next-line array-callback-return
          res.data.map((item) => {
            const columnsObj = {
              title: item.columnName,
              colSpan: 0,
              dataIndex:
                item.type === 'TermSerialNumber' ? 'serialTitle' : item.id,
            }
            if (item.type === 'TermSerialNumber') {
              dataObj.serialTitle = item.termValue
              this.dataSourceOrg.serialTitle = item.termValue
              this.editCol.push('serialNumber')
            }
            else {
              if (item.isAssociateSequence === 'N') {
                dataObj[item.id] = item.termValue
                this.dataSourceOrg[item.id] = item.termValue
              }
              else {
                dataObj[item.id] = ''
                this.dataSourceOrg[item.id] = ''
                this.dataPlaceholder[item.id] = item.columnName
                columnsObj.scopedSlots = { customRender: item.id }
                this.editCol.push(item.id)
              }
            }
            columnsChild.push(columnsObj)
          })
          this.columns = [
            {
              title: '格式项',
              dataIndex: 'type',
              children: columnsChild,
              colSpan: columnsChild.length,
            },
            {
              title: '起始流水号',
              dataIndex: 'serialNumber',
              scopedSlots: { customRender: 'serialNumber' },
            },
            ...columns,
          ]
          this.editCol.push('serialNumber')
          this.dataSource = [{ ...dataObj }]
          this.spinning = false
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
        }
        this.spinning = false
      })
    },
    // 新增
    add() {
      const uid = new Date().getTime()
      const newObj = { ...this.dataSourceOrg }
      this.dataSource.push({
        ...newObj,
        uid,
        serialNumber: '',
      })
    },
    saveData(record, modelId) {
      const tSnTerms = []
      for (const key in record) {
        if (key !== 'serialNumber' && this.editCol.includes(key)) {
          const obj = { id: key, termValue: record[key] }
          if (modelId) {
            obj.modelId = modelId
          }
          tSnTerms.push(obj)
        }
      }
      return tSnTerms
    },
    // 获取流水号
    getSnNum(record) {
      const obj = {
        snModelId: this.modelId,
        tSnTerms: [],
      }
      obj.tSnTerms = this.saveData(record)
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.snSerialNum.getSnNum,
        data: obj,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          const value = res.data ? res.data : '无使用记录'
          this.handleChange(value, record.uid, 'serialTitle')
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    // 删除
    deleteData(record) {
      const uuid_ = record.uid
      if (uuid_) {
        const data = [...this.dataSource]
        this.dataSource = data.filter(item => item.uid !== uuid_)
      }
    },
    handleChange(value, uid, column) {
      const newData = [...this.dataSource]
      const target = newData.filter(item => uid === item.uid)[0]
      if (target) {
        target[column] = value
        this.dataSource = newData
      }
    },
    save(layerI, successFunc) {
      const dataArr = []
      for (let i = 0; i < this.dataSource.length; i++) {
        const obj = {
          snModelId: this.modelId,
          serialNumber: this.dataSource[i].serialNumber,
          tSnTerms: [],
        }
        obj.tSnTerms = this.saveData(this.dataSource[i], this.modelId)
        dataArr.push(obj)
      }
      this.spinning = true
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.snSerialNum.setSnNum,
        data: dataArr,
        timeout: 60 * 1000,
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')

          successFunc && successFunc(layerI, res)
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
