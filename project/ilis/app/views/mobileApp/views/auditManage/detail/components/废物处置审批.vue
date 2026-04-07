<template>
  <div>
    <SubTitle>基本信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      关联废物
    </SubTitle>
    <CardForm :data="list" />
  </div>
</template>

<script>
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
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
        .get(`rest/chemical/waste/handle/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.data

        this.data = [
          { label: '废物名称', value: obj.name },
          { label: '废物类型', value: await this.getType(obj.type) },
          { label: '处理数量', value: `${obj.quantity}${obj.unit}` },
          { label: '处理部门', value: obj.departName },
          {
            label: '处理日期',
            value: formatDate(obj.launchDate, 'YYYY-MM-DD'),
          },
          {
            label: '有害成分',
            value: await this.getHazardousIngredients(obj.hazardousIngredients),
          },
          ...(obj.customizeValues || []).map(item => ({
            label: item.columnName,
            value: item.columnValue,
          })),
          { label: '备注', value: obj.remark },
          { label: '附件', fileId: obj.id, fileKey: 'CHEMICAL' },
        ]

        this.list = (obj.chemicalWasteMaterialList || []).map((item, index) => [
          { label: '序号', value: index + 1 },
          { label: '功能室名称', value: item.laboratoryName },
          { label: '总数量', value: item.totalValue },
          {
            label: '提交日期',
            value: formatDate(item.submitDate, 'YYYY-MM-DD HH:mm:ss'),
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
    async getHazardousIngredients(val) {
      const res = await mRequest.get(
        'rest/type/getTypesByGroupCode?groupCode=chemicalHazardousIngredients',
      )

      const item = res.data.find(i => i.typeCode === val)
      return item ? item.typeName : ''
    },
    async getType(val) {
      const res = await mRequest.get(
        'rest/type/getTypesByGroupCode?groupCode=chemicalWasteMaterialType',
      )

      const item = res.data.find(i => i.typeCode === val)
      return item ? item.typeName : ''
    },
  },
}
</script>
