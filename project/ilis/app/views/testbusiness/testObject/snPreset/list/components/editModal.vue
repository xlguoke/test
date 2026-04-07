<template>
  <div>
    <ht-modal
      v-model:open="uploadVisible"
      :title="isAdd ? '新增' : '编辑'"
      centered
      :confirm-loading="confirmLoading"
      class="otherAchievement-uploadModal"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="data">
        <a-form-item
          label="项目名称"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          :rules="[{ required: true, message: '请输入项目名称' }]"
          name="projectName"
        >
          <a-input
            v-model:value="data.projectName"
            placeholder="请输入项目名称"
          />
        </a-form-item>
        <a-form-item
          label="招标单位"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          :rules="[{ required: true, message: '请输入招标单位！' }]"
          name="bidUnit"
        >
          <a-input
            v-model:value="data.bidUnit"
            placeholder="请输入招标单位"
          />
        </a-form-item>
        <a-form-item
          label="招标公告时间"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-date-picker
            v-model:value="data.announcementTime"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            show-time
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </a-form-item>
        <a-form-item
          label="开标时间"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          :rules="[{ required: true, message: '请选择开标时间！' }]"
          name="bidTime"
        >
          <a-date-picker
            v-model:value="data.bidTime"
            style="width: 100%"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            show-time
          />
        </a-form-item>

        <a-form-item
          label="招标文件"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
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
      :max="1"
      :uploadcall="uploadcall"
      :file-lists="fileLists"
    />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
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
      data: {},
      dayjs,
    }
  },
  created() {},
  methods: {
    showModal(data) {
      if (data) {
        this.isAdd = false
        this.data = data
        this.fileLists = data.recordAttach.map(item => ({
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
        }

        data.recordAttach = this.fileLists.map(item => ({
          attachmentId: item.uid,
          name: item.name,
          url: item.url,
        }))

        data.bidTime = data.bidTime
          ? new Date(
              dayjs(data.bidTime).format('YYYY-MM-DD HH:mm:ss'),
            ).getTime()
          : ''
        data.announcementTime = data.announcementTime
          ? new Date(
              dayjs(data.announcementTime).format('YYYY-MM-DD HH:mm:ss'),
            ).getTime()
          : ''

        if (!this.isAdd) {
          data.id = this.data.id
        }

        window.$oAjax({
          method: 'POST',
          url: `${window.$oApi.biddingRecord.operation}`,
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
        uid: item.id,
        name: item.attachmenttitle,
        status: 'done',
        url: item.realpath,
      }))
    },
  },
}
</script>
