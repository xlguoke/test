<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div class="sampleScanRecord">
    <div style="display: flex; justify-content: space-between">
      <a-button type="primary" @click="batchRegister">
        批量登记
      </a-button>
      <span>
        <!-- <span style="font-size: 14px;margin-right: 10px;">检测参数类别:</span> -->
        <!-- <a-checkbox-group @change="checkboxChange" v-model="checkedList" :options="testParamCategory" /> -->
      </span>
    </div>

    <a-table
      :row-selection="rowSelection"
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="false"
      :loading="loading"
      row-key="testObjectParamId"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <a @click="register(record)">登记</a>
          </div>
        </template>

        <template v-if="column.dataIndex === 'actualTesters'">
          <template v-for="item in record.actualTesters">
            <span v-if="record.actualTesters" style="margin-right: 10px">
              <span>{{ item.userName }}</span>

              <span>({{ item.ratio }})</span>
            </span>
          </template>
        </template>
      </template>
    </a-table>
    <EditModal :id="editId" ref="editModalRef" :callback="getPersonConfig" />

    <!-- <a-button @click="saveAllocationData">确定</a-button> -->
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
import editModal from './components/editModal.vue'

const columns = [
  {
    title: '检测参数',
    dataIndex: 'testObjectParam',
  },
  {
    title: '检测参数类别',
    dataIndex: 'testObjectParamCategory',
  },
  {
    title: '检测人员',
    dataIndex: 'assignedTesters',
  },
  {
    title: '登记人员',
    dataIndex: 'actualTesters',
    scopedSlots: { customRender: 'actualTesters' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 80,
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    EditModal: editModal,
  },
  data() {
    return {
      testTaskId: getQueryVariable('testTaskId') || '',
      testParamCategory: [],
      checkedList: [],
      editId: '',
      selectedRowKeys: [],
      data: [],
      query: {
        q: '',
      },
      sortParams: null,
      columns,
      showCustomerSampleCode: false,
      selectedRows: [],
      page: 1,
      size: 10,
      loading: false,
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        onChange: this.onSelectChange,
        hideDefaultSelections: true,
      }
    },
  },
  created() {
    this.getTestParamCategory()
    this.getData()
    window.saveAllocationData = this.saveAllocationData
  },
  methods: {
    getPersonConfig(v) {
      this.selectedRowKeys.forEach((key) => {
        this.data.forEach((it) => {
          // eslint-disable-next-line eqeqeq
          if (key == it.testObjectParamId) {
            it.actualTesters = JSON.parse(JSON.stringify(v))
          }
        })
      })
    },
    checkboxChange(v) {
      this.getData(v.join(','))
    },
    getTestParamCategory() {
      window.$oAjax.get(`/rest/testParamCategory/all`).then((res) => {
        if (res && res.code === 20000) {
          this.testParamCategory = res.data.map((it) => {
            return {
              label: it.name,
              value: it.id,
            }
          })

          // this.pagination.total = res.data.count;
          // this.pagination.current = page;
          // this.pagination.pageSize = size;
        }
      })
    },
    async saveData(row) {
      row.isEdit = false
    },
    register(row) {
      this.selectedRowKeys = [row.testObjectParamId]
      this.selectedRows = [row]
      this.batchRegister()
    },

    batchRegister() {
      if (!this.selectedRows.length) {
        window.$oAntdMessage.warning('请选择至少一条数据')
        return
      }
      if (
        // eslint-disable-next-line eqeqeq
        this.selectedRows.length == 1
        && this.selectedRows[0].actualTesters
        && this.selectedRows[0].actualTesters.length
      ) {
        // 如果是单个参数登记且已经分配过权重
        this.$refs.editModalRef.checkedKeys
          = this.selectedRows[0].actualTesters.map((it) => {
            return it.userId
          })
        this.$refs.editModalRef.selectedNode
          = this.selectedRows[0].actualTesters
      }
      else {
        // 如果是多个参数登记
        this.$refs.editModalRef.testTaskId = this.testTaskId
        const personIdArr = this.selectedRows[0].assignedTesterIds.split(',')
        const nameArr = this.selectedRows[0].assignedTesters.split(',')
        this.$refs.editModalRef.checkedKeys = personIdArr
        this.$refs.editModalRef.selectedNode = personIdArr.map((it, i) => {
          return {
            ratio: 0,
            userName: nameArr[i],
            userId: personIdArr[i],
          }
        })
      }
      this.$refs.editModalRef.showModal()
    },

    onSelectChange(selectedRowKeys, row) {
      this.selectedRowKeys = selectedRowKeys
      this.selectedRows = row
    },
    getScanResult(result) {
      this.query.scode = result
    },

    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },

    getData(pcid) {
      this.loading = true
      const params = {
        paramCategoryIds: pcid || '',
      }
      window.$oAjax
        .get(
          `/rest/testObjectParamTester/by-task/${this.testTaskId}`,
          { params },
        )
        .then((res) => {
          if (res && res.code === 20000) {
            this.data = res.data
            this.loading = false
          }
        })
    },
    saveAllocationData() {
      return this.data
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
