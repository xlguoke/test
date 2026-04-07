<!-- eslint-disable vue/valid-v-for -->
<template>
  <span>
    <a-form-item :label="column.columnName">
      <a-input
        v-if="column.columnType === 'input'"
        v-model:value="_column.columnValue"
        :disabled="disabled"
        :placeholder="showPlaceholder ? '请输入'.concat(column.columnName) : ''"
      />
      <a-select
        v-else-if="column.columnType === 'select'"
        v-model:value="_column.columnValue"
        :disabled="disabled"
        :placeholder="showPlaceholder ? '请选择'.concat(column.columnName) : ''"
      >
        <a-select-option
          v-for="item in column.columnValue.split(',')"
          :value="item"
        >{{ item }}</a-select-option>
      </a-select>
      <a-date-picker
        v-else-if="column.columnType === 'date'"
        v-model:value="_column.columnValue"
        :disabled="disabled"
        :placeholder="showPlaceholder ? '请选择'.concat(column.columnName) : ''"
      />
      <a-textarea
        v-else-if="column.columnType === 'textArea'"
        v-model:value="_column.columnValue"
        :disabled="disabled"
        :placeholder="showPlaceholder ? '请输入'.concat(column.columnName) : ''"
      />
      <a-input-number
        v-else-if="column.columnType === 'inputNumber'"
        v-model:value="_column.columnValue"
        :disabled="disabled"
        :placeholder="showPlaceholder ? '请输入'.concat(column.columnName) : ''"
      />
      <a-radio-group
        v-else-if="column.columnType === 'radio'"
        v-model:value="_column.columnValue"
        :disabled="disabled"
      >
        <a-radio value="是"> 是 </a-radio>
        <a-radio value="否"> 否 </a-radio>
      </a-radio-group>
    </a-form-item>
  </span>
</template>

<script>
import dayjs from 'dayjs'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  name: 'CustomProperties',
  props: {
    column: {
      required: true,
    },
    objectId: {
      type: String,
    },
    label: {
      type: String,
      required: true,
    },
    columnValues: {},
    formState: {},
    disabled: {
      type: Boolean,
    },
    showPlaceholder: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      defaultData: {},
    }
  },
  computed: {
    _column: {
      get() {
        return this.column
      },
      set(newValue) {
        $emit(this, 'update:column', newValue)
      },
    },
  },
  watch: {
    columnValues() {
      this.setDefaultValue()
    },
  },
  created() {
    this.setDefaultValue()
  },
  methods: {
    setDefaultValue() {
      if (this.columnValues) {
        const d = this.columnValues.find(item => item.columnId === this.column.id)
        if (d) {
          // fix: 转化日期格式，解决日期组件报错问题
          let value = d.columnValue
          if (this.column.columnType === 'date') {
            value = value ? dayjs(value) : ''
          }
          this._column.columnValue = value
        }
      }
    },
  },
}
</script>

<style scoped>
.ant-input-number {
  width: 100% !important;
}
</style>
