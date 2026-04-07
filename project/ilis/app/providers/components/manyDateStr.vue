<template>
  <ht-modal
    :title="modalTitle || '设置时间'"
    centered
    :confirm-loading="confirmLoading"
    :mask-closable="false"
    :open="visible"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div style="padding: 10px 0">
          <a-button type="primary" @click="add">
            新增
          </a-button>
        </div>
        <a-table
          :columns="columns"
          :pagination="false"
          :data-source="data"
          bordered
          row-key="sortNum"
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'inspectTimes'">
              <div>
                <a-date-picker
                  v-model:value="record.inspectTimes"
                  placeholder="请选择日期"
                  value-format="YYYY-MM-DD"
                  @change="(e) => handleChange(e, record, 'inspectTimes')"
                />
              </div>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <div class="editable-row-operations">
                <a class="text-blue-500" @click="() => deleteData(record)">删除</a>
              </div>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
  </ht-modal>
</template>

<script>
import dayjs from 'dayjs'

const columns = [
  {
    title: '序号',
    dataIndex: 'sortNum',
  },
  {
    title: '时间',
    dataIndex: 'inspectTimes',
  },
  {
    title: '操作',
    dataIndex: 'operation',
  },
]
export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      editData: null,
      data: [],
      value: [],
      columns,
      spinning: false,
      modalTitle: '',
    }
  },
  computed: {},
  created() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    showModal(data, titles) {
      this.modalTitle = titles
      this.visible = true
      this.editData = data
      const target = data ? data.split(';') : []
      this.data = target.map((item, index) => ({
        sortNum: index + 1,
        inspectTimes: item,
      }))
    },
    handleChange(value, record, column) {
      const values = value ? dayjs(value).format('YYYY-MM-DD') : ''
      const newData = [...this.data]
      const target = newData.filter(
        item => record.sortNum === item.sortNum,
      )[0]
      if (target) {
        target[column] = values
        this.data = newData
      }
    },
    handleOk() {
      const realArr = this.data.map(item => item.inspectTimes)
      const realArr2 = realArr.filter(item => item)
      this.callback(realArr2.join(';'))
      this.handleCancel()
    },
    handleCancel() {
      this.editData = null
      this.visible = false
    },
    add() {
      const newData = [...this.data]
      this.data.push({ sortNum: newData.length + 1, inspectTimes: '' })
    },
    // 删除
    deleteData(record) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: () => {
          this.data = this.data.filter(
            item => item.sortNum !== record.sortNum,
          )
        },
      })
    },
  },
}
</script>

<style scoped>
.spin-content {
  height: 300px;
  overflow: auto;
}
</style>
