<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <van-cell-group>
      <van-field
        v-model="data.personName"
        placeholder="请选择"
        readonly
        input-align="right"
      >
        <template #label>
          <i class="red" style="margin-right: 8px">*</i>检验人
        </template>
        <template v-if="!readonly" #button>
          <van-button
            size="small"
            plain
            type="primary"
            @click="selectPersonVisible = true"
          >
            选择
          </van-button>
        </template>
      </van-field>

      <FormItemDate
        v-model:value="data.verifyTime"
        label="检验时间"
        :placeholder="placeholder"
      />

      <van-field
        v-model="data.content"
        label="修复程度检验"
        :placeholder="placeholder"
        :rows="1"
        autosize
        type="textarea"
        input-align="right"
        :readonly="readonly"
      />
      <van-field name="uploader" label="附件" input-align="right">
        <template #input>
          <van-uploader
            v-model="fileList"
            accept="*"
            :after-read="afterRead"
            :before-delete="beforeDelete"
            :disabled="readonly"
            :deletable="!readonly"
            @click-preview="clickPreview"
          />
        </template>
      </van-field>
    </van-cell-group>

    <SelectPerson
      v-model:value="selectPersonVisible"
      @selected-ok="getPerson"
    />
  </div>
</template>

<script>
// eslint-disable vue/no-mutating-props
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import SelectPerson from '~/views/mobileApp/components/selectPerson.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { $emit } from '../../../utils/gogocodeTransfer'

export default {
  components: {
    FormItemDate,
    SelectPerson,
  },
  props: ['data', 'detailData', 'readonly'],
  emits: ['update:formData'],
  data() {
    return {
      labelWidth: '6em',
      selectPersonVisible: false,
      fileList: [],
    }
  },
  computed: {
    placeholder() {
      return !this.readonly ? '请输入' : ''
    },
  },
  watch: {
    data: {
      handler(val) {
        $emit(this, 'update:formData', val)
      },
      deep: true,
    },
    detailData: {
      handler(data) {
        if (data.id) {
          this.initData()
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    initData() {
      const data = { ...this.detailData }
      const repairVerifyVo = data.repairVerifyVo || {}
      const attachments = repairVerifyVo.attachments || []

      this.fileList = attachments.map(i => ({
        id: i.id,
        title: i.attachmenttitle,
        url: i.realpath,
        obj: i,
        file: {
          name: i.attachmenttitle,
        },
      }))
    },
    getPerson(rows) {
      const row = rows[0]
      // eslint-disable-next-line vue/no-mutating-props
      this.data.personId = row.id
      // eslint-disable-next-line vue/no-mutating-props
      this.data.personName = row.name
    },
    afterRead(file) {
      file.status = 'uploading'
      file.message = '上传中...'
      const formData = new FormData()
      formData.append('file', file.file)
      mRequest
        .post(api.common.upload, formData)
        .then((res) => {
          file.status = 'done'
          file.message = '上传成功'
          if (res.obj && res.obj[0]) {
            const dataObj = res.obj[0]
            file.obj = dataObj
            file.id = dataObj.id

            const attachmentIds = this.data.attachmentIds
              ? this.data.attachmentIds.split(',')
              : []
            attachmentIds.push(dataObj.id)
            // eslint-disable-next-line vue/no-mutating-props
            this.data.attachmentIds = attachmentIds.join(',')
          }
        })
        .catch((_) => {
          console.warn(_)
          file.status = 'failed'
          file.message = '上传失败'
        })
    },
    beforeDelete(row) {
      let attachmentIds = this.data.attachmentIds
        ? this.data.attachmentIds.split(',')
        : []
      attachmentIds = attachmentIds.filter(i => i !== row.id)
      // eslint-disable-next-line vue/no-mutating-props
      this.data.attachmentIds = attachmentIds.join(',')
      this.fileList = this.fileList.filter(i => i.id !== row.id)
    },
    clickPreview(row) {
      const url = row.obj.realpath.toLocaleLowerCase()
      if (
        url.includes('jpg')
        || url.includes('jpeg')
        || url.includes('png')
      ) {
        return
      }

      downloadFile(row.obj.realpath, row.obj.attachmenttitle)
    },
  },
}
</script>
