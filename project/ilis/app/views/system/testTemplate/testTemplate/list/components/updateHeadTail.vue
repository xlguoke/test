<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="修改表头表尾"
      centered
      :force-render="true"
      :mask-closable="false"
      class="components-selectPersonnel"
      width="650px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning" :model="formState">
        <div class="spin-content">
          <a-form ref="formRef">
            <a-form-item
              label="横向模板表头"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-select v-model:value="formState.headHorizontalId" show-search :filter-option="filterOption1">
                <a-select-option value="">
                  全部
                </a-select-option>
                <a-select-option
                  v-for="item in headHorizontalInfo"
                  :key="item.headHorizontalId"
                  :value="item.headHorizontalId"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item
              label="纵向模板表头"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-select v-model:value="formState.headVerticalId" show-search :filter-option="filterOption2">
                <a-select-option value="">
                  全部
                </a-select-option>
                <a-select-option
                  v-for="(item, index) in headVerticalInfo"
                  :key="index"
                  :value="item.headVerticalId"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item
              label="横向模板表尾"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-select v-model:value="formState.tailHorizontalId" show-search :filter-option="filterOption3">
                <a-select-option value="">
                  全部
                </a-select-option>
                <a-select-option
                  v-for="(item, index) in tailHorizontalInfo"
                  :key="index"
                  :value="item.tailHorizontalId"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item
              label="纵向模板表尾"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-select
                v-model:value="formState.tailVerticalId"
                :disabled="templateType === '2' ? true : false"
                show-search
                :filter-option="filterOption4"
              >
                <a-select-option value="">
                  全部
                </a-select-option>
                <a-select-option
                  v-for="(item, index) in tailVerticalInfo"
                  :key="index"
                  :value="item.tailVerticalId"
                >
                  {{ item.name }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
export default {
  props: ['callback'],
  data() {
    return {
      formState: {},
      templateType: '',
      spinning: false,
      visible: false,
      fristLoad: false,
      useUdrIds: '',
      updateAll: false,
      headHorizontalInfo: [], // 表头横向列表
      headVerticalInfo: [], // 表头纵向列表
      tailHorizontalInfo: [], // 表尾横向列表
      tailVerticalInfo: [], // 表尾纵向列表
    }
  },
  computed: {},
  created() {},
  methods: {
    handleSelectChange() {
      // this.qualificationTypeID = value;
      // this.getData()
    },
    getData() {
      window.$oAjax({
        method: 'GET',
        params: {
          templateType: this.templateType,
        },
        url: window.$oApi.testTemplate.headTailInfo,
      }).then((res) => {
        this.spinning = false
        if (res.code === 20000 && res.data) {
          this.headHorizontalInfo = res.data.headHorizontalInfo // 表头横向列表
          // 表头纵向列表
          this.headVerticalInfo = res.data.headVerticalInfo
          // 表头纵向列表
          this.tailHorizontalInfo = res.data.tailHorizontalInfo // 表尾横向列表
          this.tailVerticalInfo = res.data.tailVerticalInfo // 表尾纵向列表
        }
        else {
          this.headHorizontalInfo = [] // 表头横向列表
          this.headVerticalInfo = [] // 表头纵向列表
          this.tailHorizontalInfo = [] // 表尾横向列表
          this.tailVerticalInfo = [] // 表尾纵向列表
        }
      })
    },
    filterOption1(input, option) {
      // 根据数据结构 [{name: string, headHorizontalId: string}]，需要搜索显示名称
      // 但 option 参数只包含 value，需要从数据源中查找对应的 name
      const item = this.headHorizontalInfo.find(d => d.headHorizontalId === option.value)
      return item ? item.name.toLowerCase().includes(input.toLowerCase()) : false
    },
    filterOption2(input, option) {
      const item = this.headVerticalInfo.find(d => d.headVerticalId === option.value)
      return item ? item.name.toLowerCase().includes(input.toLowerCase()) : false
    },
    filterOption3(input, option) {
      const item = this.tailHorizontalInfo.find(d => d.tailHorizontalId === option.value)
      return item ? item.name.toLowerCase().includes(input.toLowerCase()) : false
    },
    filterOption4(input, option) {
      const item = this.tailVerticalInfo.find(d => d.tailVerticalId === option.value)
      return item ? item.name.toLowerCase().includes(input.toLowerCase()) : false
    },
    showModal(ids, templateType, updateAll) {
      this.visible = true
      this.spinning = true
      this.templateType = `${templateType}`
      this.useUdrIds = ids
      this.updateAll = updateAll
      this.getData()
    },
    handleCancel() {
      this.formState = {}
      this.headHorizontalInfo = [] // 表头横向列表
      this.headVerticalInfo = [] // 表头纵向列表
      this.tailHorizontalInfo = [] // 表尾横向列表
      this.tailVerticalInfo = [] // 表尾纵向列表
      this.visible = false
    },
    handleSubmit() {
      const values = { ...this.formState }
      this.spinning = true
      const obj = {
        ...values,
        useUdrIds: this.useUdrIds,
        updateAll: this.updateAll,
        templateType: this.templateType,
        headHorizontalName: values.headHorizontalId
          ? this.headHorizontalInfo.find(
            item => item.headHorizontalId === values.headHorizontalId,
          ).name
          : '',
        headVerticalName: values.headVerticalId
          ? this.headVerticalInfo.find(
            item => item.headVerticalId === values.headVerticalId,
          ).name
          : '',
        tailHorizontalName: values.tailHorizontalId
          ? this.tailHorizontalInfo.find(
            item => item.tailHorizontalId === values.tailHorizontalId,
          ).name
          : '',
        tailVerticalName: values.tailVerticalId
          ? this.tailVerticalInfo.find(
            item => item.tailVerticalId === values.tailVerticalId,
          ).name
          : '',
      }
      window.$oAjax({
        method: 'POST',
        data: JSON.stringify(obj),
        headers: {
          'content-type': 'application/json',
        },
        url: window.$oApi.testTemplate.updateHeadTail,
      }).then((res) => {
        this.spinning = false
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功！')
          this.callback()
          this.handleCancel()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.message || '更新失败'))
        }
      })
    },
  },
}
</script>

<style lang="less">
.searchBox {
  display: flex;
  margin-bottom: 10px;
}
.content-table {
  height: 300px;
  overflow-y: auto;
}
</style>
