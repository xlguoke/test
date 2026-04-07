<template>
  <div>
    <DetailForm :data="data" />
  </div>
</template>

<script>
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import DetailForm from './DetailForm.vue'

export default {
  components: {
    DetailForm,
  },
  props: ['businessKey'],
  data() {
    return {
      data: [],
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get(`rest/eq/rent/controller/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.data
        this.data = [
          { label: '借用类型', value: this.getRentType(obj.rentType) },
          { label: '设备编号', value: obj.equipmentVo.equipmentSn },
          { label: '设备名称', value: obj.equipmentName },
          { label: '设备规格', value: obj.eqStandard },
          { label: '借出部门(单位)', value: obj.outOrg },
          { label: '借出联系人', value: obj.outOrgContacts },
          { label: '借入部门(单位)', value: obj.inOrg },
          { label: '借入联系人', value: obj.inOrgContacts },
          {
            label: '设备状态',
            value: await this.getEqStatus(obj.rentEqStatus),
          },
          { label: '设备单价', value: obj.equipmentPrice },
          {
            label: '租赁开始日期',
            value: formatDate(obj.rentStartTime, 'YYYY-MM-DD'),
          },
          {
            label: '租赁结束日期',
            value: formatDate(obj.rentEndTime, 'YYYY-MM-DD'),
          },
          {
            label: '实际归还日期',
            value: formatDate(obj.returnTime, 'YYYY-MM-DD'),
          },
          { label: '双方协议内容', value: obj.agreementContent },
          { label: '申请说明', value: obj.applyReason },
          { label: '备注', value: obj.remark },
          {
            label: '附件材料',
            fileList: (obj.files || []).map(i => ({
              name: i.name,
              url: i.url,
            })),
          },
          { label: '签名图片', imgUrl: obj.rentSignerFile.url },
        ]
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    async getEqStatus(val) {
      const res = await mRequest.get(
        `rest/type/getTypesByGroupCode?groupCode=eq_status`,
      )
      const item = res.data.find(i => i.typeCode === val)
      return item ? item.typeName : ''
    },
    getRentType(val) {
      if (val === '1') {
        return '对外出租(出借)'
      }
      else if (val === '2') {
        return '租借外部设备'
      }
      else if (val === '3') {
        return '内部借用'
      }
    },
  },
}
</script>
