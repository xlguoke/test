<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <van-cell-group>
      <van-field
        v-model="data.equipmentName"
        placeholder="请选择"
        readonly
        input-align="right"
      >
        <template #label>
          <i class="red" style="margin-right: 8px">*</i>设备
        </template>
        <template v-if="!readonly" #button>
          <van-button
            size="small"
            plain
            type="primary"
            @click="selectEquipmentVisible = true"
          >
            选择
          </van-button>
        </template>
      </van-field>
      <van-field
        v-if="equipmentInfo.id"
        v-model="equipmentInfo.sn"
        label="设备编号"
        input-align="right"
        readonly
      />
      <van-field
        v-if="equipmentInfo.id"
        v-model="equipmentInfo.standard"
        label="规格型号"
        input-align="right"
        readonly
      />
      <van-field
        v-model="data.repairSn"
        label="维修单号"
        :placeholder="placeholder"
        input-align="right"
        :readonly="readonly"
      />

      <FormItemDate
        v-model:value="data.repairServiceEndTime"
        label="保修时间"
      />

      <van-field
        v-model="data.totalFee"
        label="维修费用"
        :placeholder="placeholder"
        type="number"
        input-align="right"
        :readonly="readonly"
      >
        <template #right-icon>
          元
        </template>
      </van-field>
      <van-field
        v-model="data.phenomenon"
        label="故障现象"
        :placeholder="placeholder"
        :rows="1"
        autosize
        type="textarea"
        input-align="right"
        :readonly="readonly"
      />
      <van-field
        v-model="data.reason"
        label="故障原因分析"
        :placeholder="placeholder"
        :rows="1"
        autosize
        type="textarea"
        input-align="right"
        :readonly="readonly"
      />
      <van-field
        v-model="data.disposeWay"
        label="损坏后的处理"
        :placeholder="placeholder"
        :rows="1"
        autosize
        type="textarea"
        input-align="right"
        :readonly="readonly"
      />
      <van-field
        v-model="data.remark"
        label="备注"
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

    <SelectEquipment
      v-model:value="selectEquipmentVisible"
      @selected-ok="getEquipment"
    />
  </div>
</template>

<script>
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import SelectEquipment from '~/views/mobileApp/components/selectEquipment.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { downloadFile } from '~/views/mobileApp/provides/utils/downloadFile'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { $emit } from '../../../utils/gogocodeTransfer'

export default {
  components: {
    FormItemDate,
    SelectEquipment,
  },
  props: ['data', 'detailData', 'readonly'],
  emits: ['update:formData'],
  data() {
    return {
      labelWidth: '6em',
      selectEquipmentVisible: false,
      equipmentInfo: {},
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
      const attachments = data.attachments || []

      this.fileList = attachments.map(i => ({
        id: i.id,
        title: i.attachmenttitle,
        url: i.realpath,
        obj: i,
        file: {
          name: i.attachmenttitle,
        },
      }))

      this.equipmentInfo.id = data.equipmentVo.id
      this.equipmentInfo.name = data.equipmentVo.name
      this.equipmentInfo.sn = data.equipmentVo.archiveSn
      this.equipmentInfo.standard = data.equipmentVo.standard
    },
    getFormData() {
      if (!this.data.equipmentId) {
        showFailToast('请选择设备！')
        return false
      }

      return this.data
    },
    getEquipment(rows) {
      const row = rows[0]
      // eslint-disable-next-line vue/no-mutating-props
      this.data.equipmentId = row.id
      // eslint-disable-next-line vue/no-mutating-props
      this.data.equipmentName = row.name

      this.equipmentInfo.id = row.id
      this.equipmentInfo.name = row.name
      this.equipmentInfo.sn = row.archiveSn
      this.equipmentInfo.standard = row.standard
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
