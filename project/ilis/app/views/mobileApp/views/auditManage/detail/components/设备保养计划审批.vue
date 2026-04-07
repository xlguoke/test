<template>
  <div>
    <SubTitle>保养计划信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      保养设备
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
        .get(`rest/eq/upkeep/plan/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const data = res.data
        this.data = [
          { label: '计划名称', value: data.name },
          { label: '计划编号', value: data.sn },
          {
            label: '计划类型',
            value: data.type === '1' ? '年度计划' : '月度计划',
          },
          {
            label: '计划年月',
            value:
              data.type === '1'
                ? data.planYear
                : `${data.planYear}/${data.planMonth}`,
          },
          { label: '制定人', value: data.creator },
          { label: '计划说明', value: data.explains },
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
        `rest/eq/upkeep/plan/${this.businessKey}/detail`,
        {
          params: {
            buyApplyId: this.businessKey,
          },
        },
      )

      const dict = await this.getUpkeepProjectDict()

      if (res.code !== 20010) {
        this.eqList = res.data.rows.map((item, index) => [
          { label: '序号', value: index + 1 },
          { label: '设备名称', value: item.equipmentVo.name },
          { label: '设备编号', value: item.equipmentVo.equipmentSn },
          { label: '规格型号', value: item.equipmentVo.standard },
          { label: '所属部门', value: item.equipmentVo.departName },
          { label: '保养部门', value: item.upkeepDepart },
          { label: '保养人', value: item.upkeepPerson },
          {
            label: '保养项目',
            value: (item.upkeepProject || '')
              .split(',')
              .map(i => dict[i])
              .join(','),
          },
          {
            label: '计划进度',
            value: `${item.recordCount}/${item.totalCount}`,
          },
          { label: '备注', value: item.remark },
        ])
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    async getUpkeepProjectDict() {
      const res = await mRequest.get(
        `rest/type/getTypesByGroupCode?groupCode=eqUpkeepProject`,
        {
          params: {
            buyApplyId: this.businessKey,
          },
        },
      )

      const upkeepProjectDict = {}

      res.data.forEach((item) => {
        upkeepProjectDict[item.typeCode] = item.typeName
      })

      return upkeepProjectDict
    },
  },
}
</script>
