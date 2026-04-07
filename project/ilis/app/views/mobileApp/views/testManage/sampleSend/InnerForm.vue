<template>
  <div>
    <van-form ref="form" label-width="100px">
      <FormItemRadio
        v-model:value="formData.taskType"
        label="送样类型"
        :options="[
          { label: '立即送样（机器人送样）', value: 'IMMEDIATE' },
          { label: '预约送样（机器人送样）', value: 'APPOINTMENT' },
          { label: '自行送样（人工自取）', value: 'SELF_DELIVERY' },
        ]"
      />

      <van-field
        v-model="formData.objectName"
        readonly
        autosize
        disabled
        label="样品名称"
        type="objectName"
        placeholder="请选择"
      />

      <van-field
        v-model="formData.objectCode"
        readonly
        autosize
        disabled
        label="样品编号"
        type="objectCode"
        placeholder="请选择"
      />

      <FormItemDate
        v-if="formData.taskType === 'APPOINTMENT'"
        v-model:value="formData.requestDeliveryTime"
        label="要求送达时间"
        required
        enable-time
        :rules="[{ required: true, message: '请选择要求送达时间' }]"
        placeholder="请选择"
      />

      <van-field
        v-model="lab.name"
        readonly
        autosize
        required
        label="功能室"
        placeholder="请选择"
        is-link
        input-align="right"
        :rules="[{ required: true, message: '请选择功能室' }]"
        @click-input="selectLabVsibile = true"
      />

      <FormItemSwitch
        v-model:value="formData.appointmentTemperatureAndHumidity"
        label="是否预约功能室温湿度"
      />
    </van-form>

    <MobileLabSelector
      v-model:open="selectLabVsibile"
      :query="{ isIotLab: 1 }"
      :selected-rows="[lab]"
      @select="getLab"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemRadio from '~/views/mobileApp/components/MobileFormItem/FormItemRadio.vue'
import FormItemSwitch from '~/views/mobileApp/components/MobileFormItem/FormItemSwitch.vue'
import MobileLabSelector from '~/views/mobileApp/components/MobileSelector/MobileLabSelector.vue'
import { $emit } from '../../utils/gogocodeTransfer'

export default {
  components: {
    FormItemRadio,
    FormItemDate,
    FormItemSwitch,
    MobileLabSelector,
  },
  emits: ['formStateChange'],
  data() {
    return {
      formData: {
        taskType: 'APPOINTMENT',
        labId: '',
        requestDeliveryTime: dayjs().hour(8).minute(0).second(0).format('YYYY-MM-DD HH:mm:ss'),
      },
      lab: {},
      selectLabVsibile: false,
      isSubmit: false,
    }
  },
  watch: {
    formData: {
      handler(val) {
        $emit(this, 'formStateChange', val)
      },
      deep: true,
    },
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      const testTaskData = JSON.parse(
        sessionStorage.getItem('reservationLabPageData'),
      )
      this.formData.taskId = testTaskData.id
      this.formData.taskCode = testTaskData.testTaskCode
      this.formData.objectName = testTaskData.testSampleDisplayName
      this.formData.objectCode = testTaskData.testObjectCode || '-'
      this.testTask = testTaskData
    },
    checkIsDefine(val) {
      return val !== null && val !== undefined
    },
    // 保存操作
    async getFormData() {
      return new Promise((resolve, _reject) => {
        this.$refs.form.validate().then(() => {
          resolve(this.formData)
        })
      })
    },
    getLab(data) {
      const [item] = data
      this.lab = item
      this.formData.labId = item.id
      this.formData.labName = item.name
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
