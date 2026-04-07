<!-- eslint-disable vue/eqeqeq -->
<template>
  <div class="sampleManageApp-detail">
    <div class="sampleManageApp-detail-header">
      样品信息（SADASD-QWEQW）
      <span class="sampleManageApp-detail-status">待领取</span>
    </div>

    <div class="sampleManageApp-detail-content">
      <div class="sampleManageApp-detail-title">
        样品基本信息
      </div>
      <div class="sampleManageApp-detail-info">
        <div>样品名称：水泥</div>
        <div>样品名称：水泥</div>
        <div>样品名称：水泥</div>
        <div>样品名称：水泥</div>
        <div>样品名称：水泥</div>
        <div>样品名称：水泥</div>
        <div>样品名称：水泥</div>
        <div>样品名称：水泥</div>
        <div>样品名称：水泥</div>
        <div>样品名称：水泥</div>
      </div>
    </div>

    <div class="sampleManageApp-receiveTest">
      <a-form :model="formState">
        <a-form-item
          label="延期人"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input v-model:value="formState.people" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="延期时长"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input v-model:value="formState.time" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="延期原因"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input v-model:value="formState.number" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="审核人员"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <span
            v-for="(item, index) in person"
            :key="item.id"
            :class="`sampleManageApp-detail-person ${
              index == '0' ? 'active' : ''
            }`"
          >
            <span>{{ item.name }}</span>
          </span>
          <a-button
            icon="plus-circle"
            style="margin-bottom: 5px"
            @click="showDrawer"
          >
            添加
          </a-button>
        </a-form-item>
      </a-form>
      <SelectPerson ref="SelectPerson" :callback="getPerson" />
      <a-button
        type="primary"
        class="sampleManageApp-detail-btn"
        @click="submit"
      >
        确定延期
      </a-button>
    </div>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import SelectPerson from './selectPerson.vue'

export default {
  components: {
    SelectPerson,
  },
  data() {
    return {
      person: [],
      formState: {},
    }
  },
  methods: {
    submit() {
      const data = { ...this.formState }
      // eslint-disable-next-line no-console
      console.log(data)

      this.$router.push({ name: 'detail' })
    },
    getPerson(data) {
      if (this.person.find(item => item.id === data.id)) {
        message.warn('审核人员已存在')
        return
      }
      this.person.push(data)
    },
    showDrawer() {
      this.$refs.SelectPerson.showDrawer()
    },
  },
}
</script>

<style lang="less"></style>
