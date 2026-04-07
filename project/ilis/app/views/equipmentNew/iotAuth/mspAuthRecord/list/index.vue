<template>
  <div>
    <!-- 查询页面 -->
    <a-form
      layout="inline"
      :model="formInline"
      @submit="handleSubmit"
      @submit.prevent
    >
      <a-form-item>
        <a-input
          v-model:value.trim="formInline.q"
          title="请输入更新设备编号、更新设备名称、更新账号、更新用户名"
          placeholder="请输入更新设备编号、更新设备名称、更新账号、更新用户名"
          type="text"
          style="width: 360px"
        >
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-select
          v-model:value="formInline.mode"
          placeholder="更新方式"
          style="width: 200px"
        >
          <a-select-option value="manual">
            手动
          </a-select-option>
          <a-select-option value="auto">
            自动
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-select
          v-model:value="formInline.success"
          placeholder="更新结果"
          style="width: 200px"
        >
          <a-select-option value="true">
            成功
          </a-select-option>
          <a-select-option value="false">
            失败
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-range-picker
          v-model:value="formInline.timer"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
          :placeholder="['开始时间', '结束时间']"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">
          查询
        </a-button>
        <a-button style="margin-left: 10px" @click="handleRest">
          重置
        </a-button>
      </a-form-item>
    </a-form>
    <!-- 表格 -->
    <div class="table">
      <a-table
        :columns="columns"
        :loading="loading"
        :data-source="tableData"
        row-key="__index__"
        bordered
        :pagination="{
          total,
          pageSize: formInline.size,
          current: formInline.page,
          pageSizeOptions: ['10', '20', '30', '50'],
          showTotal: (total) =>
            `${
              formInline.page === 1
                ? 1
                : (formInline.page - 1) * formInline.size + 1
            }-${
              formInline.size * formInline.page < total
                ? formInline.size * formInline.page
                : total
            } 共 ${total} 条`,
          showQuickJumper: true,
          showSizeChanger: true,
        }"
        @change="handleChange"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'success'">
            <div v-if="text === true">
              成功
            </div>
            <a-tooltip v-if="text === false" placement="topLeft">
              <template #title>
                <span>{{ record.errorMsg }}</span>
              </template>
              <div style="display: flex; align-items: center">
                <span style="margin-right: 6px">失败</span>
                <ExclamationCircleOutlined style="color: orange" />
              </div>
            </a-tooltip>
          </template>

          <template v-if="column.dataIndex === 'mode'">
            <div v-if="text === 'manual'">
              手动
            </div>
            <div v-if="text === 'auto'">
              自动
            </div>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script>
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { formatTime } from '~/providers/common/utils'
import { getlist } from '../api'

const columns = [
  {
    title: '更新时间',
    dataIndex: 'operateTime',
    key: 'operateTime',
  },
  {
    title: '更新账号',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '更新用户名',
    dataIndex: 'realName',
    key: 'realName',
  },
  {
    title: '更新方式',
    dataIndex: 'mode',
    key: 'mode',
  },
  {
    title: '更新结果',
    dataIndex: 'success',
    key: 'success',
  },
  {
    title: '更新设备编号',
    key: 'eqSn',
    dataIndex: 'eqSn',
  },
  {
    title: '更新设备名称',
    dataIndex: 'eqName',
    key: 'eqName',
    ellipsis: true,
  },
  {
    title: '检测室',
    key: 'laboratoryName',
    dataIndex: 'laboratoryName',
    ellipsis: true,
  },
  {
    title: '所属部门',
    key: 'departName',
    dataIndex: 'departName',
    ellipsis: true,
  },
  {
    title: '关联墨水屏ID',
    key: 'deviceId',
    dataIndex: 'deviceId',
    ellipsis: true,
  },
  {
    title: '关联墨水屏名称',
    key: 'deviceName',
    dataIndex: 'deviceName',
    ellipsis: true,
  },
]
export default {
  name: 'MspAuthRecord',
  components: {
    ExclamationCircleOutlined,
  },
  data() {
    return {
      formInline: {
        page: 1,
        size: 10,
        q: '',
        mode: undefined,
        success: undefined,
        timer: [],
      },
      columns,
      tableData: [],
      total: 0,
      loading: false,
    }
  },
  mounted() {
    this.getData()
  },
  methods: {
    handleSubmit() {
      this.formInline.page = 1
      this.getData()
    },
    // 获取数据
    async getData() {
      this.loading = true
      let body = {}
      try {
        if (this.formInline.timer && this.formInline.timer[0]) {
          const operateTimeStart = formatTime(
            this.formInline.timer[0],
            'YYYY-MM-DD HH:mm:ss',
          )
          const operateTimeEnd = formatTime(
            this.formInline.timer[1],
            'YYYY-MM-DD HH:mm:ss',
          )
          this.formInline.operateTimeStart = operateTimeStart
          this.formInline.operateTimeEnd = operateTimeEnd
        }
        else {
          this.formInline.timer = []
          this.formInline.operateTimeStart = undefined
          this.formInline.operateTimeEnd = undefined
        }
        // 修改点击
        body = { ...this.formInline }
        delete body.timer
        const result = await getlist({ ...body })
        if (result && result.code === 20000) {
          this.tableData = result.data.rows || []
          if (this.tableData && this.tableData.length) {
            this.tableData.forEach(
              (item, index) => (item.__index__ = index + 1),
            )
          }
          this.total = result.data.count
        }
      }
      finally {
        this.loading = false
      }
    },
    // 分页函数
    handleChange(page) {
      this.formInline.page = page.current
      this.formInline.size = page.pageSize
      this.getData()
    },
    handleRest() {
      this.formInline = {
        page: 1,
        size: 10,
        q: '',
        mode: undefined,
        success: undefined,
        timer: [],
      }
      this.getData()
    },
  },
}
</script>

<style lang="less" scoped>
.table {
  margin: 20px 0;
}
</style>
