<template>
  <div>
    <ht-modal
      v-model:open="uploadVisible"
      title="更新进度"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-form ref="formRef" :model="data">
        <a-form-item
          label="工程名称"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-input
            v-model:value="data.name"
            :disabled="true"
          />
        </a-form-item>
        <a-form-item
          label="整体进度百分比"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-slider v-model:value="data.rateOfProgress" />
        </a-form-item>
        <a-form-item
          v-for="(item, index) in fieldsData"
          :key="index"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
          :label="item.columnName"
        >
          <a-input
            v-if="'input' === item.columnType"
            v-model:value="data[item.id]"
            :placeholder="`请输入${item.columnName}`"
          />
          <a-input-number
            v-if="'inputNumber' === item.columnType"
            v-model:value="data[item.id]"
            style="width: 100%"
            :placeholder="`请输入${item.columnName}`"
          />
          <a-radio-group
            v-if="'radio' === item.columnType"
            v-model:value="data[item.id]"
          >
            <a-radio value="是">
              是
            </a-radio>
            <a-radio value="否">
              否
            </a-radio>
          </a-radio-group>
          <a-textarea
            v-if="'textArea' === item.columnType"
            v-model:value="data[item.id]"
          />
          <a-select
            v-if="'select' === item.columnType"
            v-model:value="data[item.id]"
            :placeholder="`请选择${item.columnName}`"
          >
            <a-select-option
              v-for="cItem in item.columnValue ? item.columnValue.split(',') : []"
              :key="cItem + 1"
              :value="cItem"
            >
              {{ cItem }}
            </a-select-option>
          </a-select>
          <a-date-picker
            v-if="'date' === item.columnType"
            v-model:value="data[item.id]"
            value-format="YYYY-MM-DD"
          />
        </a-form-item>
        <a-form-item
          label="附件"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-button @click="upload">
            上传文件
          </a-button>
          <div v-for="(item, index) in fileLists" :key="index">
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
import { getQueryVariable } from '~/providers/common/utils'
import UploadComponent from '~/providers/components/uploadComponent.vue'

export default {
  components: {
    UploadComponent,
  },
  props: ['fieldsData', 'callback'],
  data() {
    return {
      id: getQueryVariable('id'),
      selectTreeVisible: false,
      uploadVisible: false,
      confirmLoading: false,
      typeData: [
        { name: '综合检测大纲', value: 0 },
        { name: '综合检测方案', value: 1 },
        { name: '检测细则', value: 2 },
        { name: '其它', value: 3 },
      ],
      data: {
        rateOfProgress: 0,
      },
      fileLists: [],
    }
  },
  methods: {
    showModal(data) {
      this.data = data
      this.uploadVisible = true
    },
    cancelModal() {
      this.data = {
        rateOfProgress: 0,
      }
      this.fileLists = []
      this.uploadVisible = false
    },
    handleSubmit() {
      if (this.fileLists.length == 0) {
        message.warn('请先上传文件')
        return
      }

      this.$refs.formRef.validateFields().then(() => {
        this.confirmLoading = true

        const customKeyValues = []
        for (let i = 0; i < this.fieldsData.length; i++) {
          const item = this.fieldsData[i]
          customKeyValues.push({
            columnId: item.id,
            columnValue: this.data[item.id] || '',
          })
        }
        const data = {
          unitProjectId: '',
          contractPartId: '',
          rateOfProgress: this.data.rateOfProgress,
          attachmentId: this.fileLists[0].uid,
          attachmentName: this.fileLists[0].name,
          customKeyValues,
        }

        if (this.data.type == 'contract') {
          data.contractPartId = this.data.key
        }
        else if (this.data.type == 'unit') {
          data.unitProjectId = this.data.key
        }

        window.$oRest({
          method: 'POST',
          url: window.$oApi.testItem.updateProgress,
          data,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then((res) => {
          if (res && res.code) {
            message.success(res.message)
            this.cancelModal()
            this.callback()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.confirmLoading = false
        }).catch((err) => {
          console.error(err)
          this.confirmLoading = false
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
