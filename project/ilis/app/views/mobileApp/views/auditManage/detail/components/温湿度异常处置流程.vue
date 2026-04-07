<template>
  <div>
    <SubTitle>基本信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      处理记录
    </SubTitle>
    <DetailForm :data="data2" />
  </div>
</template>

<script>
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import DetailForm from './DetailForm.vue'
import SubTitle from './SubTitle.vue'

export default {
  components: {
    DetailForm,
    SubTitle,
  },
  props: ['businessKey'],
  data() {
    return {
      data: [],
      data2: [],
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get(`rest//humiture/record/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.data

        this.data = [
          { label: '功能室', value: obj.laboratoryName },
          {
            label: '巡查时间',
            value: formatDate(obj.recordDate, 'YYYY-MM-DD HH:mm:ss'),
          },
          { label: '标准温度（℃）', value: obj.standardTem },
          { label: '巡查温度（℃）', value: obj.tem },
          { label: '温度状态', value: this.getStatus(obj.temStatus) },
          { label: '标准湿度（℃）', value: obj.standardHum },
          { label: '巡查湿度（℃）', value: obj.hum },
          { label: '湿度状态', value: this.getStatus(obj.humStatus) },
        ]

        this.data2 = [
          { label: '处理人', value: obj.handleUser },
          {
            label: '处理时间',
            value: formatDate(obj.handleDate, 'YYYY-MM-DD HH:mm:ss'),
          },
          { label: '处理内容', value: obj.handleContent },
          { label: '附件', fileId: obj.id, fileKey: 'EQ' },
        ]
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
