<template>
  <div style="min-height: 600px">
    <h3 class="ht-page-title">
      数据查询
    </h3>
    <div class="content-box">
      <a-alert
        type="info"
        show-icon
      >
        <template #message>
          1. 短信发送后回执消息一般在72小时内返回，并同步会更新发送状态，请关注因回执更新带来的数据变化
          <br />
          2. 数据查询仅支持60天内的历史记录
        </template>
      </a-alert>
      <a-tabs v-model:active-key="activeTab">
        <a-tab-pane key="1" tab="发送记录">
          <DataQueryTable />
        </a-tab-pane>
        <a-tab-pane key="2" tab="数据走势">
          <DataQueryEchart />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import DataQueryEchart from './DataQueryEchart.vue'
import DataQueryTable from './DataQueryTable.vue'

export default {
  components: {
    DataQueryTable,
    DataQueryEchart,
  },
  data() {
    return {
      activeTab: '1',
    }
  },
  methods: {},
}
</script>

<style lang="less" scoped></style>
