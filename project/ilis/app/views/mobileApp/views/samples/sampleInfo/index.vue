<template>
  <div class="sampleData-wrap">
    <van-sticky>
      <MobileTitleBar title="取样信息" left-arrow @click-left="onBack">
      </MobileTitleBar>
    </van-sticky>
    <div class="sampleData-content">
      <div class="sampleData-box">
        <div class="sampleData-title">
          样品信息
        </div>

        <FormItemInput
          :value="sampleData.extractSampleLocation"
          label="当前定位："
          v-bind="fieldAttrs"
        />

        <FormItemInput
          :value="sampleData.consignMeta ? sampleData.consignMeta.perjectInfo
            ? sampleData.consignMeta.perjectInfo.bidSection
            : ''
            : ''"
          label="取样标段："
          v-bind="fieldAttrs"
        />

        <FormItemInput
          :value="`${sampleData.categoryName}/${sampleData.testSampleDisplayName}`"
          label="取样类型："
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="sampleData.testSampleDisplayName"
          label="样品名称："
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-if="showType === 0"
          v-model:value="sampleData.standard"
          label="规格型号："
          v-bind="fieldAttrs"
        />
        <template v-else-if="showType >= 1">
          <FormItemInput
            v-for="(item, index) in specificationList" :key="index"
            v-model:value="item.value"
            :label="index === 0 ? '规格型号：' : ' '"
            v-bind="fieldAttrs"
          />
        </template>

        <FormItemInput
          v-model:value="sampleData.sampleNum"
          label="数量："
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="sampleData.delegatesNum"
          label="代表数量："
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="sampleData.samplingPlace"
          label="取样地点："
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="sampleData.projectPartAndUse"
          label="工程部位："
          v-bind="fieldAttrs"
        />

        <template v-if="moreInfo">
          <template v-for="(item, index) in otherInfos" :key="index">
            <template v-if="!item._hide">
              <FormItemInput
                v-model:value="item.value"
                :label="`${item.displayName || item.name}：`"
                v-bind="fieldAttrs"
              />
            </template>
          </template>
        </template>

        <div class="text-center mt-5">
          <div class="sampleData-btn" @click.stop="more">
            {{ moreInfo ? '收起' : '更多信息' }}
          </div>
        </div>
      </div>

      <div class="sampleData-box mt-2">
        <div class="sampleData-title">
          智能标签
        </div>
        <div
          v-for="(item, index) in barcodeIdList"
          :key="index"
          :class="{ sampleDataTag: index }"
        >
          <FormItemInput
            v-model:value="item.barcodeId"
            label="二维码："
            v-bind="fieldAttrs"
          />

          <template v-if="String(isStandard) === '1'">
            <FormItemInput
              v-model:value="item.formingDate"
              label="制样时间："
              v-bind="fieldAttrs"
            />

            <FormItemInput
              v-model:value="item.periodCode"
              label="试件编号："
              v-bind="fieldAttrs"
            />

            <FormItemInput
              v-model:value="item.days"
              label="龄期："
              v-bind="fieldAttrs"
            />
          </template>
        </div>
      </div>

      <div class="sampleData-box mt-2">
        <div class="sampleData-title">
          附件
        </div>
        <div class="file-wrap">
          <AttachmentHandler
            v-if="sampleData.id"
            :business-id="sampleData.id"
            business-type="EXTRACT_SAMPLE"
            readonly
            pic-view-mode
          />
        </div>
      </div>
      <div class="sampleData-box mt-2">
        <div class="sampleData-title">
          见证信息
        </div>
        <div class="file-wrap">
          <AttachmentHandler
            v-if="sampleData.id"
            :business-id="sampleData.id"
            business-type="EXTRACT_SAMPLE_WITNESS"
            readonly
            pic-view-mode
          />
        </div>
      </div>

      <div class="sampleData-box mt-2">
        <FormItemInput
          v-model:value="witnessInfo.buildWitness"
          label="见证人："
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="witnessInfo.buildUnitName"
          label="建设单位："
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="witnessInfo.buildWitnessLicenseNumber"
          label="见证人证号："
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="witnessInfo.buildWitnessPhone"
          label="手机号："
          v-bind="fieldAttrs"
        />
      </div>

      <div class="sampleData-box mt-2">
        <FormItemInput
          v-model:value="witnessInfo.witness"
          label="见证人："
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="witnessInfo.witnessUnitName"
          label="监理单位："
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="witnessInfo.witnessLicenseNumber"
          label="见证人证号："
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="witnessInfo.witnessPhone"
          label="手机号："
          v-bind="fieldAttrs"
        />
      </div>

      <div class="sampleData-box mt-2">
        <div class="sampleData-title">
          其他信息
        </div>

        <FormItemInput
          v-model:value="sampleOtherInfo.testObjectCode"
          rows="1"
          autosize
          label="样品编号："
          type="textarea"
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-model:value="sampleOtherInfo.snCategory"
          rows="1"
          autosize
          label="编号类别："
          type="textarea"
          v-bind="fieldAttrs"
        />

        <FormItemInput
          v-for="(item, index) in sampleOtherInfo.terms"
          :key="index"
          v-model:value="item.valueShow"
          rows="1"
          autosize
          :label="`${item.name}：`"
          type="textarea"
          v-bind="fieldAttrs"
        />
      </div>
    </div>

    <div v-if="InAndroid" class="sampleData-printBtn">
      <van-button type="primary" block @click="onPrint(1)">
        打印样品标签
      </van-button>
      <van-button type="primary" block @click="onPrint(2)">
        打印样品标签（按试件打印）
      </van-button>
    </div>
  </div>
