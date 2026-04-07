<template>
  <div>
    <SubTitle>盘点基本信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      盘点设备
    </SubTitle>
    <CardForm :data="eqList" />
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
        .get(`rest/inventory/plan/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.data

        this.data = [
          { label: '盘点单名称', value: obj.inventoryName },
          { label: '盘点单号', value: obj.inventorySn },
          {
            label: '计划盘点日期',
            value: `${formatDate(
              obj.planTimeBegin,
              'YYYY-MM-DD',
            )} ~ ${formatDate(obj.planTimeEnd, 'YYYY-MM-DD')}`,
          },
          { label: '盘点说明', value: obj.description },
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
        `rest/inventory/plan/eq/list/${this.businessKey}`,
      )

      if (res.code !== 20010) {
        this.eqList = res.data.map((item, index) => [
          { label: '序号', value: index + 1 },
          { label: '设备名称', value: item.name },
          { label: '设备编号', value: item.equipmentSn },
          { label: '资产编号', value: item.assetSn },
          { label: '规格型号', value: item.standard },
          { label: '购置日期', value: formatDate(item.buyDate, 'YYYY-MM-DD') },
          { label: '所属部门', value: item.departName },
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
