<template>
  <a-modal
    v-model:visible="visible"
    :title="mtitle"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="saveLoading"
    width="70%"
    @cancel="cancelModal"
    @ok="handleOk"
  >
    <div class="edit-count">
      <div v-if="form.amendVersion > 0" @click="openChangeHistory('AMEND')">
        <span class="title">更正次数：</span>
        <span class="count">{{ form.amendVersion }}</span>
      </div>
      &nbsp; &nbsp; &nbsp; &nbsp;&nbsp;&nbsp;
      <div v-if="form.editVersion > 0" @click="openChangeHistory('EDIT')">
        <span class="title">编辑次数：</span>
        <span class="count">{{ form.editVersion }}</span>
      </div>
    </div>
    <a-spin :spinning="spinning" tip="Loading...">
      <a-form
        ref="formRef"
        :model="form"
        :label-col="{ style: { width: '120px' } }"
        style="padding-right: 20px"
      >
        <a-row :gutter="10">
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="试验室名称"
              name="laboratory"
              :rules="[{ required: true, message: '请选择试验室名称' }]"
            >
              <common-select
                v-model:value="form.laboratory"
                :url="userAuthLab()"
                :config="{
                  placeholder: '请选择试验室名称',
                  disabled
                }"
                @change="changeLaboratory"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="page == '4'" :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="检测机构"
              name="testOrg"
              :rules="[{ required: true, message: '请输入检测机构' }]"
            >
              <a-input
                v-model:value="form.testOrg"
                placeholder="请输入检测机构"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <p class="detail-title">编号信息</p>
        <a-row :gutter="10">
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="委托编号"
              name="consignSn"
              :rules="[{ required: true, message: '请输入委托编号' }]"
            >
              <a-input
                v-model:value="form.consignSn"
                placeholder="请输入委托编号"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <!-- <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="样品编号" name="sampleSn">
              <a-input
                v-model:value="form.sampleSn"
                placeholder="请输入样品编号"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col> -->
          <!-- <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="记录编号" name="recordSn">
              <a-input
                v-model:value="form.recordSn"
                placeholder="请输入记录编号"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col> -->
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="报告编号"
              name="originalSn"
              :rules="[{ required: true, message: '请输入报告编号' }]"
            >
              <div style="display: flex; align-items: center">
                <a-form-item-rest>
                  <a-input
                    v-model:value="form.originalSn"
                    placeholder="请输入报告编号"
                    :disabled="!isForce && mtitle != '新增报告'"
                  />
                </a-form-item-rest>
                <template v-if="form.snVersionSuffix && (disabled || mtitle != '新增报告')">
                  <span style="margin: 0 3px">-</span>
                  <a-input v-model:value="form.snVersionSuffix" style="width: 80px" disabled />
                </template>
              </div>
            </a-form-item>
          </a-col>
        </a-row>

        <p class="detail-title">委托信息</p>
        <a-row :gutter="10">
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="委托单位"
              name="consignUnit"
              :rules="[{ required: true, message: '请输入委托单位' }]"
            >
              <a-input
                v-model:value="form.consignUnit"
                placeholder="请输入委托单位"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="委托类型"
              name="checkType"
              :rules="[{ required: true, message: '请选择委托类型' }]"
            >
              <dict-code
                v-model:value="form.checkType"
                code="report_test_type"
                placeholder="请选择委托类型"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="委托人" name="sampleSender">
              <a-input
                v-model:value="form.sampleSender"
                placeholder="请输入委托人"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="委托人电话" name="sampleSenderTel">
              <a-input
                v-model:value="form.sampleSenderTel"
                placeholder="请输入委托人电话"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="项目名称"
              name="project"
              :rules="[{ required: true, message: '请输入项目名称' }]"
            >
              <a-input
                v-model:value="form.project"
                placeholder="请输入项目名称"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="标段名称" name="projectSection">
              <a-input
                v-model:value="form.projectSection"
                placeholder="请输入标段名称"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="委托日期"
              name="consignDate"
              :rules="[
                { required: labType == '母体试验室' ? true : false, message: '请输入委托日期' }
              ]"
            >
              <a-date-picker
                v-model:value="form.consignDate"
                style="width: 100%"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item v-if="labType == '母体试验室'" label="资质类型" name="qualification">
              <!-- <a-input
                v-model:value="form.qualification"
                placeholder="请选择资质类型，多个用 “,” 隔开"
                :disabled="disabled"
              /> -->
              <a-select
                v-model:value="qualifications"
                placeholder="请选择资质类型"
                :disabled="disabled"
                mode="multiple"
                allow-clear
                @change="
                  () => {
                    form.qualification = qualifications.join(',')
                  }
                "
              >
                <a-select-option v-for="d in qualifyDatas" :key="d.id" :value="d.name">
                  {{ d.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
        </a-row>

        <p class="detail-title">样品信息</p>
        <DetailSample v-model:samples="form.samples" :disabled="disabled" />

        <p class="detail-title">规程信息</p>
        <a-row :gutter="10">
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="检测标准"
              name="testBasis"
              :rules="[{ required: true, message: '请输入检测标准' }]"
            >
              <a-input
                v-model:value="form.testBasis"
                placeholder="请输入检测标准"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="评定标准" name="evaluationStandard">
              <a-input
                v-model:value="form.evaluationStandard"
                placeholder="请输入评定标准"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <p class="detail-title">人员信息</p>
        <a-row :gutter="10">
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="检测人"
              name="tester"
              :rules="[{ required: true, message: '请输入检测人姓名' }]"
            >
              <a-input
                v-model:value="form.tester"
                placeholder="请输入检测人姓名；多人用“,”隔开"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="审核人"
              name="auditor"
              :rules="[{ required: true, message: '请输入审核人姓名' }]"
            >
              <a-input
                v-model:value="form.auditor"
                placeholder="请输入审核人姓名；多人用“,”隔开"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="批准人"
              name="approver"
              :rules="[{ required: true, message: '请输入批准人姓名' }]"
            >
              <a-input
                v-model:value="form.approver"
                placeholder="请输入批准人姓名；多人用“,”隔开"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="记录人" name="recorder">
              <a-input
                v-model:value="form.recorder"
                placeholder="请输入记录人姓名；多人用“,”隔开"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="协助人" name="assistant">
              <a-input
                v-model:value="form.assistant"
                placeholder="请输入协助人姓名；多人用“,”隔开"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="编写人" name="editor">
              <a-input
                v-model:value="form.editor"
                placeholder="请输入编写人姓名；多人用“,”隔开"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="复核人" name="reviewer">
              <a-input
                v-model:value="form.reviewer"
                placeholder="请输入复核人姓名；多人用“,”隔开"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
        </a-row>

        <p class="detail-title">设备信息</p>
        <a-row :gutter="10">
          <a-col :sm="24" :lg="12" :xxl="8" style="position: reactive">
            <a-form-item
              label="设备编号"
              name="equipmentSn"
              :rules="[{ required: true, message: '请输入设备编号' }]"
            >
              <a-input
                v-model:value="form.equipmentSn"
                placeholder="请输入设备编号，多个设备用 , 隔开"
                :disabled="disabled"
              />
            </a-form-item>
            <span style="color: red; position: absolute; right: -350px; top: 5px">
              当设备编号中含有","时，请使用"&"来分隔多个设备编号
            </span>
          </a-col>
          <!-- <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="设备名称" name="equipmentName">
              <a-input
                v-model:value="form.equipmentName"
                placeholder="请输入设备名称，多个设备用 , 隔开"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col> -->
        </a-row>

        <p class="detail-title">报告信息</p>
        <a-row :gutter="10">
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="审核日期" name="auditTime">
              <a-date-picker
                v-model:value="form.auditTime"
                style="width: 100%"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="检测日期"
              name="testTimeBegin"
              :rules="[{ required: true, message: '请选择检测日期' }]"
            >
              <a-range-picker
                v-model:value="testTime"
                style="width: 100%"
                :disabled="disabled"
                @change="changeTestTime"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="是否合格"
              name="isQualified"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-select v-model:value="form.isQualified" placeholder="请选择" :disabled="disabled">
                <a-select-option :value="1">合格</a-select-option>
                <a-select-option :value="0">不合格</a-select-option>
                <a-select-option :value="-1">不判定</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="签发日期"
              name="signDate"
              :rules="[{ required: true, message: '请选择签发日期' }]"
            >
              <a-date-picker
                v-model:value="form.signDate"
                style="width: 100%"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="是否临时报告"
              name="isTemporary"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-radio-group v-model:value="form.isTemporary" :disabled="disabled">
                <a-radio :value="true">是</a-radio>
                <a-radio :value="false">否</a-radio>
              </a-radio-group>
            </a-form-item>
          </a-col>
          <template v-if="page != '4'">
            <a-col :sm="24" :lg="12" :xxl="8">
              <a-form-item
                label="防伪码"
                name="securityCode"
                :rules="[{ required: true, message: '请输入防伪码' }]"
              >
                <a-input
                  v-model:value="form.securityCode"
                  placeholder="请输入防伪码"
                  :disabled="!isForce && mtitle != '新增报告'"
                />
              </a-form-item>
            </a-col>
            <!-- <a-col :sm="24" :lg="12" :xxl="8">
              <a-form-item
                label="验证码"
                name="queryCode"
                :rules="[{ required: true, message: '请输入验证码' }]"
              >
                <a-input
                  v-model:value="form.queryCode"
                  placeholder="请输入验证码"
                  :disabled="!isForce && mtitle != '新增报告'"
                />
              </a-form-item>
            </a-col> -->
          </template>
        </a-row>

        <p class="detail-title">报告文件</p>
        <a-form-item
          label="报告文件"
          name="attachments"
          :rules="[{ required: true, message: '请上传报告' }]"
        >
          <template v-if="!disabled">
            <UploadFile
              v-show="form.id"
              id="upload-report"
              v-model:value="form.attachments"
              :config="{
                multiple: true,
                isReport: true,
                bucketUri: `${form.id}`,
                disabled: pageType == 'edit' && form.status != '未上传报告',
                types: ['pdf']
              }"
              :btn-name="form.attachments && form.attachments.length ? '更新' : '点击上传'"
              @success="uploadSuccess"
            />
            <!-- 新增时，先执行保存获取到报告id，再执行上传 -->
            <a-button
              v-if="!form.id"
              type="primary"
              :disabled="pageType == 'edit' && form.status != '未上传报告'"
              @click="clickUpload"
            >
              <upload-outlined />
              点击上传
            </a-button>
          </template>
          <FileList v-else :datas="form.attachments" style="margin-top: 10px" />
        </a-form-item>

        <p class="detail-title">备注信息</p>
        <a-row :gutter="10">
          <a-col :sm="24">
            <a-form-item label="备注" name="verdictRemark">
              <a-textarea
                v-model:value="form.verdictRemark"
                placeholder="请输入备注"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>

    <a-modal
      v-model:visible="changeReasonVisible"
      title="提交更正"
      :mask-closable="false"
      :keyboard="false"
      :confirm-loading="saveLoading"
      width="700px"
      @ok="submitAmend()"
    >
      <div class="change-reason-form">
        <p style="color: red">请确保报告文件中的报告编号为此编号</p>
        <a-form class="inline-form">
          <a-form-item label="报告编号预览">
            <div style="display: flex; align-items: center">
              <a-input :value="`${form.originalSn}`" disabled />
              <span style="margin: 0 3px">-</span>
              <a-input v-model:value="form.snVersionSuffix" disabled style="width: 100px" />
            </div>
          </a-form-item>
          <a-form-item label="更正次数">
            <a-input :value="form.amendVersion + 1" disabled />
          </a-form-item>
        </a-form>
        <a-form ref="changeFormRef" :model="changeForm">
          <a-form-item
            label="更正理由"
            name="reason"
            :rules="[{ required: true, message: '请输入更正理由' }]"
          >
            <a-textarea
              v-model:value="changeForm.reason"
              :maxlength="300"
              type="textarea"
              placeholder="请输入更正理由（最多输入300字符）"
            />
          </a-form-item>
          <a-form-item
            label="更正日期"
            name="amendTime"
            :rules="[{ required: true, message: '请选择更正日期' }]"
          >
            <a-date-picker
              v-model:value="changeForm.amendTime"
              show-time
              placeholder="请选择更正日期"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 更正记录 -->
    <ChangeHistory ref="changeHistory" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, h, withDirectives, resolveDirective } from "vue"
