<template>
  <div>
    <SubTitle>评价信息</SubTitle>
    <van-collapse v-model="activeNames">
      <van-collapse-item title="供应商信息" name="1">
        <DetailForm :data="supplierData" />
      </van-collapse-item>
      <van-collapse-item title="评价内容" name="2">
        <DetailForm :data="evaluationData" />
      </van-collapse-item>
      <van-collapse-item title="评价结论" name="3">
        <DetailForm :data="resultData" />
      </van-collapse-item>
    </van-collapse>

    <SubTitle style="margin-top: 16px">
      供货信息
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
      activeNames: ['1'],
      supplierData: [],
      evaluationData: [],
      resultData: [],
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
        .get(`rest/supplier/assess/detail/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.data
        const supplier = obj.supplier

        this.supplierData = [
          { label: '供应商名称', value: obj.supplier.name },
          {
            label: '供应商类型',
            value: await this.getSupplierTypeByDict(supplier.type),
          },
          { label: '地址', value: supplier.site },
          { label: '邮编', value: supplier.mail },
          { label: '联系人', value: supplier.contacts },
          { label: '联系电话', value: supplier.tel },
          { label: '经营内容', value: supplier.operationContent },
          { label: '备注', value: supplier.remark },
        ]

        this.resultData = [
          { label: '评价结果', value: obj.assessResult },
          { label: '评价意见', value: obj.assessOpinion },
        ]

        this.getEvaluation(obj.assessItemResult || [])
        this.getList(obj.supplierId)
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    async getEvaluation(assessItemResult) {
      const res = await mRequest.get('rest/supplier/assess/item/list')

      this.evaluationData = res.data
        .filter(i => i.status === '10')
        .map((item) => {
          const fItem = assessItemResult.find(
            i => i.supplierAssessItemId === item.id,
          )
          return {
            label: item.itemContent,
            value: fItem ? fItem.assessItemResult : '',
          }
        })
    },
    async getList(supplierId) {
      const res = await mRequest.get('rest/supplierController/supply', {
        params: {
          id: supplierId,
        },
      })

      if (res.code !== 20010) {
        this.list = res.data.map(item => [
          { label: '供货内容', value: item.eqName },
          { label: '管理编号', value: item.archiveSn },
          { label: '规格型号', value: item.standard },
          { label: '量程', value: item.eqRange },
          { label: '精度', value: item.eqAccuracy },
          { label: '供货日期', value: item.buyDate },
          { label: '验收日期', value: item.acceptanceDate },
          { label: '验收结果', value: item.acceptanceStatus },
        ])
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    // 获取供应商类型字典
    async getSupplierTypeByDict(val) {
      const res = await mRequest.get(
        '/dictionaryController.do?getListByGroupId&dictGroupId=a85c02db699e11ee920650ebf6ecba75',
      )

      const r = res.obj.find(i => i.typecode === val)
      return r ? r.typename : ''
    },
  },
}
</script>
