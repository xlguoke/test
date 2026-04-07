<template>
  <div>
    <SubTitle>基本信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      化学品信息
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
        .get(`rest/purchase/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.data

        this.data = [
          { label: '申请单号', value: obj.requestCode },
          { label: '申请原因', value: obj.requestReason },
          { label: '申请部门', value: obj.requestDepartment },
          { label: '申请人', value: obj.applicant },
          { label: '备注', value: obj.description },
        ]

        this.list = (obj.items || []).map(i => [
          { label: '化学名称', value: i.name },
          { label: '化学品编号', value: i.code },
          { label: '规格', value: i.standard },
          { label: '数量', value: i.amount },
          { label: '单位', value: i.unit },
          { label: '备注', value: i.description },
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