import { FormInstance, message, Modal } from "ant-design-vue"
import { UploadOutlined } from "@ant-design/icons-vue"
import dayjs, { Dayjs } from "dayjs"
import DetailSample from "./DetailSample.vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import DictCode from "@/components/dictCode/index.vue"
import UploadFile from "@/components/uploadFile/index.vue"
import FileList from "@/components/fileList/index.vue"
import ChangeHistory from "./ChangeHistory.vue"
import { userAuthLab } from "@/api/commonSelect.api"
import { detailApi, addApi, editApi, amendApi, forceEditApi, delApi } from "@/api/reportMgr.api"
import { getDetail as orgDetail } from "@/api/organization.api"
import { deepCopy } from "@/assets/js/common"
import type { dataItemType } from "@/type/api/report.api"
import checkFieldChange from "@/assets/js/checkFieldChange"

const props = defineProps({
  // 打开页面 1-报告列表 2-不合格报告 3-质量监督抽检报告 4-外委报告
  page: {
    type: [String, Number],
    default: "1"
  }
})
const emit = defineEmits(["updateList"])

const mtitle = ref<string>("")
const spinning = ref<boolean>(false)
const visible = ref<boolean>(false)
const pageType = ref<string>("")

const dataId = ref<string>("")
// 禁用表单 - 详情模式
const disabled = ref<boolean>(false)
// 是否强制编辑
const isForce = ref<boolean>(false)
const openModal = async (
  title: string,
  id: string,
  isDetail: boolean,
  type: string,
  _isForce?: boolean
) => {
  pageType.value = type //页面类型  add：新增  edit：编辑  amend：变更
  mtitle.value = title || "编辑"
  disabled.value = !isDetail
  isForce.value = _isForce || false
  dataId.value = id || ""
  visible.value = true
  id && getDetailData()
}

