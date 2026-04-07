<template>
  <div>
    <SubTitle>基本信息</SubTitle>
    <DetailForm :data="data" />
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
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get('eqInspect.do?getById', {
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
          { label: '期间核查计划', value: obj.inspectPlanName },
          { label: '选择设备', value: obj.equipmentName },
          { label: '核查部门', value: obj.departName },
          { label: '核查人员', value: obj.personName },
          { label: '计划执行时间', value: obj.planTimes },
          {
            label: '核查时间',
            value: formatDate(obj.inspectTime, 'YYYY-MM-DD'),
          },
          { label: '核查内容', value: obj.inspectContent },
          { label: '核查结果及评价', value: obj.inspectResult },
          { label: '评价人', value: obj.resultPersonName },
          { label: '说明', value: obj.inspectExplain },
          {
            label: '附件材料',
            fileList: obj.files.map(item => ({
              uid: item.attachmentId,
              name: item.name,
              url: item.url,
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
