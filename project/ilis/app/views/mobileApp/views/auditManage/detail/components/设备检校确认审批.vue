<template>
  <div>
    <SubTitle>设备基本信息</SubTitle>
    <DetailForm :data="data1" />

    <SubTitle style="margin-top: 16px">
      检校证书信息
    </SubTitle>
    <DetailForm :data="data2" />

    <SubTitle style="margin-top: 16px">
      检校证书确认内容
    </SubTitle>
    <CardForm :data="list1" />

    <SubTitle style="margin-top: 16px">
      计量溯源结果符合性确认
    </SubTitle>
    <CardForm :data="checkList" />

    <SubTitle style="margin-top: 16px">
      确认结论
    </SubTitle>
    <CardForm :data="list2" />
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
      data1: [],
      data2: [],
      list1: [],
      checkList: [],
      list2: [],
    }
  },
  created() {
    this.getDetail()
    this.getCheckList()
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get('checkController.do?getById', {
          params: {
            id: this.businessKey,
          },
        })
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const { equipment, check, eqDepartName } = res.obj
        const confirmItem = JSON.parse(check.confirmItem)

        this.data1 = [
          { label: '设备编号', value: equipment.equipmentSn },
          { label: '设备名称', value: equipment.name },
          { label: '规格型号', value: equipment.standard },
          { label: '出厂编号', value: equipment.factorySn },
          { label: '所属部门', value: eqDepartName },
          { label: '设备使用人', value: equipment.userName },
          { label: '存放位置', value: equipment.storageSite },
          {
            label: '计划检校时间',
            value: formatDate(equipment.nextCheckDate, 'YYYY-MM-DD'),
          },
        ]

        this.data2 = [
          { label: '检校证书编号', value: check.certificateSn },
          { label: '检校证书名称', value: check.certificateName },
          { label: '检校单位', value: check.checkUnit },
          { label: '检校类型', value: check.checkType },
          {
            label: '检校时间',
            value: formatDate(check.checkTime, 'YYYY-MM-DD'),
          },
          {
            label: '检校周期',
            value: `${check.checkPeriod || ''}${check.checkPeriodUnit || ''}`,
          },
          {
            label: '检校有效期',
            value: formatDate(check.validityDate, 'YYYY-MM-DD'),
          },
          { label: '检校依据', value: check.gist },
          { label: '检校结论', value: check.verdict },
          { label: '检校备注', value: check.remark },
          { label: '检校证书', fileId: check.id, fileKey: 'EQ_CHECK_FILE' },
          {
            label: '其它附件',
            fileId: check.id,
            fileKey: 'EQ_CHECK_OTHER_FILE',
          },
        ]

        this.list1 = [
          [
            {
              label:
                '1、检定/校准证书/测试报告是否在法定的检定机构/认可的校准实验室的授权范围',
              value: confirmItem.confirmCon.confirmCon1 === '1' ? '是' : '否',
            },
            {
              label: '2、检定/校准参数是否满足检测实验室要求',
              value: confirmItem.confirmCon.confirmCon2 === '1' ? '是' : '否',
            },
            {
              label: '3、是否提供具体的检定/校准数据',
              value: confirmItem.confirmCon.confirmCon3 === '1' ? '是' : '否',
            },
            {
              label: '4、证书/报告是否具有量值溯源信息',
              value: confirmItem.confirmCon.confirmCon4 === '1' ? '是' : '否',
            },
            {
              label: '5、是否提供测量不确定的信息',
              value: confirmItem.confirmCon.confirmCon5 === '1' ? '是' : '否',
            },
            {
              label: '6、是否能溯源国家基准',
              value: confirmItem.confirmCon.confirmCon6 === '1' ? '是' : '否',
            },
          ],
        ]

        this.list2 = [
          [
            {
              label: '是否能达到要求的准确度',
              value:
                confirmItem.resultConfirm.resultConfirm1 === '1' ? '是' : '否',
            },
            {
              label: '是否能达到要求的量程',
              value:
                confirmItem.resultConfirm.resultConfirm2 === '1' ? '是' : '否',
            },
            {
              label: '是否需要引入修正因子',
              value:
                confirmItem.resultConfirm.resultConfirm3 === '1' ? '是' : '否',
            },
          ],
        ]
      }
      else {
        showDialog({
          title: '提示',
          message: res.message,
        })
      }
    },
    async getCheckList() {
      const formData = new FormData()
      formData.append('checkId', this.businessKey)

      const res = await mRequest.post(
        'checkController.do?getCheckedItemByCheckId',
        formData,
      )

      if (res.code !== 20010) {
        this.checkList = res.obj.map(item => [
          { label: '检校参数/项目', value: item.checkItemName },
          // { label: '适用参数', value: item.applyParam },
          // { label: '确认依据', value: item.applyRegulations },
          { label: '技术要求', value: item.skillLimit },
          { label: '检校结果', value: item.checkedInfo },
          // { label: '是否使用修正因子/修正值', value: item.isCorrect },
          { label: '确认结果', value: item.confirmResults },
          {
            label: '本次确认时间',
            value: formatDate(item.checkTime, 'YYYY-MM-DD'),
          },
          // { label: '上次确认时间', value: formatDate(item.preCheckDate, 'YYYY-MM-DD') },
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
