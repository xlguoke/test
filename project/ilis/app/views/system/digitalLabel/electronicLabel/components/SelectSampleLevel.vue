<template>
  <ht-modal
    v-model:open="_value"
    width="640px"
    :mask-closable="false"
    title="选择样品层级"
    class="select-sample-level"
  >
    <a-spin :spinning="treeLoading" tip="加载中...">
      <a-row style="height: 500px" :gutter="16">
        <a-col :span="12" style="height: 100%; overflow-y: auto">
          <a-tree
            v-model:expanded-keys="expandedKeys"
            :replace-fields="{
              title: 'name',
              key: 'id',
            }"
            :default-expand-parent="true"
            :selected-keys="treeSelectedKeys"
            :tree-data="treeData"
            @select="onSelect"
          />
        </a-col>
        <a-col :span="12">
          <a-table
            :row-selection="rowSelection"
            :columns="columns"
            :data-source="tableData"
            :loading="loading"
            bordered
            row-key="id"
            :pagination="false"
            :scroll="{
              y: 300,
            }"
          />
        </a-col>
      </a-row>
    </a-spin>
    <template #footer>
      <a-button @click="cancel">
        取消
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="handleOk">
        保存
      </a-button>
    </template>
  </ht-modal>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  name: 'SampleLevel',
  props: {
    value: {
      default: false,
    },
  },
  emits: ['update:value', 'on-save'],
  data() {
    return {
      columns: [
        {
          title: '样品名称',
          dataIndex: 'name',
        },
      ],
      treeSelectedKeys: [],
      treeData: [],
      tableData: [],
      treeLoading: false,
      loading: false,
      submitLoading: false,
      selectedRowKeys: [],
      expandedKeys: [],
    }
  },
  computed: {
    _value() {
      return this.value
    },
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (rowKeys) => {
          this.selectedRowKeys = rowKeys
        },
      }
    },
  },
  watch: {
    async value(val) {
      if (val) {
        await this.getTreeData()
        this.defaultExpand()
      }
      else {
        this.cancel()
      }
    },
  },
  methods: {
    cancel() {
      $emit(this, 'update:value', false)
      this.selectedRowKeys = []
      this.tableData = []
      this.treeSelectedKeys = []
      this.expandedKeys = []
    },
    onSelect(treeSelectedKeys) {
      this.tableData = []
      this.selectedRowKeys = []
      this.treeSelectedKeys = treeSelectedKeys
      this.getTableData()
    },
    defaultExpand() {
      if (this.treeData.length > 0) {
        this.expandedKeys = [this.treeData[0].id]
      }
    },
    async getTreeData() {
      if (this.treeData.length > 0) {
        return
      }

      this.treeLoading = true
      this.treeData = await window.$oAjax(
        '/bigCategoryController.do?datagrid',
      ).finally(() => {
        this.treeLoading = false
      })
    },
    async getTableData() {
      this.loading = true
      const res = await window.$oAjax('/testSampleController.do?treeGridSync', {
        params: {
          bigCategoryId: this.treeSelectedKeys[0],
        },
      }).finally(() => {
        this.loading = false
      })

      this.tableData = res.map(item => ({
        ...item,
        children: null,
      }))
    },
    async handleOk() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdMessage.warning('请选择样品！')
        return
      }

      this.submitLoading = true
      const hide = window.$oAntdMessage.loading('数据保存中...', 0)
      await window.$oAjax({
        method: 'POST',
        url: '/rest/sample/rfid',
        headers: {
          'content-type': 'application/json',
        },
        data: JSON.stringify({
          bigCategoryId: this.treeSelectedKeys[0],
          sampleIds: this.selectedRowKeys,
        }),
      }).finally(() => {
        hide()
        this.submitLoading = false
      })

      $emit(this, 'on-save')
      this.cancel()
    },
  },
}
</script>
