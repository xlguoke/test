<template>
  <div>
    <ht-modal
      title="查看已选参数"
      centered
      :open="visible"
      width="80%"
      :mask-closable="false"
      @cancel="onCancel"
      @ok="onOk"
    >
      <div>
        <a-table
          bordered
          :columns="columns"
          :data-source="data"
          row-key="id"
          :row-class-name="rowClassName"
          :pagination="false"
          :scroll="{ y: 300 }"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'actions'">
              <a class="text-blue-500" href="javascript:;" @click="onRemove(record)">移除</a>
            </template>
          </template>
        </a-table>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  emits: ['on-submit'],
  data() {
    return {
      visible: false,
      columns: [
        {
          title: '检测参数',
          dataIndex: 'displayName',
        },
        { title: '参数备注', dataIndex: 'remark', width: '30%' },
        {
          title: '附注',
          dataIndex: 'paramNote',
          width: '20%',
        },
        {
          title: '操作',
          dataIndex: 'actions',
          align: 'center',
          scopedSlots: { customRender: 'actions' },
          width: '80px',
        },
      ],
      data: [],
      removeIds: [],
    }
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    onRemove(row) {
      this.data = this.data.filter(item => item.id !== row.id)
      this.removeIds.push(row.id)
    },
    onOk() {
      $emit(this, 'on-submit', this.removeIds)
      this.onCancel()
    },
    onCancel() {
      this.visible = false
    },
    onOpen(data) {
      this.data = JSON.parse(JSON.stringify(data))
      this.visible = true
    },
  },
}
</script>
