<template>
  <div class="reservationLab">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <!-- eslint-disable-next-line vue/v-on-event-hyphenation -->
    <InnerForm ref="innerFormRef" @formStateChange="handleChange"></InnerForm>
    <ReservationLabForm
      v-if="showReservationLabForm"
      ref="reservationLabFormRef"
      :hide-fields="['taskId', 'laboratoryIotEqType', 'laboratoryId']"
    ></ReservationLabForm>

    <div class="reservationLab-btns">
      <van-row>
        <van-col span="12">
          <van-button block type="primary" square @click="submit">
            确定
          </van-button>
        </van-col>
        <van-col span="12">
          <van-button
            block
            square
            @click="
              () => {
                $router.go(-1)
              }
            "
          >
            取消
          </van-button>
        </van-col>
      </van-row>
    </div>
  </div>
</template>

<script>
import { showDialog, showLoadingToast, showNotify } from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import ReservationLabForm from '../reservationLab/InnerForm.vue'
import InnerForm from './InnerForm.vue'

export default {
  components: {
    ReservationLabForm,
    InnerForm,
    MobileTitleBar,
  },
  beforeRouteLeave(to, from, next) {
    if (this.isSubmit === true && to.name === 'testTask') {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.resetPage = true
    }
    next()
  },
  data() {
    return {
      isSubmit: false,
      showReservationLabForm: false,
    }
  },
  methods: {
    // 保存操作
    async submit() {
      const reservationLabPromise = this.$refs.reservationLabFormRef
        ? this.$refs.reservationLabFormRef.getFormData()
        : Promise.resolve(null)
      const [data, dataTH] = await Promise.all([
        this.$refs.innerFormRef.getFormData(),
        reservationLabPromise,
      ])
      const query = {
        ...data,
        ...(dataTH
          ? {
              humitureResFrom: {
                ...dataTH,
                taskId: data.taskId,
                laboratoryId: data.labId,
                testParams: '',
              },
            }
          : {}),
      }
      if (data.taskType !== 'APPOINTMENT') {
        delete query.requestDeliveryTime
      }
      if (query.humitureResFrom && query.humitureResFrom.testParams) {
        query.humitureResFrom.testParams
          = query.humitureResFrom.testParams.join(',')
      }

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      const res = await mRequest({
        url: 'rest/intelligent/sampling',
        headers: { 'Content-Type': ' application/json' },
        method: 'POST',
        data: query,
      }).finally(() => {
        toast.close()
      })

      if (res.code !== 20010) {
        showNotify({ type: 'success', message: '操作成功！' })
        this.isSubmit = true
        this.$router.go(-1)
      }
      else {
        showDialog({ message: res.msg || res.message || '操作失败' })
      }
    },
    handleChange(val) {
      this.showReservationLabForm = !!val.appointmentTemperatureAndHumidity
      if (this.showReservationLabForm && val.taskType === 'APPOINTMENT') {
        this.$nextTick(() => {
          this.$refs.reservationLabFormRef.formData.startDate
            = val.requestDeliveryTime
        })
      }
      this.$nextTick(() => {
        if (this.$refs.reservationLabFormRef) {
          this.$refs.reservationLabFormRef.formData.laboratoryId = val.labId
          this.$refs.reservationLabFormRef.formData.taskId = val.taskId
          this.$refs.reservationLabFormRef.lab = this.$refs.innerFormRef.lab
          this.$refs.reservationLabFormRef.getTestParamConfig()
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
