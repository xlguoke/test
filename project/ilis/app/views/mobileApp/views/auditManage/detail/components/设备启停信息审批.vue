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
        .get('/eqStartstopController.do?getById', {
          params: {
            id: this.businessKey,
          },
        })
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.obj
        this.data = [
          { label: '操作类型', value: obj.ssType === '1' ? '启用' : '停用' },
          { label: '选择设备', value: obj.equipmentName },
          { label: '保管人', value: obj.keeper },
          { label: '地点', value: obj.site },
          { label: '日期', value: formatDate(obj.ssTime, 'YYYY-MM-DD') },
          { label: '申请理由', value: obj.reason },
          { label: '申请说明', value: obj.applyExplain },
          { label: '技术状况说明', value: obj.technicalStatus },
          {
            label: '检校证书',
            fileId: obj.id,
            fileKey: 'EQ_START_STOP_CHECK_FILE',
          },
          {
            label: '其他附件材料',
            fileId: obj.id,
            fileKey: 'EQ_START_STOP_OTHER_FILE',
          },
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
