<template>
  <div>
    <ht-modal
      title="竣工资料上报配置"
      centered
      :open="visible"
      :mask-closable="false"
      class="hitek-add-modal"
      width="80%"
      @cancel="handleCancel"
    >
      <template #footer>
        <div>
          <a-button v-if="!isDetail" @click="handleCancel">
            取消
          </a-button>
          <a-button v-if="!isDetail" type="primary" @click="handleOk">
            确定
          </a-button>
          <a-button v-if="isDetail" type="primary" @click="handleCancel">
            关闭
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-table
            :columns="columns"
            :data-source="dataSource"
            bordered
            :pagination="false"
            row-key="id"
            :row-class-name="rowClassName"
            :scroll="{ y: tableHeight }"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="column.dataIndex === 'contractPartName'">
                <div v-if="record.editable">
                  {{ text }}
                  <PlusCircleOutlined
                    v-if="!isDetail"
                    style="padding-left: 5px"
                    title="选择"
                    @click.stop="setSelContract(text, record.id, 'contractPart')"
                  />
                </div>
                <template v-else>
                  {{ text }}
                </template>
              </template>
              <template v-if="column.dataIndex === 'consignUnitName'">
                <div v-if="record.editable">
                  {{ text }}
                  <PlusCircleOutlined
                    v-if="!isDetail"
                    style="padding-left: 5px"
                    title="选择"
                    @click.stop="
                      setSelConsignUnits(text, record.id, 'consignUnit')
                    "
                  />
                </div>
                <template v-else>
                  {{ text }}
                </template>
              </template>
              <template v-if="column.dataIndex === 'typeCode'">
                <div v-if="record.editable">
                  <a-input
                    style="margin: -5px 0"
                    :value="text"
                    placeholder="请填写对应的类型编码"
                    @change="
                      (e) => handleChange(e.target.value, record.id, 'typeCode')
                    "
                  />
                </div>
                <template v-else>
                  {{ text }}
                </template>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <div class="editable-row-operations">
                  <template v-if="record.editable">
                    <a @click="() => saveRow(record.id)">
                      保存</a>
                    <a-popconfirm
                      title="确定要取消吗?"
                      @confirm="() => cancelRow(record.id, record.uid)"
                    >
                      <a>
                        取消
                      </a>
                    </a-popconfirm>
                  </template>
                  <template v-else>
                    <a
                      :disabled="editingKey !== ''"
                      @click="() => editRow(record.id)"
                    >
                      编辑
                    </a>
                    <a-popconfirm
                      v-if="dataSource.length"
                      :disabled="editingKey !== ''"
                      title="确定要删除?"
                      @confirm="() => deleteRow(record.id, record.uid)"
                    >
                      <a
                        href="javascript:"
                        :style="
                          editingKey !== '' ? 'color:#00000040' : `color: red`
                        "
                      >
                        删除
                      </a>
                    </a-popconfirm>
                  </template>
                </div>
              </template>
            </template>
          </a-table>
          <div class="add-box">
            <a @click="handleAdd">
              <PlusCircleOutlined title="添加" /></a>
          </div>
        </div>
      </a-spin>
    </ht-modal>
    <ManyDateStr ref="ManyDateStr" :callback="getDate" />
    <SysConfigList ref="SysConfigList" :callback="getSysConfig" />
    <SelContract ref="SelContract" :callback="getSelContract" />
    <SelConsignUnits ref="SelConsignUnits" :callback="getSelConsignUnits" />
  </div>
</template>

<script>
import { PlusCircleOutlined } from '@ant-design/icons-vue'
import ManyDateStr from '~/providers/components/manyDateStr.vue'
import SelConsignUnits from './selConsignUnits.vue'
import SelContract from './selContract.vue'
import SysConfigList from './sysConfigList.vue'

