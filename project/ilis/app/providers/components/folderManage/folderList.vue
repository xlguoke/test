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
    <!-- :mainEntityId="mainEntityId" :pid="pid" :editInfo="editInfo" -->
    <AddFolder ref="AddFolder" :callback="getData" />
    <UploadComponents
      ref="UploadComponents"
      accept="all"
      :uploadcall="getUploadData"
      :file-lists="fileLists"
    />
  </div>
</template>

<script>
import qs from 'qs'
import { downloadAccessory } from '~/providers/common/utils'
import UploadComponents from '~/providers/components/uploadComponent.vue'
import AddFolder from './addFolder.vue'

export default {
  components: {
    AddFolder,
    UploadComponents,
  },
  data() {
    return {
      leftData: [],
      rightData: [],
      // visible: false,
      loadingLeft: false,
      selectedKeys: [],
      selectedFolderKeys: [],
      node: [],
      pid: '',
      mainEntityId: '',
      editInfo: {},
      fileLists: [],
    }
  },
  methods: {
    showModal(mainEntityId) {
      this.mainEntityId = mainEntityId

      this.getData()
    },
    getData() {
      this.loadingLeft = true
      this.loading = true
      window.$oAjax({
        methods: 'GET',
        url: window.$oApi.folderManages.datagridByFolder,
        params: {
          mainEntityId: this.mainEntityId,
        },
      }).then((res) => {
        if (res.success === false) {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          return
        }
        if (res.rows && Array.isArray(res.rows)) {
          this.leftData = this.formatData(res.rows)

          this.selectedKeys = []
          this.selectedFolderKeys = []
          this.node = []
          this.editInfo = {}
          this.pid = ''
          window.$oForceUpdate()
        }
        this.loadingLeft = false
        this.loading = false
      })
    },
    getAttach(folderId) {
      this.loadingLeft = true
      window.$oAjax({
        methods: 'GET',
        url: window.$oApi.folderManages.datagridByFile,
        params: { folderId },
      }).then((res) => {
        if (res.success === false) {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          return
        }
        if (res.rows && Array.isArray(res.rows)) {
          this.rightData = this.formatFileData(res.rows || [])

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
            title: item.name,
            key: item.id,
            isLeaf:
              !item.children || (item.children && item.children.length == 0),
            pid: item.parentId,
            children,
          })
        })
      }
      else {
        return []
      }

      return arr
    },
    addFolder() {
      if (this.pid == '') {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一个目录'))
        return
      }
      this.$refs.AddFolder.showModal(this.mainEntityId, this.pid)
    },
    editFolder() {
      if (this.pid == '') {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一个目录'))
        return
      }
      if (this.editInfo.pid === null) {
        window.$oAntdModal.warning(window.$oMsgTips.info('系统目录不能编辑'))
        return
      }
      this.$refs.AddFolder.showModal(this.mainEntityId, this.pid, this.editInfo)
    },
    deleteFolder() {
      if (this.pid == '') {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一个目录'))
        return
      }
      if (this.editInfo.pid === null) {
        window.$oAntdModal.warning(window.$oMsgTips.info('系统目录不能删除'))
        return
      }
      if (this.rightData.length > 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先删除目录下的文件'))
        return
      }

      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除 ${this.editInfo.title} 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax
            .get(window.$oApi.folderManages.delFolder, {
              params: { id: this.pid },
            })
            .then((res) => {
              if (res.success) {
                window.$oAntdMessage.success(res.message || res.msg)
                this.getData()
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
              }
            })
        },
      })
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
    cancelModal() {
      this.leftData = []
      this.rightData = []
      this.selectedKeys = []
      this.selectedFolderKeys = []
      this.node = []
      this.pid = ''
      // this.visible = false;
    },
    selectFolder(keys, info) {
      this.selectedFolderKeys = keys
      if (keys.length > 0) {
        this.pid = keys[0] || ''
        this.editInfo = {
          pid: info.node.dataRef.pid,
          title: info.node.dataRef.title,
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
    uploadFile() {
      if (this.pid == '') {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一个目录'))
        return
      }
      this.$refs.UploadComponents.showModal()
    },
    getUploadData(data) {
      if (data && data.length > 0) {
        window.$oAjax({
          method: 'POST',
          url: window.$oApi.folderManages.saveFile,
          data: qs.stringify({
            mainEntityId: this.mainEntityId,
            attachmentIds: data.map(item => item.id).join(','),
            // name: data[0].attachmenttitle,
            // url: data[0].realpath,
            folderId: this.pid,
          }),
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            // "content-type": "application/json"
          },
        }).then((res) => {
          if (res && res.success) {
            window.$oAntdMessage.success(res.message || res.msg)
            this.fileLists = []
            this.getAttach(this.pid)
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
          }
        })
      }
    },
    // 根据文件路径获取文件类型
    getFileTypeByUrl(url) {
      if (!url)
        return ''
      const lastDotIndex = url.lastIndexOf('.')
      if (lastDotIndex === -1)
        return ''
      return url.substring(lastDotIndex + 1).toLowerCase()
    },
    // 判断是否可预览的文件类型
    isPreviewableFile(url) {
      const fileType = this.getFileTypeByUrl(url)
      const previewableTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'pdf']
      return previewableTypes.includes(fileType)
    },
    // 获取文件类型分类
    getFileCategory(url) {
      const fileType = this.getFileTypeByUrl(url)
      const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
      if (imageTypes.includes(fileType)) {
        return 'image'
      }
      if (fileType === 'pdf') {
        return 'pdf'
      }
      return 'other'
    },
    viewFile() {
      if (this.selectedKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一个文件'))
        return
      }

      const url = this.node[0].url
      const fileCategory = this.getFileCategory(url)

      // 图片类型：直接打开
      if (fileCategory === 'image') {
        let a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.click()
        a = null
      }
      // PDF类型：在新窗口打开预览
      else if (fileCategory === 'pdf') {
        window.open(url, '_blank')
      }
      // 其他类型：提示下载
      else {
        window.$oAntdConfirm({
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
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一个文件'))
        return
      }
      downloadAccessory(this.node[0].attachmentId)
    },
    deleteFile() {
      if (this.selectedKeys.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择一个文件'))
        return
      }
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除 ${this.node[0].title} 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax
            .get(window.$oApi.folderManages.delFile, {
              params: { id: this.selectedKeys[0] },
            })
            .then((res) => {
              if (res.success === false) {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
                return false
              }
              else {
                this.getAttach(this.pid)
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
  height: 300px;
  .biddingPerformance-folder-left {
    float: left;
    width: 40%;
    height: 300px;
    overflow-y: auto;
    border: solid 1px #e2e2e2;
    margin-right: 15px;
  }

  .biddingPerformance-folder-right {
    overflow: hidden;
    height: 300px;
    overflow-y: auto;
    margin-left: 15px;
    border: solid 1px #e2e2e2;
  }
}
</style>
