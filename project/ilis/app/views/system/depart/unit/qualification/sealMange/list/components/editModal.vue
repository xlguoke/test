<template>
  <div>
    <ht-modal
      v-model:open="_value"
      :title="modalTitle"
      :mask-closable="false"
      :loading="loading"
      width="640px"
      :centered="true"
      :body-style="{ 'max-height': `${height - 300}px`, 'overflow-y': 'auto' }"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form
            ref="ruleForm"
            :model="dataObj"
            :rules="rules"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-form-item label="印章名称" name="name">
              <a-input
                v-model:value="dataObj.name"
                placeholder="请输入印章名称"
                :max-length="20"
              />
            </a-form-item>
            <a-form-item label="印章类型" name="sealType">
              <a-radio-group
                v-model:value="dataObj.sealType"
                @change="onSealTypeChange"
              >
                <a-radio value="QUALIFY">
                  资质章
                </a-radio>
                <a-radio value="PROJECT">
                  项目章
                </a-radio>
                <a-radio value="OTHER">
                  其他章
                </a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="签章方式" name="signType">
              <a-radio-group
                v-model:value="dataObj.signType"
                @change="onSignTypeChange"
              >
                <a-radio value="notSign">
                  不签章
                </a-radio>
                <a-radio value="picSign">
                  图片签章
                </a-radio>
                <a-radio value="eleSign">
                  电子签章
                </a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item name="autoSign">
              <template #label>
                <span>
                  打印即标记已签章
                  <a-tooltip placement="top">
                    <template #title>
                      <span>开启后，在打印报告时，有该印章的报告，将自动标记为已签章</span>
                    </template>
                    <QuestionCircleOutlined
                      style="color: #1890ff; font-size: 14px"
                    />
                  </a-tooltip>
                </span>
              </template>
              <a-radio-group
                v-model:value="dataObj.autoSign"
                :disabled="dataObj.signType === 'notSign'"
              >
                <a-radio :value="true">
                  是
                </a-radio>
                <a-radio :value="false">
                  否
                </a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item
              v-if="dataObj.sealType === 'QUALIFY'"
              label="印章资质"
              name="qualifications"
            >
              <a-select
                v-model:value="dataObj.qualifications"
                placeholder="请选择印章资质"
              >
                <a-select-option
                  v-for="item in detachedQualificationList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item
              v-if="dataObj.sealType === 'PROJECT'"
              :rules="[{ required: true, message: '请选择关联项目' }]"
              label="关联项目"
              name="projectId"
            >
              <a-select
                v-model:value="dataObj.projectId"
                :options="projectList"
                :virtual="true"
                show-search
                option-filter-prop="label"
                placeholder="请选择关联项目"
              >
              </a-select>
            </a-form-item>
            <a-form-item
              v-if="dataObj.sealType === 'OTHER'"
              label="关联资质"
              name="qualifications"
            >
              <a-select
                v-model:value="dataObj.qualifications"
                mode="multiple"
                placeholder="请选择关联资质"
              >
                <a-select-option
                  v-for="item in qualificationList"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="默认签章页码" name="formatType">
              <a-select
                v-model:value="dataObj.formatType"
                :disabled="dataObj.signType === 'notSign'"
              >
                <a-select-option v-if="dataObj.signType === 'notSign'" value="10">
                  不签章
                </a-select-option>
                <a-select-option value="30">
                  固定页码签章
                </a-select-option>
                <a-select-option value="20">
                  每页均签章
                </a-select-option>
                <a-select-option value="40">
                  除固定页码外均签章
                </a-select-option>
                <a-select-option value="50">
                  除首尾页码外均签章
                </a-select-option>
                <a-select-option value="60">
                  除尾页外均签章
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item
              v-if="['30', '40'].includes(dataObj.formatType)"
              label="页码"
              name="signPage"
            >
              <a-textarea
                v-model:value="dataObj.signPage"
                placeholder="请输入页码"
                :auto-size="{ minRows: 3 }"
              />
              <p style="font-size: 12px; color: #aaa">
                多页码时，使用 |
                隔开，例：1|2|3；连续页码时可用-链接，例：1-5|7-10
              </p>
            </a-form-item>
          </a-form>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { QualificationService } from '~/providers/providers/services/common-body-qualification'
import { SealService } from '~/providers/providers/services/common-body-seal'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const qualificationService = new QualificationService()
const sealService = new SealService()

