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
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get(`rest/eq/egress/apply/detail/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.data

        this.data = [
          { label: '借用人', value: obj.borrowUser },
          { label: '关联任务', value: obj.testTaskSn },
          {
            label: '关联工程项目',
            value: (obj.projects || [])
              .map(
                i =>
                  `${i.projectName}${i.projectCode ? `(${i.projectCode})` : ''}`,
              )
              .join(','),
          },
          { label: '外出时间', value: obj.egressTime },
          { label: '预还时间', value: obj.expectReturnTime },
          { label: '备注', value: obj.remark },
          {
            label: '附件材料',
            fileList: (obj.attachments || []).map(i => ({
              name: i.attachmentTitle,
              url: i.attachmentUrl,
            })),
          },
        ]

        this.eqList = (obj.equipments || []).map(i => [
          { label: '设备名称', value: i.name },
          { label: '设备编号', value: i.equipmentSn },
          { label: '档案编号', value: i.archiveSn },
          { label: '资产编号', value: i.assetSn },
          { label: '规格型号', value: i.standard },
          { label: '量程', value: i.eqRange },
          { label: '精度', value: i.accuracy },
          { label: '下次校验日期', value: i.nextCheckDate },
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
