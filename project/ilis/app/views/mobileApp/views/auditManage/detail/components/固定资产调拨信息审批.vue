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
        .get(`rest/equipment/assets-allot/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.data
        this.data = [
          { label: '固定资产', value: obj.equipmentName },
          { label: '设备编号', value: obj.equipmentVo.equipmentSn },
          { label: '规格型号', value: obj.equipmentVo.standard },
          { label: '调出部门', value: obj.outOrg },
          { label: '调入部门', value: obj.inOrg },
          { label: '存放位置', value: obj.storageSite },
          {
            label: '所属功能室',
            value: await this.getDepartment(obj.inOrgId, obj.laboratoryId),
          },
          { label: '调拨时间', value: formatDate(obj.allotTime, 'YYYY-MM-DD') },
          { label: '调拨说明', value: obj.allotExplain },
          {
            label: '附件材料',
            fileList: (obj.files || []).map(i => ({
              name: i.name,
              url: i.url,
            })),
          },
        ]
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    async getDepartment(departId, labId) {
      if (!departId) {
        return
      }

      const res = await mRequest.get(
        `laboratoryController.do?listLaboratory&departId=${departId}`,
      )

      const item = (res.obj || []).find(i => i.id === labId)
      return item ? item.name : ''
    },
  },
}
</script>
