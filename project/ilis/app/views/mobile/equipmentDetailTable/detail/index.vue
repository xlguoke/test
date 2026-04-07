<template>
  <div class="p-2">
    <div class="flex items-center justify-center py-5">
      <img class="h-[30px] mr-2" :src="logoImg" />
      <span class="text-base font-bold">{{ formData.unitName }}</span>
    </div>
    <table class="my-table">
      <tr>
        <td style="text-align: center" colspan="4">
          仪器设备管理卡
        </td>
      </tr>
      <tr>
        <td class="label">
          设备名称
        </td>
        <td colspan="3">
          {{ formData.name }}
        </td>
      </tr>
      <tr v-for="row in fields" :key="row.field">
        <td class="label">
          {{ row.name }}
        </td>
        <td>{{ formData[row.field] || '-' }}</td>
        <td class="label">
          {{ row.name2 }}
        </td>
        <td>{{ formData[row.field2] || '-' }}</td>
      </tr>
      <tr>
        <td class="label">
          备注
        </td>
        <td colspan="4">
          {{ formData.remark || '-' }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'
import { formatTime, getQueryVariable } from '~/providers-moblie/common/utils'

const fields = [
  {
    name: '管理编号',
    field: 'testManageSn',
    name2: '固定资产编号',
    field2: 'assetSn',
  },
  {
    name: '规格型号',
    field: 'standard',
    name2: '单价（元）',
    field2: 'factoryPrice',
  },
  {
    name: '测量范围',
    field: 'eqRange',
    name2: '精度/分辨力',
    field2: 'accuracy',
  },
  {
    name: '生成厂家',
    field: 'factory',
    name2: '出厂编号',
    field2: 'factorySn',
  },
  { name: '设备状态', field: 'status', name2: '购置日期', field2: 'buyDate' },
  {
    name: '管理类别',
    field: 'manageType',
    name2: '保管人',
    field2: 'keeperName',
  },
  {
    name: '上次检校时间',
    field: 'preCheckDate',
    name2: '有效期限',
    field2: 'nextCheckDate',
  },
  {
    name: '计量检校公司',
    field: 'checkUnit',
    name2: '检校类型',
    field2: 'checkType',
  },
  {
    name: '所属部门',
    field: 'departName',
    name2: '存放位置',
    field2: 'storageSite',
  },
]

export default {
  data() {
    return {
      id: getQueryVariable('id'),
      fields,
      formData: {},
      logoImg: new URL('~/providers-moblie/assets/gxlj-logo.png', import.meta.url).href,
    }
  },
  created() {
    this.getDatas()
  },
  methods: {
    async getDatas() {
      const formData = new FormData()
      formData.append('id', this.id)
      const resDetail = await mAjax({
        method: 'POST',
        url: `${mApi.equipmentInfo.detail}`,
        data: formData,
      })
      if (resDetail.success) {
        this.formData = {
          ...resDetail.obj,
          ...resDetail.attributes,
        }
        this.formData.buyDate = this.formData.buyDate
          ? formatTime(this.formData.buyDate, 'YYYY-MM-DD')
          : ''
        this.formData.preCheckDate = this.formData.preCheckDate
          ? formatTime(this.formData.preCheckDate, 'YYYY-MM-DD')
          : ''
        this.formData.nextCheckDate = this.formData.nextCheckDate
          ? formatTime(this.formData.nextCheckDate, 'YYYY-MM-DD')
          : ''
      }
    },
  },
}
</script>

<style lang="less" scoped>
.my-table {
  width: 100%;
  height: auto;
  border-collapse: collapse;
  border-radius: 4px;
  border: 1px solid #eee;
  font-size: 12px;
  tr {
    border-bottom: 1px solid #eee;
  }

  td {
    padding: 5px;
    height: 30px;
    border-right: 1px solid #eee;
  }

  td.label {
    min-width: 90px;
    max-width: 90px;
    text-align: center;
    background-color: #f8f8f8;
  }
}
</style>
