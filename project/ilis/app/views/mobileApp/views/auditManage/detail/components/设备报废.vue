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
        .get('/eqScrapController.do?getById', {
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
          { label: '选择设备', value: obj.equipmentName },
          { label: '报废类型', value: obj.scrapType },
          { label: '报废单号', value: obj.scrapSn },
          { label: '申请时间', value: formatDate(obj.applyTime, 'YYYY-MM-DD') },
          { label: '报废时间', value: formatDate(obj.scrapTime, 'YYYY-MM-DD') },
          { label: '经办部门', value: obj.operationDepart },
          { label: '文件号', value: obj.fileSn },
          { label: '处理依据', value: obj.gist },
          { label: '报废原因', value: obj.reason },
          { label: '备注', value: obj.remark },
          {
            label: '附件材料',
            fileList: (obj.files || []).map(i => ({
              name: i.name,
              url: i.url,
            })),
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