</template>

<script>
import {
  showDialog,
} from 'vant'
import AttachmentHandler from '~/views/mobileApp/components/AttachmentHandler.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { checkEmptyText } from '~/views/mobileApp/provides/utils/checkEmptyText'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { InAndroid } from '~/views/mobileApp/provides/utils/referrer'

function SampleData() {
  return {
    extractSampleLocation: undefined,
    samplingPlace: undefined,
    extractedDate: undefined,
    testSampleDisplayName: undefined,
    sampleName: undefined,
    categoryId: undefined,
    categoryName: undefined,
    categorySampleId: undefined,
    sampleId: undefined,
    standard: undefined,
    delegatesNum: undefined,
    sampleNum: undefined,
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
    AttachmentHandler,
    MobileTitleBar,
    FormItemInput,
  },
  data() {
    return {
      formatDate,
      checkEmptyText,
      sampleData: new SampleData(),
      witnessInfo: new WitnessInfo(),
      moreInfo: false,
      isStandard: false,
      barcodeIdList: [],
      otherInfos: [],
      specificationList: [],
      samplesType: '',
      samplesIds: {
        id: '',
        value: '',
      },
      sampleNum: '',
      perjectInfo: {},
      sampleOtherInfo: {},
      InAndroid,
    }
  },
  computed: {
    showType() {
      return this.specificationList.length
    },
    fieldAttrs() {
      return {
        labelWidth: '100px',
        readonly: true,
      }
    },
  },
  async created() {
    const query = this.$route.query
    const name = query.name ? query.name : ''
    const label = query.label ? query.label : ''
    const id = query.id ? query.id : ''
    const value = query.value ? query.value : ''
    this.samplesType = `${name}/${label}`
    this.samplesIds.id = id
    this.samplesIds.value = value
    this.sampleData.testSampleDisplayName = label
    this.sampleData.sampleName = label

    this.getData()
    this.getOtherInfo()
  },
  methods: {
    // 获取取样信息
    getData() {
      const toast = showLoadingToast({
        duration: 0,
        message: '加载中...',
        forbidClick: true,
      })
      mRequest
        .get(api.samples.sampleInfo + this.samplesIds.id)
        .then((res) => {
          toast && toast.close()
          const data = res.data ? res.data : {}
          this.sampleData = data

          if (data.consignMeta) {
            data.consignMeta = JSON.parse(data.consignMeta)
            const { unitProjectName, consignProjectName }
              = data.consignMeta.perjectInfo
            data.consignMeta.perjectInfo.bidSection = `${unitProjectName}/${consignProjectName}`
          }
          if (data.meta) {
            data.meta = JSON.parse(data.meta)
            this.isStandard = data.meta.isStandard
            this.sampleData.samplingPlace = data.meta.samplingPlace
            this.sampleData.standard = data.meta.standard
          }
          if (data.otherInfo) {
            data.otherInfo = JSON.parse(data.otherInfo)
            this.otherInfos = data.otherInfo
          }
          if (data.periods) {
            data.periods = JSON.parse(data.periods)
            this.barcodeIdList = data.periods
          }

          if (data.witnessInfo) {
            data.witnessInfo = JSON.parse(data.witnessInfo)
            this.witnessInfo = data.witnessInfo
          }
        })
        .catch((_) => {
          toast && toast.close()
          console.warn(_)
        })
    },
    // 获取其他信息
    async getOtherInfo() {
      const res = await mRequest.get(
        `${api.samples.sampleOtherInfo}/${this.samplesIds.id}`,
      )
      if (res.code === 20000) {
        this.sampleOtherInfo = res.data
        this.sampleOtherInfo.terms = res.data.terms || []
      }
      else {
        showDialog({ message: res.msg || res.message || '其他信息获取失败' })
      }
    },
    // 返回
    onBack() {
      this.$router.push({
        name: 'sampling',
      })
    },
    more() {
      this.moreInfo = !this.moreInfo
    },
    /**
     * 按试件打印
     * @param type 1 按样品打印 2 按试件打印
     */
    onPrint(type) {
      if (!this.sampleOtherInfo.testObjectId) {
        this.$router.push({
          name: 'sampleCodeGeneration',
          params: {
            type,
            extractSampleId: this.sampleData.id,
          },
        })
      }
      else {
        this.$router.push({
          name: 'bluetoothPrint',
          params: {
            type,
            testObjectId: this.sampleOtherInfo.testObjectId,
          },
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
:deep(.van-field__label) {
  margin-right: 0;
}
</style>
