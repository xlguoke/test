<template>
  <div>
    <ht-modal
      v-model:open="uploadVisible"
      :title="isAdd ? '新增' : '编辑'"
      centered
      :confirm-loading="confirmLoading"
      class="otherAchievement-uploadModal"
      :mask-closable="false"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="data">
        <a-form-item
          label="单位名称"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
          :rules="[{ required: true, message: '请输入单位名称！' }]"
          name="unitName"
        >
          <a-input
            v-model:value="data.unitName"
            placeholder="请输入单位名称"
          />
        </a-form-item>
        <a-form-item
          label="报价"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
          :rules="[{ required: true, message: '请输入报价！' }]"
          name="quoteAmount"
        >
          <a-inputNumber
            v-model:value="data.quoteAmount"
            style="width: 200px"
            placeholder="请输入报价"
          />
          <span
            style="font-size: 12px; vertical-align: middle; margin-left: 5px"
          >元</span>
        </a-form-item>
        <a-form-item
          label="其他说明"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
          name="otherDescription"
        >
          <a-textarea
            v-model:value="data.otherDescription"
            :rows="4"
            placeholder="请输入其他说明"
          />
        </a-form-item>
        <a-form-item
          label="附件"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-button @click="upload">
            上传文件
          </a-button>
          <div
            v-for="(item, index) in fileLists"
            :key="index"
            style="font-size: 12px"
          >
            {{ item.name }}
          </div>
        </a-form-item>
      </a-form>
    </ht-modal>
    <UploadComponent
      ref="UploadComponent"
      :max="5"
      :uploadcall="uploadcall"
      :file-lists="fileLists"
    />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import qs from 'qs'
import UploadComponent from '~/providers/components/uploadComponent.vue'

export default {
  components: {
    UploadComponent,
  },
  props: ['callback', 'id'],
  data() {
    return {
      uploadVisible: false,
      confirmLoading: false,

      fileLists: [],
      isAdd: true,
      professionData: [],
      typeData: [],
      data: {},
    }
  },
  created() {
    this.getSelectData()
  },
  methods: {
    getSelectData() {
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictionaryData,
        data: qs.stringify({ dictGroupId: '4028821e6eb14554016eb1e11006000c' }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          this.professionData = res.obj
        }
        else {
          message.error(res.msg)
        }
      })

      window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictionaryData,
        data: qs.stringify({ dictGroupId: '4028821e6eb14554016eb1dfd7d80006' }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          this.typeData = res.obj
        }
        else {
          message.error(res.msg)
        }
      })
    },
    showModal(data) {
      if (data) {
        this.isAdd = false
        this.data = data
        this.fileLists = data.unitAttach.map(item => ({
          uid: item.attachmentId,
          name: item.name,
          status: 'done',
          url: item.url,
        }))
      }
      else {
        this.data = {}
        this.isAdd = true
        this.fileLists = []
      }
      this.uploadVisible = true
    },
    cancelModal() {
      this.data = {}
      this.uploadVisible = false
    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        this.confirmLoading = true
        const data = {
          ...this.data,
          unitType: 1,
          recordId: this.id,
        }

        data.unitAttach = this.fileLists.map(item => ({
          attachmentId: item.uid,
          name: item.name,
          url: item.url,
        }))

        if (!this.isAdd) {
          data.id = this.data.id
        }

        window.$oAjax({
          method: 'POST',
          url: `${window.$oApi.biddingRecord.unitOperation}`,
          data,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then(
          (res) => {
            if (res && res.success) {
              this.cancelModal()
              message.success(res.message || res.msg)
              this.callback()
            }
            else {
              message.error(res.message || res.msg)
            }
            this.confirmLoading = false
          },
          () => {
            this.confirmLoading = false
          },
        )
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
