<template>
  <div>
    <DetailForm :data="data" />
  </div>
</template>

<script>
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import DetailForm from './DetailForm.vue'

export default {
  components: {
    DetailForm,
  },
  props: ['businessKey'],
  data() {
    return {
      data: [],
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get('/trainPlanController.do?getById', {
          params: {
            id: this.businessKey,
          },
        })
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.obj
        const customizeValues = res.attributes.customizeValues || []

        this.data = [
          { label: '培训主题', value: obj.theme },
          { label: '培训内容', value: obj.content },
          { label: '培训时间', value: formatDate(obj.trainTime, 'YYYY-MM-DD') },
          { label: '培训地点', value: obj.address },
          { label: '培训讲师', value: obj.lecturer },
          { label: '培训对象', value: obj.trainObject },
          { label: '培训类型', value: obj.type },
          { label: '培训形式', value: obj.trainForm },
          { label: '培训时长', value: obj.duration },
          ...customizeValues.map(i => ({
            label: i.columnName,
            value: i.columnValue,
          })),
        ]
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
  },
}
</script>
