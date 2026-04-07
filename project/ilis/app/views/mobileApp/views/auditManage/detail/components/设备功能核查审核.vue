<template>
  <div>
    <SubTitle>基础信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      核查记录
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
        .get(`rest/equipment/function/check/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const data = res.data

        this.data = [
          { label: '核查部门', value: data.checkDepartment },
          { label: '核查人', value: data.checkUser },
          {
            label: '核查时间',
            value: `${data.checkStartDate} ~ ${data.checkEndDate}`,
          },
          { label: '备注', value: data.remark },
          { label: '核查结论', value: data.checkResult },
          { label: '附件', fileId: data.id, fileKey: 'EQ' },
        ]

        this.getList(data.checkItems || [])
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    async getList(checkItems) {
      const formData = new FormData()
      formData.append('dictGroupId', '6237f908815e4283bf66165ba1c2a16b')

      const res = await mRequest.post(
        'rest/dictionaryController.do?getListByGroupId',
        formData,
      )

      const obj = {}

      checkItems.forEach((item) => {
        obj[item.dictId] = {
          value: item.value,
        }
      })

      this.list = (res.obj || []).map(i => [
        { label: '是否勾选', value: obj[i.id] ? '是' : '否' },
        { label: '核查项目', value: i.typename },
        {
          label: '核查结果',
          value: obj[i.id] ? this.getVal(obj[i.id].value) : '',
        },
      ])
    },
    getVal(val) {
      if (val === 'true') {
        return '是'
      }
      else if (val === 'false') {
        return '否'
      }
      else {
        return val
      }
    },
  },
}
</script>
