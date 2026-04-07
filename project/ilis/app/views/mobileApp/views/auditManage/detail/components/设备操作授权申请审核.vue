<template>
  <div>
    <SubTitle>基本信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      授权操作人员
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
        .get(`rest/eq/auth/${this.businessKey}`, {})
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.data

        this.data = [
          { label: '设备名称', value: obj.name },
          { label: '设备编号', value: obj.equipmentSn },
          { label: '附件', fileId: this.businessKey, fileKey: 'EQ_IOT_AUTH' },
        ]

        this.list = (obj.detail || []).map(i => [
          { label: '姓名', value: i.personName },
          { label: '任职部门', value: i.department },
          {
            label: '人员状态',
            value: i.personStatus === '0' ? '在职' : '离职',
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
  },
}
</script>
