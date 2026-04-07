<template>
  <div>
    <ht-modal
      title="高级查询"
      centered
      :open="visible"
      :mask-closable="false"
      :width="widths || '960px'"
      class="senior-modal"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form :model="formState">
            <a-row>
              <a-col
                v-for="item in dataSource"
                :key="item.field"
                :span="item.col"
              >
                <a-form-item
                  :label="item.title"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <span v-if="item.type == 'input'">
                    <a-input
                      v-model:value="formState[item.field]"
                      :placeholder="`请输入${item.title}`"
                      style="width: 100%"
                      autocomplete="off"
                    />
                  </span>
                  <span v-else-if="item.type == 'select'">
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
                  <span v-else-if="item.type == 'autoComplete'">
                    <a-auto-complete
                      v-model:value="formState[item.field]"
                      :data-source="item.options"
                      style="width: 100%"
                      :placeholder="`请选择${item.title}`"
                    />
                  </span>
                  <span v-else-if="item.type == 'switch'">
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
                  <span v-else-if="item.type == 'radio'">
                    <a-radio-group
                      v-model:value="formState[item.field]"
                      :name="item.field"
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
                  <span v-else-if="item.type == 'datePicker'">
                    <a-date-picker
                      v-model:value="formState[item.field]"
                      value-format="YYYY-MM-DD"
                      :placeholder="`请选择${item.title}`"
                      style="width: 100%"
                      format="YYYY-MM-DD"
                    />
                  </span>
                  <span v-else-if="item.type == 'rangePicker'">
                    <a-range-picker
                      v-model:value="formState[item.field]"
                      style="width: 100%"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                    />
                  </span>
                  <span v-else-if="item.type == 'inputNumber'">
                    <a-input-number
                      v-model:value="formState[item.field]"
                      :placeholder="`请输入${item.title}`"
                      style="width: 100%"
                    />
                  </span>
                  <span v-else-if="item.type == 'inputInit'">
                    <a-input-number
                      v-model:value="formState[item.field]"
                      :placeholder="`请输入${item.title}`"
                      :min="item.expend.min"
                      :parser="(value) => (/^\d+$/.test(value) ? value : 0)"
                      style="width: 100%"
                    />
                  </span>
                  <span v-else-if="item.type == 'treeSelect'">
                    <a-tree-select
                      v-model:value="formState[item.field]"
                      style="width: 100%"
                      :dropdown-style="{ maxHeight: '220px', overflow: 'auto' }"
                      :tree-data="item.options"
                    />
                  </span>
                  <span v-else-if="item.type == 'custom'">
                    <slot :name="item.field" :item="item"></slot>
                  </span>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </a-spin>
      <template #footer>
        <div style="display: inline-block">
          <a-button @click="resetForm">
            <SyncOutlined />重置
          </a-button>
          <a-button type="primary" @click="handleOk">
            <SearchOutlined />确定
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import { SearchOutlined, SyncOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: { SearchOutlined, SyncOutlined },
  props: {
    callback: {
      type: Function,
      default: () => {},
    },
    resetCall: {
      type: Function,
      default: () => {},
    },
    autoClose: {
      type: Boolean,
      default: true,
    },
    widths: {
      type: String,
      default: '960px',
    },
    labelCol: {
      type: Object,
      default: () => ({ span: 5 }),
    },
    wrapperCol: {
      type: Object,
      default: () => ({ span: 18 }),
    },
  },
  data() {
    return {
      spinning: false,
      rootUrl,
      formLayout: 'horizontal',
      dayjs,
      visible: false,
      dataSource: [],
      originData: [],
      params: null,
      formState: {},
    }
  },
  created() {},
  methods: {
    async showModal(dataSource, paramsP) {
      const params = { ...paramsP }
      this.dataSource = JSON.parse(JSON.stringify(dataSource))
      this.originData = JSON.parse(JSON.stringify(dataSource))

      this.dataSource.forEach((i) => {
        this.formState[i.field] = i.default || undefined
      })

      const arr = Object.keys(params)
      if (arr.length > 0) {
        for (const key in params) {
          if (params[key]) {
            this.editType(key, '', params[key])
          }
          else {
            this.editType(key, '', '')
          }
        }
      }

      this.visible = true
    },
    dataRequired() {
      return true
    },
    async handleOk() {
      const params = { ...this.formState }
      if (this.dataRequired()) {
        for (const key in params) {
          if (!params[key]) {
            params[key] = ''
          }
        }
      }
      const showData = await this.showSpanData(params)
      this.callback(params, showData)
      if (this.autoClose !== false) {
        this.handleCancel()
      }
    },
    handleCancel() {
      this.formState = {}
      this.visible = false
    },
    resetForm() {
      this.formState = {}
      for (const key in this.dataSource) {
        this.dataSource[key].default = this.originData[key].default || ''
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

      this.formState[field] = defaults
    },
    // 高级查询 数据显示更改
    showSpanData(params) {
      // let isShow = false;
      const arr = []
      for (const key in params) {
        if (params[key]) {
          const newData = [...this.dataSource].map(item => ({ ...item }))
          const target = newData.filter(item => key === item.field)[0]
          if (target) {
            if (target.options.length > 0) {
              if (target.type === 'treeSelect') {
                const values = params[key]
                const obj = this.getObjInTreeById(target.options, values)
                if (obj) {
                  arr.push({
                    name: target.title,
                    value: obj.title,
                    field: key,
                  })
                }
              }
              else {
                const values = `${params[key]}`
                const optArr = [...target.options]
                const obj = optArr.filter(itemO => values === itemO.id)[0]
                if (obj) {
                  arr.push({ name: target.title, value: obj.name, field: key })
                }
              }
            }
            else {
              if (target.type === 'rangePicker') {
                if (params[key] && params[key].length > 0) {
                  const _value = `${dayjs(params[key][0]).format(
                    'YYYY-MM-DD',
                  )} ~ ${dayjs(params[key][1]).format('YYYY-MM-DD')}`
                  arr.push({ name: target.title, value: _value, field: key })
                }
              }
              else if (target.type !== 'custom') {
                arr.push({
                  name: target.title,
                  value: params[key],
                  field: key,
                })
              }
            }
          }
          // isShow = true;
        }
      }
      // if (isShow) {
      //   this.isShow = true;
      // } else {
      //   this.isShow = false;
      // }
      // this.showData = arr;
      return arr
    },
    getObjInTreeById(data, id) {
      let obj = null
      for (let i = 0; i < data.length; i++) {
        if (data[i].value === id) {
          obj = data[i]
          break
        }
        if (data[i].children && data[i].children.length > 0) {
          const _obj = this.getObjInTreeById(data[i].children, id)
          if (_obj !== null) {
            obj = _obj
            break
          }
        }
      }

      return obj
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.ant-modal-body) {
  height: 400px;
}
</style>