defineExpose({
  openModal
})

const form = ref<dataItemType>({
  testOrg: "",
  testOrgId: "",
  id: "", // 报告ID
  isSubcontract: props.page == "4",
  laboratoryId: "", //试验室ID
  laboratory: "", //试验室名称
  testLaboratory: "", //检测机构
  consignSn: "", //委托编号
  // sampleSn: "", //样品编号
  // recordSn: "", //记录编号
  originalSn: "",
  sn: "", //报告编号
  snVersionSuffix: "", // 报告编号后缀-更正标识
  consignUnit: "", //委托单位
  checkType: "", //委托类型
  sampleSender: "", //委托人
  sampleSenderTel: "", //委托人电话
  project: "", //项目名称
  projectSection: "", //标段名称
  consignDate: null, //委托日期
  qualification: "", //资质类型
  testBasis: "", //检测依据
  evaluationStandard: "", //判断依据
  tester: "", //检测人
  recorder: "", //记录人
  assistant: "", //协助人
  editor: "", //编写人
  reviewer: "", //复核人
  auditor: "", //审核人
  approver: "", //批准人
  equipmentSn: "", //设备编号
  equipmentName: "", //设备名称
  auditTime: null, //审核时间
  testTimeBegin: null, //检测开时间
  testTimeEnd: null, //检测结束时间
  isQualified: 1, //是否合格
  signDate: "", //签发日期
  isTemporary: false, //是否临时报告
  securityCode: "", //防伪码值, 只有行管强制变更时, 才能修改
  queryCode: "", //查询码/验证码, 只有行管强制变更时, 才能修改
  verdictRemark: "", //备注
  samples: [], //样品
  status: null, // 报告状态
  attachments: [], // 附件
  version: 1,
  createVersion: true,
  editVersion: 0, //编辑版本
  amendVersion: 0 //变更版本
})
let cacheForm: any = {}

