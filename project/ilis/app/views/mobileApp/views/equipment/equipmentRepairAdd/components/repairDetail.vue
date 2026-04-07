<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <van-cell-group>
      <van-field
        v-model="data.repairMan"
        :placeholder="placeholder"
        input-align="right"
        :readonly="readonly"
      >
        <template #label>
          <i class="red" style="margin-right: 8px">*</i>承修人
        </template>
      </van-field>
      <van-field
        v-model="data.repairUnit"
        label="承修单位"
        :placeholder="placeholder"
        input-align="right"
        :readonly="readonly"
      />
      <van-field
        v-model="data.materialFee"
        label="材料费"
        :placeholder="placeholder"
        input-align="right"
        :readonly="readonly"
        type="number"
        @input="checkFee"
      >
        <template #right-icon>
          元
        </template>
      </van-field>
      <van-field
        v-model="data.laborFee"
        label="人工费"
        :placeholder="placeholder"
        input-align="right"
        :readonly="readonly"
        type="number"
        @input="checkFee"
      >
        <template #right-icon>
          元
        </template>
      </van-field>
      <van-field
        v-model="data.otherFee"
        label="其他费用"
        :placeholder="placeholder"
        input-align="right"
        :readonly="readonly"
        type="number"
        @input="checkFee"
      >
        <template #right-icon>
          元
        </template>
      </van-field>
      <van-field
        v-model="data.totalFee"
        label="费用合计"
        :placeholder="placeholder"
        input-align="right"
        disabled
        type="number"
      >
        <template #right-icon>
          元
        </template>
      </van-field>
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
  </div>
</template>

<script>
import { api } from '~/views/mobileApp/provides/api/api'
import { downloadFile } from '~/views/mobileApp/provides/utils/downloadFile'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { $emit } from '../../../utils/gogocodeTransfer'

export default {
  props: ['data', 'detailData', 'readonly'],
  emits: ['update:formData'],
  data() {
    return {
      labelWidth: '6em',
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
  created() {},
  methods: {
    initData() {
      const data = { ...this.detailData }
      const repairDetailVo = data.repairDetailVo || {}
      const attachments = repairDetailVo.attachments || []

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
    checkFee() {
      const { materialFee, laborFee, otherFee } = this.data
      // eslint-disable-next-line vue/no-mutating-props
      this.data.totalFee
        = Number(materialFee || 0) + Number(laborFee || 0) + Number(otherFee || 0)
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
