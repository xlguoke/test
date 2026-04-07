<template>
  <div>
    <SubTitle>基本信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      设备信息
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
    this.getEqList()
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get('buyPlanController.do?getById', {
          params: {
            buyPlanId: this.businessKey,
          },
        })
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.obj
        this.data = [
          { label: '申请人', value: obj.applicant },
          { label: '总金额', value: obj.budget },
          { label: '申请说明', value: obj.applyExplain },
        ]
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    async getEqList() {
      const res = await mRequest.get(
        'buyPlanController.do?datagridPlanDetail',
        {
          params: {
            buyPlanId: this.businessKey,
          },
        },
      )

      if (res.code !== 20010) {
        this.eqList = res.rows.map(item => [
          { label: '设备名称', value: item.name },
          { label: '规格型号', value: item.standard },
          { label: '生产厂家', value: item.manufacturer },
          { label: '申请科室', value: item.depart },
          { label: '单价', value: item.price },
          { label: '数量', value: item.amount },
          { label: '合计', value: item.totalPrice },
          { label: '折旧年限', value: item.usefulLife },
          { label: '原因及用途', value: item.reason },
          { label: '使用规范', value: item.useRule },
          ...item.customizeValues.map(cItem => ({
            label: cItem.columnName,
            value: cItem.columnValue,
          })),
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