//  获取详情数据
const getDetailData = async () => {
  spinning.value = true
  await detailApi(dataId.value).then((res: any) => {
    res.attachments.forEach((it) => {
      let arr = it.url.split("/")
      it.name = arr[arr.length - 1]
    })

    // res.qualification = "公路工程-综合甲级,水运工程-材料乙级"
    if (!res) return
    cacheForm = deepCopy(res)
    for (let i = 0; i < dateKeys.length; i++) {
      const t = res[dateKeys[i]]
      res[dateKeys[i]] = t ? dayjs(t) : null
    }
    //设置回显 资质回显
    qualifications.value = res.qualification ? res.qualification.split(",") : []
    testTime.value = [dayjs(res.testTimeBegin), dayjs(res.testTimeEnd)]
    res.isQualified = res.isQualified === null ? -1 : Number(res.isQualified)

    // res.originalSn ? (res.sn = res.originalSn) : ""
    form.value = res
    spinning.value = false

    pageType.value == "amend" ? (res.attachments = []) : ""
  })
  //获取资质下拉数据
  changeLaboratory({
    option: {
      name: cacheForm.laboratory,
      id: cacheForm.laboratoryId,
      type: cacheForm.labType || ""
    }
  })
}

const qualifications = ref([])
const qualifyDatas = ref<
  Array<{
    name: string
    id: string
  }>
