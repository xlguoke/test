<template>
  <ht-modal title="日志" :open="visible">
    <a-table
      :columns="columns"
      :data-source="data"
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
    <template #footer>
      <div>
        <a-button @click="handleCancel">
          关闭
        </a-button>
        <div style="clear: both"></div>
      </div>
    </template>
  </ht-modal>
</template>

<script>
export default {
  name: 'Log',
  props: {
    columns: {
      required: true,
      type: Array,
    },
    data: {
      required: true,
      type: Array,
    },
  },
  data() {
    return {
      visible: false,
    }
  },
  methods: {
    showModal() {
      this.visible = true
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
.addModalBox {
  .ant-modal-body {
    height: 360px;
    max-height: 360px;
    min-height: 360px;
    overflow-y: auto;
    padding: 0 15px;
  }
}
</style>
