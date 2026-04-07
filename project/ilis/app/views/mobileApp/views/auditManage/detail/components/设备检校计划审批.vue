<template>
  <div>
    <SubTitle>基本信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      设备信息
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
    this.getList()
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get('checkPlanController.do?getById', {
          params: {
            planId: this.businessKey,
          },
        })
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.obj
        this.data = [
          {
            label: '计划类型',
            value: obj.planType === '2' ? '月度计划' : '年度计划',
          },
          { label: '计划年份', value: obj.planYear },
          { label: '计划月份', value: obj.planMouth },
          { label: '计划科室', value: obj.planDepartName },
          { label: '计划名称', value: obj.name },
          { label: '备注', value: obj.remark },
        ]
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    async getList() {
      const columnRes = await mRequest.get(
        'rest/common/chosen-columns?type=checkPlanDetail',
      )

      const res = await mRequest.get(
        'checkPlanController.do?datagridPlanDetail',
        {
          params: {
            planId: this.businessKey,
          },
        },
      )

      if (res.code !== 20010) {
        this.list = res.rows.map(item =>
          columnRes.data.map(
            cItem => ({
              label: cItem.columnName,
              value: this.tranDateValue(cItem.columnKey, item[cItem.columnKey]),
            }),
            ...(item.customizeValues || []).map(cItem => ({
              label: cItem.columnName,
              value: cItem.columnValue,
            })),
          ),
        )
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    tranDateValue(key, value) {
      if (['preCheckDate', 'nextCheckDate'].includes(key)) {
        return formatDate(value, 'YYYY-MM-DD')
      }

      return value
    },
  },
}
</script>
