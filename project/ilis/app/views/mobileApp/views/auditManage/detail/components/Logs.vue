<template>
  <div style="padding-top: 8px">
    <CardForm :data="logs" />
    <van-empty v-if="!logs.length" description="暂无数据" />
  </div>
</template>

<script>
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import CardForm from './CardForm.vue'

export default {
  components: {
    CardForm,
  },
  props: ['businessKey', 'processTypeId'],
  data() {
    return {
      logs: [],
    }
  },
  created() {
    this.getLogs()
  },
  methods: {
    // 获取日志
    async getLogs() {
      const res = await mRequest.get('/rest/auditProcess/processLogs', {
        params: {
          businessKey: this.businessKey,
          processTypeId: this.processTypeId,
        },
      })

      this.logs = res.data.map(item => [
        { label: '对象编号', value: item.objectSn },
        { label: '内容', value: item.content },
        { label: '处理人', value: item.createName },
        { label: '处理意见', value: item.opinion },
        {
          label: '时间',
          value: formatDate(item.createDate, 'YYYY-MM-DD HH:mm:ss'),
        },
      ])
    },
  },
}
</script>
