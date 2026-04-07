<!-- eslint-disable vue/valid-v-for -->
<template>
  <a-form ref="formRef" :label-col="labelCol" :wrapper-col="wrapperCol" :model="formState">
    <a-form-item label="检查编号">
      <a-input v-model:value="formState.sn" placeholder="请输入检查编号" />
    </a-form-item>
    <a-form-item label="检查对象">
      <a-input v-model:value="formState.testObject" placeholder="请输入检查对象" />
    </a-form-item>
    <a-form-item label="检查日期">
      <a-range-picker
        v-model:value="formState.testDate"
        @change="testDateChange"
      />
    </a-form-item>
    <a-form-item label="检查人">
      <a-input v-model:value="formState.tester" placeholder="请输入检查人" />
    </a-form-item>
    <a-form-item label="检查状态">
      <a-checkbox-group v-model:value="formState.testStatus">
        <a-checkbox v-for="item in testStatusList" :value="item.typename">
          {{
            item.typename
          }}
        </a-checkbox>
      </a-checkbox-group>
    </a-form-item>
    <a-form-item label="整改状态">
      <a-checkbox-group v-model:value="formState.reformStatus">
        <a-checkbox v-for="item in reformStatusList" :value="item.typename">
          {{
            item.typename
          }}
        </a-checkbox>
      </a-checkbox-group>
    </a-form-item>
  </a-form>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import requestApi from '../../request'

export default {
  name: 'AdvancedQuery',
  emits: ['submit'],
  data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      formState: {
        testStatus: [],
        reformStatus: [],
      },
      // 所有检查状态
      testStatusList: [],
      testStatusDefaultSelect: [],
      // 所有整改状态
      reformStatusList: [],
      reformStatusDefaultSelect: [],
    }
  },
  created() {
    this.init()
  },
  methods: {
    /**
     * 初始化器
     */
    init() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      requestApi.advancedQuery.testStatus().then((res) => {
        _this.testStatusList = res.rows
        this.testStatusDefaultSelect = _this.testStatusList.map(
          item => item.typename,
        )
      })
      requestApi.advancedQuery.reformStatus().then((res) => {
        _this.reformStatusList = res.rows
        this.reformStatusDefaultSelect = _this.reformStatusList.map(
          item => item.typename,
        )
      })
    },
    testDateChange() {

    },
    submit() {
      this.$refs.formRef.validateFields().then(() => {
        $emit(this, 'submit', { ...this.formState })
      })
    },
  },
}
</script>

<style scoped></style>
