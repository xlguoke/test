<template>
  <div>
    <van-collapse v-model="activeNames">
      <van-collapse-item title="基本信息" name="1">
        <DetailForm :data="data" />
      </van-collapse-item>
      <van-collapse-item v-if="buyAcceptance" title="验收情况" name="2">
        <DetailForm :data="data2" />
      </van-collapse-item>
      <van-collapse-item title="供应商信息" name="3">
        <DetailForm :data="data3" />
      </van-collapse-item>
      <van-collapse-item title="设备详细信息登记" name="4">
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
      buyAcceptance: false,
    }
  },
  created() {
    this.getDetail()
  },
  methods: {
    async getDetail() {
      const toastLoading = showLoadingToast({ duration: 0, forbidClick: true })
      const res = await mRequest
        .get('buyController.do?getBuyInfoAll', {
          params: {
            buyId: this.businessKey,
          },
        })
        .finally(() => {
          toastLoading.close()
        })

      if (res.code !== 20010) {
        const obj = res.obj
        const buyAcceptance = obj.buyAcceptance || {}
        const teqSupplierSnapshot = obj.teqSupplierSnapshot || {}
        const teqSnapshot = obj.teqSnapshot || {}

        this.buyAcceptance = !!obj.buyAcceptance

        // 基本信息
        this.data = [
          { label: '申请部门', value: obj.applyDepart },
          { label: '设备名称', value: obj.equipmentName },
          { label: '合同编号', value: obj.contractSn },
          { label: '规格型号', value: obj.standard },
          { label: '购买人', value: obj.buyPerson },
          { label: '购买时间', value: formatDate(obj.buyTime, 'YYYY-MM-DD') },
          { label: '单价', value: obj.price },
          { label: '数量', value: obj.amount },
          { label: '金额', value: obj.totalFee },
          { label: '折旧年限', value: obj.usefulLife },
          { label: '备注', value: obj.remark },
        ]

        // 验收情况
        this.data2 = [
          { label: '验收人', value: buyAcceptance.acceptor },
          { label: '验收编号', value: buyAcceptance.acceptanceSn },
          {
            label: '说明书(份)',
            value: `${buyAcceptance.specifications || ''}${
              buyAcceptance.specificationsAmount || ''
            }`,
          },
          { label: '说明书语种', value: buyAcceptance.manualLanguage },
          {
            label: '检验单(份)',
            value: `${buyAcceptance.inspectionSheet || ''} ${
              buyAcceptance.inspectionSheetAmount || ''
            }`,
          },
          {
            label: '图纸资料(份)',
            value: `${buyAcceptance.pictures || ''} ${
              buyAcceptance.picturesAmount || ''
            }`,
          },
          {
            label: '合格证(份)',
            value: `${buyAcceptance.certificate || ''} ${
              buyAcceptance.certificateAmount || ''
            }`,
          },
          {
            label: '附件清单(份)',
            value: `${buyAcceptance.attachment || ''} ${
              buyAcceptance.attachmentAmount || ''
            }`,
          },
          {
            label: '验收日期',
            value: formatDate(buyAcceptance.acceptanceDate, 'YYYY-MM-DD'),
          },
          {
            label: '试车日期',
            value: formatDate(buyAcceptance.testRunDate, 'YYYY-MM-DD'),
          },
          {
            label: '到货日期',
            value: formatDate(buyAcceptance.arrivalDate, 'YYYY-MM-DD'),
          },
          {
            label: '包装外观',
            value: this.isDefine(buyAcceptance.packagingAppearance)
              ? buyAcceptance.packagingAppearance
                ? '完好'
                : '缺损'
              : '',
          },
          {
            label: '包装外观照片',
            fileId: obj.id,
            fileKey: 'EQ_BUY_ACC_PACKAGE',
          },
          {
            label: '设备外观',
            value: this.isDefine(buyAcceptance.equipmentAppearance)
              ? buyAcceptance.equipmentAppearance
                ? '完好'
                : '缺损'
              : '',
          },
          { label: '设备外观照片', fileId: obj.id, fileKey: 'EQ_BUY_ACC' },
          {
            label: '规格型号',
            value: this.isDefine(buyAcceptance.standard)
              ? buyAcceptance.standard
                ? '符合'
                : '不符'
              : '',
          },
          {
            label: '配件',
            value: this.isDefine(buyAcceptance.accessorie)
              ? buyAcceptance.accessorie
                ? '齐全'
                : '缺失'
              : '',
          },
          {
            label: '资料齐全',
            value: this.isDefine(buyAcceptance.documentComplete)
              ? buyAcceptance.documentComplete
                ? '是'
                : '否'
              : '',
          },
          { label: '开箱检查验收', value: buyAcceptance.unpackCheckInfo },
          { label: '安装质量及精度', value: buyAcceptance.installQuality },
          { label: '设备运转情况', value: buyAcceptance.runningStatus },
          { label: '试车检验情况', value: buyAcceptance.testRunStatus },
          { label: '设备接收意见', value: buyAcceptance.acceptanceOpinion },
          { label: '备注', value: buyAcceptance.remark },
        ]

        const supplierFiles = await this.getFiles(teqSupplierSnapshot.id)

        // 供应商信息
        this.data3 = [
          { label: '供应商名称', value: teqSupplierSnapshot.name },
          { label: '联系人', value: teqSupplierSnapshot.contacts },
          { label: '邮编', value: teqSupplierSnapshot.postcode },
          { label: '地址', value: teqSupplierSnapshot.site },
          { label: '联系电话', value: teqSupplierSnapshot.tel },
          { label: '手机', value: teqSupplierSnapshot.mobile },
          { label: '经营内容', value: teqSupplierSnapshot.operationContent },
          { label: '备注', value: teqSupplierSnapshot.remark },
          {
            label: '营业执照',
            fileList: (supplierFiles[1].tEqFileVos || []).map(item => ({
              name: item.name,
              url: item.url,
            })),
          },
          {
            label: '产品认证',
            fileList: (supplierFiles[4].tEqFileVos || []).map(item => ({
              name: item.name,
              url: item.url,
            })),
          },
          {
            label: '通过质保体系',
            fileList: (supplierFiles[5].tEqFileVos || []).map(item => ({
              name: item.name,
              url: item.url,
            })),
          },
          {
            label: '税务登记证',
            fileList: (supplierFiles[2].tEqFileVos || []).map(item => ({
              name: item.name,
              url: item.url,
            })),
          },
          {
            label: '组织机构代码证',
            fileList: (supplierFiles[3].tEqFileVos || []).map(item => ({
              name: item.name,
              url: item.url,
            })),
          },
          {
            label: '其他',
            fileList: (supplierFiles[0].tEqFileVos || []).map(item => ({
              name: item.name,
              url: item.url,
            })),
          },
        ]

        // 设备详细信息登记
        this.data4 = [
          { label: '资产编号', value: teqSnapshot.assetSn },
          { label: '档案编号', value: teqSnapshot.archiveSn },
          { label: '设备类别', value: teqSnapshot.type },
          { label: '设备名称', value: teqSnapshot.name },
          { label: '规格型号', value: teqSnapshot.standard },
          { label: '配置位置', value: teqSnapshot.storageSite },
          { label: '生产厂家', value: teqSnapshot.factory },
          { label: '制造编号', value: teqSnapshot.factorySn },
          {
            label: '出厂日期',
            value: formatDate(teqSnapshot.productionDate, 'YYYY-MM-DD'),
          },
          { label: '出厂价', value: teqSnapshot.factoryPrice },
          { label: '安装费', value: teqSnapshot.installFee },
          { label: '运杂费', value: teqSnapshot.transportFee },
          {
            label: '购置日期',
            value: formatDate(teqSnapshot.buyDate, 'YYYY-MM-DD'),
          },
          {
            label: '投产时间',
            value: formatDate(teqSnapshot.operationDate, 'YYYY-MM-DD'),
          },
          { label: '精度', value: teqSnapshot.accuracy },
          { label: '量程', value: teqSnapshot.eqRange },
          { label: '总功率', value: teqSnapshot.power },
          { label: '外型尺寸', value: teqSnapshot.size },
          { label: '复杂系数(机)', value: teqSnapshot.coefficientMachine },
          { label: '复杂系数(电)', value: teqSnapshot.coefficientElectronic },
          { label: '复杂系数(热)', value: teqSnapshot.coefficientHot },
          { label: '管理方式', value: teqSnapshot.managementWay },
          {
            label: '纳入设备授权管理',
            value: teqSnapshot.isIot === '1' ? '是' : '否',
          },
          {
            label: '公路水运设备',
            value: teqSnapshot.isGlsy === '1' ? '是' : '否',
          },
          { label: '单位管理员', value: teqSnapshot.managerName },
          { label: '部门保管人', value: teqSnapshot.keeperName },
          { label: '所属功能室', value: teqSnapshot.laboratoryName },
          {
            label: '检校周期',
            value: `${
              this.isDefine(teqSnapshot.checkPeriod)
                ? teqSnapshot.checkPeriod
                : ''
            }${teqSnapshot.checkUnit}`,
          },
          { label: '所属单位', value: teqSnapshot.unitName },
          { label: '所属部门', value: teqSnapshot.departName },
          { label: '管理类别', value: teqSnapshot.manageType },
          { label: '使用人', value: teqSnapshot.userName },
          {
            label: '下次校验时间',
            value: formatDate(teqSnapshot.nextCheckDate, 'YYYY-MM-DD'),
          },
          { label: '存放位置', value: teqSnapshot.storageSite },
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
