<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="日志"
      centered
      :mask-closable="false"
      width="60%"
      :z-index="10000"
      class="hitek-add-modal"
      @ok="cancelModal"
      @cancel="cancelModal"
    >
      <a-table
        :columns="columns"
        :row-class-name="rowClassName"
        :data-source="data"
        :loading="loading"
        :scroll="{ y: 320 }"
        row-key="id"
        bordered
        table-layout="auto"
        :pagination="false"
      >
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'content'">
            <div v-html="text"></div>
          </template>
        </template>
      </a-table>
    </ht-modal>
  </div>
</template>

<script>
import { formatTime } from '~/providers/common/utils'

import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const columns = [
  {
    title: '内容',
    dataIndex: 'content',
    width: '30%',
    scopedSlots: { customRender: 'content' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '20%',
  },
  {
    title: '处理人',
    dataIndex: 'operator',
    width: '10%',
  },
  {
    title: '时间',
    dataIndex: 'operationTime',
    width: '20%',
    customRender: ({ text }) => formatTime(text, 'YYYY-MM-DD HH:mm:ss'),
  },
]

export default {
  emits: ['close'],
  data() {
    return {
      data: [],
      visible: false,
      columns,
      loading: false,
      isEdit: false,
    }
  },
  created() {},
  methods: {
    colseModel() {
      $emit(this, 'close')
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 获取自定义字段
    getData(id) {
      this.loading = true
      window.$oAjax({
        url: `/rest/fee/settlement/log/${id}`,
        method: 'GET',
      }).then((res) => {
        if (res.code === 20000) {
          this.data = res.data
        }
      })
      this.loading = false
    },
    showModal(id) {
      this.getData(id)
      this.visible = true
    },
    cancelModal() {
      this.visible = false
    },
  },
}
</script>
