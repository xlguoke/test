<template>
  <div class="fieldSampling-wrap">
    <MobileTitleBar title="现场取样" left-arrow @click-left="$router.go(-1)" />

    <div class="fieldSampling-content">
      <div class="fieldSampling-box">
        <div class="fieldSampling-title">
          样品信息
        </div>
        <div class="fieldSampling-item">
          <div class="fieldSampling-label">
            当前定位：
          </div>
          <div class="fieldSampling-value flex justify-end">
            <AppLocation
              v-model:value="fieldSampling.extractSampleLocation"
            ></AppLocation>
          </div>
        </div>

        <FormItemPicker
          label="取样标段："
          :options="bidSectionList"
          required
          placeholder="请选择取样标段"
          :value="bidSection"
          v-bind="fieldAttrs"
          @select="onConfirm"
        />

        <FormItemInput
          :value="samplesTypeLable"
          label="取样类型："
          required
          v-bind="fieldAttrs"
          placeholder="请选择样品类型"
          @click-input="samplesSelect"
        />

        <FormItemInput
          v-model="fieldSampling.testSampleDisplayName"
          label="样品名称："
          required
          v-bind="fieldAttrs"
          placeholder="请输入样品名称"
        />

        <FormItemInput
          v-if="showType === 0"
          v-model="fieldSampling.standard"
          label="规格型号："
          v-bind="fieldAttrs"
          placeholder="请输入规格型号"
        />
        <template v-else-if="showType >= 1">
          <FormItemInput
            v-for="(item, index) in specificationList" :key="index"
            v-model:value="item.value"
            :label="index === 0 ? '规格型号：' : ' '"
            :placeholder="`请输入${item.displayName || item.name}`"
            v-bind="fieldAttrs"
            :options="item.inputHistory"
          />
        </template>

        <FormItemInput
          v-model:value="fieldSampling.sampleNum_num"
          label="数量："
          type="digit"
          v-bind="fieldAttrs"
          placeholder="请输入数量"
          @blur="numChange('sampleNum')"
        />

        <FormItemSelect
          v-model:value="fieldSampling.sampleNum_unit"
          label="数量单位："
          :options="sampleUnitList"
          placeholder="请选择数量单位"
          v-bind="fieldAttrs"
          @select="() => {
            numChange('sampleNum')
          }"
        />

        <FormItemInput
          v-model:value="fieldSampling.delegatesNum_num"
          label="代表数量："
          type="digit"
          v-bind="fieldAttrs"
          placeholder="请输入代表数量"
          @blur="numChange('delegatesNum')"
        />

        <FormItemSelect
          v-model:value="fieldSampling.delegatesNum_unit"
          label="代表数量单位："
          :options="sampleUnitList"
          placeholder="请选择代表数量单位"
          v-bind="fieldAttrs"
          @select="() => {
            numChange('delegatesNum')
          }"
        />

        <FormItemInput
          v-model:value="fieldSampling.samplingPlace"
          label="取样地点："
          v-bind="fieldAttrs"
          placeholder="请输入取样地点"
        />

        <FormItemInput
          v-model:value="fieldSampling.projectPartAndUse"
          label="工程部位："
          v-bind="fieldAttrs"
          placeholder="请输入工程部位"
        />

        <template v-if="moreInfo">
          <template v-for="(item, index) in otherInfos" :key="index">
            <template v-if="!item._hide">
              <FormItemDate
                v-if="item.dataType === 2"
                v-model:value="item.formingDate"
                :label="`${item.displayName || item.name}：`"
                :placeholder="`请选择${item.displayName || item.name}`"
                v-bind="fieldAttrs"
              />

              <FormItemSelect
                v-else-if="item.dataType === 5"
                v-model:value="item.value"
                :label="`${item.displayName || item.name}：`"
                :placeholder="`请选择${item.displayName || item.name}`"
                :options="item._listValue"
                v-bind="fieldAttrs"
              />

              <FormItemInput
                v-else
                v-model:value="item.value"
                :label="`${item.displayName || item.name}：`"
                :options="item.inputHistory"
                :placeholder="`请输入${item.displayName || item.name}`"
                v-bind="fieldAttrs"
              />
            </template>
          </template>

          <FormItemInput
            v-model:value="fieldSampling.remark"
            label="备注："
            placeholder="请输入备注"
            v-bind="fieldAttrs"
          />
        </template>

        <div class="text-center mt-5">
          <div class="fieldSampling-btn" @click.stop="more">
            {{ moreInfo ? '收起' : '更多信息' }}
          </div>
        </div>
      </div>
      <div class="fieldSampling-box mt-2">
        <div class="fieldSampling-title">
          智能标签
        </div>
        <div
          v-for="(item, index) in barcodeIdList"
          :key="index"
          :class="{ fieldSamplingTag: index }"
        >
          <div v-if="barcodeIdList && barcodeIdList.length > 1" class="text-right pr-4">
            <van-icon
              color="red"
              size="20"
              name="delete"
              @click.stop="delQrCode(item, index)"
            />
          </div>

          <FormItemInput
            v-model:value="item.barcodeId"
            label="二维码："
            placeholder="请输入二维码"
            v-bind="fieldAttrs"
            @blur="qrCodeBlur(item, index)"
          >
            <template #right-icon>
              <van-icon
                v-if="!item.barcodeId"
                color="#154bd0"
                size="20"
                name="scan"
                @click.stop="onScan(item, index)"
              />
              <van-icon
                v-else-if="item.barcodeId"
                size="20"
                name="close"
                @click.stop="clearQrCode(item, index)"
              />
            </template>
          </FormItemInput>

          <template v-if="String(isStandard) === '1'">
            <FormItemDate
              v-model:value="item.formingDate"
              label="制样时间："
              placeholder="请选择制样时间"
              v-bind="fieldAttrs"
            />

            <FormItemInput
              v-model:value="item.periodCode"
              label="试件编号："
              placeholder="请输入试件编号"
              v-bind="fieldAttrs"
            />

            <FormItemInput
              v-model:value="item.days"
              label="龄期(天)："
              type="digit"
              placeholder="请输入龄期（天）"
              v-bind="fieldAttrs"
            />
          </template>
        </div>
        <div class="text-center mt-5">
          <div class="fieldSampling-btn" @click.stop="addQrCode">
            新增
          </div>
        </div>
      </div>
      <div class="fieldSampling-box mt-2">
        <div class="fieldSampling-title">
          附件
        </div>
        <div class="file-wrap">
          <AttachmentHandler
            ref="attachmentRef"
            :business-id="undefined"
            business-type="EXTRACT_SAMPLE"
          />
        </div>
      </div>
      <div class="fieldSampling-box mt-2">
        <div class="fieldSampling-title">
          见证信息
        </div>
        <div class="file-wrap">
          <AttachmentHandler
            ref="witnessingAttachmentRef"
            :business-id="undefined"
            business-type="EXTRACT_SAMPLE_WITNESS"
          />
        </div>
      </div>
      <div class="fieldSampling-box mt-2">
        <FormItemInput
          v-model:value="witnessInfo.buildWitness"
          label="见证人："
          placeholder="请输入见证人"
          :options="buildWitnessList"
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="witnessInfo.buildUnitName"
          label="建设单位："
          placeholder="请输入建设单位"
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="witnessInfo.buildWitnessLicenseNumber"
          label="见证人证号："
          placeholder="请输入见证人证号"
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="witnessInfo.buildWitnessPhone"
          label="手机号："
          placeholder="请输入手机号"
          v-bind="fieldAttrs"
        />
      </div>
      <div class="fieldSampling-box mt-2">
        <FormItemInput
          v-model:value="witnessInfo.witness"
          label="见证人："
          placeholder="请输入见证人"
          :options="witnessList"
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="witnessInfo.witnessUnitName"
          label="监理单位："
          placeholder="请输入监理单位"
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="witnessInfo.witnessLicenseNumber"
          label="见证人证号："
          placeholder="请输入见证人证号"
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="witnessInfo.witnessPhone"
          label="手机号："
          placeholder="请输入手机号"
          v-bind="fieldAttrs"
        />
      </div>
    </div>
    <van-button block type="primary" @click="onSubmit">
      完成取样
    </van-button>
  </div>
