<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="样品"
      width="1000px"
      :loading="spinning || pageLoading"
      @cancel="handleCancel"
    >
      <div class="w-full overflow-x-hidden">
        <a-form
          v-bind="layout"
          ref="Form"
          :model="formData"
          :rules="rules"
          :hide-required-mark="false"
        >
          <a-row :gutter="15">
            <a-col span="12">
              <a-form-item label="取样定位">
                <div>
                  {{ formData.extractSampleLocation || '未知' }}
                  <EnvironmentFilled class="toolBtn-bar" />
                </div>
              </a-form-item>
            </a-col>
          </a-row>
          <BaseTitle>取样信息</BaseTitle>
          <a-row :gutter="15">
            <a-col span="12">
              <a-form-item label="取样地点" name="samplingPlace">
                <a-input
                  v-model:value="formData.samplingPlace"
                  autocomplete="off"
                  placeholder="请输入"
                  :disabled="readOnly"
                />
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item label="取样时间" name="extractedDate">
                <a-date-picker
                  v-model:value="formData.extractedDate"
                  autocomplete="off"
                  style="width: 100%"
                  placeholder="请选择"
                  :disabled="readOnly"
                  @change="extractedDateChange"
                />
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item label="取样单位" name="samplingCompany">
                <a-input
                  v-model:value="formData.samplingCompany"
                  autocomplete="off"
                  placeholder="请输入"
                  :disabled="readOnly"
                />
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item label="取样人" name="samplingPerson">
                <a-input
                  v-model:value="formData.samplingPerson"
                  autocomplete="off"
                  placeholder="请输入"
                  :disabled="readOnly"
                />
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item label="取样人电话" name="samplingPhone">
                <a-input
                  v-model:value="formData.samplingPhone"
                  autocomplete="off"
                  placeholder="请输入"
                  :disabled="readOnly"
                />
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item
                label="取样人证号"
                name="samplingPersonNumber"
              >
                <a-input
                  v-model:value="formData.samplingPersonNumber"
                  autocomplete="off"
                  placeholder="请输入"
                  :disabled="readOnly"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <BaseTitle>样品信息</BaseTitle>
          <a-row :gutter="15">
            <a-col span="12" style="height: auto">
              <a-form-item label="取样标段" name="contractPartId">
                <a-tree-select
                  v-model:value="formData.contractPartId"
                  tree-data-simple-mode
                  style="width: 100%"
                  :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                  :tree-data="samplingProjectList"
                  placeholder="请选择"
                  :disabled="readOnly"
                  @change="onSelectProject"
                />
              </a-form-item>
            </a-col>
            <a-col span="12" style="height: auto">
              <a-form-item label="取样类型" name="categorySampleId">
                <a-tree-select
                  v-model:value="formData.categorySampleId"
                  tree-data-simple-mode
                  style="width: 100%"
                  :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                  :tree-data="samplingCategoryList"
                  placeholder="请选择"
                  :disabled="readOnly"
                  @change="onSelectSample"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row v-show="formData.categorySampleId" :gutter="15">
            <a-col span="12">
              <a-form-item
                label="样品名称"
                name="testSampleDisplayName"
              >
                <a-input
                  v-model:value="formData.testSampleDisplayName"
                  autocomplete="off"
                  placeholder="请输入"
                  :disabled="readOnly"
                />
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item label="规格型号" name="standard">
                <a-input
                  v-model:value="formData.standard"
                  autocomplete="off"
                  placeholder="请输入"
                  :disabled="readOnly"
                />
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item label="样品数量" name="sampleNum">
                <a-form-item-rest>
                  <a-row :gutter="8" type="flex" align="middle">
                    <a-col span="16">
                      <a-input-number
                        v-model:value="formData.sampleNum_num"
                        :min="0"
                        autocomplete="off"
                        placeholder="请输入"
                        style="width: 100%"
                        :disabled="readOnly"
                      />
                    </a-col>
                    <a-col span="8">
                      <a-auto-complete
                        v-model:value="formData.sampleNum_unit"
                        :data-source="numberUnit"
                        placeholder="单位"
                        :disabled="readOnly"
                      />
                    </a-col>
                  </a-row>
                </a-form-item-rest>
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item label="代表数量" name="delegatesNum">
                <a-form-item-rest>
                  <a-row :gutter="8">
                    <a-col span="16">
                      <a-input-number
                        v-model:value="formData.delegatesNum_num"
                        :min="0"
                        autocomplete="off"
                        placeholder="请输入"
                        style="width: 100%"
                        :disabled="readOnly"
                      />
                    </a-col>
                    <a-col span="8">
                      <a-auto-complete
                        v-model:value="formData.delegatesNum_unit"
                        :data-source="numberUnit"
                        placeholder="单位"
                        :disabled="readOnly"
                      />
                    </a-col>
                  </a-row>
                </a-form-item-rest>
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item label="检测部位" name="testPart">
                <a-input
                  v-model:value="formData.testPart"
                  autocomplete="off"
                  placeholder="请输入"
                  :disabled="readOnly"
                  @change="changeTestPart"
                />
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item
                label="工程部位/用途"
                name="projectPartAndUse"
              >
                <a-input
                  v-model:value="formData.projectPartAndUse"
                  autocomplete="off"
                  placeholder="请输入"
                  :disabled="readOnly"
                />
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item
                label="测后处理"
                name="sampleProcessMethodCode"
              >
                <a-form-item-rest>
                  <a-row :gutter="8">
                    <a-col span="16">
                      <a-select
                        v-model:value="formData.sampleProcessMethodCode"
                        placeholder="请选择"
                        :disabled="readOnly"
                      >
                        <a-select-option
                          v-for="(item, index) in sampleProcessMethodList"
                          :key="index"
                          :value="item.typecode"
                        >
                          {{ item.typename }}
                        </a-select-option>
                      </a-select>
                    </a-col>
                    <a-col span="8">
                      <a-input-number
                        v-model:value="formData.retentionHowLong"
                        :min="0"
                        autocomplete="off"
                        placeholder="留样天数"
                        style="width: 100%"
                        :disabled="readOnly"
                      />
                    </a-col>
                  </a-row>
                </a-form-item-rest>
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item label="备注" name="remark">
                <a-input
                  v-model:value="formData.remark"
                  autocomplete="off"
                  placeholder="请输入"
                  :disabled="readOnly"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <hr v-show="formData.categorySampleId" style="margin-top: 0" />

          <a-spin :spinning="otherInfoloading">
            <a-row :gutter="15">
              <a-col
                v-for="(item, index) in otherInfo"
                v-show="!item._hide"
                :key="index"
                span="12"
              >
                <a-form-item :label="item.displayName || item.name">
                  <a-form-item-rest>
                    <a-date-picker
                      v-if="`${item.dataType}` === '2'"
                      v-model:value="item.value"
                      autocomplete="off"
                      style="width: 100%"
                      placeholder="请选择"
                      :disabled="readOnly"
                    />
                    <a-select
                      v-else-if="`${item.dataType}` === '5'"
                      v-model:value="item.value"
                      placeholder="请选择"
                      :disabled="readOnly"
                    >
                      <a-select-option
                        v-for="(item2, index2) in item._listValue"
                        :key="index2"
                        :value="item2"
                      >
                        {{ item2 }}
                      </a-select-option>
                    </a-select>
                    <a-input
                      v-else
                      v-model:value="item.value"
                      autocomplete="off"
                      placeholder="请输入"
                      :disabled="readOnly"
                    />
                  </a-form-item-rest>
                </a-form-item>
              </a-col>
            </a-row>
          </a-spin>

          <BaseTitle class="mt-3">
            智能标签

            <a-space class="text-sm">
              <a-button
                v-if="pageStatus !== 3"
                type="link"
                @click="addSmartLabel"
              >
                添加
              </a-button>
              <a-button
                v-if="pageStatus !== 1"
                type="link"
                @click="checkLabelRecord"
              >
                标签记录
              </a-button>
            </a-space>
          </BaseTitle>
          <SmartLabel
            ref="SmartLabel"
            :view-type="formData.isStandard"
            :page-status="pageStatus"
          />

          <BaseTitle class="mt-3">
            附件
          </BaseTitle>
          <!-- <Accessories ref="Accessories" :read-only="readOnly" /> -->
          <HtUploadFile
            ref="AccessoriesRef"
            :key="id"
            business-type="EXTRACT_SAMPLE"
            force-init
            :business-id="id"
            :is-reandonly="readOnly"
            @get-qr-code-key="EXTRACT_SAMPLE_QR = $event"
          />
          <BaseTitle class="mt-3">
            见证信息
          </BaseTitle>
          <HtUploadFile
            ref="WitnessAccessoriesRef"
            :key="id"
            business-type="EXTRACT_SAMPLE_WITNESS"
            force-init
            :business-id="id"
            :is-reandonly="readOnly"
            @get-qr-code-key="EXTRACT_SAMPLE_WITNESS_QR = $event"
          />
          <table class="samplingManage-sample-witness">
            <thead>
              <tr>
                <th width="10%"></th>
                <th width="22.5%">
                  单位名称
                </th>
                <th width="22.5%">
                  见证人
                </th>
                <th width="22.5%">
                  证件号
                </th>
                <th width="22.5%">
                  手机号
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td align="center">
                  1
                </td>
                <td>
                  <a-input
                    v-model:value="witnessInfo.witnessUnitName"
                    placeholder="请输入"
                    :disabled="readOnly"
                  ></a-input>
                </td>
                <td>
                  <a-input
                    v-model:value="witnessInfo.witness"
                    placeholder="请输入"
                    :disabled="readOnly"
                  ></a-input>
                </td>
                <td>
                  <a-input
                    v-model:value="witnessInfo.witnessLicenseNumber"
                    placeholder="请输入"
                    :disabled="readOnly"
                  ></a-input>
                </td>
                <td>
                  <a-input
                    v-model:value="witnessInfo.witnessPhone"
                    :disabled="readOnly"
                    placeholder="请输入"
                  ></a-input>
                </td>
              </tr>
              <tr>
                <td align="center">
                  2
                </td>
                <td>
                  <a-input
                    v-model:value="witnessInfo.buildUnitName"
                    :disabled="readOnly"
                    placeholder="请输入"
                  ></a-input>
                </td>
                <td>
                  <a-input
                    v-model:value="witnessInfo.buildWitness"
                    :disabled="readOnly"
                    placeholder="请输入"
                  ></a-input>
                </td>
                <td>
                  <a-input
                    v-model:value="witnessInfo.buildWitnessLicenseNumber"
                    :disabled="readOnly"
                    placeholder="请输入"
                  ></a-input>
                </td>
                <td>
                  <a-input
                    v-model:value="witnessInfo.buildWitnessPhone"
                    :disabled="readOnly"
                    placeholder="请输入"
                  ></a-input>
                </td>
              </tr>
            </tbody>
          </table>

          <template v-if="readOnly">
            <BaseTitle class="mt-3">
              其他信息
            </BaseTitle>
            <a-row :gutter="15">
              <a-col span="12" style="height: auto">
                <a-form-item label="样品编号">
                  <a-input
                    disabled
                    :value="sampleOtherInfo.testObjectCode"
                    :title="sampleOtherInfo.testObjectCode"
                  ></a-input>
                </a-form-item>
              </a-col>
              <a-col span="12" style="height: auto">
                <a-form-item label="编号类别">
                  <a-input
                    disabled
                    :value="sampleOtherInfo.snCategory"
                    :title="sampleOtherInfo.snCategory"
                  ></a-input>
                </a-form-item>
              </a-col>
              <a-col
                v-for="(item, index) in sampleOtherInfo.terms || []"
                :key="index"
                span="12"
                style="height: auto"
              >
                <a-form-item :label="item.name">
                  <a-input
                    disabled
                    :value="item.valueShow"
                    :title="item.valueShow"
                  ></a-input>
                </a-form-item>
              </a-col>
            </a-row>
          </template>
        </a-form>
      </div>
      <template #footer>
        <a-button v-if="readOnly" type="primary" @click="handleCancel">
          关闭
        </a-button>
        <a-button v-if="pageStatus !== 3" @click="handleCancel">
          取消
        </a-button>
        <a-button
          v-if="pageStatus !== 3"
          type="primary"
          :loading="spinning"
          @click="validateForm"
        >
          确定
        </a-button>
        <div style="clear: both"></div>
      </template>
    </ht-modal>

    <SmartLabelRecord ref="SmartLabelRecord" :view-type="formData.isStandard" />
  </div>
