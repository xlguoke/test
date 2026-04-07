<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="导入工程划分"
      :confirm-loading="confirmLoading"
      width="500px"
      :mask-closable="false"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div
        style="margin: 12px 0; border-bottom: 1px solid; padding-bottom: 5px"
      >
        <a-button type="primary" @click="upload">
          选择文件
        </a-button>
        <u
          href="#"
          style="margin-left: 10px; color: #1890ff"
          @click="sampleFile"
        >示例文件</u>
      </div>
      <div class="treeBox">
        <a-tree
          :expanded-keys="expandedKeys"
          :auto-expand-parent="autoExpandParent"
          :selected-keys="selectedKeys"
          :tree-data="treeData"
          class="testItemDetail-left-tree"
          @expand="onExpand"
          @select="onSelect"
        />
      </div>
    </ht-modal>
    <UploadComponent
      ref="UploadComponent"
      :max="1"
      :uploadcall="uploadcall"
      :file-lists="fileLists"
      accept=".xls,  .xlsx,"
    />
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
import UploadComponent from '~/providers/components/uploadComponent.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {
    UploadComponent,
  },
  props: ['callback'],
  data() {
    return {
      id: getQueryVariable('id') || '',
      expandedKeys: [],
      autoExpandParent: true,
      selectedKeys: [],
      treeData: [],
      visible: false,
      confirmLoading: false,
      contractPartId: '',
      fileLists: [],
    }
  },
  watch: {},
  created() {},
  methods: {
    showModal(selId) {
      this.visible = true
      this.contractPartId = selId
    },
    handleCancel() {
      this.treeData = []
      this.confirmLoading = false
      this.visible = false
    },
    handleOk() {
      this.confirmLoading = true
      window.$oAjax({
        url: window.$oApi.testItem.importPreview,
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        params: { contractPartId: this.contractPartId },
        data: {
          unitProjects: this.treeData,
          contractPartId: this.contractPartId,
        },
      }).then((res) => {
        if (res.code === 21000) {
          this.visible = false
          this.handleCancel()
          this.callback()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.confirmLoading = false
      })
    },
    sampleFile() {
      window.open(`${rootUrl}${window.$oApi.testItem.templateUrl}`)
    },
    getTreeData(data) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        if (data[i].children && data[i].children.length != 0) {
          children = this.getTreeData(data[i].children)
        }
        const obj = {
          ...data[i],
          value: data[i].oid,
          title: data[i].name,
          key: data[i].oid,
          children,
        }
        if (children.length === 0) {
          delete obj.children
        }
        arr.push(obj)
      }
      return arr
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onSelect(selectedKeys) {
      this.selectedKeys = selectedKeys
    },
    upload() {
      this.fileLists = []
      this.$refs.UploadComponent.showModal(true)
    },
    uploadcall(uploadFile) {
      this.treeData = []
      const formData = new FormData()
      uploadFile.forEach((file) => {
        formData.append('file', file)
      })
      window.$oAjax({
        url: window.$oApi.testItem.importPreview,
        method: 'post',
        params: { contractPartId: this.contractPartId },
        data: formData,
      }).then((res) => {
        if (res.code === 20000) {
          this.treeData = this.getTreeData(res.data)
          const arrIds = this.treeData.map(item => item.oid)
          if (this.treeData[0].children && this.treeData[0].children[0].oid) {
            arrIds.push(this.treeData[0].children[0].oid)
          }
          this.expandedKeys = [...this.expandedKeys, ...arrIds]
          this.onExpand(this.expandedKeys)
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
  },
}
</script>

<style scoped>
.treeBox {
  height: 400px;
  overflow: hidden;
  overflow-y: auto;
}
</style>
