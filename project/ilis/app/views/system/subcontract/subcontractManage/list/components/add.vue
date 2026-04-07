<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="新增"
      :mask-closable="false"
      :centered="true"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-form ref="formRef" layout="horizontal" :model="dataObj">
        <a-form-item
          :label="term('样品名称')"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :rules="[{ required: true, message: `请输入${term('样品名称')}！` }]"
          name="sampleName"
        >
          <a-input
            v-model:value="dataObj.sampleName"
            :disabled="isDetail"
            placeholder="请输入"
          />
        </a-form-item>
        <a-form-item
          :label="term('样品编号')"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-input
            v-model:value="dataObj.sampleSn"
            :disabled="isDetail"
            placeholder="请输入"
          />
        </a-form-item>
        <a-form-item
          label="委托单位"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <div style="display: flex">
            <a-input
              v-model:value="dataObj.consignUnitName"
              style="flex: 1"
              :disabled="true"
              :class="{ readonlyCls: !isDetail }"
              placeholder="请选择"
            />
            <a-button
              :disabled="isDetail"
              style="margin-left: 15px"
              @click="setConsignUnit"
            >
              选择
            </a-button>
          </div>
        </a-form-item>
        <a-form-item
          v-if="getField('project')?.selected"
          label="工程项目"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <div style="display: flex">
            <a-input
              v-model:value="dataObj.projectName"
              style="flex: 1"
              :disabled="true"
              :class="{ readonlyCls: !isDetail }"
            />
            <a-button
              :disabled="isDetail"
              style="margin-left: 15px"
              @click="setConsignProject"
            >
              选择
            </a-button>
          </div>
        </a-form-item>
        <a-form-item
          label="委托编号"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-input
            v-model:value="dataObj.consignSn"
            :disabled="isDetail"
            placeholder="请输入"
          />
        </a-form-item>
        <a-form-item
          label="规格型号"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-input
            v-model:value="dataObj.standard"
            :disabled="isDetail"
            placeholder="请输入"
          />
        </a-form-item>
      </a-form>
    </ht-modal>
    <SelProjcet ref="SelProjcet" :callback="getConsignProject" />
    <SelConsignUnit ref="SelConsignUnit" :callback="getConsignUnit" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import SelConsignUnit from '~/providers/components/selConsignUnit.vue'
import SelProjcet from '~/providers/components/selProjcet.vue'
import { useIndustryStore } from '~/store/industryStore'

export default {
  components: {
    SelProjcet,
    SelConsignUnit,
  },
  props: ['callback'],
  setup() {
    const { term, getField } = useIndustryStore()

    return { term, getField }
  },
  data() {
    return {
      visible: false,
      isDetail: false,
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      dayjs,
      dataObj: {},
      projcetData: [],
      consignUnitData: [],
    }
  },
  methods: {
    showModal(dataObj) {
      this.dataObj = dataObj || {}
      this.visible = true
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = { ...this.dataObj }
        const data = {
          ...fieldsValue,
          sourceType: '2',
          id: new Date().getTime(),
        }
        if (this.consignUnitData.length > 0) {
          data.consignUnit = this.consignUnitData[0].name
          data.consignUnitId = this.consignUnitData[0].id
        }
        if (this.projcetData.length > 0) {
          data.consignProject = this.projcetData[0].name
          data.consignProjectId = this.projcetData[0].id
        }
        this.callback(data)
        this.handleCancel()
      })
    },
    handleCancel() {
      this.visible = false
      this.dataObj = {}
      this.projcetData = []
      this.consignUnitData = []
    },
    setConsignUnit() {
      this.$refs.SelConsignUnit.showModal(
        'radio',
        'consignUnitIds',
        this.consignUnitData,
      )
    },
    getConsignUnit(idsPerson, acceptData) {
      this.consignUnitData = acceptData.map(item => ({
        id: item.id,
        name: item.name,
      }))
      this.dataObj.consignUnitName = acceptData[0].name
    },
    setConsignProject() {
      this.$refs.SelProjcet.showModal('radio', 'projectIds', this.projcetData)
    },
    getConsignProject(idsPerson, acceptData) {
      this.projcetData = acceptData.map(item => ({
        id: item.id,
        name: item.name,
      }))
      this.dataObj.projectName = acceptData[0].name
    },
  },
}
</script>

<style></style>
