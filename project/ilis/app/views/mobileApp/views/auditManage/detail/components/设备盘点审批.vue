<template>
  <div>
    <SubTitle>盘点基础信息</SubTitle>
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
        .get(`rest/eq/inventory/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.data

        const processData = await this.getInventoryProcess()

        this.data = [
          { label: '盘点单名称', value: obj.inventoryName },
          { label: '盘点单号', value: obj.inventorySn },
          { label: '盘点进度', value: processData.inventoryProgress },
          { label: '盘点正常', value: processData[20] || 0 },
          { label: '盘点异常', value: processData[30] || 0 },
          { label: '位置异常', value: processData[40] || 0 },
        ]
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    async getInventoryProcess() {
      const res = await mRequest.get(`rest/eq/inventory/statistics/count`, {
        params: {
          inventoryId: this.businessKey,
        },
      })

      return res.data
    },
    async getTypeObj() {
      const res = await mRequest.get(
        `rest/type/getTypesByGroupCode?groupCode=eqAssets`,
      )
      const obj = {}

      res.data.forEach((item) => {
        obj[item.typeCode] = item.typeName
      })

      return obj
    },
    async getEqStatusObj() {
      const res = await mRequest.get(
        `rest/type/getTypesByGroupCode?groupCode=eqAssetsStatus`,
      )
      const obj = {}

      res.data.forEach((item) => {
        obj[item.typeCode] = item.typeName
      })

      return obj
    },
    async getEqList() {
      const res = await mRequest.get('rest/eq/inventory/eq/list', {
        params: {
          page: 1,
          size: 999,
          inventoryId: this.businessKey,
        },
      })

      const typeObj = await this.getTypeObj()
      const eqStatusObj = await this.getEqStatusObj()
      const inventoryStatusObj = {
        10: '待盘点',
        20: '正常',
        30: '盘点异常',
        40: '位置异常',
      }

      if (res.code !== 20010) {
        this.eqList = res.data.rows.map((item, index) => [
          { label: '序号', value: index + 1 },
          { label: '资产编号', value: item.assetSn },
          { label: '设备编号', value: item.equipmentSn },
          { label: '资产类别', value: typeObj[item.type] },
          { label: '设备名称', value: item.equipmentName },
          { label: '资产品牌', value: item.factory },
          { label: '规格型号', value: item.equipmentStandard },
          { label: '数量', value: item.quantity },
          { label: '购置日期', value: item.buyDate },
          { label: '所属部门', value: item.departName },
          { label: '存放位置', value: item.storageSite },
          { label: '使用人', value: item.userName },
          { label: '使用状态', value: eqStatusObj[item.useStatus] },
          { label: '盘点状态', value: inventoryStatusObj[item.status] },
          { label: '盘点人', value: item.inventoryUserName },
          { label: '盘点时间', value: item.inventoryTime },
          { label: '备注', value: item.remark },
          { label: '附件', fileId: item.id, fileKey: 'INVENTORY_REGISTER' },
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