</template>

<!-- eslint-disable ts/no-unused-expressions -->
<script>
import dayjs from 'dayjs'
import { mapState, mapWritableState } from 'pinia'
import qs from 'qs'
import { v4 } from 'uuid'
import {
  showDialog,
  showSuccessToast,
} from 'vant'
import AppLocation from '~/views/mobileApp/components/appLocation.vue'
import AttachmentHandler from '~/views/mobileApp/components/AttachmentHandler.vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemPicker from '~/views/mobileApp/components/MobileFormItem/FormItemPicker.vue'
import FormItemSelect from '~/views/mobileApp/components/MobileFormItem/FormItemSelect.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { qrCodeScanTool } from '~/views/mobileApp/provides/modules/qr-code-scan-tool'
import { checkEmptyText } from '~/views/mobileApp/provides/utils/checkEmptyText'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useSampleStore } from '~/views/mobileApp/store/useSampleStore'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

function FieldSampling() {
  return {
    currentLocation: undefined,
    extractSampleLocation: undefined,
    extractedDate: '',
    testSampleDisplayName: undefined,
    sampleName: undefined,
    categoryId: undefined,
    categoryName: undefined,
    categorySampleId: undefined,
    sampleId: undefined,
    standard: '',
    delegatesNum: '',
    sampleNum: '',
    delegatesNum_num: '',
    sampleNum_num: '',
    delegatesNum_unit: '',
    sampleNum_unit: '',
    consignCode: undefined,
    extractSampleCode: undefined,
    projectPartAndUse: undefined,
    sampleProcessMethod: undefined,
    sampleProcessMethodCode: undefined,
    remark: undefined,
    otherInfo: undefined,
    witnessInfo: undefined,
    periods: undefined,
    attachments: undefined,
    proofs: undefined,
    rfids: [],
    meta: undefined,
    consignMeta: undefined,
  }
}
function WitnessInfo() {
  return {
    witnessUnitName: '', // 监理单位
    witness: '', // 监理见证人
    witnessLicenseNumber: '', // 监理见证人证号
    witnessPhone: '', // 监理见证人手机号
    buildUnitName: '', // 建设单位
    buildWitness: '', // 建设见证人
    buildWitnessLicenseNumber: '', // 建设人证号
    buildWitnessPhone: '', // 建设人手机号
  }
}
export default {
  components: {
    AppLocation,
    MobileTitleBar,
    FormItemPicker,
    FormItemSelect,
    FormItemDate,
    FormItemInput,
    AttachmentHandler,
  },
  beforeRouteLeave(to, from, next) {
    if (
      !(to.name === 'samplesSelect' && to.query.id)
      && this.isSubmit === false
    ) {
      this.cacheFormData()
      sessionStorage.removeItem('otherInfosCache')
    }

    if (
      (to.name === 'samples' || to.name === 'sampleInfo')
      && this.isSubmit === true
    ) {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.resetPage = true
    }
    next()
  },
  data() {
    return {
      formatDate,
      checkEmptyText,
      fieldSampling: new FieldSampling(),
      witnessInfo: new WitnessInfo(),
      columns: ['杭州', '宁波', '温州', '嘉兴', '湖州'],
      moreInfo: false,
      isStandard: '0',
      barcodeIdList: [
        {
          storeId: '',
          barcodeId: '',
          rfid: '',
          status: true,
          periodCode: '',
          description: '',
          days: '',
          formingDate: dayjs().format(EDateFormatType.YYYY_MM_DD),
        },
      ],
      scanItem: null,
      otherInfos: [],
      // 上一次提交时的辅助信息数据
      preOtherInfos: [],
      specificationList: [],
      // 上一次提交时的规格型号数据
      preSpecificationList: [],
      attachmentsList: [],
      proofsList: [],
      witnessList: [],
      buildWitnessList: [],
      samplesType: '',
      samplesTypeLable: '',
      samplesIds: {
        id: '',
        value: '',
      },
      sampleNum_num: '',
      sampleNum_unit: '',
      delegatesNum_num: '',
      delegatesNum_unit: '',
      sampleUnitList: [],
      categorySampleInfo: {},
      perjectInfo: {},
      bidSection: '',
      bidSectionList: [],
      projectList: [],
      contractList: [],
      bidSectionListLoading: false,
      isSubmit: false,
    }
  },
  computed: {
    showType() {
      return this.specificationList.length
    },
    fieldAttrs() {
      return {
        labelWidth: '100px',
      }
    },
    ...mapWritableState(useSampleStore, ['sampleInfo']),
    ...mapState(useAppUserStore, ['userInfo']),
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      const query = this.$route.query
      const name = query.name ? query.name : ''
      const label = query.label ? query.label : ''
      const id = query.id ? query.id : ''
      const value = query.value ? query.value : ''
      this.samplesType = `${name}/${label}`
      this.samplesTypeLable = label
      this.samplesIds.id = id
      this.samplesIds.value = value
      this.fieldSampling.testSampleDisplayName = label
      this.fieldSampling.sampleName = label

      this.getTypeGrid()
      this.getProjectTree()
      const witnessList = localStorage.getItem('witnessList')
      this.witnessList = witnessList ? JSON.parse(witnessList) : []
      const buildWitnessList = localStorage.getItem('buildWitnessList')
      this.buildWitnessList = buildWitnessList
        ? JSON.parse(buildWitnessList)
        : []

      if (this.sampleInfo) {
        const sampleInfo = this.sampleInfo ? this.sampleInfo : {}
        sampleInfo.fieldSampling
        && (this.fieldSampling = {
          ...sampleInfo.fieldSampling,
          testSampleDisplayName: label,
          sampleName: label,
        })
        sampleInfo.bidSection && (this.bidSection = sampleInfo.bidSection)
        sampleInfo.categorySampleInfo
        && (this.categorySampleInfo = sampleInfo.categorySampleInfo)
        sampleInfo.witnessInfo && (this.witnessInfo = sampleInfo.witnessInfo)
        sampleInfo.barcodeIdList
        && (this.barcodeIdList = sampleInfo.barcodeIdList)
        sampleInfo.attachmentsList
        && (this.attachmentsList = sampleInfo.attachmentsList)
        sampleInfo.proofsList && (this.proofsList = sampleInfo.proofsList)
        sampleInfo.witnessList && (this.witnessList = sampleInfo.witnessList)
        sampleInfo.buildWitnessList
        && (this.buildWitnessList = sampleInfo.buildWitnessList)
        sampleInfo.perjectInfo && (this.perjectInfo = sampleInfo.perjectInfo)
      }

      // 加载收样辅助信息放存默认值后面，此方法里面会重新赋值当前categorySampleInfo
      this.loadOtherInfo()

      // 判断是否第一次进入，第一次进入页面，默认上次提交时填写的数据
      if (!this.sampleInfo || !this.sampleInfo.fieldSampling) {
        this.usePreData()
      }
    },
    // 使用上一次填写的数据
    usePreData() {
      let samplesRow = sessionStorage.getItem('samplesRow')
      samplesRow = samplesRow ? JSON.parse(samplesRow) : ''
      if (!samplesRow) {
        return
      }

      let preExtractedSampleData = localStorage.getItem(
        'preExtractedSampleData',
      )
      if (preExtractedSampleData) {
        preExtractedSampleData = JSON.parse(preExtractedSampleData)
        const data = preExtractedSampleData[samplesRow.sampleId]
        if (data) {
          this.perjectInfo = data.perjectInfo
          this.bidSection = data.perjectInfo.bidSection
          this.witnessInfo = data.witnessInfo
          const {
            standard,
            sampleNum_num,
            sampleNum_unit,
            delegatesNum_num,
            delegatesNum_unit,
            samplingPlace,
            projectPartAndUse,
            remark,
            contractPartId,
          } = data.fieldSampling
          this.fieldSampling.contractPartId = contractPartId
          this.fieldSampling.standard = standard
          this.fieldSampling.sampleNum_num = sampleNum_num
          this.fieldSampling.sampleNum_unit = sampleNum_unit
          this.numChange('sampleNum')
          this.fieldSampling.delegatesNum_num = delegatesNum_num
          this.fieldSampling.delegatesNum_unit = delegatesNum_unit
          this.numChange('delegatesNum')
          this.fieldSampling.samplingPlace = samplingPlace
          this.fieldSampling.projectPartAndUse = projectPartAndUse
          this.fieldSampling.remark = remark
          this.preSpecificationList = data.specificationList
          this.preOtherInfos = data.otherInfos
          // this.proofsList = data.proofsList;
          // this.attachmentsList = data.attachmentsList;
        }
      }
    },
    // 二维码输入后检测
    async qrCodeBlur(item) {
      if (!item.barcodeId) {
        return
      }
      this.scanItem = item
      await this.getRfid(item.barcodeId)
    },
    numChange(str) {
      this.fieldSampling[str]
        = this.checkNull(this.fieldSampling[`${str}_num`])
          + this.checkNull(this.fieldSampling[`${str}_unit`])
    },
    checkNull(val) {
      return val || val === 0 ? val : ''
    },
    // 获取标签信息
    async getRfid(result) {
      await mRequest
        .get(api.samples.rfid, { params: { param: result } })
        .then((res) => {
          if (res.code === 20000) {
            this.scanRsult(res.data)
          }
          else {
            showFailToast(res.message || res.msg)
          }
        })
        .catch((_) => {})
    },
    samplesSelect() {
      const arr = this.samplesType.split('/')
      const name = arr[0] ? arr[0] : ''
      const label = arr[1] ? arr[1] : ''

      this.sampleInfo = {
        fieldSampling: this.fieldSampling,
        bidSection: this.bidSection,
        categorySampleInfo: this.categorySampleInfo,
        witnessInfo: this.witnessInfo,
        barcodeIdList: this.barcodeIdList,
        otherInfos: this.otherInfos,
        specificationList: this.specificationList,
        sampleNum_num: this.sampleNum_num,
        sampleNum_unit: this.sampleNum_unit,
        delegatesNum_num: this.delegatesNum_num,
        delegatesNum_unit: this.delegatesNum_unit,
        attachmentsList: this.attachmentsList,
        proofsList: this.proofsList,
        witnessList: this.witnessList,
        buildWitnessList: this.buildWitnessList,
        perjectInfo: this.perjectInfo,
      }

      sessionStorage.setItem('otherInfosCache', JSON.stringify(this.otherInfos))

      this.$router.push({
        name: 'samplesSelect',
        query: {
          id: this.samplesIds.id,
          name,
          value: this.samplesIds.value,
          label,
        },
      })
    },
    // 扫码
    onScan(row) {
      this.scanItem = row

      qrCodeScanTool.scan((result) => {
        mRequest
          .get(api.samples.rfid, { params: { param: result } })
          .then((res) => {
            if (res.code === 20000) {
              this.scanRsult(res.data)
            }
            else {
              showDialog({
                title: '提示',
                message: res.msg || res.message,
              })
            }
          })
          .catch((_) => {
            // eslint-disable-next-line no-alert
            alert(JSON.stringify(_))
          })
      })
    },
    more() {
      this.moreInfo = !this.moreInfo
    },
    scanRsult(rsult) {
      if (!this.scanItem) {
        return
      }
      this.scanItem.storeId = rsult.id
      this.scanItem.barcodeId = rsult.barcodeId
      this.scanItem.rfid = rsult.rfid
      this.scanItem.status = rsult.status
    },
    clearQrCode(row) {
      row.barcodeId = ''
    },
    delQrCode(row, index) {
      this.barcodeIdList.splice(index, 1)
    },
    addQrCode() {
      this.barcodeIdList.push({
        storeId: '',
        barcodeId: '',
        rfid: '',
        status: true,
        periodCode: '',
        description: '',
        days: '',
        formingDate: dayjs().format(EDateFormatType.YYYY_MM_DD),
      })
    },
    getListValueArr(item) {
      if (String(item.dataType) === '5' && item.listValue) {
        const arr = item.listValue.split(';').filter(d => !!d)
        return arr.map((i) => {
          if (i.includes('@_@')) {
            return i.split('@_@')[0]
          }

          return i
        })
      }
      return []
    },
    // 获取样品辅助信息
    loadOtherInfo() {
      let samplesRow = sessionStorage.getItem('samplesRow')
      samplesRow = samplesRow ? JSON.parse(samplesRow) : ''
      if (!samplesRow) {
        return
      }
      this.isStandard = samplesRow.isStandard

      this.categorySampleInfo = samplesRow
      const { sampleId, quoteParams } = samplesRow
      const ids = quoteParams.map(item => item.testItemId)
      const testItemIds = Array.from(new Set(ids))
      const sampleInfo = this.sampleInfo ? this.sampleInfo : {}
      if (sampleInfo && sampleInfo.otherInfos) {
        this.otherInfos = sampleInfo.otherInfos
        this.specificationList = sampleInfo.specificationList
        this.sampleNum_num = sampleInfo.sampleNum_num
        this.sampleNum_unit = sampleInfo.sampleNum_unit
        this.delegatesNum_num = sampleInfo.delegatesNum_num
        this.delegatesNum_unit = sampleInfo.delegatesNum_unit
        // return;
      }
      mRequest
        .post(
          api.samples.getTestOtherInfo,
          qs.stringify({
            testItemIds: testItemIds.toString(),
            sampleId,
          }),
        )
        .then((res) => {
          const data = res.sort((a, b) => a.orderNo - b.orderNo)
          const specification = ['型号', '规格', '等级', '标号']
          const fields = [...specification, '代表批量', '试样数量']
          const specificationList = []
          this.otherInfos = data.map((item) => {
            const has = specification.includes(item.systemFieldName)
            const obj = {
              ...item,
              value: null,
              _listValue: this.getListValueArr(item),
              _hide: fields.includes(item.systemFieldName),
            }

            // 将上一次提交填写的收样辅助信息默认
            if (this.preOtherInfos.length > 0) {
              const preOtherInfosObj = this.preOtherInfos.find(
                item => item.id === obj.id,
              )
              if (preOtherInfosObj) {
                obj.value = preOtherInfosObj.value || null
              }
            }

            if (has) {
              // 将上一次提交填写的规格型号默认
              if (this.preSpecificationList.length > 0) {
                const preSpecificationObj = this.preSpecificationList.find(
                  item => item.id === obj.id,
                )
                if (preSpecificationObj) {
                  obj.value = preSpecificationObj.value || null
                }
              }
              specificationList.push(obj)
            }

            return obj
          })

          // 从缓存中取出保存的收样辅助信息来匹配修改
          let otherInfosCache = sessionStorage.getItem('otherInfosCache')
          if (otherInfosCache) {
            try {
              otherInfosCache = JSON.parse(otherInfosCache)
              for (let i = 0; i < this.otherInfos.length; i++) {
                const id = this.otherInfos[i].id
                const otherInfo = otherInfosCache.find(item => item.id === id)
                if (otherInfo) {
                  this.otherInfos[i].value = otherInfo.value
                }
              }
            }
            catch (e) {
              console.warn(e.message)
            }
          }

          this.specificationList = specification
            .map((item) => {
              return specificationList.filter(i =>
                i.systemFieldName.includes(item),
              )[0]
            })
            .filter(i => i)
            .map(i => ({
              ...i,
              inputHistory: this.getSpecificationInputHistory(
                i.listValue,
                i.inputHistory,
              ),
            }))
        })
        .catch((_) => {})
    },
    // 拼接历史纪录和规格型号自带的值
    getSpecificationInputHistory(listValue, inputHistory) {
      const list = []
      if (listValue) {
        const arr = listValue.split(';')
        arr.forEach((i) => {
          if (!list.includes(i)) {
            list.push(i)
          }
        })
      }

      if (inputHistory && inputHistory.length > 0) {
        inputHistory.forEach((i) => {
          if (!list.includes(i)) {
            list.push(i)
          }
        })
      }

      return list.map(i => ({ name: i }))
    },
    // 获取单位
    getTypeGrid() {
      mRequest
        .post(
          api.common.typeGrid,
          qs.stringify({
            typegroupid: '8a8ab0b246dc81120146dc8181c3006d',
            field: 'id,typename,typecode,sourceFrom',
          }),
        )
        .then((res) => {
          const arr = res.rows ? res.rows : []
          this.sampleUnitList = arr.map(i => ({
            name: i.typecode || i.typename,
            value: i.typecode || i.typename,
          }))
        })
        .catch((_) => {})
    },
    // 获取综合项目树
    getProjectTree() {
      this.bidSectionListLoading = true
      mRequest
        .get(api.samples.projectTree)
        .then((res) => {
          this.bidSectionListLoading = false
          const arr = res.data ? res.data : []

          arr.forEach((i) => {
            i.text = i.name
            i.value = i.id
            ;(i.children || []).forEach((j) => {
              j.text = j.name
              j.value = j.id
              j.pId = i.id
              j.pName = i.name
            })
          })

          this.projectList = arr
          this.bidSectionList = arr
        })
        .catch((_) => {
          this.bidSectionListLoading = false
        })
    },
    onConfirm(val) {
      if (!val || !val.length) {
        return
      }

      const item = val[val.length - 1]

      if (!item && item.id === null) {
        return
      }

      this.bidSection = val.map(i => i.name).join('/')
      this.selectBidSectionShow = false

      item.bidSection = this.bidSection
      this.onSelectProject(item)
    },
    // 选中取样标段
    async onSelectProject(data) {
      const { id, name, pId, pName, bidSection } = data

      this.fieldSampling.contractPartId = id
      this.perjectInfo.consignProjectId = id
      this.perjectInfo.consignProjectName = name
      this.perjectInfo.unitProjectType = 2
      this.perjectInfo.unitProjectObjId = pId
      this.perjectInfo.unitProjectName = pName
      this.perjectInfo.bidSection = bidSection
      delete this.perjectInfo.consignUnit
      delete this.perjectInfo.sampleSender

      const unitRes = await mRequest(
        `${api.samples.getConsignUnitByProject}&id=${pId}&showDeleted=0`,
      )
      if (unitRes.rows && unitRes.rows.length > 0) {
        const consignUnit = unitRes.rows[0].consignUnit
        this.perjectInfo.consignUnit = consignUnit

        const senderRes = await mRequest(
          `${api.samples.getSenderByUnit}&id=${consignUnit.id}`,
        )

        if (senderRes.rows && senderRes.rows.length > 0) {
          const sender = senderRes.rows[0]
          this.perjectInfo.sampleSender = sender
        }
      }
    },
    // 处理收样辅助信息
    formatOtherInfo(formData) {
      // "型号", "规格", "等级", "标号", "代表批量", "试样数量",
      const otherInfo = JSON.parse(JSON.stringify(this.otherInfos))
      for (let i = 0; i < otherInfo.length; i++) {
        const item = otherInfo[i]
        if (item.systemFieldName === '代表批量') {
          item.value = formData.delegatesNum
        }
        else if (item.systemFieldName === '试样数量') {
          item.value = formData.sampleNum
        }

        if (item.dataType === 2 && item.value) {
          item.value = formatDate(item.value)
          delete item.formingDate
        }
      }

      return otherInfo
    },
    // 构建样品元数据
    async buildSampleMeta(formData) {
      const {
        systemSampleId,
        sampleId,
        sampleName,
        quoteParams,
        bigCategoryId,
      } = this.categorySampleInfo

      const testParams = await this.buildSampleParamsMeta(
        quoteParams || [],
        sampleId,
        bigCategoryId,
      )
      let initalTestObjectPrice = 0
      let testObjectPrice = 0

      testParams.forEach((item) => {
        initalTestObjectPrice += item.price || 0
        testObjectPrice += item.price || 0
      })

      let samplingPerson = ''
      if (this.userInfo && this.userInfo.realName) {
        samplingPerson = this.userInfo.realName
      }
      else if (localStorage.getItem('userInfo')) {
        const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
        samplingPerson = userInfo.realName || ''
      }

      const meta = {
        ...formData,
        consignProjectId: this.perjectInfo.consignProjectId,
        isStandard: this.isStandard,
        samplingPerson,
        bigCategoryId,
        systemTestSampleId: systemSampleId,
        testSampleId: sampleId,
        testUnitTestSampleId: sampleId,
        testSampleName: sampleName,
        retentionTimeUnit: 'D',
        subsampleList: [],
        otherMaterials: [],
        label: '',
        grade: '',
        model: '',
        specification: '',
        specificationJoint: '',
        sampleAmount: 1,
        testObjectPrice,
        initalTestObjectPrice,
        accessories: [],
        samplingDate: formData.extractedDate,
        testParams,
        mark: v4(),
      }
      return JSON.stringify(meta)
    },
    // 根据样品获取参数
    async buildSampleParamsMeta(data, sampleId, bigCategoryId) {
      const params = JSON.parse(JSON.stringify(data))
      if (params.length === 0) {
        return []
      }

      let testParams = await mRequest(
        api.samples.getTestParamByTestSample,
        {
          params: {
            sampleId,
            bigCategoryId,
          },
        },
      )

      const ids = params.map(item => item.testParamId)
      testParams = testParams.filter(item => ids.includes(item.id))
      testParams = testParams.map((item) => {
        const basis = []
        const basisIds = []
        const standard = []
        const standardIds = []

        for (let j = 0; j < (item.useStandards || []).length; j++) {
          const useStandard = item.useStandards[j]
          const baseStandardUseType = useStandard.baseStandardUseType
          if (baseStandardUseType === '1') {
            basis.push(useStandard.baseStandardName)
            basisIds.push(useStandard.baseStandardId)
          }
          else if (baseStandardUseType === '2') {
            standard.push(useStandard.baseStandardName)
            standardIds.push(useStandard.baseStandardId)
          }
          else if (baseStandardUseType === '3') {
            basis.push(useStandard.baseStandardName)
            basisIds.push(useStandard.baseStandardId)
            standard.push(useStandard.baseStandardName)
            standardIds.push(useStandard.baseStandardId)
          }
        }
        const employPrice
          = item.prices.find((item) => {
            return item.type === 1
          }) || {}
        return {
          basis: basis.toString(),
          basisIds: basisIds.toString(),
          count: 1,
          generateAcceptSampleInfoByCount: item.generateAcceptSampleInfoByCount,
          generateProcessObject: item.generateProcessObject,
          isBuildSampleCode: item.isBuildSampleCode,
          isLocaleItem: item.isLocaleItem,
          priceStandardId: item.priceStandardId,
          price: employPrice.price || 0,
          priceType: employPrice.type || -1,
          priceId:
            item.prices && item.prices.length > 0
              ? item.prices[0].priceId
              : undefined,
          prices: item.prices,
          qualificationType: item.qualificationType,
          remark: item.remark,
          sharePrice: item.sharePrice,
          standard: standard.toString(),
          standardIds: standardIds.toString(),
          testParamId: item.id,
          testParamDisplayName: item.displayName,
        }
      })

      return testParams
    },
    // 构建委托基本数据
    buildConsignMeta() {
      const consognMeta = {
        ...this.witnessInfo,
        perjectInfo: {
          ...this.perjectInfo,
        },
        accessories: [],
      }

      return JSON.stringify(consognMeta)
    },
    // 缓存数据
    cacheFormData() {
      const cache = { ...this.$data }
      localStorage.setItem('extractedSampleCacheData', JSON.stringify(cache))
    },
    // 读取缓存
    loadDataByCache() {
      let extractedSampleCacheData = localStorage.getItem(
        'extractedSampleCacheData',
      )
      if (extractedSampleCacheData) {
        try {
          extractedSampleCacheData = JSON.parse(extractedSampleCacheData)
          const {
            fieldSampling,
            bidSection,
            categorySampleInfo,
            witnessInfo,
            barcodeIdList,
            otherInfos,
            specificationList,
            sampleNum_num,
            sampleNum_unit,
            delegatesNum_num,
            delegatesNum_unit,
            attachmentsList,
            proofsList,
            witnessList,
            buildWitnessList,
            perjectInfo,
          } = extractedSampleCacheData

          this.sampleInfo = {
            fieldSampling,
            bidSection,
            categorySampleInfo,
            witnessInfo,
            barcodeIdList,
            otherInfos,
            specificationList,
            sampleNum_num,
            sampleNum_unit,
            delegatesNum_num,
            delegatesNum_unit,
            attachmentsList,
            proofsList,
            witnessList,
            buildWitnessList,
            perjectInfo,
          }
          localStorage.removeItem('extractedSampleCacheData')
        }
        catch (e) {
          console.warn(e)
          showDialog({ message: '缓存数据出错，系统无法载入上次填写的数据' })
        }
      }
    },
    async onSubmit() {
      if (!this.bidSection) {
        showToast('请选择标段')
        return
      }
      if (!this.samplesType) {
        showToast('请选择取样类型')
        return
      }
      if (!this.fieldSampling.testSampleDisplayName) {
        showToast('请输入样品名称')
        return
      }
      // if (!this.proofsList || !this.proofsList.length) {
      //   showToast("请添加见证信息（照片）");
      //   return;
      // }

      const toast = showLoadingToast({
        duration: 0,
        message: '提交中...',
        forbidClick: true,
      })
      const arr = ['sampleNum', 'delegatesNum']
      arr.forEach((item) => {
        this.numChange(item)
      })
      const testSampleDisplayName = this.fieldSampling.testSampleDisplayName
      const formData = {
        ...this.fieldSampling,
        bigCategoryId: this.categorySampleInfo.bigCategoryId,
        categoryId: this.categorySampleInfo.categoryId,
        categoryName: this.categorySampleInfo.categoryName,
        categorySampleId: this.categorySampleInfo.id,
        sampleId: this.categorySampleInfo.sampleId,
        testSampleDisplayName,
        extractedDate: formatDate(new Date()),
      }

      if (this.showType) {
        const obj = {
          型号: 'model',
          规格: 'specification',
          等级: 'grade',
          标号: 'label',
        }
        this.specificationList.forEach((item) => {
          if (obj[item.systemFieldName]) {
            formData[obj[item.systemFieldName]] = item.value
          }
        })
        const arr = [
          formData.model || null,
          formData.specification || null,
          formData.grade || null,
          formData.label || null,
        ].filter(i => i || i === 0 || i === false)
        formData.standard = arr.join(' ')
      }

      // 辅助收样信息
      formData.otherInfo = this.formatOtherInfo(formData)
      // 附件
      formData.qrKey = [this.$refs.attachmentRef.qrKey, this.$refs.witnessingAttachmentRef.qrKey]
      const barcodeIdList = this.barcodeIdList.filter((i) => {
        i.formingDate && (i.formingDate = formatDate(i.formingDate))
        return i.barcodeId || i.barcodeId === 0
      })
      // 制件信息
      formData.periods = barcodeIdList
      // 电子标签
      formData.rfids = barcodeIdList.map((i) => {
        i.formingDate && (i.formingDate = formatDate(i.formingDate))
        return {
          // id: isNaN(i.id * 1) ? i.id : i.id * 1,
          // barcodeId: isNaN(i.barcodeId * 1) ? i.barcodeId : i.barcodeId * 1,
          // rfid: isNaN(i.rfid * 1) ? i.rfid : i.rfid * 1,
          id: i.storeId,
          barcodeId: i.barcodeId,
          rfid: i.rfid,
        }
      })
      // 构建样品数据
      formData.meta = await this.buildSampleMeta(formData).catch((err) => {
        toast.close()
        throw err
      })

      // 构建委托数据
      formData.consignMeta = this.buildConsignMeta()
      formData.otherInfo = JSON.stringify(formData.otherInfo)
      formData.proofs = JSON.stringify(formData.proofs)
      formData.attachments = JSON.stringify(formData.attachments)
      formData.periods = JSON.stringify(formData.periods)
      formData.witnessInfo = JSON.stringify(this.witnessInfo)
      if (!formData.rfids.length) {
        formData.rfids = null
      }
      mRequest({
        url: api.samples.extractSample,
        method: 'POST',
        data: formData,
        headers: {
          'content-type': 'application/json',
        },
      })
        .then((res) => {
          if (res && res.code === 21000) {
            showSuccessToast('操作成功')
            const witness = this.witnessInfo.witness // 监理见证人
            const buildWitness = this.witnessInfo.buildWitness // 建设见证人
            if (witness && !this.witnessList.includes(witness)) {
              this.witnessList.push(witness)
              localStorage.setItem(
                'witnessList',
                JSON.stringify(this.witnessList),
              )
            }
            if (buildWitness && !this.buildWitnessList.includes(buildWitness)) {
              this.buildWitnessList.push(buildWitness)
              localStorage.setItem(
                'buildWitnessList',
                JSON.stringify(this.buildWitnessList),
              )
            }
            localStorage.removeItem('extractedSampleCacheData')
            sessionStorage.removeItem('otherInfosCache')
            this.cacheSubmitData(formData)
            this.isSubmit = true

            this.sampleInfo = {}

            this.$router.replace({
              name: 'sampleInfo',
              query: {
                type: 'sampling',
                id: res.data.id,
              },
            })
          }
          else {
            showDialog({ message: res.message || res.msg })
          }
        })
        .finally(() => {
          toast.close()
        })
    },
    // 缓存本次提交的数据
    cacheSubmitData(formData) {
      // 按不同的大类缓存本次提交的数据，下次新增相同大类的取样时，默认缓存的数据
      let preExtractedSampleData = localStorage.getItem(
        'preExtractedSampleData',
      )
      if (preExtractedSampleData) {
        preExtractedSampleData = JSON.parse(preExtractedSampleData)
      }
      else {
        preExtractedSampleData = {}
      }

      preExtractedSampleData[formData.sampleId] = {
        perjectInfo: this.perjectInfo,
        witnessInfo: this.witnessInfo,
        fieldSampling: this.fieldSampling,
        specificationList: this.specificationList,
        otherInfos: this.otherInfos,
        // attachmentsList: this.attachmentsList,
        // proofsList: this.proofsList
      }
      localStorage.setItem(
        'preExtractedSampleData',
        JSON.stringify(preExtractedSampleData),
      )
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