const columns = [
  {
    title: '合同段',
    dataIndex: 'contractPartName',
    width: '21%',
    scopedSlots: { customRender: 'contractPartName' },
  },
  {
    title: '委托单位',
    dataIndex: 'consignUnitName',
    width: '21%',
    scopedSlots: { customRender: 'consignUnitName' },
  },
  {
    title: '类型编码',
    dataIndex: 'typeCode',
    width: '21%',
    scopedSlots: { customRender: 'typeCode' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '16%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    ManyDateStr,
    SysConfigList,
    SelContract,
    SelConsignUnits,
    PlusCircleOutlined,
  },
  props: ['callback'],
  data() {
    return {
      spinning: false,
      tableHeight: 350,
      // data: [],
      dataSource: [],
      cacheData: [],
      isDetail: false,
      visible: false,
      // visibleSys: false,
      editingKey: '',
      columns,
      projectId: '',
      currentRow: null,
    }
  },
  created() {},
  mounted() {},
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
        url: window.$oApi.completionDataConfig.listProjectProfile,
        params: { projectId: this.projectId },
      }).then((res) => {
        this.dataSource = []
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          this.dataSource = res.data
        }
        this.cacheData = JSON.parse(JSON.stringify(this.dataSource))
        this.spinning = false
      })
    },
    editRow(did) {
      const newData = [...this.dataSource]
      const target = newData.filter(item => did === item.id)[0]
      this.editingKey = did
      if (target) {
        target.editable = true
        this.dataSource = newData
      }
    },
    deleteRow(did, uid) {
      if (did && !uid) {
        this.spinning = true
        window.$oAjax({
          url: `${window.$oApi.completionDataConfig.delProjectProfile}/${did}`,
          method: 'DELETE',
        }).then((res) => {
          if (res.code && res.code === 23000) {
            window.$oAntdMessage.success('操作成功')
            this.getData()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.spinning = false
        })
      }
      else {
        const newData = [...this.dataSource]
        this.dataSource = newData.filter(item => item.id !== uid)
      }
    },
    dataRequired(newData) {
      if (!Array.isArray(newData)) {
        return
      }
      for (let i = 0; i < newData.length; i++) {
        if (!newData[i].contractPartId) {
          window.$oAntdModal.warning(window.$oMsgTips.info('请选择合同段'))
          return false
        }
        if (!newData[i].consignUnitId) {
          window.$oAntdModal.warning(window.$oMsgTips.info('请选择委托单位'))
          return false
        }
        if (!newData[i].typeCode) {
          window.$oAntdModal.warning(window.$oMsgTips.info('请填写类型编码'))
          return false
        }
      }
      return true
    },
    saveRow(did) {
      const newData = [...this.dataSource]
      if (this.dataRequired(newData)) {
        const target = newData.filter(item => did === item.id)[0]
        const data = {
          projectId: target.projectId,
          contractPartId: target.contractPartId,
          consignUnitId: target.consignUnitId,
          contractPartName: target.contractPartName,
          consignUnitName: target.consignUnitName,
          typeCode: target.typeCode,
        }
        let method = 'post'
        if (target.id && !target.uid) {
          data.id = target.id
          method = 'put'
        }
        this.spinning = true
        window.$oAjax({
          url: window.$oApi.completionDataConfig.addPutProjectProfile,
          method,
          data,
          headers: { 'Content-Type': 'application/json' },
        }).then((res) => {
          if (res.code && (res.code === 21000 || res.code === 22000)) {
            window.$oAntdMessage.success('操作成功')
            this.getData()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.editingKey = ''
          this.spinning = false
        })
      }
    },
    cancelRow(did, uid) {
      const newData = [...this.dataSource]
      const target = newData.filter(item => did === item.id)[0]
      if (target) {
        if (did && uid) {
          this.dataSource = this.dataSource.filter(item => did != item.id)
        }
        else {
          Object.assign(
            target,
            this.cacheData.filter(item => did === item.id)[0],
          )
          delete target.editable
          this.dataSource = newData
        }
      }
      this.editingKey = ''
    },
    handleAdd() {
      if (this.editingKey) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先保存数据'))
        return
      }
      const id = new Date().getTime()
      const newData = {
        id,
        uid: id,
        projectId: this.projectId,
        contractPartId: '',
        consignUnitId: '',
        contractPartName: '',
        consignUnitName: '',
        typeCode: '',
        editable: true,
      }
      this.editingKey = id
      this.dataSource = [...this.dataSource, newData]
    },
    showModal(recordId) {
      this.projectId = recordId
      this.getData()
      this.visible = true
    },
    handleOk() {
      if (this.editingKey) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先保存数据'))
        return
      }
      // if (this.dataRequired(data)) {
      this.handleCancel()
      this.callback()
      // }
    },
    handleCancel() {
      this.dataObj = null
      this.editingKey = ''
      this.script = ''
      this.visible = false
    },
    // 选择 期间核查时间
    inspectTimesBtn(value, id, column) {
      this.currentRow = { id, column }
      this.$refs.ManyDateStr.showModal(value)
    },
    getDate(value) {
      this.newDataSource(value)
    },
    newDataSource(data) {
      const newData = [...this.dataSource]
      const target = newData.filter(item => this.currentRow.id === item.id)[0]
      if (target) {
        target[`${this.currentRow.column}Name`] = data.name
        target[`${this.currentRow.column}Id`] = data.id
        this.dataSource = newData
      }

      this.currentRow = null
    },
    getSysConfig(data) {
      this.newDataSource(data[0])
    },
    setSysConfig(value, id, column) {
      this.currentRow = { id, column }
      const newData = [...this.dataSource]
      const target = newData.filter(item => this.currentRow.id === item.id)[0]
      let selectedRowKeys = []

      if (target) {
        selectedRowKeys = [target[`${column}Id`]]
      }

      window.$oNextTick(() => {
        this.$refs.SysConfigList.showModal(false, true, selectedRowKeys)
      })
    },
    getSelContract(data) {
      const newData = data.map(item => ({
        id: item.id,
        name: item.contractPartName,
      }))
      this.newDataSource(newData[0])
    },
    setSelContract(value, id, column) {
      this.currentRow = { id, column }
      const newData = [...this.dataSource]
      const target = newData.filter(item => this.currentRow.id === item.id)[0]
      let selectedRowKeys = []

      if (target) {
        // eslint-disable-next-line unused-imports/no-unused-vars
        selectedRowKeys = [target[`${column}Id`]]
      }

      // window.$oNextTick(() => {
      this.$refs.SelContract.showModal(this.projectId)
      // });
    },
    getSelConsignUnits(data) {
      this.newDataSource(data[0])
    },
    setSelConsignUnits(value, id, column) {
      this.currentRow = { id, column }
      const newData = [...this.dataSource]
      const target = newData.filter(item => this.currentRow.id === item.id)[0]
      let selectedRowKeys = []

      if (target) {
        // eslint-disable-next-line unused-imports/no-unused-vars
        selectedRowKeys = [target[`${column}Id`]]
      }

      // window.$oNextTick(() => {
      this.$refs.SelConsignUnits.showModal(this.projectId)
      // });
    },
    handleChange(value, key, column) {
      const newData = [...this.dataSource]
      const target = newData.filter(item => key === item.id)[0]
      if (target) {
        target[column] = value
        this.dataSource = newData
      }
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
</style>
