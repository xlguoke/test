<template>
  <div>
    <SubTitle>审核信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      报告印章信息
    </SubTitle>
    <CardForm :data="list" />
  </div>
</template>

<script>
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
  props: ['businessKey', 'processInstanceId'],
  data() {
    return {
      data: [],
      list: [],
    }
  },
  created() {
    this.getDetail()
    this.getList()
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get(
          'rest/auditProcess/getProcessVariables?processInrest/auditProcess/getProcessVariables',
          {
            params: {
              processInstanceId: this.processInstanceId,
            },
          },
        )
        .finally(() => {
          toastLoading.close()
        })

      const columnRes = await mRequest.get(
        'rest/auditProcess/getStartFormData?auditTypeId=88',
      )

      if (res.code !== 20010) {
        const formProperties = JSON.parse(res.data.formProperties || '{}')

        this.data = (columnRes.data || []).map(item => ({
          label: item.name,
          value: formProperties[item.id],
        }))
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    async getList() {
      const res = await mRequest.get(
        `rest/stamp/audit/detail/${this.businessKey}`,
      )

      if (res.code !== 20010) {
        this.list = res.data.map((item, index) => [
          { label: '序号', value: index + 1 },
          { label: '报告编号', value: item.reportNumber },
          { label: '样品名称', value: item.sampleName },
          { label: '检测参数', value: item.params },
          { label: '报告印章', value: item.qualifications },
          {
            label: '资质及参数覆盖情况',
            value: (item.qualificationDetail || [])
              .map(i => this.renderQualificationDetail(i))
              .join(''),
          },
        ])
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    renderQualificationDetail(item) {
      if (item.omitType === '10') {
        return `<p style="color: #d9001b;">${item.qualificationName}：无参数</p>`
      }
      else if (item.omitType === '20') {
        return `<p style="color: #f59a23;">${item.qualificationName}：${item.omissiveParams}</p>`
      }
      else if (item.omitType === '30') {
        return `<p style="color: #70b603;">${item.qualificationName}：全覆盖</p>`
      }
    },
  },
}
</script>
