<template>
  <div>
    <ht-modal
      v-model:open="uploadVisible"
      :title="isAdd ? '新增' : '编辑'"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="formState">
        <a-form-item
          label="文件"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-button @click="upload">
            上传文件
          </a-button>
          <div v-for="(item, index) in fileLists" :key="index">
            {{ item.name }}
          </div>
        </a-form-item>
        <a-form-item
          label="备注"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-input
            v-model:value="formState.remarks"
            placeholder="请输入备注"
          />
        </a-form-item>
      </a-form>
    </ht-modal>
    <UploadComponent
      ref="UploadComponent"
      :max="1"
      :uploadcall="uploadcall"
      :file-lists="fileLists"
    />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import UploadComponent from '~/providers/components/uploadComponent.vue'
import TreeComponent from '../../testReport/components/tree.vue'

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    TreeComponent,
    UploadComponent,
  },
  props: ['treeInfo', 'callback', 'node', 'isAdd'],
  data() {
    return {
      selectTreeVisible: false,
      uploadVisible: false,
      confirmLoading: false,
      typeData: [
        { name: '综合检测大纲', value: 0 },
        { name: '综合检测方案', value: 1 },
        { name: '检测细则', value: 2 },
        { name: '其它', value: 3 },
      ],
      fileLists: [],
      data: {},
      formState: {},
    }
  },
  methods: {
    showModal(data) {
      if (data) {
        this.formState.remarks = data.remarks
        this.data = data
        this.fileLists = [
          {
            uid: data.attachmentId,
            name: data.attachmentName,
            status: 'done',
            url: '',
          },
        ]
      }
      else {
        this.data = {}
        this.formState.remarks = ''
        this.fileLists = []
      }
      this.uploadVisible = true
    },
    cancelModal() {
      this.uploadVisible = false
    },
    handleSubmit() {
      if (this.fileLists.length == 0) {
        message.warn('请上传文件')
        return
      }

      this.$refs.formRef.validateFields().then(() => {
        this.confirmLoading = true

        const values = { ...this.formState }

        const { uid, name } = this.fileLists[0]
        const method = this.isAdd ? 'POST' : 'PUT'

        const treeInfo = { ...this.treeInfo } || {}
        if (!this.isAdd) {
          if (this.data.contractPartId) {
            treeInfo.contractPartId = this.data.contractPartId
          }
          else {
            treeInfo.unitProjectId = this.data.unitProjectId
          }
          treeInfo.projectId = this.data.projectId
          treeInfo.id = this.data.id
        }

        window.$oRest(window.$oApi.testItem.appendixByFile, {
          method,
          data: {
            attachmentId: uid,
            attachmentName: name,
            ...treeInfo,
            ...values,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then((res) => {
          this.confirmLoading = false
          message.success(res.message)
          this.formState = {}
          this.cancelModal()
          if (this.isAdd) {
            this.callback(this.node.type, this.node.id)
          }
          else {
            const type = treeInfo.contractPartId ? 'contract' : 'unit'
            this.callback(type, treeInfo.id)
          }
        })
      })
    },
    upload() {
      this.$refs.UploadComponent.showModal()
    },
    uploadcall(res) {
      this.fileLists = res.map(item => ({
        uid: item.id || item.uid,
        name: item.attachmenttitle || item.name,
        status: 'done',
        url: item.realpath || item.url,
      }))
    },
  },
}
</script>

<style></style>
