<template>
  <div>
    <SubTitle>基本信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      巡查记录
    </SubTitle>
    <CardForm :data="list" />
  </div>
</template>

<script>
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import CardForm from './CardForm.vue'
import DetailForm from './DetailForm.vue'
import SubTitle from './SubTitle.vue'

export default {
  components: {
    DetailForm,
    SubTitle,
    CardForm,
  },
  props: ['businessKey'],
  data() {
    return {
      data: [],
      list: [],
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get(`rest/humiture/ledger/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.data
        this.data = [
          {
            label: '开始时间',
            value: formatDate(obj.ledgerStartDate, 'YYYY-MM-DD'),
          },
          {
            label: '结束时间',
            value: formatDate(obj.ledgerEndDate, 'YYYY-MM-DD'),
          },
          { label: '功能室', value: obj.laboratoryName },
          { label: '台账名称', value: obj.name },
        ]

        this.list = obj.recordList.map((item, index) => [
          { label: '序号', value: index + 1 },
          {
            label: '巡查时间',
            value: formatDate(item.recordDate, 'YYYY-MM-DD HH:mm:ss'),
          },
          { label: '功能室', value: item.laboratoryName },
          { label: '标准温度（℃）', value: item.standardTem },
          { label: '巡查温度（℃）', value: item.tem },
          { label: '温度状态', value: this.getStatus(item.temStatus) },
          { label: '标准湿度（%RH）', value: item.standardHum },
          { label: '巡查湿度（%RH）', value: item.hum },
          { label: '湿度状态', value: this.getStatus(item.humStatus) },
        ])
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    getStatus(val) {
      return ['OVER', 'LOWER'].includes(val) ? '超标' : '正常'
    },
  },
}
</script>
