<template>
  <a-form
    :disabled="disabled"
    :label-col="{ span: 5 }"
    :wrapper-col="{ span: 17 }"
    label-wrap
    style="width: 100%"
  >
    <a-form-item
      v-for="(item, i) in customProperties"
      :key="item.id"
      :label="item.columnName"
    >
      <a-input-number
        v-if="item.columnType === FORM_TYPE.INPUT_NUMBER"
        v-model:value="customProperties[i].columnValue"
        allow-clear
        style="width: 100%"
        :placeholder="`请输入${item.columnName}`"
      />
      <a-radio-group
        v-else-if="item.columnType === FORM_TYPE.RADIO"
        v-model:value="customProperties[i].columnValue"
        name="radioGroup"
      >
        <a-radio
          v-for="(v, index) in item.options ? item.options.split(',') : []"
          :key="index"
          :value="v"
        >
          {{ v }}
        </a-radio>
      </a-radio-group>
      <a-select
        v-else-if="item.columnType === FORM_TYPE.SELECT"
        v-model:value="customProperties[i].columnValue"
        allow-clear
        :placeholder="`请选择${item.columnName}`"
      >
        <a-select-option
          v-for="(v, index) in item.options ? item.options.split(',') : []"
          :key="index"
          allow-clear
          :value="v"
        >
          {{ v }}
        </a-select-option>
      </a-select>
      <a-auto-complete
        v-else-if="item.columnType === FORM_TYPE.SELECT_INPUT"
        v-model:value="customProperties[i].columnValue"
        allow-clear
        :data-source="initialOptions(item.options)"
        :placeholder="`请选择${item.columnName}`"
      />
      <a-textarea
        v-else-if="item.columnType === FORM_TYPE.TEXT_AREA"
        :ref="item.id"
        v-model:value="customProperties[i].columnValue"
        allow-clear
        :ref-val="item.id"
      />
      <a-date-picker
        v-else-if="item.columnType === FORM_TYPE.DATE"
        v-model:value="customProperties[i].columnValue"
        :placeholder="`请选择${item.columnName}`"
        allow-clear
        style="width: 100%"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
      />
      <a-input
        v-else
        :ref="item.id"
        v-model:value="customProperties[i].columnValue"
        allow-clear
        :ref-val="item.id"
        :placeholder="`请输入${item.columnName}`"
      />
    </a-form-item>
  </a-form>
</template>

<script>
const FORM_TYPE = {
  SELECT: 'select',
  INPUT: 'input',
  TEXT_AREA: 'textarea',
  DATE: 'date',
  RADIO: 'radio',
  SELECT_INPUT: 'selectInput',
}

export default {
  props: {
    customizeType: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
    },
  },
  data() {
    return {
      FORM_TYPE,
      customProperties: [],

    }
  },
  created() {
    this.getCustomPropertieList()
  },
  methods: {
    async getCustomPropertieList() {
      const res = await window.$oAjax.get(window.$oApi.common.customProperties, {
        params: {
          customizeType: this.customizeType,
        },
      })
      if (res.code !== 20000)
        return
      const data = res.data || []
      this.customProperties = data.map((item) => {
        // 设置option
        if (
          item.columnType === FORM_TYPE.SELECT
          || item.columnType === FORM_TYPE.RADIO
          || item.columnType === FORM_TYPE.SELECT_INPUT
        ) {
          item.options = item.columnValue
          item.columnValue = undefined
        }
        item.columnValue = item.defaultValue
        // 设置默认值
        return item
      })
    },
    initialOptions(options) {
      if (!options)
        return []
      return options.split(',').map((item) => {
        return item
      })
    },
    getFormData() {
      return this.customProperties.map((item) => {
        return {
          columnId: item.id,
          columnValue: item.columnValue,
          columnName: item.columnName,
        }
      })
    },
  },
}
</script>
