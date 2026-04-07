<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <a-flex>
      <a-tree
        v-model:selected-keys="selectedTreeKey"
        class="w-[320px] mr-4"
        :tree-data="treeData"
        :field-names="{ title: 'name', key: 'id' }"
        @select="handleSelect"
      />

      <div class="flex-1">
        <a-table
          ref="selection"
          bordered
          :loading="loading"
          :columns="columns"
          :data-source="data"
          :pagination="false"
          :row-selection="rowSelection"
          row-key="id"
          :scroll="{ y: 550 }"
        />
        <div style="text-align: right; margin-top: 20px">
          <a-button type="primary" @click="handleSubmit">
            保存
          </a-button>
        </div>
      </div>
    </a-flex>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'

export default {
  name: 'PrintConfiguration',
  data() {
    return {
      treeData: [],
      columns: [
        {
          title: '名称',
          dataIndex: 'name',
          width: 320,
        },
        {
          title: '权限编码',
          dataIndex: 'permissionCode',
          width: 320,
        },
        {
          title: '描述',
          dataIndex: 'description',
        },
      ],
      data: [],
      selectedRowKeys: [],
      selectedTreeKey: [],
      loading: false,
    }
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        },
      }
    },
    selected() {
      return this.selectedTreeKey.length > 0 ? this.selectedTreeKey[0] : ''
    },
  },
  watch: {},
  mounted() {
    this.fetchCatalogs()
  },
  methods: {
    handleSelect(nodes, node) {
      if (node.selected) {
        this.fetchPrintConfigurations()
      }
      else {
        this.data = []
      }
    },
    fetchCatalogs() {
      window.$oAjax({
        url: window.$oApi.printConfig.configCatalogs,
      })
        .then((res) => {
          if (res.code === 20000) {
            this.treeData = res.data

            if (res.data.length > 0) {
              this.selectedTreeKey = [res.data[0].id]
            }

            this.fetchPrintConfigurations()
          }
          else {
            this.$Message.error('获取打印配置分类失败')
          }
        })
        .catch((err) => {
          console.error(err)
        })
    },
    fetchPrintConfigurations() {
      window.$oAjax({
        url: `${window.$oApi.printConfig.configurations}/${this.selected}`,
      }).then((res) => {
        if (res.code === 20000) {
          this.data = res.data
          this.selectedRowKeys = res.data.filter(i => i.activated).map(j => j.id)
        }
        else {
          this.$Message.error('获取打印配置失败')
        }
      })
    },
    handleSubmit() {
      const status = this.selectedRowKeys.reduce((result, id) => {
        result[id] = true
        return result
      }, {})

      this.loading = true
      window.$oAjax({
        url: `${window.$oApi.printConfig.configurationsStatus}/${this.selected}`,
        method: 'put',
        headers: { 'content-type': 'application/json' },
        data: status,
      })
        .then((res) => {
          if (res.code === 22000) {
            message.success('更新成功')
            this.fetchPrintConfigurations()
          }
          else {
            this.$Message.error('更新失败')
          }
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<style scoped></style>
