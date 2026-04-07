<template>
  <div>
    <van-sticky>
      <MobileTitleBar title="样品出入库详情" left-arrow @click-left="$router.go(-1)">
      </MobileTitleBar>
    </van-sticky>

    <div class="flex p-4 items-center">
      <div class="flex-1">
        <p class="font-bold">
          {{ detail.sampleDisplayName }}
        </p>
        <p v-if="detail.standard">
          ({{ detail.standard }})
        </p>
      </div>

      <van-tag v-if="detail.getCount + detail.subCount" color="green">
        已出库
      </van-tag>
      <van-tag v-else>
        未出库
      </van-tag>
    </div>

    <div class="px-4">
      <FormItemInput
        label="入库日期"
        :value="detail.storageDate ? dayjs(detail.storageDate).format('YYYY-MM-DD') : ''"
        :readonly="true"
      />

      <FormItemInput
        label="试样数量"
        :value="detail.sampleNum"
        :readonly="true"
      />

      <FormItemInput
        label="存放地点"
        :value="detail.saveSite"
        :readonly="true"
      />

      <FormItemInput
        label="入库操作人"
        :value="detail.storageUser"
        :readonly="true"
      />

      <template v-if="detail.getCount">
        <FormItemInput
          label="出库方式"
          value="领取样品"
          :readonly="true"
        />

        <FormItemInput
          label="领样人"
          :value="detail.getPerson"
          :readonly="true"
        />

        <FormItemInput
          label="经办人"
          :value="detail.getOperator"
          :readonly="true"
        />

        <FormItemInput
          label="领样日期"
          :value="detail.getDate ? dayjs(detail.getDate).format('YYYY-MM-DD') : ''"
          :readonly="true"
        />

        <FormItemInput
          label="领样数量"
          :value="detail.getAmount"
          :readonly="true"
        />
      </template>

      <template v-if="detail.subCount">
        <FormItemInput
          label="出库方式"
          value="分包样品"
          :readonly="true"
        />

        <FormItemInput
          label="分包单位"
          :value="detail.subUnit"
          :readonly="true"
        />

        <FormItemInput
          label="经办人"
          :value="detail.subOperator"
          :readonly="true"
        />

        <FormItemInput
          label="分包日期"
          :value="detail.subDate ? dayjs(detail.subDate).format('YYYY-MM-DD') : ''"
          :readonly="true"
        />

        <FormItemInput
          label="分包数量"
          :value="detail.subCount"
          :readonly="true"
        />
      </template>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

export default {
  components: {
    FormItemInput,
    MobileTitleBar,
  },
  data() {
    return {
      formatDate,
      detail: {
        saveDate: '',
      },
      id: '',
    }
  },
  computed: {},
  mounted() {
    const query = this.$route.query
    this.id = query.id ? query.id : ''
    const samplesDeliveryDetail = sessionStorage.getItem('samplesDeliveryDetail')
    this.detail = samplesDeliveryDetail ? JSON.parse(samplesDeliveryDetail) : {}
    // this.getPeriodDetail();
  },
  methods: {
    dayjs,
    getPeriodDetail() {
      const toast = showLoadingToast({
        duration: 0,
        message: '加载中...',
        forbidClick: true,
      })
      mRequest
        .get(api.samples.getPeriodDetail, {
          params: {
            id: this.id,
            page: this.currentPage,
            rows: this.pageSize,
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.detail = res.data ? res.data : {}
          }
          else {
            showDialog({ message: res.msg || res.message })
          }
        })
        .finally(() => {
          if (toast) {
            toast.close()
          }
        })
    },
  },
}
</script>
