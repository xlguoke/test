<template>
  <div>
    <MobileTitleBar left-arrow @click-left="$router.go(-1)" />

    <div class="eqdetails">
      <p style="display: flex; justify-content: space-between">
        <span>设备名称：{{ eqDetils.name }}</span>
        <van-tag v-if="String(eqDetils.transferStatus) === 10" color="#6fae00">
          闲置
        </van-tag>
        <van-tag v-if="String(eqDetils.transferStatus) === 20" color="#154bd0">
          调拨中
        </van-tag>
        <van-tag v-if="String(eqDetils.transferStatus) === 30" type="warning">
          使用中
        </van-tag>
        <van-tag v-if="String(eqDetils.transferStatus) === 40" type="success">
          已安装
        </van-tag>
        <van-tag v-if="String(eqDetils.transferStatus) === 50" color="#ff99aa">
          已移交
        </van-tag>
      </p>
      <p>设备编号：{{ eqDetils.equipmentSn }}</p>
      <p>资产编号：{{ eqDetils.assetSn }}</p>
      <p>设备状态：{{ eqDetils.status }}</p>
      <p>规格型号：{{ eqDetils.standard }}</p>
      <p>量程：{{ eqDetils.eqRange }}</p>
      <p>精度：{{ eqDetils.accuracy }}</p>
      <p>下次校验时间：{{ eqDetils.nextCheckDate }}</p>
    </div>
    <van-form>
      <van-cell-group inset>
        <FormItemDate
          v-model:value="callInTime"
          required
          label="调入日期"
          placeholder="请选择调入日期"
        />

        <FormItemInput
          v-model:value="callOutRemark"
          label="备注"
          placeholder="请输入备注"
          autosize
        />

        <FormItemRadio
          v-model:value="abnormal"
          label="是否异常"
          :options="[
            { label: '是', value: '1' },
            { label: '否', value: '0' },
          ]"
        />

        <van-field
          name="uploader"
          label="附件"
          input-align="right"
        >
          <template #input>
            <van-uploader v-model="fileList" :after-read="afterRead" />
          </template>
        </van-field>
      </van-cell-group>
    </van-form>

    <ActionBar>
      <van-button type="primary" @click="submitCallout">
        确定
      </van-button>
    </ActionBar>
  </div>
</template>

<script>
import {
  showNotify,
} from 'vant'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemRadio from '~/views/mobileApp/components/MobileFormItem/FormItemRadio.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    ActionBar,
    FormItemRadio,
    FormItemDate,
    FormItemInput,
    MobileTitleBar,
  },
  data() {
    return {
      callInTime: formatDate(new Date(), 'YYYY-MM-DD'),
      callOutRemark: '',
      fileList: [],
      abnormal: '0',
      eqid: this.$route.params.id,
      eqDetils: {},
    }
  },
  computed: {},
  created() {
    this.getdepDetails()
  },
  methods: {
    submitCallout() {
      this.submitCallIn()
    },
    getdepDetails() {
      mRequest
        .get(`rest/equipmentNewController/detail?id=${this.eqid}`, {})
        .then((res) => {
          if (res.code === 20000) {
            this.eqDetils = res.data
          }
        })
    },
    submitCallIn() {
      if (!this.callInTime) {
        showNotify({ type: 'warning', message: '请检查必填项' })
        return
      }
      const fileids = this.fileList.map((item) => {
        return item.obj.id
      })
      const params = {
        eqIds: [this.eqid],
        attachmentIds: fileids,
        operateType: '20',
        callInTime: `${this.callInTime} 00:00:00`,
        abnormal: this.abnormal,
      }

      mRequest({
        method: 'POST',
        url: 'rest/eqTransfer/record',
        data: JSON.stringify(params),
        headers: {
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          showNotify({ type: 'success', message: '调入成功' })
          this.$router.go(-1)
        }
      })
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
            file.obj = res.obj[0]
          }
        })
        .catch((_) => {
          file.status = 'failed'
          file.message = '上传失败'
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
