<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div
          style="
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
            padding: 5px 0;
            margin: 15px 0;
          "
        >
          <a-flex>
            <SmartTag ref="SmartTag" @set-data="setData" />
            <a-button class="ml-2" @click="addEditRow">
              新增
            </a-button>
          </a-flex>
        </div>
        <a-form
          v-bind="layout"
          ref="Form"
          :model="formData"
          :rules="rules"
          :hide-required-mark="false"
        >
          <a-row :gutter="15">
            <a-col>
              <a-form-item>
                <a-checkbox-group v-model:value="formData.type">
                  <div v-for="(item, index) in sampleData" :key="index">
                    <a-checkbox
                      style="margin: 5px 0"
                      :value="item.storeId || item.id"
                      name="type"
                    >
                      {{ item.barcodeId }}
                    </a-checkbox>
                  </div>
                </a-checkbox-group>
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
        <!-- <a-button @click="saveFun">保存</a-button> -->
      </div>
    </a-spin>
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
import SmartTag from './components/smartTag.vue'

export default {
  components: { SmartTag },
  data() {
    return {
      spinning: false,
      formData: {
        issaveDate: '0',
        saveDate: undefined,
        saveSite: '',
        type: ['1'],
      },
      layout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
      },
      rules: {
        categorySampleId: [
          {
            required: true,
            message: '请选择取样类型',
            trigger: 'change',
          },
        ],
      },
      numberUnit: [],
      visible: false,
      sampleData: [],
      iotLabelType: '3',
      iotLabelCode: '',
      processObjectId: getQueryVariable('processObjectId') || '',
      sel: getQueryVariable('sel') || '',
      status: getQueryVariable('status') || '', // 1 在检留样, 3 测后留样
      // 1: 标签编号, 2: 二维码编号, 3:RFID编号
    }
  },
  computed: {},
  mounted() {
    window.GetResult = this.saveFun
  },
  created() {
    if (this.sel) {
      this.formData.type = this.sel.split(',')
    }
    this.getData()
  },
  methods: {
    getData() {
      let sampleOldData = sessionStorage.getItem(
        `sampleOldData_${this.processObjectId}`,
      )
      sampleOldData = sampleOldData ? JSON.parse(sampleOldData) : []
      this.spinning = true
      window.$oAjax
        .get('rest/rfid/processObjectRfids', {
          params: {
            processObjectId: this.processObjectId,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          let sampleData = []
          if (res.code === 20000) {
            // eslint-disable-next-line ts/no-unused-expressions
            this.status === '3' ? (sampleData = res.data) : ''
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
          }
          const obj = {}
          const newData2 = []
          const newData = [...sampleData, ...sampleOldData]
          // eslint-disable-next-line array-callback-return
          newData.map((item) => {
            if (!obj[item.id]) {
              newData2.push(item)
              obj[item.id] = item.id
            }
          })
          this.sampleData = JSON.parse(JSON.stringify(newData2))
          this.spinning = false
        })
    },
    addEditRow() {
      this.$refs.SmartTag.handleOk()
    },
    setData(res) {
      window.$oAjax
        .get('rest/rfid', {
          params: {
            param: res.typeValue,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.sampleData.push({ ...res.data, storeId: res.data.id })
            this.$refs.SmartTag.clearInput()
            this.visible = false
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
          }
          this.spinning = false
        })
    },
    saveFun(layerI, successFunc) {
      sessionStorage.setItem(
        `sampleOldData_${this.processObjectId}`,
        JSON.stringify(this.sampleData),
      )

      successFunc
      && successFunc(layerI, {
        iotLabelType: '3',
        iotLabelCode: this.formData.type,
      })
    },
  },
}
</script>

<style lang="less" scoped>

</style>
