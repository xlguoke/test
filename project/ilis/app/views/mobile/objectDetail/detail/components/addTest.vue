<template>
  <div class="sampleManageApp-detail">
    <div class="sampleManageApp-detail-header">
      样品信息（SADASD-QWEQW）
      <span class="sampleManageApp-detail-status">待领取</span>
    </div>

    <div class="sampleManageApp-receiveTest">
      <a-form :model="formState">
        <a-form-item
          label="制件编号"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input v-model:value="formState.code" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="检测参数"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input v-model:value="formState.params" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="试验龄期"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input v-model:value="formState.days" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="制件时间"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input
            v-model:value="formState.time1"
            placeholder="请选择制件时间"
            readonly
            @click="time1Open = true"
          />
        </a-form-item>
        <a-form-item
          label="龄期到期"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input
            v-model:value="formState.time2"
            placeholder="请选择龄期到期时间"
            readonly
            @click="time2Open = true"
          />
        </a-form-item>
        <a-form-item
          label="制件人"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input v-model:value="formState.people" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="制样情况"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input v-model:value="formState.status" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="样品照片"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-button icon="add"></a-button>
        </a-form-item>
      </a-form>
      <a-button
        type="primary"
        class="sampleManageApp-detail-btn"
        @click="submit"
      >
        处理
      </a-button>
    </div>

    <DateSelector v-model:open="time1Open" enable-time @select="(val) => { formState.time1 = val }" />

    <DateSelector v-model:open="time2Open" enable-time @select="(val) => { formState.time2 = val }" />
  </div>
</template>

<script>
import DateSelector from '~/providers-moblie/components/DateSelector.vue'

export default {
  components: {
    DateSelector,
  },
  data() {
    return {
      time1Open: false,
      time2Open: false,
      formState: {},
    }
  },
  methods: {
    submit() {
      const data = { ...this.formState }
      // eslint-disable-next-line no-console
      console.log(data)

      // this.$router.push({ name: "detail" })
    },
  },
}
</script>

<style lang="less"></style>
