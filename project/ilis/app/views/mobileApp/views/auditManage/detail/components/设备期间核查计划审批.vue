<template>
  <div>
    <SubTitle>核查计划信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      设备信息
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
        .get(`rest/eq/inspect/plan/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const data = res.data
        this.data = [
          {
            label: '计划类型',
            value: data.planType === '1' ? '年度计划' : '月度计划',
          },
          {
            label: '年/月',
            value:
              data.planType === '1'
                ? data.planYear
                : `${data.planYear}/${data.planMouth}`,
          },
          { label: '科室', value: data.planDepart },
          { label: '备注', value: data.remark },
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
        `rest/eq/inspect/plan/${this.businessKey}/detail`,
      )

      if (res.code !== 20010) {
        this.eqList = res.data.rows.map((item, index) => [
          { label: '序号', value: index + 1 },
          { label: '设备名称', value: item.name },
          { label: '设备编号', value: item.equipmentSn },
          { label: '规格型号', value: item.standard },
          { label: '所属部门', value: item.departName },
          {
            label: '前次检校时间',
            value: formatDate(item.preCheckDate, 'YYYY-MM-DD'),
          },
          { label: '检校周期', value: item.checkPeriod },
          {
            label: '计划检校时间',
            value: formatDate(item.nextCheckDate, 'YYYY-MM-DD'),
          },
          {
            label: '期间核查时间',
            value: formatDate(item.inspectTimes, 'YYYY-MM-DD'),
          },
          { label: '核查人', value: item.inspectUserName },
          { label: '核查方式', value: item.inspectWay },
          { label: '核查参数', value: item.inspectItems },
          { label: '核查依据', value: item.verificationBasis },
          { label: '测量参考标准名称及精度', value: item.referenceStandards },
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
  },
}
</script>