export default {
  components: { QuestionCircleOutlined },
  props: ['value', 'editId'],
  emits: ['update:value', 'on-save'],
  data() {
    return {
      spinning: false,
      dataObj: {},
      height: document.body.clientHeight,
      detachedQualificationList: [],
      qualificationList: [],
      projectList: [], // 项目检测列表
      loading: false,
    }
  },
  computed: {
    _value() {
      return this.value
    },
    rules() {
      const { dataObj } = this
      const obj = {
        name: [{ required: true, message: '请输入印章名称', trigger: 'blur' }],
        signPage: [{ required: true, message: '请输入页码', trigger: 'blur' }],
      }

      if (dataObj.sealType === 'QUALIFY') {
        obj.qualifications = [{ required: true, message: '请选择印章资质' }]
      }

      return obj
    },
    formItemProp() {
      return {
        'label-col': { span: 4 },
        'wrapper-col': { span: 18 },
      }
    },
    isAddPage() {
      return !this.editId
    },
    modalTitle() {
      return this.isAddPage ? '新增印章' : '编辑印章'
    },
  },
  watch: {
    async value(val) {
      this.loading = true
      try {
        await Promise.all([
          this.getAllQualification(),
          this.getDetachedQualification(),
          this.getSynthesisList(),
        ])
      }
      catch (error) {
        this.loading = false
        console.error(error, '数据初始化失败')
      }
      if (val === true) {
        if (this.editId) {
          this.getDetail()
        }
        else {
          this.dataObj = {
            name: '',
            sealType: 'OTHER',
            signType: 'notSign',
            autoSign: false,
            formatType: '10',
            qualifications: [],
          }
        }
      }
      this.$nextTick(() => {
        this.loading = false
      })
    },
  },
  methods: {
    onSealTypeChange() {
      this.dataObj.qualifications = []
    },
    onSignTypeChange() {
      if (this.dataObj.signType === 'notSign') {
        this.dataObj.formatType = '10'
        this.dataObj.autoSign = false
        return
      }

      if (this.dataObj.formatType === '10') {
        this.dataObj.formatType = '30'
      }
    },
    async getDetail() {
      this.spinning = true
      const res = await sealService.getSeal(this.editId).finally(() => {
        this.spinning = false
      })

      if (res.code !== 20010) {
        const data = res.data
        const qualifications = data.qualifications

        if (data.sealType === 'OTHER') {
          data.qualifications = qualifications.map(i => i.qualificationId)
        }

        if (data.sealType === 'QUALIFY') {
          const qItem = qualifications[0]

          if (qItem) {
            if (
              !this.detachedQualificationList.find(
                j => j.id === qItem.qualificationId,
              )
            ) {
              this.detachedQualificationList.push({
                id: qItem.qualificationId,
                name: qItem.qualificationName,
              })
            }
            data.qualifications = qItem.qualificationId
          }
        }
        if (data.sealType === 'PROJECT') {
          const qItem = qualifications[0]
          if (qItem) {
            if (!this.projectList.find(i => i.value === qItem.qualificationId)) {
              this.projectList.push({
                value: qItem.qualificationId,
                label: qItem.qualificationName,
              })
            }
          }
          data.projectId = qualifications[0].qualificationId // 关联项目回显
        }

        this.dataObj = data
      }
    },
    async getDetachedQualification() {
      const res = await qualificationService.detached()

      if (res.code !== 20010) {
        this.detachedQualificationList = res.data
      }
    },
    async getAllQualification() {
      const res = await qualificationService.list()

      if (res.code !== 20010) {
        this.qualificationList = res.data
      }
    },
    async getSynthesisList() {
      const res = await qualificationService.getAvailableProjects(1, 999)
      if (res.code === 20000) {
        this.projectList = (res.data || []).map(i => ({
          value: i.projectId,
          label: i.projectName,
        }))
      }
    },
    cancelModal() {
      $emit(this, 'update:value', false)
      window.$oNextTick(() => {
        this.dataObj = {}
      })
    },
    handleSubmit() {
      this.$refs.ruleForm.validateFields().then(async () => {
        this.spinning = true

        const formData = { ...this.dataObj }
        const qualifications = formData.qualifications

        if (formData.sealType === 'PROJECT') {
          formData.qualifications = [{
            qualificationId: formData.projectId,
          }]
        }
        else if (Array.isArray(qualifications)) {
          formData.qualifications = formData.qualifications.map(i => ({
            qualificationId: i,
          }))
        }
        else {
          formData.qualifications = [
            { qualificationId: formData.qualifications },
          ]
        }

        const fnName = this.isAddPage ? 'add' : 'update'
        delete formData.projectId

        const res = await sealService[fnName](formData).finally(() => {
          this.spinning = false
        })

        if (res.code !== 20010) {
          this.cancelModal()
          $emit(this, 'on-save')
        }
      })
    },
  },
}
</script>