</template>

<script>
import { EnvironmentFilled } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import qs from 'qs'
import { HtUploadFile } from '~/components/htUploadFile'
import { formatTime } from '~/providers/common/utils'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

import SmartLabel from './smartLabel.vue'
import SmartLabelRecord from './smartLabelRecord.vue'

export default {
  components: {
    SmartLabel,
    SmartLabelRecord,
    EnvironmentFilled,
    HtUploadFile,
  },
  props: ['callback'],
  emits: ['success-ok'],
  data() {
    return {
      // 1 新增 2 编辑 3 查看
      pageStatus: 1,
      visible: false,
      formData: {
        isStandard: '0',
      },
      witnessInfo: {
        buildUnitName: '',
        buildWitness: '',
        buildWitnessLicenseNumber: '',
        buildWitnessPhone: '',
        witness: '',
        witnessLicenseNumber: '',
        witnessPhone: '',
        witnessUnitName: '',
      },
      perjectInfo: {},
      layout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
      },
      rules: {
        categorySampleId: [
          {
            required: true,
            message: '请选择取样类型',
            trigger: 'change',
          },
        ],
        contractPartId: [
          {
            required: true,
            message: '请选择取样标段',
            trigger: 'change',
          },
        ],
      },
      numberUnit: [],
      samplingCategoryList: [],
      samplingProjectList: [],
      sampleProcessMethodList: [],
      otherInfo: [],
      categorySampleInfo: {},
      spinning: false,
      pageLoading: false,
      otherInfoloading: false,
      sampleOtherInfo: {},
      EXTRACT_SAMPLE_QR: '',
      EXTRACT_SAMPLE_WITNESS_QR: '',
      id: undefined, // 编辑、详情的id
    }
  },
  computed: {
    readOnly() {
      return this.pageStatus === 3
    },
  },
  created() {
    this.getSamplingCategoryTree()
    this.getProjectTree()
    this.numberUnitData()
    // 测后样品处理方式
    // eslint-disable-next-line array-callback-return
    ;['sampleProcessMethodList'].map((item) => {
      this.getSelectDataByDictionary(item)
    })
  },
  methods: {
    getData(id) {
      this.pageLoading = true
      window.$oAjax({
        url: `${window.$oApi.samplingManage.sample}/${id}`,
        method: 'get',
      })
        .then((res) => {
          if (res && res.code === 20000) {
            this.getEditData(res.data)
          }
          else {
            this.pageLoading = false
            window.$oAntdModal.warning(
              window.$oMsgTips.info(res.msg || res.message || '数据请求失败'),
            )
          }
        })
        .catch(() => {
          this.pageLoading = false
          window.$oAntdModal.warning(window.$oMsgTips.info('数据请求失败'))
        })
    },
    // 获取其他信息
    async getSampleOtherInfo(id) {
      window.$oAjax({
        url: `/rest/extract/snInfo/${id}`,
        method: 'get',
      })
        .then((res) => {
          if (res && res.code === 20000) {
            this.sampleOtherInfo = res.data
          }
          else {
            window.$oAntdModal.warning(
              window.$oMsgTips.info(res.msg || res.message || '数据请求失败'),
            )
          }
        })
        .catch(() => {
          window.$oAntdModal.warning(window.$oMsgTips.info('数据请求失败'))
        })
    },
    // 获取字典数据
    async getSelectDataByDictionary(field) {
      const obj = {
        sampleProcessMethodList: '999de77c-e05b-11ea-87d0-0242ac13',
      }

      window.$oAjax
        .post(
          window.$oApi.common.getDictionaryData,
          qs.stringify({
            dictGroupId: obj[field],
          }),
        )
        .then((res) => {
          if (res.success) {
            this[field] = res.obj
          }
        })
    },
    // 获取数量单位下拉
    numberUnitData() {
      window.$oAjax
        .post(
          'systemController.do?typeGrid&typegroupid=8a8ab0b246dc81120146dc8181c3006d&field=id,typename,typecode,sourceFrom',
        )
        .then((res) => {
          this.numberUnit = res.rows.map(item => item.typename)
        })
    },
    // 获取取样标段
    async getProjectTree() {
      const res = await window.$oAjax({
        method: 'get',
        url: window.$oApi.samplingManage.projectTree,
        headers: {
          'content-type': 'application/json',
        },
      })
      if (res.code === 20000) {
        this.samplingProjectList = res.data.map(item => ({
          ...item,
          disabled: true,
          key: item.id,
          value: item.id,
          title: item.name,
          children: item.children.map(child => ({
            ...child,
            key: child.id,
            value: child.id,
            title: child.name,
            pId: item.id,
            pName: item.name,
          })),
        }))
      }
    },
    // 选中取样标段
    async onSelectProject(value, _values, _info) {
      // 根据 value 从 tree-data 中查找对应的节点数据
      const findNode = (treeData, nodeValue) => {
        for (const node of treeData) {
          if (node.value === nodeValue) {
            return node
          }
          if (node.children && node.children.length > 0) {
            const found = findNode(node.children, nodeValue)
            if (found) {
              return found
            }
          }
        }
        return null
      }

      const data = findNode(this.samplingProjectList, value)
      if (!data)
        return

      const { id, name, pId, pName } = data

      this.perjectInfo.consignProjectId = id
      this.perjectInfo.consignProjectName = name
      this.perjectInfo.unitProjectType = 2
      this.perjectInfo.unitProjectObjId = pId
      this.perjectInfo.unitProjectName = pName
      delete this.perjectInfo.consignUnit
      delete this.perjectInfo.sampleSender

      const unitRes = await window.$oAjax(
        `${window.$oApi.samplingManage.getConsignUnitByProject}&id=${pId}&showDeleted=0`,
      )
      if (unitRes.rows && unitRes.rows.length > 0) {
        const consignUnit = unitRes.rows[0].consignUnit
        this.perjectInfo.consignUnit = consignUnit

        const senderRes = await window.$oAjax(
          `${window.$oApi.samplingManage.getSenderByUnit}&id=${consignUnit.id}`,
        )

        if (senderRes.rows && senderRes.rows.length > 0) {
          const sender = senderRes.rows[0]
          this.perjectInfo.sampleSender = sender
        }
      }
    },
    // 获取取样分类
    async getSamplingCategoryTree() {
      const res = await window.$oAjax({
        method: 'get',
        url: window.$oApi.samplingManage.getSamplingCategoryTree,
        headers: {
          'content-type': 'application/json',
        },
      })
      if (res.code === 20000) {
        this.samplingCategoryList = res.data.map(item => ({
          ...item,
          disabled: true,
          key: item.id,
          value: item.id,
          title: item.name,
          children: item.children.map(child => ({
            ...child,
            key: child.id,
            value: child.id,
            title: child.sampleDisplayName || child.sampleName,
            pId: item.id,
            pName: item.name,
          })),
        }))
      }
    },
    // 选中样品，构建数据
    onSelectSample(value, _values, _info) {
      // 根据 value 从 tree-data 中查找对应的节点数据
      const findNode = (treeData, nodeValue) => {
        for (const node of treeData) {
          if (node.value === nodeValue) {
            return node
          }
          if (node.children && node.children.length > 0) {
            const found = findNode(node.children, nodeValue)
            if (found) {
              return found
            }
          }
        }
        return null
      }

      const data = findNode(this.samplingCategoryList, value)

      if (!data)
        return

      const { sampleId, sampleName, sampleDisplayName, pId, pName, isStandard }
        = data
      this.categorySampleInfo = { ...data }

      this.formData.sampleId = sampleId
      this.formData.sampleName = sampleName

      this.formData.categoryId = pId
      this.formData.categoryName = pName
      this.formData.isStandard = isStandard

      this.formData.testSampleDisplayName = sampleDisplayName || sampleName

      this.loadOtherInfo(sampleId, data.quoteParams)
    },
    // 获取样品辅助信息
    loadOtherInfo(sampleId, quoteParams) {
      const ids = quoteParams.map(item => item.testItemId)
      const testItemIds = Array.from(new Set(ids))

      this.otherInfoloading = true
      window.$oAjax
        .post(
          window.$oApi.samplingManage.getTestOtherInfo,
          qs.stringify({
            testItemIds: testItemIds.toString(),
            sampleId,
          }),
        )
        .then((res) => {
          this.otherInfoloading = false

          const data = res.sort((a, b) => a.orderNo - b.orderNo)
          const systemFieldName = [
            '型号',
            '规格',
            '等级',
            '标号',
            '代表批量',
            '试样数量',
          ]

          if (this.pageLoading === false) {
            const standard = []
            const model = data.find(i => i.systemFieldName === '型号')
            const specification = data.find(i => i.systemFieldName === '规格')
            const grade = data.find(i => i.systemFieldName === '等级')
            const label = data.find(i => i.systemFieldName === '标号')

            model && model.value && standard.push(model.value)

            specification
            && specification.value
            && standard.push(specification.value)

            grade && grade.value && standard.push(grade.value)

            label && label.value && standard.push(label.value)

            standard.length > 0 && (this.formData.standard = standard.join(' '))
          }

          this.otherInfo = data.map(item => ({
            ...item,
            _listValue:
              `${item.dataType}` === `5` && item.listValue
                ? item.listValue.split(';')
                : [],
            _hide: systemFieldName.includes(item.systemFieldName),
            value: this.getOtherInfoValue(item),
          }))

          this.pageLoading = false
        })
        .catch(() => {
          this.otherInfoloading = false
          this.pageLoading = false
        })
    },
    extractedDateChange(val) {
      this.formData.extractedDate = val
      window.$oForceUpdate()
    },
    showModal(pageStatus, record) {
      this.pageStatus = pageStatus

      if (pageStatus === 2 || pageStatus === 3) {
        this.getData(record.id)
        this.id = record.id
      }
      else {
        this.id = undefined
        this.formData.extractedDate = dayjs(new Date())
      }

      if (pageStatus === 3) {
        this.getSampleOtherInfo(record.id)
      }

      window.$oForceUpdate()
      this.visible = true
    },
    // 构建编辑界面
    async getEditData(data) {
      this.witnessInfo = JSON.parse(data.witnessInfo || '{}')

      const consignMeta = JSON.parse(data.consignMeta || '{}')
      if (consignMeta) {
        this.perjectInfo = {
          ...consignMeta.perjectInfo,
        }
      }

      const periods = JSON.parse(data.periods || '[]')
      await this.$refs.SmartLabel.setComponentData(data.id, periods)

      const otherInfo = JSON.parse(data.otherInfo || '[]')
      this.otherInfo = otherInfo

      const meta = JSON.parse(data.meta)
      meta.id = data.id
      delete meta.proofs
      delete meta.attachments
      delete meta.accessories

      if (meta.extractedDate) {
        meta.extractedDate = dayjs(data.extractedDate)
      }

      this.formData = meta

      const category = this.samplingCategoryList.find(
        item => item.id === data.categoryId,
      )

      if (category && category.children && category.children.length > 0) {
        const categorySample = category.children.find(
          item => item.id === data.categorySampleId,
        )
        this.categorySampleInfo = categorySample
        this.loadOtherInfo(categorySample.sampleId, categorySample.quoteParams)
      }
    },
    getOtherInfoValue(item) {
      if (this.otherInfo.length > 0) {
        const record = this.otherInfo.find(
          info =>
            String(info.id).toLocaleLowerCase()
            === String(item.id).toLocaleLowerCase(),
        )
        if (record) {
          return record.value || ''
        }
      }

      return item.value || ''
    },
    handleCancel() {
      this.visible = false
      window.$oNextTick(() => {
        this.formData = {
          isStandard: '0',
        }
        this.witnessInfo = {
          buildUnitName: '',
          buildWitness: '',
          buildWitnessLicenseNumber: '',
          buildWitnessPhone: '',
          witness: '',
          witnessLicenseNumber: '',
          witnessPhone: '',
          witnessUnitName: '',
        }
        this.perjectInfo = {}
        this.otherInfo = []
        this.otherIncategorySampleInfofos = {}
        this.sampleOtherInfo = {}

        this.$refs.SmartLabel.resetComponentData()
      })
    },
    addSmartLabel() {
      this.$refs.SmartLabel.addLabel()
    },
    checkLabelRecord() {
      this.$refs.SmartLabelRecord.checkLabelRecord(this.formData.id)
    },
    changeTestPart(e) {
      this.formData.projectPartAndUse = e.target.value
    },
    // 处理收样辅助信息
    formatOtherInfo(formData) {
      // "型号", "规格", "等级", "标号", "代表批量", "试样数量",
      const otherInfo = JSON.parse(JSON.stringify(this.otherInfo))
      for (let i = 0; i < otherInfo.length; i++) {
        const item = otherInfo[i]
        if (item.systemFieldName === '代表批量') {
          item.value = formData.delegatesNum
        }
        else if (item.systemFieldName === '试样数量') {
          item.value = formData.sampleNum
        }

        if (`${item.dataType}` === '2' && item.value) {
          item.value = formatTime(new Date(item.value), 'YYYY-MM-DD')
        }
      }

      return otherInfo
    },
    // 数据处理
    formDataFormat(data) {
      const formData = { ...data }

      // 代表数量 拼接
      if (formData.delegatesNum_num || formData.delegatesNum_unit) {
        formData.delegatesNum = `${formData.delegatesNum_num || ''}${
          formData.delegatesNum_unit || ''
        }`
      }
      else {
        formData.delegatesNum = ''
      }

      // 样品数量 拼接
      if (formData.sampleNum_num || formData.sampleNum_unit) {
        formData.sampleNum = `${formData.sampleNum_num || ''}${
          formData.sampleNum_unit || ''
        }`
      }
      else {
        formData.sampleNum = ''
      }

      // 格式化取样时间
      if (formData.extractedDate) {
        formData.extractedDate = formatTime(
          new Date(formData.extractedDate),
          'YYYY-MM-DD',
        )
      }

      // 测后处理
      if (
        this.sampleProcessMethodList.length > 0
        && formData.sampleProcessMethodCode
      ) {
        formData.sampleProcessMethod = this.sampleProcessMethodList.find(
          item => item.typecode === formData.sampleProcessMethodCode,
        ).typename
      }

      return formData
    },
    // 构建委托基本数据
    buildConsignMeta(_formData) {
      const consognMeta = {
        ...this.witnessInfo,
        perjectInfo: {
          ...this.perjectInfo,
        },
        accessories: this.$refs.WitnessAccessoriesRef.fileDatas.map(item => ({
          attachmentId: item.id,
          attachmentName: item.attachmenttitle,
          path: item.realpath,
        })),
      }

      return JSON.stringify(consognMeta)
    },
    // 构建样品元数据
    async buildSampleMeta(formData) {
      const { systemSampleId, sampleId, sampleName, quoteParams, bigCategoryId }
        = this.categorySampleInfo

      const testParams = await this.buildSampleParamsMeta(
        quoteParams || [],
        sampleId,
        bigCategoryId,
      )

      let initalTestObjectPrice = 0
      let testObjectPrice = 0

      // eslint-disable-next-line array-callback-return
      testParams.map((item) => {
        initalTestObjectPrice += item.price || 0
        testObjectPrice += item.price || 0
      })
      const meta = {
        ...formData,
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
        accessories: this.$refs.AccessoriesRef.fileDatas.map(item => ({
          attachmentId: item.id,
          attachmentName: item.attachmenttitle,
          path: item.realpath,
          type: 100,
        })),
        samplingDate: formData.extractedDate,
        testParams,
        mark: this.broofa(),
      }

      return JSON.stringify(meta)
    },
    broofa() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
        /[xy]/g,
        (c) => {
          const r = (Math.random() * 16) | 0
          const v = c === 'x' ? r : (r & 0x3) | 0x8
          return v.toString(16)
        },
      )
    },
    async buildSampleParamsMeta(data, sampleId, bigCategoryId) {
      const params = JSON.parse(JSON.stringify(data))
      if (params.length === 0) {
        return []
      }

      let testParams = await window.$oAjax(window.$oApi.samplingManage.getTestParamByTestSample, {
        params: {
          sampleId,
          bigCategoryId,
        },
      })

      const ids = params.map(item => item.testParamId)
      testParams = testParams.filter(item => ids.includes(item.id))
      testParams = testParams.map((item) => {
        const basis = []
        const basisIds = []
        const standard = []
        const standardIds = []

        for (let j = 0; j < (item.useStandards || []).length; j++) {
          const useStandard = item.useStandards[j]
          const baseStandardUseType = `${useStandard.baseStandardUseType}`
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
        const paramPrice = item.prices && item.prices.filter(d => d.type - 0 === 1)
        const price = paramPrice.length > 0 ? paramPrice[0].price : 0
        const priceType = paramPrice.length > 0 ? paramPrice[0].type : -1
        return {
          basis: basis.toString(),
          basisIds: basisIds.toString(),
          count: 1,
          generateAcceptSampleInfoByCount: item.generateAcceptSampleInfoByCount,
          isBuildSampleCode: item.isBuildSampleCode,
          generateProcessObject: item.generateProcessObject,
          isLocaleItem: item.isLocaleItem,
          price,
          priceType,
          priceId: paramPrice.length > 0 ? paramPrice[0].id : undefined,
          prices: item.prices,
          qualificationType: item.qualificationType,
          remark: item.remark,
          sharePrice: item.sharePrice,
          standard: standard.toString(),
          standardIds: standardIds.toString(),
          testParamId: item.id,
          testParamDisplayName: item.displayName,
          priceStandardId: item.priceStandardId,
        }
      })
      return testParams
    },
    async validateForm() {
      try {
        await this.$refs.Form.validate()
        this.submit()
      }
      catch (err) {
        console.error(err)
        return false
      }
    },
    async submit() {
      try {
        this.spinning = true

        // 制件信息
        const periods = this.$refs.SmartLabel.getPeriods() || []
        // 未通过校验的标签
        const notCheckPeriods = periods.filter(
          item => !item._complete && !item.id,
        )
        if (notCheckPeriods.length > 0) {
          window.$oAntdModal.warning(
            window.$oMsgTips.info(
              '检测到含有未通过校验的电子标签，请确认输入后点击查询关联',
            ),
          )
          this.spinning = false
          return
        }

        let formData = { ...this.formData }
        formData = this.formDataFormat(formData)

        // 辅助收样信息
        formData.otherInfo = this.formatOtherInfo(formData)

        // 制件
        formData.periods = periods

        formData.qrKey = [this.EXTRACT_SAMPLE_QR, this.EXTRACT_SAMPLE_WITNESS_QR]

        // 电子标签
        const rfids = formData.periods.filter(item => item._complete)
        formData.rfids = rfids.map(item => ({
          id: item.storeId,
          barcodeId: item.barcodeId,
          rfid: item.rfid,
        }))

        formData.periods = formData.periods.map((item) => {
          delete item._complete
          delete item._new
          delete item.key
          return item
        })

        // 构建样品数据
        formData.meta = await this.buildSampleMeta(formData)

        // 构建委托数据
        formData.consignMeta = this.buildConsignMeta(formData)

        formData.otherInfo = JSON.stringify(formData.otherInfo)
        formData.proofs = JSON.stringify(formData.proofs)
        formData.attachments = JSON.stringify(formData.attachments)
        formData.periods = JSON.stringify(formData.periods)
        formData.witnessInfo = JSON.stringify(this.witnessInfo)

        if (formData.rfids.length === 0) {
          formData.rfids = null
        }

        window.$oAjax({
          url: window.$oApi.samplingManage.sample,
          method: this.pageStatus === 1 ? 'POST' : 'PUT',
          data: formData,
          headers: {
            'content-type': 'application/json',
          },
        })
          .then((res) => {
            this.spinning = false
            if (res && res.code !== 20010) {
              window.$oAntdMessage.success('操作成功')
              this.handleCancel()
              $emit(this, 'success-ok')
            }
            else {
              window.$oAntdModal.warning(
                window.$oMsgTips.info(res.msg || res.message || '操作失败'),
              )
            }
          })
          .catch(() => {
            this.spinning = false
            window.$oAntdModal.warning(window.$oMsgTips.info('操作失败'))
          })
      }
      catch (err) {
        // eslint-disable-next-line no-console
        console.log(err)
        window.$oAntdModal.warning(window.$oMsgTips.info('数据异常，保存失败'))
        this.spinning = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
.samplingManage-sample {
  :deep(.ant-form-item) {
    font-size: 12px;
  }

  :deep(.ant-form-item-label) {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    word-break: break-all;
  }

  :deep(.ant-col-12) {
    height: 43px;
  }

  :deep(.ant-modal-body) {
    height: 440px;
    overflow-y: auto;
  }

  :deep(.ant-select-auto-complete.ant-select) {
    height: 28px;
    font-size: 12px;
  }

  :deep(.has-error .ant-form-explain),
  :deep(.has-error .ant-form-split) {
    font-size: 12px;
  }

  .anticon-scan {
    cursor: pointer;
    font-size: 28px;

    &:hover {
      color: #1890ff;
    }
  }

  hr {
    border: 0;
    margin: 15px 0;
    border-bottom: solid 1px #e2e2e2;
  }

  .samplingManage-sample-witness {
    width: 100%;
    border-top: solid 1px #e2e2e2;
    border-left: solid 1px #e2e2e2;
    font-size: 12px;

    td,
    th {
      border-right: solid 1px #e2e2e2;
      border-bottom: solid 1px #e2e2e2;
      padding: 8px 5px;
    }

    td div {
      text-align: center;
    }

    th {
      font-weight: bold;
      color: #333;
      text-align: center;
      line-height: 28px;
    }

    thead {
      background: #fafafa;
    }
  }
}
</style>
