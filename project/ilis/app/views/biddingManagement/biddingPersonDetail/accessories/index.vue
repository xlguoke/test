<template>
  <div>
    <div class="biddingPerformance-folder">
      <a-spin :spinning="loadingLeft">
        <div class="biddingPerformance-folder-left">
          <div
            style="
              padding: 6px;
              background: #f5f5f5;
              border-bottom: solid 1px #e2e2e2;
            "
          >
            <a-button @click="addFolder">
              新增
            </a-button>
            <a-button @click="editFolder">
              编辑
            </a-button>
            <a-button @click="deleteFolder">
              删除
            </a-button>
          </div>
          <a-directory-tree
            :default-expand-parent="true"
            :tree-data="leftData"
            :auto-expand-parent="true"
            :selected-keys="selectedFolderKeys"
            @select="selectFolder"
          />
        </div>
        <div class="biddingPerformance-folder-right">
          <div
            style="
              padding: 6px;
              background: #f5f5f5;
              border-bottom: solid 1px #e2e2e2;
            "
          >
            <a-button @click="viewFile">
              查看
            </a-button>
            <a-button @click="uploadFile">
              上传
            </a-button>
            <a-button @click="downloadFile">
              下载
            </a-button>
            <a-button @click="deleteFile">
              删除
            </a-button>
          </div>
          <a-tree
            show-line
            :default-expand-all="true"
            :auto-expand-parent="true"
            :default-expand-parent="true"
            :tree-data="rightData"
            :selected-keys="selectedKeys"
            @select="selectFile"
          />
        </div>
        <div style="clear: both"></div>
      </a-spin>
    </div>
    <AddFolder
      ref="AddFolder"
      :callback="getData"
      :main-id="mainId"
      :pid="pid"
      :edit-info="editInfo"
    />
    <UploadComponents
      ref="UploadComponents"
      accept="all"
      :uploadcall="getUploadData"
      :file-lists="fileLists"
    />
  </div>
</template>

<script>
import { message, Modal } from 'ant-design-vue'
import { downloadAccessory, getQueryVariable } from '~/providers/common/utils'
import UploadComponents from '~/providers/components/uploadComponent.vue'
import AddFolder from '../../biddingPerformance/list/components/addFolder.vue'

