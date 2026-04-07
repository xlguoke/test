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
            <div v-html="text" />
          </template>
        </template>
      </a-table>
    </ht-modal>
  </div>
</template>

<script>
import { formatTime } from '~/providers/common/utils'

const columns = [
  {
    title: '内容',
    dataIndex: 'content',
    width: '30%',
    scopedSlots: { customRender: 'content' },
  },
  {
    title: '处理意见',
    dataIndex: 'opinion',
    width: '15%',
  },
  {
    title: '对象编号',
    dataIndex: 'objectSn',
    width: '15%',
  },
  {
    title: '处理人',
    dataIndex: 'createName',
    width: '10%',
  },
  {
    title: '时间',
    dataIndex: 'createDate',
    width: '15%',
    customRender: ({ text }) => formatTime(text, 'YYYY-MM-DD'),
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: '15%',
  },
]

export default {
  data() {
    return {
      data: [],
      columns,
      loading: false,
      visible: false,
      isEdit: false,
    }
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 获取自定义字段
    getData(id, type) {
      this.loading = true
      window.$oRest({
        url: window.$oApi.testItem.synthesisLog,
        params: {
          id,
          objectType: type,
        },
      }).then((res) => {
        if (res && res.data) {
          this.data = res.data
          this.loading = false
        }
      })
    },
    showModal(id, type) {
      this.getData(id, type)
      this.visible = true
    },
    cancelModal() {
      this.visible = false
    },
  },
}
</script>
