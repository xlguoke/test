<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="isAdd ? '新增' : '编辑'"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      width="720px"
      :centered="true"
      :body-style="{ 'max-height': `${height - 300}px`, 'overflow-y': 'auto' }"
      class="biddingPerformance-editModal"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-form ref="formRef" :model="data">
        <a-form-item
          label="业绩名称"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 18 }"
          :rules="[{ required: true, message: '业绩名称为必填项！' }]"
          name="performanceName"
        >
          <a-input
            v-model:value="data.performanceName"
            placeholder="请输入业绩名称"
          />
        </a-form-item>
        <a-form-item
          label="业绩类型"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 18 }"
          :rules="[{ required: true, message: '业绩类型为必选项！' }]"
          name="performanceType"
        >
          <a-select
            v-model:value="data.performanceType"
            placeholder="请选择业绩类型"
          >
            <a-select-option
              v-for="item in performanceTypeData"
              :key="item.id"
              :value="item.typecode"
            >
              {{ item.typename }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="合同金额"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 18 }"
          name="performanceAmount"
        >
          <a-input-number
            v-model:value="data.performanceAmount"
            style="width: 95%"
            placeholder="请输入合同金额"
          />
          <span
            style="vertical-align: middle; font-size: 12px; margin-left: 3px"
          >元</span>
        </a-form-item>
        <a-form-item
          label="等级"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 18 }"
          :rules="[{ required: true, message: '等级为必选项！' }]"
          name="grade"
        >
          <a-select
            v-model:value="data.grade"
            placeholder="请选择等级"
          >
            <a-select-option
              v-for="item in gradeData"
              :key="item.id"
              :value="item.typecode"
            >
              {{ item.typename }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="时间年限"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 18 }"
          name="yearLimit"
        >
          <a-input
            v-model:value="data.yearLimit"
            placeholder="请输入时间年限"
          />
        </a-form-item>
        <a-form-item
          label="地区"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 18 }"
          :rules="[{ required: true, message: '地区为必填项！' }]"
          name="area"
        >
          <a-input
            v-model:value="data.area"
            placeholder="请输入地区"
          />
        </a-form-item>
        <div v-if="customFields.length > 0">
          <a-form-item
            v-for="item in customFields"
            :key="item.id"
            :label="item.columnName"
            :label-col="{ span: 4 }"
            :wrapper-col="{ span: 18 }"
            :name="item.id"
          >
            <span v-if="item.columnType === 'inputNumber'">
              <a-input-number
                v-model:value="data[item.id]"
                style="width: 100%"
                :disabled="item.disabled"
                :placeholder="`请输入${item.columnName}`"
              />
            </span>
            <span v-else-if="item.columnType === 'input'">
              <a-input
                v-model:value="data[item.id]"
                style="width: 100%"
                :disabled="item.disabled"
                :placeholder="`请输入${item.columnName}`"
              />
            </span>
            <span v-else-if="item.columnType === 'radio'">
              <a-radio-group
                v-model:value="data[item.id]"
                :disabled="item.disabled"
                name="radioGroup"
              >
                <a-radio value="是">是</a-radio>
                <a-radio value="否">否</a-radio>
              </a-radio-group>
            </span>
            <span v-else-if="item.columnType === 'select'">
              <a-select
                v-model:value="data[item.id]"
                :disabled="item.disabled"
                :placeholder="`请选择${item.columnName}`"
                style="width: 100%"
              >
                <a-select-option
                  v-for="(v, index) in item.columnValue
                    ? item.columnValue.split(',')
                    : []"
                  :key="index"
                  :value="v"
                >
                  {{ v }}
                </a-select-option>
              </a-select>
            </span>
            <span v-else-if="item.columnType === 'textArea'">
              <a-textarea
                v-model:value="data[item.id]"
                :disabled="item.disabled"
              />
            </span>
            <span v-else-if="item.columnType === 'date'">
              <a-date-picker
                v-model:value="data[item.id]"
                :disabled="item.disabled"
                :placeholder="`请选择${item.columnName}`"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </span>
          </a-form-item>
        </div>
      </a-form>
    </ht-modal>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import qs from 'qs'

export default {
  props: ['callback', 'isAdd'],
  data() {
    return {

      visible: false,
      confirmLoading: false,
      data: {},
      performanceTypeData: [],
      gradeData: [],
      customFields: [],
      height: document.body.clientHeight,
    }
  },
  created() {
    this.getSelectData()
  },
  methods: {
    getCustomFields() {
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: 'performance-property',
          },
        })
        .then((res) => {
          this.customFields = res.data || []
          if (
            this.data.biddingCustomizeValueEntities
            && this.data.biddingCustomizeValueEntities.length > 0
          ) {
            this.customFields = [
              ...this.customFields,
              ...this.data.biddingCustomizeValueEntities
                .filter(c => c.disabled)
                .map((c) => {
                  const copy = { ...c }
                  copy.id = c.columnId
                  return copy
                }),
            ]
          }
        })
    },
    getSelectData() {
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictionaryData,
        data: qs.stringify({ dictGroupId: '4028821e6ea5bc4b016ea643bdb10019' }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          this.gradeData = res.obj
        }
        else {
          message.error(res.msg)
        }
      })

      window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictionaryData,
        data: qs.stringify({ dictGroupId: '4028821e6ea5bc4b016ea642236b000f' }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          this.performanceTypeData = res.obj
        }
        else {
          message.error(res.msg)
        }
      })
    },
    showModal(data) {
      this.data = data || {}
      if (
        this.data.biddingCustomizeValueEntities
        && this.data.biddingCustomizeValueEntities.length > 0
      ) {
        const obj = {}
        // eslint-disable-next-line array-callback-return
        this.data.biddingCustomizeValueEntities.map((item) => {
          obj[item.columnId] = item.columnValue
        })
        this.data = {
          ...this.data,
          ...obj,
        }
      }
      this.getCustomFields()
      this.visible = true
    },
    cancelModal() {
      this.visible = false
      this.data = {}
      this.$nextTick(() => {
        this.$refs.formRef.resetFields()
      })
    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        this.confirmLoading = true

        const data = { ...this.data }

        const biddingCustomizeValueEntities = []
        this.customFields
          .filter(c => !c.disabled)
          // eslint-disable-next-line array-callback-return
          .map((item) => {
            biddingCustomizeValueEntities.push({
              columnId: item.id,
              columnValue: data[item.id],
            })
            delete data[item.id]
          })

        if (!this.isAdd) {
          data.id = this.data.id
        }

        if (biddingCustomizeValueEntities.length > 0) {
          data.biddingCustomizeValueEntities = biddingCustomizeValueEntities
        }

        window.$oRest({
          method: 'POST',
          url: `${window.$oApi.biddingPerformance.operation}`,
          data,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then(
          (res) => {
            if (res && res.success) {
              this.cancelModal()
              message.success(res.message || res.msg)
              this.data = {}
              this.callback()
            }
            else {
              message.error(res.message || res.msg)
            }
            this.confirmLoading = false
          },
          () => {
            this.confirmLoading = false
          },
        )
      })
    },
  },
}
</script>

<style lang="less">
.ant-form-explain {
  font-size: 12px;
}
.biddingPerformance-editModal {
  .ant-form-item-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
