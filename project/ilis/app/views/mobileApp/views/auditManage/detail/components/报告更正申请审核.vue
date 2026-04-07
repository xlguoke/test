<template>
  <div>
    <SubTitle>报告信息</SubTitle>
    <DetailForm :data="data" />

    <SubTitle style="margin-top: 16px">
      申请信息
    </SubTitle>
    <DetailForm :data="data2" />
  </div>
</template>

<script>
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import DetailForm from './DetailForm.vue'
import SubTitle from './SubTitle.vue'

export default {
  components: {
    DetailForm,
    SubTitle,
  },
  props: ['businessKey'],
  data() {
    return {
      data: [],
      data2: [],
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get(`report/amend/application/${this.businessKey}`)
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.data

        this.data = [
          { label: '报告编号', value: obj.reportCode },
          { label: '项目负责人', value: obj.principal },
          { label: '发出份数', value: obj.issueQty || 0 },
          { label: '发出日期', value: obj.issueDate },
          { label: '收回份数', value: obj.recycleQty },
          { label: '销毁份数', value: obj.destructionQty },
        ]

        this.getData2(obj)
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    async getData2(obj) {
      const res = await mRequest.get(
        'rest/common/custom-properties?customizeType=report_amend_application',
      )

      const customsObj = {}

      ;(obj.customs || []).forEach((item) => {
        customsObj[item.customColumnId] = item.customColumnValue
      })

      if (res.code !== 20010) {
        this.data2 = [
          { label: '申请人', value: obj.applicant },
          { label: '申请日期', value: obj.applicationDate },
          { label: '申请说明', value: obj.applicationDescription },
          ...res.data.map(item => ({
            label: item.columnName,
            value: customsObj[item.id],
          })),
          {
            label: '附件',
            fileList: (obj.attachments || []).map(i => ({
              name: i.attachmentTitle,
              url: i.realpath,
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
  },
}
</script>
