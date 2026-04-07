<template>
  <div>
    <SubTitle>送检基本信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      送检设备信息
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
        .get('rest/checkSendController.do?getById', {
          params: {
            sendId: this.businessKey,
          },
        })
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.obj
        this.data = [
          { label: '送检批号', value: obj.batchNumber },
          { label: '检校单位', value: obj.unit },
          {
            label: '送检日期',
            value: formatDate(obj.createDate, 'YYYY-MM-DD'),
          },
          {
            label: '计划取回日期',
            value: formatDate(obj.planRetrieveTime, 'YYYY-MM-DD'),
          },
          { label: '备注说明', value: obj.remark },
          { label: '送检状态', value: this.getCheckSendStatus(obj.status) },
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
        'rest/checkSendController.do?datagridSendDetail',
        {
          params: {
            sendId: this.businessKey,
          },
        },
      )

      if (res.code !== 20010) {
        this.eqList = res.rows.map(item => [
          { label: '设备编号', value: item.equipmentSn },
          { label: '设备名称', value: item.name },
          { label: '规格型号', value: item.standard },
          { label: '所属科室', value: item.departName },
          { label: '项目/参数', value: item.checkItemName },
          { label: '检校依据', value: item.checkConfirmReference },
          { label: '试验规范', value: item.testSpecifications },
          { label: '备注', value: item.remark },
          { label: '状态', value: this.getStatus(item.status) },
        ])
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    getCheckSendStatus(val) {
      return {
        10: '待送检',
        20: '审批中',
        30: '待送检',
        40: '已送检',
        50: '已检校',
      }[val]
    },
    getStatus(val) {
      return {
        CREATE: '待取回',
        END: '已取回',
      }[val]
    },
  },
}
</script>