>([])

let labType = ref("") //选择试验室的类型
// 修改试验室
const changeLaboratory = ({ option }) => {
  labType.value = option.type
  console.log("试验室类型:", option.type)
  form.value.laboratory = option ? option.name : ""
  form.value.laboratoryId = option ? option.id : ""
  // qualifications.value = []
  orgDetail(option.id).then((res: any) => {
    const qualify = res.qualify || []
    qualifyDatas.value = qualify.map((d) => ({
      id: d.id,
      name: d.qualificationLevel
    }))
  })
}

// 更正次数
const changeReasonVisible = ref(false)
const changeHistory = ref()
// 查看更正记录
const openChangeHistory = (type) => {
  let version = type == "AMEND" ? form.value.amendVersion : form.value.editVersion
  changeHistory.value.openModal(form.value.id, version, type)
}

const testTime = ref<Dayjs[]>([])
const changeTestTime = (e: Dayjs[]) => {
  if (e) {
    form.value.testTimeBegin = dayjs(e[0]).valueOf()
    form.value.testTimeEnd = dayjs(e[1]).valueOf()
  } else {
    form.value.testTimeBegin = null
    form.value.testTimeEnd = null
  }
}

// 点击上传
const isUploadSave = ref(false)
const clickUpload = () => {
  const fileLen = form.value.attachments ? form.value.attachments.length : 0
  if (fileLen === 0) {
    form.value.attachments = [{ name: "", url: "" }]
  }
  form.value.createVersion = false
  handleOk(fileLen)
    .then((id) => {
      if (!id) return
      isUploadSave.value = true
      form.value.id = id as unknown as string
      form.value.createVersion = true
      form.value.status = "未上传报告"
      ;(document.querySelector("#upload-report input") as any)?.click()
    })
    .catch(() => {
      if (fileLen === 0) {
        form.value.attachments = []
      }
    })
}

// 上传完成
const uploadSuccess = () => {
  formRef.value?.validateFields(["attachments"])
}

// 处理提交参数
const dateKeys = ["consignDate", "auditTime", "signDate"]
const formatParams = () => {
  switch (pageType.value) {
    case "amend":
      form.value.snVersionSuffix = "GZ" + (form.value.amendVersion + 1)
      form.value.sn = form.value.snVersionSuffix
        ? form.value.originalSn + "-" + form.value.snVersionSuffix
        : form.value.originalSn
      break
    case "add":
      form.value.sn = form.value.originalSn
      break
    case "edit":
      form.value.sn = form.value.snVersionSuffix
        ? form.value.originalSn + "-" + form.value.snVersionSuffix
        : form.value.originalSn
      break
  }
  const params = { ...form.value }
  for (let i = 0; i < dateKeys.length; i++) {
    const t = params[dateKeys[i]]
    params[dateKeys[i]] = t ? dayjs(t).valueOf() : null
  }
  if (params.attachments && params.attachments.length > 0) {
    params.attachments = params.attachments.map((d) => ({
      id: d.id || "",
      name: d.name,
      url: d.url
    }))
  }
  params.isQualified = params.isQualified === -1 ? null : params.isQualified === 1
  return params
}

// 取消
const cancelModal = () => {
  visible.value = false
  if (isUploadSave.value && form.value.id) {
    delApi(form.value.id)
  }
}