export default {
  components: {
    AddFolder,
    UploadComponents,
  },
  data() {
    return {
      mainId: getQueryVariable('id'),
      leftData: [],
      rightData: [],
      loadingLeft: false,
      selectedKeys: [],
      selectedFolderKeys: [],
      node: [],
      pid: '',
      pidType: '',
      editInfo: {},
      fileLists: [],
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.loadingLeft = true
      this.loading = true
      window.$oAjax({
        methods: 'GET',
        url: window.$oApi.biddingPerformance.fileTree,
        params: {
          mainId: this.mainId,
        },
      }).then((res) => {
        if (res && res.success) {
          this.leftData = this.formatData([res.obj])
          this.selectedKeys = []
          this.selectedFolderKeys = []
          this.node = []
          this.editInfo = {}
          this.pid = ''
          this.loadingLeft = false
        }
        else {
          this.loadingLeft = false
        }
      })
    },
    getAttach(folderId) {
      this.loadingLeft = true
      window.$oAjax({
        methods: 'GET',
        url: window.$oApi.biddingPerformance.getFolder,
        params: { folderId },
      }).then((res) => {
        if (res) {
          this.rightData = this.formatFileData(res.obj || [])
          this.selectedKeys = []
          this.node = []
          this.loadingLeft = false
        }
        else {
          this.loadingLeft = false
        }
      })
    },
    formatData(data) {
      const arr = []
      if (Array.isArray(data)) {
        // eslint-disable-next-line array-callback-return
        data.map((item) => {
          let children = []
          if (item.children && item.children.length > 0) {
            children = this.formatData(item.children)
          }
          arr.push({
            title: item.folderName,
            key: item.id,
            isLeaf: item.folderType !== null,
            pid: item.pid,
            createType: item.createType,
            children,
          })
        })
      }
      else {
        return []
      }

      return arr
    },
    formatFileData(data) {
      const arr = []
      if (Array.isArray(data)) {
        // eslint-disable-next-line array-callback-return
        data.map((item) => {
          let children = []
          if (item.children && item.children.length > 0) {
            children = this.formatFileData(item.children)
          }
          arr.push({
            title: item.name,
            key: item.id,
            isLeaf: true,
            folderId: item.folderId,
            attachmentId: item.attachmentId,
            url: item.url,
            children,
          })
        })
      }
      else {
        return []
      }

      return arr
    },
    selectFolder(keys, info) {
      this.selectedFolderKeys = keys
      if (keys.length > 0) {
        this.pid = keys[0] || ''
        this.editInfo = {
          pid: info.node.dataRef.pid,
          title: info.node.dataRef.title,
          createType: info.node.dataRef.createType,
        }
        this.getAttach(keys[0])
      }
    },
    selectFile(selectedKeys, info) {
      this.selectedKeys = selectedKeys
      this.node = info.selectedNodes
      if (info.selected) {
        const data = info.node.dataRef
        if (data.children && data.children.length > 0) {
          // eslint-disable-next-line array-callback-return
          data.children.map((item) => {
            if (!this.selectedKeys.includes(item.key)) {
              this.selectedKeys.push(item.key)
              this.node.push(item)
            }
          })
        }
      }
    },
    addFolder() {
      if (this.pid == '') {
        message.warn('请先选择一个目录')
        return
      }
      this.$refs.AddFolder.showModal()
    },
    editFolder() {
      if (this.pid == '') {
        message.warn('请先选择一个目录')
        return
      }
      if (this.editInfo.pid === null || this.editInfo.createType == '1') {
        message.warn('系统目录不能编辑')
        return
      }
      this.$refs.AddFolder.showModal(this.editInfo)
    },
    deleteFolder() {
      if (this.pid == '') {
        message.warn('请先选择一个目录')
        return
      }
      if (this.editInfo.pid === null || this.editInfo.createType == '1') {
        message.warn('系统目录不能删除')
        return
      }
      if (this.rightData.length > 0) {
        message.warn('请先删除目录下的文件')
        return
      }

      Modal.confirm({
        title: '删除',
        content: `确认删除 ${this.editInfo.title} 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax
            .get(window.$oApi.biddingPerformance.deleteFile, {
              params: { id: this.pid },
            })
            .then((res) => {
              if (res.success) {
                message.success(res.message || res.msg)
                this.getData()
              }
              else {
                message.error(res.message || res.msg)
              }
            })
        },
      })
    },
    uploadFile() {
      if (this.pid == '') {
        message.warn('请先选择一个目录')
        return
      }
      this.$refs.UploadComponents.showModal()
    },
    getUploadData(data) {
      if (data && data.length > 0) {
        window.$oAjax({
          method: 'POST',
          url: window.$oApi.biddingPerformance.addAttach,
          data: {
            attachmentId: data[0].id,
            name: data[0].attachmenttitle,
            url: data[0].realpath,
            folderId: this.pid,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then((res) => {
          if (res && res.success) {
            message.success(res.message || res.msg)
            this.fileLists = []
            this.getAttach(this.pid)
          }
          else {
            message.error(res.message || res.msg)
          }
        })
      }
    },
    viewFile() {
      if (this.selectedKeys.length == 0) {
        message.warn('请先选择一个文件')
        return
      }

      const url = this.node[0].url
      if (
        url
        && (url.substr(url.length - 4) == '.jpg'
          || url.substr(url.length - 4) == '.png')
      ) {
        let a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.click()
        a = null
      }
      else {
        Modal.confirm({
          title: '提示',
          content: `${this.node[0].title}不支持在线预览，点击确认下载后查看`,
          okText: '确认',
          cancelText: '取消',
          onOk: () => {
            downloadAccessory(this.node[0].attachmentId)
          },
        })
      }
    },
    downloadFile() {
      if (this.selectedKeys.length == 0) {
        message.warn('请先选择一个文件')
        return
      }
      downloadAccessory(this.node[0].attachmentId)
    },
    deleteFile() {
      if (this.selectedKeys.length == 0) {
        message.warn('请先选择一个文件')
        return
      }

      Modal.confirm({
        title: '删除',
        content: `确认删除 ${this.node[0].title} 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax
            .get(window.$oApi.biddingPerformance.deleteAttach, {
              params: { id: this.selectedKeys[0] },
            })
            .then((res) => {
              if (res.success) {
                message.success(res.message || res.msg)
                this.getAttach(this.pid)
              }
              else {
                message.error(res.message || res.msg)
              }
            })
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
.biddingPerformance-folder {
  height: 450px;
  margin-top: 15px;
  .biddingPerformance-folder-left {
    float: left;
    width: 40%;
    height: 450px;
    overflow-y: auto;
    border: solid 1px #e2e2e2;
    margin-right: 15px;
  }

  .biddingPerformance-folder-right {
    overflow: hidden;
    height: 450px;
    overflow-y: auto;
    margin-left: 15px;
    border: solid 1px #e2e2e2;
  }
}
</style>
