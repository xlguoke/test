<template>
  <ht-modal
    v-model:open="visible"
    width="60%"
    :closable="true"
    :mask-closable="false"
    :keyboard="false"
    title="导入任务"
  >
    <a-table
      row-key="id"
      bordered
      :columns="columns"
      :data-source="data"
      :pagination="false"
    >
      <template #bodyCell="{ column, text }">
        <template v-if="column.dataIndex === 'result'">
          <span v-if="!text" style="color: #999; line-height: 21px">等待导入</span>
          <a-progress
            v-else-if="text === 'loading'"
            status="active"
            :percent="100"
            :show-info="false"
          />
          <a-progress v-else-if="text === 'success'" :percent="100" />
          <a-progress
            v-else-if="text === 'fail'"
            :percent="100"
            status="exception"
          />
        </template>
      </template>
    </a-table>
    <p v-if="importFinish" class="import-result">
      本次执行导入{{ data.length }}条离线试验数据，其中成功
      <span style="color: green">{{ successLen }}</span>
      条，失败
      <span style="color: red">{{ failLen }}</span>
      条。
    </p>
    <template #footer>
      <div v-if="importFinish" class="clearfix">
        <a-button type="primary" @click="okBtn">
          确定
        </a-button>
      </div>
    </template>
  </ht-modal>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 50,
    align: 'center',
    customRender: ({ index }) => index + 1,
  },
  { title: '任务编号', dataIndex: 'testTaskCode' },
  { title: '样品名称', dataIndex: 'testSampleDisplayName' },
  { title: '检测参数', dataIndex: 'paramNames' },
  {
    title: '导入结果',
    dataIndex: 'result',
    width: '15%',
    scopedSlots: { customRender: 'result' },
  },
  {
    title: '原因',
    dataIndex: 'reason',
    width: '30%',
    scopedSlots: { customRender: 'reason' },
  },
]

export default {
  emits: ['finish'],
  data() {
    return {
      visible: false,
      importFinish: false,
      successLen: 0,
      failLen: 0,
      columns,
      data: [],
    }
  },
  methods: {
    showModal(rows) {
      this.importFinish = false
      this.visible = true
      this.data = rows
      this.impostHandle()
    },
    // 导入
    async impostHandle() {
      for (let i = 0; i < this.data.length; i++) {
        const item = this.data[i]
        try {
          item.result = 'loading'
          await this.importFetch(item.id)
          item.result = 'success'
          item.reason = '-'
        }
        catch (err) {
          item.result = 'fail'
          item.reason = err.message || '未知异常'
        }
        this.data[i] = item
      }
      this.successLen = this.data.filter(
        item => item.result === 'success',
      ).length
      this.failLen = this.data.filter(item => item.result === 'fail').length
      this.importFinish = true
      $emit(this, 'finish')
    },
    // 发起导入请求
    async importFetch(id) {
      const res = await window.$oAjax({
        url: `${window.$oApi.offlineDataManage.import}/${id}`,
        method: 'POST',
      })
      if (res && res.code === 20000)
        return res
      return Promise.reject(res)
    },
    okBtn() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
.import-result {
  margin-top: 10px;
}
:deep(.ant-table-tbody > tr > td i.anticon) {
  font-size: 12px;
}
:deep(.ant-progress-show-info .ant-progress-outer) {
  padding-right: 20px;
}
:deep(.ant-progress-text) {
  margin-left: 22px;
  width: 14px;
}
</style>
