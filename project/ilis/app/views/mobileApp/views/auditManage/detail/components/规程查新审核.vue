<template>
  <div>
    <SubTitle> 规程列表 </SubTitle>
    <CardForm :data="list" />
  </div>
</template>

<script>
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import CardForm from './CardForm.vue'
import SubTitle from './SubTitle.vue'

export default {
  components: {
    SubTitle,
    CardForm,
  },
  props: ['businessKey'],
  data() {
    return {
      list: [],
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get('rest/standard/check/new/detail-pagination', {
          params: {
            page: 1,
            size: 999,
            standardCheckNewId: this.businessKey,
          },
        })
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        this.list = res.rows.map((item, index) => [
          { label: '序号', value: index + 1 },
          { label: '规程名称', value: item.standardName },
          { label: '颁布号', value: item.standardPublishCode },
          { label: '规程类型', value: this.getStandardType(item.standardType) },
          { label: '查新结果', value: this.getStatus(item.status) },
          { label: '新规程', value: item.newStandard },
          { label: '执行日期', value: item.newStandardExecuteDate },
          { label: '查新人', value: item.checkUser },
          { label: '查新日期', value: item.checkDate },
          { label: '验证人员', value: item.verificationUserName },
        ])
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    getStandardType(val) {
      if (val === 3) {
        return '检测依据/评定标准'
      }
      else if (val === 2) {
        return '评定标准'
      }
      else if (val === 1) {
        return '检测依据'
      }
    },
    getStatus(val) {
      if (val === 'PENDING') {
        return '待查新'
      }
      else if (val === 'UPDATED') {
        return '更新规程'
      }
      else if (val === 'NOT_REQUIRED') {
        return '暂无更新'
      }
      else if (val === 'DEPRECATED') {
        return '已废止'
      }
    },
  },
}
</script>
