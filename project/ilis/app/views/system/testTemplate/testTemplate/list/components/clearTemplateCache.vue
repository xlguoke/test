<template>
  <ht-modal
    title="设置"
    :open="value"
    centered
    :mask-closable="false"
    :after-close="handleCancel"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-alert
      message="当时间范围为空时，将清空所选模板类型全部缓存！"
      type="info"
      show-icon
    />
    <a-form
      ref="formRef"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
      class="mt-4"
      :model="formState"
    >
      <a-form-item label="模板类型">
        <a-select
          v-model:value="formState.templateType"
          style="width: 100%"
        >
          <a-select-option
            v-for="item in templateTypeList"
            :key="item.id"
            :value="item.typecode"
          >
            {{ item.typename }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="时间范围">
        <a-range-picker
          v-model:value="formState.time"
          :show-time="{
            hideDisabledOptions: true,
            defaultValue: [
              dayjs('00:00:00', 'HH:mm:ss'),
              dayjs('11:59:59', 'HH:mm:ss'),
            ],
          }"
          format="YYYY-MM-DD HH:mm:ss"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </a-form-item>
    </a-form>
  </ht-modal>
</template>

<script>
import dayjs from 'dayjs'
import { formatTime } from '~/providers/common/utils'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  props: ['value'],
  emits: ['update:value', 'on-submit'],
  data() {
    return {
      confirmLoading: false,
      formState: {
        time: [],
      },
      templateTypeList: [{ id: 1, typecode: '', typename: '全部' }],
    }
  },
  watch: {
    value(val) {
      if (val) {
        this.getTemplateTypeList()
      }
    },
  },
  methods: {
    dayjs,
    async getTemplateTypeList() {
      if (this.templateTypeList.length > 1) {
        return
      }

      const res = await window.$oAjax(
        'rest/dictionaryController/types?code=UDR_TEMPLATE_TYPE',
      )
      this.templateTypeList.push(...res.data)
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(async () => {
        const values = { ...this.formState }
        const formData = {
          templateType: values.templateType || null,
          startTime: null,
          endTime: null,
        }

        if (values.time && values.time.length > 0) {
          formData.startTime = formatTime(
            values.time[0],
            'YYYY-MM-DD HH:mm:ss',
          )
          formData.endTime = formatTime(values.time[1], 'YYYY-MM-DD HH:mm:ss')
        }

        this.confirmLoading = true
        const res = await window.$oAjax({
          method: 'DELETE',
          url: 'rest/udr/template/clear/cache',
          data: JSON.stringify(formData),
          headers: {
            'Content-Type': 'application/json',
          },
        }).finally(() => {
          this.confirmLoading = false
        })

        if (res.code !== 20010) {
          window.$oAntdMessage.success('操作成功！')
          this.handleCancel()
          $emit(this, 'on-submit')
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    handleCancel() {
      $emit(this, 'update:value', false)
      window.$oNextTick(() => {
        this.formState = {
          templateType: '',
          time: [],
        }
      })
    },
  },
}
</script>
