<template>
  <div>
    <SubTitle>核查基础信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      核查设备
    </SubTitle>
    <CardForm :data="eqList" />
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
  props: ['businessKey'],
  data() {
    return {
      data: [],
      eqList: [],
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get(`rest/equipment/function/check/plan/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const data = res.data

        this.data = [
          { label: '计划名称', value: data.name },
          { label: '计划编号', value: data.code },
          { label: '计划说明', value: data.description },
          { label: '计划日期', value: `${data.startDate} ~ ${data.endDate}` },
        ]

        this.eqList = (data.details || []).map(i => [
          { label: '设备名称', value: i.equipmentName },
          { label: '设备编号', value: i.equipmentCode },
          { label: '规格型号', value: i.standard },
          { label: '所属部门', value: i.department },
          { label: '核查部门', value: i.checkDepartment },
          { label: '核查人', value: i.checkUser },
          {
            label: '核查项目',
            value: (i.checkItems || []).map(j => j.name).join('；'),
          },
          { label: '备注', value: i.remark },
        ])
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
