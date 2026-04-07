<template>
  <div style="padding-bottom: 48px">
    <van-collapse v-model="activeNames">
      <van-collapse-item title="基本信息" name="1">
        <DetailForm :data="data" />
      </van-collapse-item>
      <van-collapse-item v-if="repairContactVo" title="外联情况" name="2">
        <DetailForm :data="data2" />
      </van-collapse-item>
      <van-collapse-item v-if="repairDetailVo" title="维修情况" name="3">
        <DetailForm :data="data3" />
      </van-collapse-item>
      <van-collapse-item v-if="repairVerifyVo" title="修复检验情况" name="4">
        <DetailForm :data="data4" />
      </van-collapse-item>
    </van-collapse>
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
      activeNames: ['1'],
      data: [],
      data2: [],
      data3: [],
      data4: [],
      repairContactVo: false,
      repairDetailVo: false,
      repairVerifyVo: false,
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get('eqRepairController.do?getById', {
          params: {
            repairId: this.businessKey,
          },
        })
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.obj
        const repairContactVo = obj.repairContactVo || {}
        const repairDetailVo = obj.repairDetailVo || {}
        const repairVerifyVo = obj.repairVerifyVo || {}

        this.repairContactVo = !!obj.repairContactVo
        this.repairDetailVo = !!obj.repairDetailVo
        this.repairVerifyVo = !!obj.repairVerifyVo

        // 基本信息
        this.data = [
          { label: '选择设备', value: obj.equipmentName },
          { label: '维修单号', value: obj.repairSn },
          {
            label: '保修时间',
            value: formatDate(obj.repairServiceEndTime, 'YYYY-MM-DD'),
          },
          { label: '维修费用', value: obj.totalFee },
          { label: '故障现象', value: obj.phenomenon },
          { label: '故障原因分析', value: obj.reason },
          { label: '损坏后的处理', value: obj.disposeWay },
          { label: '备注', value: obj.remark },
          {
            label: '附件',
            fileList: (obj.attachments || []).map(item => ({
              name: item.attachmenttitle,
              url: item.realpath,
            })),
          },
        ]

        if (obj.equipmentVo) {
          this.data.splice(
            1,
            0,
            ...[
              { label: '设备编号', value: obj.equipmentVo.equipmentSn },
              { label: '规格型号', value: obj.equipmentVo.standard },
            ],
          )
        }

        // 外联情况
        this.data2 = [
          { label: '联系人', value: repairContactVo.repairContacts },
          {
            label: '维修联系时间',
            value: formatDate(repairContactVo.contactTime, 'YYYY-MM-DD'),
          },
          { label: '维修联系情况', value: repairContactVo.contactDetail },
        ]

        // 维修情况
        this.data3 = [
          { label: '承修人', value: repairDetailVo.repairMan },
          { label: '承修单位', value: repairDetailVo.repairUnit },
          { label: '材料费', value: repairDetailVo.materialFee },
          { label: '人工费', value: repairDetailVo.laborFee },
          { label: '其他费用', value: repairDetailVo.otherFee },
          { label: '费用合计', value: repairDetailVo.totalFee },
          { label: '维修简述', value: repairDetailVo.description },
          {
            label: '附件',
            fileList: (repairDetailVo.attachments || []).map(item => ({
              name: item.attachmenttitle,
              url: item.realpath,
            })),
          },
        ]

        // 修复检验情况
        this.data4 = [
          { label: '检验人', value: repairVerifyVo.personName },
          {
            label: '检验时间',
            value: formatDate(repairVerifyVo.verifyTime, 'YYYY-MM-DD'),
          },
          { label: '修复程度检验', value: repairVerifyVo.content },
          {
            label: '满足使用要求',
            value: repairVerifyVo.useRequirements === '1' ? '是' : '否',
          },
          {
            label: '附件',
            fileList: (repairVerifyVo.attachments || []).map(item => ({
              name: item.attachmenttitle,
              url: item.realpath,
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
    // 获取供应商附件
    async getFiles(relationEntityId) {
      const res = await mRequest.get(
        '/eqFileController.do?getFileGroupByRelationEntityId',
        {
          params: {
            relationEntityId,
          },
        },
      )

      const obj = res.obj || []

      !obj[0] && (obj[0] = {})

      !obj[1] && (obj[1] = {})

      !obj[2] && (obj[2] = {})

      !obj[3] && (obj[3] = {})

      !obj[4] && (obj[4] = {})

      !obj[5] && (obj[5] = {})
      return obj
    },
    isDefine(val) {
      return val !== null && val !== undefined && val !== ''
    },
  },
}
</script>