// 保存
const formRef = ref<FormInstance>()
const saveLoading = ref(false)
const handleOk = async (fileLen: number) => {
  if (disabled.value) {
    visible.value = false
    return
  }
  try {
    await (formRef.value as FormInstance).validateFields()
  } catch (err) {
    message.warning("请完善表单内容！")
    return Promise.reject()
  }
  const params = formatParams()

  if (fileLen === 0) {
    params.attachments = []
    form.value.attachments = []
  }

  try {
    if (params.id) {
      if (pageType.value == "amend") {
        changeReasonVisible.value = true
      } else {
        submitEdit()
      }
    } else {
      // 新增
      delete params.id
      params.sn = params.originalSn
      const res = await addApi(params)
      return Promise.resolve(res)
    }
  } catch (err: any) {
    saveLoading.value = false
    let res = err.response
    if (res.data.type == "EqCheckException") {
      let stArr = res.data?.message.split("<br>").map((it) => {
        return h("p", it || "服务异常，请稍后重试！")
      })
      Modal.warning({
        title: "提示",
        width: 600,
        content: h("div", {}, stArr)
      })
    } else {
      message.error(res.data?.message || "服务异常，请稍后重试！")
    }
  }
}

const changeFormRef = ref()
const changeForm = ref({
  reason: "",
  amendTime: ""
})

//编辑提交
const submitEdit = async (isAdd = false) => {
  try {
    // if (!isAdd) {
    //   await changeFormRef.value.validateFields()
    // }
    const params: any = formatParams()
    saveLoading.value = true
    if (params.createVersion) {
      params.versionInfo = {
        reason: changeForm.value.reason,
        amendTime: dayjs(changeForm.value.amendTime).valueOf()
      }
    }
    if (form.value.status != "未上传报告") {
      //如果当前报告未上传报告，编辑时允许上传
      delete params.attachments
      delete params.status
    }

    if (isForce.value) {
      // 强制编辑
      await forceEditApi(params)
    } else {
      // 编辑
      await editApi(params)
    }
    visible.value = false
    message.success("编辑成功")
    emit("updateList")
  } catch (err: any) {
    saveLoading.value = false
    let res = err.response
    if (res.data.type == "EqCheckException") {
      let stArr = res.data?.message.split("<br>").map((it) => {
        return h("p", it || "服务异常，请稍后重试！")
      })
      Modal.warning({
        title: "提示",
        width: 600,
        content: h("div", {}, stArr)
      })
    } else {
      message.error(res.data?.message || "服务异常，请稍后重试！")
    }
  }
}

//变更提交
const submitAmend = async () => {
  await changeFormRef.value.validateFields()
  try {
    const params = formatParams()
    saveLoading.value = true
    if (params.createVersion) {
      params.versionInfo = {
        reason: changeForm.value.reason,
        amendTime: dayjs(changeForm.value.amendTime).valueOf()
      }
    }
    await amendApi(params)
    visible.value = false
    changeReasonVisible.value = false
    message.success("更正成功")
    emit("updateList")
    saveLoading.value = false
  } catch (err: any) {
    saveLoading.value = false
    let res = err.response
    if (res.data.type == "EqCheckException") {
      let stArr = res.data?.message.split("<br>").map((it) => {
        return h("p", it || "服务异常，请稍后重试！")
      })
      Modal.warning({
        title: "提示",
        width: 600,
        content: h("div", {}, stArr)
      })
    } else {
      message.error(res.data?.message || "服务异常，请稍后重试！")
    }
  }
}
</script>

<style lang="less" scoped>
.edit-count {
  position: absolute;
  right: 100px;
  top: 10px;
  display: flex;
  align-items: center;
  color: @theme_color;
  cursor: pointer;
  z-index: 10;
  transition: 0.1s;
  &:hover {
    opacity: 0.9;
  }
  .title {
    margin-right: 5px;
    line-height: 24px;
    font-size: 14px;
  }
  .count {
    font-size: 22px;
    color: @error_color;
  }
}
.upload-file-list {
  display: flex;
  align-items: baseline;
  width: 50%;
  padding: 8px;
  border: 1px solid @border1_color;
  border-radius: 4px;
  box-sizing: border-box;

  .file-name {
    flex: 1;
    margin: 0 10px;
    width: 0;
  }
}

.no-report {
  padding-left: 12px;
  color: #999;
}

.change-reason-form {
  padding: 0 20px;
  .inline-form {
    display: flex;
    & > div {
      flex: 1;
    }
  }
  :deep(.ant-form-item-label) {
    width: 100px;
  }
}
</style>
