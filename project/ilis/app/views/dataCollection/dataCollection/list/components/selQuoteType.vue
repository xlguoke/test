<template>
  <div>
    <ht-modal
      title="系统文件资料"
      centered
      :open="visible"
      :force-render="true"
      :mask-closable="false"
      class="equipmentOutgo-add-modal"
      width="500px"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form ref="formRef" :model="formState">
            <a-form-item
              label="配置类型"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
            >
              <a-select
                v-model:value="formState.typeId"
                placeholder="请选择"
                :disabled="isDetail"
                @change="handleSelectChange"
              >
                <a-select-option
                  v-for="(item, index) in dictData"
                  :key="index"
                  :value="item.id"
                >
                  {{ item.typename }}
                </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item>
              <a-checkbox-group
                v-model:value="formState.content"
                style="width: 100%"
              >
                <a-row>
                  <a-col v-for="item in data" :key="item.id" :span="12">
                    <a-checkbox :value="item.id">
                      {{ item.name }}
                    </a-checkbox>
                  </a-col>
                </a-row>
              </a-checkbox-group>
            </a-form-item>
          </a-form>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'

export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      spinning: false,
      visible: false,
      formLayout: 'horizontal',
      formState: {
        content: [],
      },
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      dayjs,
      isDetail: false,
      fristLoad: false,
      data: [],
      dictData: [],
      typeId: '',
      typeName: '',
    }
  },
  created() {
    this.getDictData()
  },
  methods: {
    getDictData() {
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.testTemplate.getDict,
        method: 'POST',
        data: qs.stringify({
          list: JSON.stringify(['@data_manage_standard@']),
        }),
      }).then((res) => {
        this.spinning = false
        this.fristLoad = true
        if (
          res.success
          && res.attributes
          && res.attributes.data_manage_standard
          && res.attributes.data_manage_standard.length > 0
        ) {
          this.dictData = res.attributes.data_manage_standard
        }
        else {
          this.dictData = []
        }
      })
    },
    handleSelectChange(value) {
      this.typeId = value
      this.typeName = this.dictData.filter(
        item => item.id === value,
      )[0].typename
      this.formState = {
        content: [],
      }
      this.getData()
    },
    getData() {
      if (this.fristLoad) {
        this.spinning = true
        window.$oAjax({
          method: 'GET',
          params: {
            typeId: this.typeId,
          },
          url: window.$oApi.dataCollection.listQuote,
        }).then((res) => {
          this.spinning = false
          if (res.code === 20000 && res.data && res.data.length > 0) {
            this.data = []
            // eslint-disable-next-line array-callback-return
            res.data.map((item) => {
              this.data.push({ id: item.id, name: item.name })
            })
          }
          else {
            this.data = []
          }
        })
      }
    },
    showModal() {
      this.visible = true
    },
    dataRequired() {
      return true
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const data = {
          ...this.formState,
        }
        if (this.dataRequired(data)) {
          const nameArr = []
          for (let i = 0; i < data.content.length; i++) {
            nameArr.push(
              this.data.filter(item => data.content[i] === item.id)[0].name,
            )
          }
          this.callback(nameArr)
          this.handleCancel()
        }
      })
    },
    handleCancel() {
      this.formState = {
        content: [],
      }
      this.data = []
      this.typeId = ''
      this.typeName = ''
      this.visible = false
    },
  },
}
</script>

<style lang="less">
.equipmentOutgo-add-modal {
  .ant-modal-body {
    min-height: 300px;
    max-height: 450px;
    overflow-y: auto;
  }
  .text-right {
    text-align: right;
  }
  .ant-col-12 {
    margin: 6px 0;
  }
}
</style>
