<template>
  <div class="pb8">
    <a-tag
      v-for="item in tagList"
      :key="item.name"
      class="mt-2"
      closable
      @close="removeTag(item)"
    >
      {{ item.label }}：{{ item.value }}
    </a-tag>

    <ht-modal
      width="460px"
      :open="value"
      title="高级查询"
      :closable="false"
      :mask-closable="false"
    >
      <a-form ref="formRef" :label-col="labelCol" :wrapper-col="wrapperCol" :model="formState">
        <a-form-item
          v-for="item in configs"
          :key="item.key"
          :label="item.label"
        >
          <a-range-picker
            v-if="item.type == 'range-picker'"
            v-model:value="formState[item.name]"
            style="width: 100%"
            :ranges="{
              今天: [dayjs(), dayjs()],
              本周: [dayjs().startOf('week'), dayjs().endOf('week')],
              本月: [dayjs().startOf('month'), dayjs().endOf('month')],
              本年: [dayjs().startOf('year'), dayjs().endOf('year')],
            }"
            value-format="YYYY-MM-DD"
          />
          <a-select
            v-else-if="item.type == 'select'"
            v-model:value="formState[item.name]"
            placeholder="请选择"
          >
            <a-select-option
              v-for="item2 in item.options"
              :key="item2.id"
              :value="item2.id"
            >
              {{ item2.name }}
            </a-select-option>
          </a-select>
          <a-input v-else v-model:value="formState[item.name]" placeholder="请输入" />
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="cancel">
          取消
        </a-button>
        <a-button type="primary" @click="submit">
          确定
        </a-button>
        <a-button @click="reset">
          重置
        </a-button>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { QualificationService } from '~/providers/providers/services/common-body-qualification'
import { SealService } from '~/providers/providers/services/common-body-seal'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const qualificationService = new QualificationService()
const sealService = new SealService()

export default {
  props: ['value'],
  emits: ['submit', 'update:value', 'reset'],
  data() {
    return {
      dayjs,
      configs: [
        { label: '委托单位', name: 'consignUnitName' },
        { label: '工程项目', name: 'projectName' },
        { label: '委托编号', name: 'consignCode' },
        { label: '样品编号', name: 'objectCode' },
        { label: '样品名称', name: 'objectName' },
        { label: '报告签发日期', name: 'signDate', type: 'range-picker' },
        { label: '规格型号', name: 'standard' },
        { label: '工程部位/用途', name: 'projectPartAndUse' },
        { label: '检测参数', name: 'paramName' },
        { label: '签章人员', name: 'signUserName' },
        {
          label: '资质类型',
          name: 'reportQualification',
          type: 'select',
          options: [],
        },
        { label: '报告印章', name: 'reportSeal', type: 'select', options: [] },
      ],
      labelCol: { span: 6 },
      wrapperCol: { span: 18 },
      formState: {},
      queryFormData: {},
    }
  },
  computed: {
    tagList() {
      const queryFormData = this.queryFormData
      const configs = this.configs
      const list = []

      // eslint-disable-next-line array-callback-return
      configs.map((i) => {
        if (queryFormData[i.name]) {
          list.push({
            ...i,
            value: this.getTagValue(i),
          })
        }
      })

      return list
    },
  },
  watch: {
    value(val) {
      if (val) {
        this.getReportQualificationOptions()
        this.getReportSealOptions()
      }
    },
  },
  methods: {
    getTagValue(item) {
      const { queryFormData } = this
      const val = queryFormData[item.name]

      if (!val) {
        return ''
      }

      if (item.type == 'select') {
        return item.options.find(i => i.id == val).name
      }

      return val
    },
    async getReportQualificationOptions() {
      if (this.configs[10].options.length) {
        return
      }

      const res = await qualificationService.list()
      this.configs[10].options = res.data
    },
    async getReportSealOptions() {
      if (this.configs[11].options.length) {
        return
      }

      const res = await sealService.list()
      this.configs[11].options = res.data.map(i => ({
        ...i,
        id: i.sealId,
        name: i.sealName,
      }))
    },
    submit() {
      this.$refs.formRef.validateFields().then(() => {
        const query = { ...this.formState }
        if (query.signDate && query.signDate.length > 0) {
          query.signDate = query.signDate
            .map(i => dayjs(i).format('YYYY-MM-DD'))
            .join(' ~ ')
        }

        for (const key in query) {
          if (typeof query[key] == 'string') {
            query[key] = query[key].trim()
          }
        }

        this.queryFormData = { ...query }
        $emit(this, 'submit', query)
        this.cancel()
      })
    },
    reset() {
      this.clearValue()
      $emit(this, 'reset')
    },
    clearValue() {
      this.formState = {}
      this.queryFormData = {}
    },
    cancel() {
      $emit(this, 'update:value', false)
    },
    removeTag(item) {
      event.preventDefault()

      this.formState[item.name] = ''
      this.queryFormData[item.name] = null
      $emit(this, 'submit', this.queryFormData)
    },
  },
}
</script>
