<template>
  <ht-modal v-model:open="visible" :mask-closable="false" title="导入签名信息">
    <p style="font-size: 14px; font-weight: bold">
      <CloseCircleFilled
        style="
          color: #f44336;
          font-size: 20px;
          vertical-align: middle;
          margin-bottom: 4px;
          margin-right: 4px;
        "
      />
      导入失败！
    </p>
    <p class="mt-2">
      导入模板中存在以下问题，请编辑模板文件后重新导入！
    </p>
    <a-table
      class="mt-4"
      :columns="columns"
      :pagination="false"
      :data-source="dataSource"
    ></a-table>
    <template #footer>
      <a-button style="float: none" @click="close">
        确定
      </a-button>
    </template>
  </ht-modal>
</template>

<script>
import { CloseCircleFilled } from '@ant-design/icons-vue'

export default {
  components: {
    CloseCircleFilled,
  },
  data() {
    const columns = [
      {
        title: '行号',
        dataIndex: 'Index',
        width: 85,
        align: 'center',
      },
      {
        title: '问题内容',
        dataIndex: 'content',
      },
    ]
    return {
      visible: false,
      columns,
      dataSource: [],
    }
  },
  methods: {
    close() {
      this.visible = false
      window.$oNextTick(() => {
        this.dataSource = []
      })
    },
    open(dataSource) {
      this.dataSource = dataSource
      this.visible = true
    },
  },
}
</script>

<style></style>
