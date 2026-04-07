<template>
  <a-form ref="formRef" layout="inline" :model="formState">
    <a-form-item
      v-for="item in dataSource" :key="item.field"
      :label="item.title"
      :rules="item.rules
        ? [
          {
            required: true,
            message: `${item.title}为必填项!`,
          },
        ]
        : undefined"
      :name="item.field"
    >
      <span v-if="item.type === 'input'">
        <a-input
          v-model:value="formState[item.field]"
          :placeholder="`请输入${item.title}`"
          style="width: 100%"
          autocomplete="off"
        />
      </span>
      <span v-else-if="item.type === 'select'">
        <a-select
          v-model:value="formState[item.field]"
          :placeholder="`请选择${item.title}`"
          style="width: 100%"
        >
          <a-select-option :value="undefined">全部</a-select-option>
          <a-select-option
            v-for="(comItem, index) in item.options"
            :key="index"
            :value="comItem.id"
          >
            {{ comItem.name }}
          </a-select-option>
        </a-select>
      </span>
      <span v-else-if="item.type === 'switch'">
        <a-switch
          v-if="item.default"
          v-model:checked="formState[item.field]"
          default-checked
        />
        <a-switch
          v-else
          v-model:checked="formState[item.field]"
        />
      </span>
      <span v-else-if="item.type === 'radio'">
        <a-radio-group
          v-model:value="formState[item.field]"
          :name="item.field"
          style="width: 100%"
        >
          <a-radio
            v-for="(comItem, index) in item.options"
            :key="index"
            :value="comItem.id"
          >
            {{ comItem.name }}
          </a-radio>
        </a-radio-group>
      </span>
      <span v-else-if="item.type === 'datePicker'">
        <a-date-picker
          v-model:value="formState[item.field]"
          :placeholder="`请选择${item.title}`"
          style="width: 100%"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </span>
      <span v-else-if="item.type === 'rangePicker'">
        <a-range-picker
          v-model:value="formState[item.field]"
          style="width: 100%"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
        />
      </span>
      <span v-else-if="item.type === 'inputNumber'">
        <a-input-number
          v-model:value="formState[item.field]"
          :placeholder="`请输入${item.title}`"
          style="width: 100%"
        />
      </span>
      <span v-else-if="item.type === 'custom'">
        <slot :name="item.field"></slot>
      </span>
    </a-form-item>
  </a-form>
</template>

<script>
import dayjs from 'dayjs'

export default {
  components: {},
  props: ['callback', 'resetCall'],
  data() {
    return {
      dayjs,
      dataSource: [],
      params: null,
      formState: {},
    }
  },
  created() {},
  methods: {
    async showModal(dataSource, paramsP) {
      const params = { ...paramsP }
      this.dataSource = JSON.parse(JSON.stringify(dataSource))
      const arr = Object.keys(params)
      if (arr.length === 0) { /* empty */ }
      else {
        for (const key in params) {
          if (params[key]) {
            this.editType(key, '', params[key])
          }
          else {
            this.editType(key, '', '')
          }
        }
      }
    },
    async dataRequired() {
      try {
        await this.$refs.formRef.validateFields()
        return true
      }
      catch (e) {
        console.error(e)
        return false
      }
    },
    async handleOk() {
      const params = { ...this.formState }
      if (await this.dataRequired()) {
        for (const key in params) {
          if (!params[key]) {
            params[key] = ''
          }
        }
        const showData = await this.showSpanData(params)
        return { params, showData }
      }
      return false
    },
    handleCancel() {
      this.formState = {}
    },
    resetForm() {
      this.formState = {}
      for (const key in this.dataSource) {
        this.dataSource[key].default = ''
      }
      this.resetCall()
    },
    // 高级查询 inputArr的默认值更改
    editType(field, arrOpt, defaults) {
      const newData = [...this.dataSource]
      const target = newData.filter(item => field === item.field)[0]
      if (target) {
        if (arrOpt && arrOpt.length > 0) {
          target.options = [...target.options, ...arrOpt]
        }
        target.default = defaults
        this.dataSource = newData
      }
    },
    // 高级查询 数据显示更改
    showSpanData(params) {
      const arr = []
      for (const key in params) {
        if (params[key]) {
          const newData = [...this.dataSource].map(item => ({ ...item }))
          const target = newData.filter(item => key === item.field)[0]
          if (target) {
            if (target.options.length > 0) {
              const values = `${params[key]}`
              const optArr = [...target.options]
              const obj = optArr.filter(itemO => values === itemO.id)[0]
              if (obj) {
                arr.push({ name: target.title, value: obj.name, field: key })
              }
            }
            else {
              if (target.type === 'rangePicker') {
                if (params[key] && params[key].length > 0) {
                  const _value = `${dayjs(params[key][0]).format(
                    'YYYY-MM-DD',
                  )} ~ ${dayjs(params[key][1]).format('YYYY-MM-DD')}`
                  arr.push({
                    name: target.title,
                    value: _value,
                    field: key,
                    sortNum: target.sortNum,
                  })
                }
              }
              else if (target.type === 'datePicker') {
                if (params[key]) {
                  const _value = dayjs(params[key]).format('YYYY-MM-DD')
                  arr.push({
                    name: target.title,
                    value: _value,
                    field: key,
                    sortNum: target.sortNum,
                  })
                }
              }
              else if (target.type !== 'custom') {
                arr.push({
                  name: target.title,
                  value: params[key],
                  field: key,
                  sortNum: target.sortNum,
                })
              }
            }
          }
        }
      }
      return arr
    },
  },
}
</script>
