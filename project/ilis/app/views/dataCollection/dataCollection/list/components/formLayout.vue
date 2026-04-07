<!-- eslint-disable vue/valid-v-for -->
<template>
  <div>
    <a-form-item
      v-for="item in dataSource"
      :label="item.name"
      :label-col="{ span: formLayout.labelCol }"
      :wrapper-col="{ span: formLayout.wrapperCol }"
      :rules="item.rules
        ? [{ required: true, message: `${item.name}为必填项!` }]
        : undefined"
      :name="item.field"
    >
      <span v-if="item.type === 'input'">
        <a-input
          v-model:value="formState[item.field]"
          :disabled="item.disabled"
          :placeholder="`请输入${item.name}`"
          style="width: 100%"
        />
      </span>
      <span v-else-if="item.type === 'radio'">
        <a-radio-group
          v-model:value="formState[item.field]"
          :disabled="item.disabled"
          :name="item.field"
        >
          <a-radio
            v-for="(comItem, index) in item.data"
            :key="index"
            :value="comItem[item.dataField.value]"
          >
            {{ comItem[item.dataField.name] }}
          </a-radio>
        </a-radio-group>
      </span>
      <span v-else-if="item.type === 'inputNumber'">
        <a-input-number
          v-model:value="formState[item.field]"
          :disabled="item.disabled"
          :placeholder="`请输入${item.name}`"
          style="width: 100%"
        />
      </span>
      <span v-if="item.type === 'date'">
        <a-date-picker
          v-model:value="formState[item.field]"
          :disabled="item.disabled"
          :placeholder="`请选择${item.name}`"
          style="width: 100%"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </span>
      <span v-if="item.type === 'textArea'">
        <a-textarea
          v-model:value="formState[item.field]"
          :disabled="item.disabled"
        />
      </span>
      <span v-else-if="item.type === 'select'">
        <a-select
          v-model:value="formState[item.field]"
          :disabled="item.disabled"
          :placeholder="`请选择${item.name}`"
          style="width: 100%"
        >
          <a-select-option
            v-for="(comItem, index) in item.data"
            :key="index"
            :value="comItem[item.dataField.value]"
          >
            {{ comItem[item.dataField.name] }}
          </a-select-option>
        </a-select>
      </span>
    </a-form-item>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  props: ['dataSource', 'formLayout', 'data'],
  data() {
    return {
      dayjs,
    }
  },
  computed: {
    formState() {
      return this.data
    },
  },
  methods: {
    checkYearOfWork(rule, value, callback) {
      const reg = /^\d{4}$/
      if (
        reg.test(value) === true
        && Number.parseInt(value) <= new Date().getFullYear()
      ) {
        callback()
      }
      else {
        callback(new Error('请输入正确格式的工作年份!'))
      }
    },
  },
}
</script>
