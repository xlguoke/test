<template>
  <div>
    <ht-modal
      v-model:open="uploadVisible"
      title="新增"
      centered
      :confirm-loading="confirmLoading"
      class="otherAchievement-uploadModal"
      :mask-closable="false"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-form ref="formRef" :model="formState">
        <a-form-item
          label="序号"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          :rules="[{ required: true, message: '请输入序号' }]"
          name="quoteIndex"
        >
          <a-inputNumber
            v-model:value="formState.quoteIndex"
            style="width: 100%"
            placeholder="请输入序号"
          />
        </a-form-item>
        <a-form-item
          label="人员"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-button
            style="float: right"
            @click="
              () => {
                $refs.SelectPerson.showModal()
              }
            "
          >
            选择
          </a-button>
          <div style="font-size: 12px">
            {{ personData.name }}
          </div>
        </a-form-item>
        <a-form-item
          label="本次投标角色"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-input
            v-model:value="formState.referenceRole"
            placeholder="请输入本次投标角色"
          />
        </a-form-item>
      </a-form>
    </ht-modal>
    <SelectPerson ref="SelectPerson" :callback="getPerson" />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import SelectPerson from './selectPerson'

export default {
  components: {
    SelectPerson,
  },
  props: ['callback', 'recordId', 'unitId'],
  data() {
    return {
      uploadVisible: false,
      confirmLoading: false,
      formState: {},
      dayjs,
      personData: {},
    }
  },
  methods: {
    showModal() {
      this.uploadVisible = true
    },
    cancelModal() {
      this.formState = {}
      this.personData = {}
      this.uploadVisible = false
    },
    handleSubmit() {
      if (!this.personData.name && !this.personData.id) {
        message.warn('请选择人员')
        return
      }

      this.$refs.formRef.validateFields().then(() => {
        const values = { ...this.formState }
        this.confirmLoading = true
        const data = {
          ...values,
          recordId: this.recordId,
          unitId: this.unitId,
          biddingPersonId: this.personData.id,
          biddingPersonName: this.personData.name,
        }

        window.$oAjax({
          method: 'POST',
          url: `${window.$oApi.biddingRecord.personOperation}`,
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
              this.callback()
            }
            else {
              message.error(res.message || res.msg)
            }
            this.confirmLoading = false
          },
        ).catch(() => {
          this.confirmLoading = false
        })
      })
    },
    getPerson(data) {
      if (data && data.length > 0) {
        this.personData = {
          id: data[0].id,
          name: data[0].personName,
        }
      }
    },
  },
}
</script>

<style></style>
