<template>
  <div>
    <SubTitle>基本信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      规程列表
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
        .get('rest/standardBookPurchaseController.do?getDetail', {
          params: {
            bookPurchaseId: this.businessKey,
          },
        })
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.data
        this.data = [
          { label: '申请人', value: obj.applyPerson },
          { label: '申请说明', value: obj.explains },
        ]

        this.list = (res.data.standardBookPurchaseDetailVos || []).map(
          item => [
            { label: '规程名称', value: item.bookName },
            { label: '颁布号', value: item.publishCode },
            { label: '单价/元', value: item.price },
            { label: '数量', value: item.amount },
            { label: '小计', value: item.total },
            { label: '原因及用途', value: item.purpose },
          ],
        )
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
