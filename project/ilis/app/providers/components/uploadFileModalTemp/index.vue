<template>
  <div class="upload-wrap">
    <ht-modal
      title="附件管理"
      :open="visible"
      width="800px"
      :mask-closable="false"
      :keyboard="false"
      @cancel="closeModal"
      @ok="save"
    >
      <a-spin :spinning="spinning" :tip="tipText">
        <div style="min-height: 300px; max-height: 500px; overflow-y: auto">
          <a-table
            :data-source="tableFileList"
            :columns="columns"
            :pagination="false"
            row-key="uid"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.dataIndex === 'status'">
                <a-tag v-if="record.status === 1" color="#87d068">
                  等待上传
                </a-tag>
                <a-tag v-else-if="record.status === 2" color="#108ee9">
                  上传成功
                </a-tag>
                <a-tag v-else color="#f50">
                  上传失败
                </a-tag>
              </template>
              <template v-if="column.dataIndex === 'opt'">
                <a-space>
                  <a-button
                    v-if="record.annexUrl"
                    type="link"
                    @click="previewFile(record.annexUrl)"
                  >
                    预览
                  </a-button>
                  <a-button
                    v-if="record.annexUrl"
                    type="link"
                    @click="getFileBlob(record.annexUrl, record.annexName)"
                  >
                    下载
                  </a-button>
                  <a-button
                    type="link"
                    style="color: red"
                    @click="deleteFile(record, index)"
                  >
                    删除
                  </a-button>
                </a-space>
              </template>
            </template>
          </a-table>
          <br />
          <a-upload
            :file-list="fileList"
            :multiple="true"
            :before-upload="beforeUpload"
            :show-upload-list="false"
          >
            <a-button type="primary">
              选择文件
            </a-button>
          </a-upload>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import { downloadFile } from '~/providers/common/utils'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const columns = [
  // {
  //   title: "类型",
  //   dataIndex: "annexTypeName",
  //   width: 200,
  //   scopedSlots: { customRender: "annexTypeName" }
  // },
  {
    title: '文件名称',
    dataIndex: 'annexName',
  },
  {
    title: '文件状态',
    dataIndex: 'status',
  },
  {
    title: '操作',
    dataIndex: 'opt',
    width: 160,
  },
]
export default {
  emits: ['uploadSucess'],
  data() {
    return {
      visible: false,
      spinning: false,
      tipText: '',
      fileList: [],
      downloadFile,
      tableFileList: [],
      columns,
      annexTypeDatas: [],
      imgTypes: ['png', 'jpg', 'jpeg'],
    }
  },
  created() {
    this.getAnnexTypeDatas()
  },
  methods: {
    closeModal() {
      this.visible = false
      $emit(this, 'uploadSucess', [...this.tableFileList])
    },
    openModal(paramId) {
      this.tipText = ''
      this.fileList = []
      // this.tableFileList = []
      this.visible = true
      this.getFileDatas(paramId)
    },
    // 获取文件
    async getFileDatas(paramId) {
      if (!paramId)
        return
      this.spinning = true
      try {
        const res = await window.$oAjax.get(
          `/rest/indicator/annex/list/${paramId}`,
        )
        if (res.code === 20000) {
          for (const k in res.data) {
            const list = res.data[k] || []
            const files = list.map((d) => {
              const type = d.annexName.substring(
                d.annexName.lastIndexOf('.') + 1,
              )
              const isImage = this.imgTypes.includes(type)
              return {
                key: d.id,
                annexName: d.annexName,
                annexUrl: d.annexUrl,
                id: d.id,
                annexTypeName: d.annexTypeName,
                disabled: !isImage && d.annexTypeName === '其它',
              }
            })
            this.tableFileList.push(...files)
          }
        }
        else {
          window.$oAntdMessage.error(res.message || '获取附件失败')
        }
      }
      catch (err) {
        window.$oAntdMessage.error(err.message || '获取附件失败')
      }
      this.spinning = false
    },
    beforeUpload(file) {
      const type = file.name.substring(file.name.lastIndexOf('.') + 1)
      let annexType = this.annexTypeDatas[0]
      if (!this.imgTypes.includes(type)) {
        annexType = '其它'
      }
      // 判断重复
      if (this.tableFileList && this.tableFileList.length) {
        let i = 0
        for (i; i < this.tableFileList.length; i++) {
          if (this.tableFileList[i].annexName == file.name) {
            window.$oAntdMessage.warning(`文件${file.name}重复`)
            return false
          }
        }
      }
      this.fileList.push(file)
      this.tableFileList.push({
        key: file.uid,
        annexName: file.name,
        annexUrl: '',
        uid: file.uid,
        annexTypeName: annexType,
        disabled: annexType === '其它',
        status: 1, // 1等待上传，2上传成功，3其他上传失败,
        id: '',
      })
      return false
    },
    async uploadFile(file) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await window.$oAjax({
          url: '/uploadController.do?upload',
          method: 'post',
          data: formData,
        })
        if (res && res.success) {
          const file = res.obj
          if (file && file.length > 0) {
            return file[0]
          }
        }
        return Promise.reject(res)
      }
      catch (err) {
        return Promise.reject(err)
      }
    },
    // 获取类型列表
    async getAnnexTypeDatas() {
      try {
        const res = await window.$oAjax.get('/rest/indicator/annex/type')
        if (res.code === 20000) {
          this.annexTypeDatas = res.data || []
        }
        else {
          window.$oAntdMessage.error(res.message || '获取类型列表失败')
        }
      }
      catch (err) {
        window.$oAntdMessage.error(err.message || '获取类型列表失败')
      }
    },
    // 检查是否选择类型
    checkNoAnnexType() {
      return this.tableFileList.some(d => !d.annexType)
    },
    // 删除附件
    deleteFile(row, ind) {
      this.tableFileList.splice(ind, 1)
      if (row.uid) {
        // 删除还未上传的文件
        const n = this.fileList.findIndex(d => d.uid === row.uid)

        n !== -1 && this.fileList.splice(n, 1)
      }
    },
    // 预览
    previewFile(url) {
      window.open(url, '_blank')
    },
    // 获取文件流
    getFileBlob(url, name) {
      window.$oAjax({
        url,
        method: 'get',
        responseType: 'blob',
      }).then((res) => {
        const blob = new Blob([res])
        const url = window.URL.createObjectURL(blob)
        downloadFile(url, name)
      })
    },
    async save() {
      if (this.spinning)
        return
      this.spinning = true
      const failFiles = []
      if (this.fileList.length > 0) {
        for (let i = 0; i < this.fileList.length; i++) {
          const file = this.fileList[i]
          try {
            this.tipText = `正在上传${file.name}`
            const resFile = await this.uploadFile(file)
            const ind = this.tableFileList.findIndex(d => d.uid === file.uid)
            this.tableFileList[ind].annexUrl = resFile.realpath
            this.tableFileList[ind].status = 2 // 判断状态
            this.tableFileList[ind].id = resFile.id // 收集上传成功的id
            delete this.tableFileList[ind].uid
            delete this.tableFileList[ind].key
          }
          catch (err) {
            // eslint-disable-next-line no-console
            console.log(err)
            failFiles.push(file)
            // 查找失败元素
            const ind = this.tableFileList.findIndex(d => d.uid === file.uid)
            this.tableFileList[ind].status = 3 // 判断失败状态判断状态
            window.$oAntdMessage.error(`文件“${file.name}”上传失败`)
          }
        }
      }
      this.spinning = false
      if (failFiles.length > 0) {
        this.fileList = failFiles
        return
      }
      this.visible = false
      $emit(this, 'uploadSucess', [...this.tableFileList])
    },
    setFileData(list) {
      // const datalist = list.map(item => {
      //   return {
      //     uid: item.uid,
      //     name: item.name,
      //     status: 2
      //   }
      // })
      this.tableFileList = list
      // this.fileList = datalist
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.ant-table-tbody) {
  > tr > td i.ant-select-arrow-icon {
    font-size: 12px;
    margin-right: 0px;
  }
}
</style>
