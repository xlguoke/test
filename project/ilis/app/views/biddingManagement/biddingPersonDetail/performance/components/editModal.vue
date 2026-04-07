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
          name="projectName"
        >
          <a-input
            v-model:value="data.projectName"
            placeholder="请输入项目名称"
          />
        </a-form-item>
        <a-form-item
          label="担任职务"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          :rules="[{ required: true, message: '请输入担任职务！' }]"
          name="position"
        >
          <a-input
            v-model:value="data.position"
            placeholder="请输入担任职务"
          />
        </a-form-item>
        <a-form-item
          label="时间"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          name="positionDate"
          :rules="[{ required: true, message: '请选择时间！' }]"
        >
          <a-range-picker
            v-model:value="data.positionDate"
            style="width: 100%"
            value-format="YYYY-MM-DD"
          />
        </a-form-item>
        <a-form-item
          label="业绩文件"
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
      :max="5"
      :uploadcall="uploadcall"
      :file-lists="fileLists"
    />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
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
      dayjs,
    }
  },
  created() {
    // this.getSelectData()
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
        this.data.positionDate = data.positionDate.split('~')
        this.fileLists = data.performanceAttach.map(item => ({
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
          biddingPersonId: this.id,
        }

        data.performanceAttach = this.fileLists.map(item => ({
          attachmentId: item.uid,
          name: item.name,
          url: item.url,
        }))

        data.positionDate = data.positionDate
          .map(item => dayjs(item).format('YYYY-MM-DD'))
          .join('~')

        if (!this.isAdd) {
          data.id = this.data.id
        }

        window.$oAjax({
          method: 'POST',
          url: `${window.$oApi.biddingPerson.personPerformance}`,
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
