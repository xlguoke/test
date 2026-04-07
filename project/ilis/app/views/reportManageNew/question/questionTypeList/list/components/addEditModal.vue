<!-- eslint-disable vue/valid-v-for -->
<template>
  <div>
    <ht-modal
      :title="isAdd ? '新增' : '编辑'"
      :keyboard="false"
      :open="visible"
      :confirm-loading="confirmLoading"
      centered
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div>
        <a-spin :spinning="spinning">
          <div class="spin-content">
            <a-form ref="ruleForm" :model="data" :rules="rules">
              <a-form-item
                label="问题分类"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
                name="classification"
              >
                <a-input
                  v-model:value.trim="data.classification"
                  placeholder="请输入问题分类"
                  allow-clear
                />
              </a-form-item>
              <a-form-item
                label="问题类型"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
                name="type"
              >
                <a-input
                  v-model:value.trim="data.type"
                  placeholder="请输入问题类型"
                  allow-clear
                />
              </a-form-item>
              <a-form-item
                label="问题内容"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
                name="content"
              >
                <a-input
                  v-model:value.trim="data.content"
                  placeholder="请输入问题内容"
                  allow-clear
                />
              </a-form-item>
              <a-form-item
                label="严重程度"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <a-radio-group v-model:value="data.severity">
                  <a-radio v-for="item in severityData" :value="item">
                    {{ item }}
                  </a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item
                label="排序号"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
                name="orderNumber"
              >
                <a-input-number
                  v-model:value="data.orderNumber"
                  placeholder="排序号只能输入整数"
                  allow-clear
                  :min="0"
                  style="width: 100%"
                  @blur="handleInput"
                />
              </a-form-item>
              <a-form-item
                label="检测参数"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <a-table
                  :pagination="paramsData.length > 0"
                  bordered
                  :data-source="paramsData"
                  :columns="columns"
                  row-key="id"
                  :row-class-name="rowClassName"
                  :scroll="{ y: 150 }"
                >
                  <template #bodyCell="{ column, record }">
                    <template v-if="column.dataIndex === 'operation'">
                      <div class="table-handle">
                        <a-popconfirm
                          v-if="paramsData.length"
                          title="确定删除?"
                          @confirm="() => onDelete(record.id)"
                        >
                          <a href="javascript:;">删除</a>
                        </a-popconfirm>
                      </div>
                    </template>
                  </template>
                </a-table>
                <a-button style="margin-top: 5px" @click="selectParams">
                  选择
                </a-button>
              </a-form-item>
            </a-form>
          </div>
        </a-spin>
      </div>
      <ParamsModal ref="ParamsModal" :callback="getParams" />
    </ht-modal>
  </div>
</template>

<script>
import qs from 'qs'
import ParamsModal from './paramsModal.vue'

export default {
  components: {
    ParamsModal,
  },
  props: ['isAdd', 'callback'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      spinning: false,
      formLayout: 'horizontal',
      data: {
        content: '',
        type: '',
        severity: '严重错误',
        orderNumber: '',
        classification: '',
      },
      type: '',
      severityData: [
        // "严重错误",
        // "一般错误",
        // "欠缺"
      ],
      rules: {
        content: [
          { required: true, message: '请输入问题内容' },
        ],
        type: [
          {
            required: true,
            message: '请输入问题类型',
          },
        ],
        orderNumber: [
          { required: true, message: '请输入排序号' },
        ],
        classification: [
          { required: true, message: '请输入问题分类' },
        ],
      },
      testParamNames: '',
      paramsData: [],
      columns: [
        {
          title: '参数',
          dataIndex: 'name',
          width: '80%',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '20%',
          scopedSlots: { customRender: 'operation' },
        },
      ],
    }
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getStatus() {
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.common.getDictionaryData}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: '8a8ab0b246dc81120146dc8181cdxx5g',
        }),
      }).then((res) => {
        if (res && res.success) {
          this.severityData = res.obj.map(item => item.typename)
        }
        else {
          this.severityData = []
        }
      })
    },
    async showModal(id) {
      await this.getStatus()
      if (id) {
        this.spinning = true
        window.$oAjax({
          method: 'GET',
          url: `${window.$oApi.reportQuestionType.operation}/${id}`,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
          timeout: 60 * 1000,
        }).then((res) => {
          this.spinning = false
          if (res.code && res.code === 20000) {
            let {
              id,
              classification,
              content,
              type,
              severity,
              orderNumber,
              testParamIds,
              testParamNames,
            } = res.data
            if (testParamIds && testParamNames) {
              testParamIds = testParamIds.split(',')
              testParamNames = testParamNames.split(';')
            }
            this.data = {
              classification,
              content,
              type,
              severity,
              orderNumber,
              id,
            }
            if (testParamIds.length > 0) {
              this.paramsData = testParamIds.map((item, index) => ({
                id: testParamIds[index],
                name: testParamNames[index],
              }))
            }
          }
        })
      }
      else {
        this.data = {
          content: '',
          type: '',
          severity: '严重错误',
          orderNumber: '',
          classification: '',
        }
      }
      this.visible = true
    },
    handleOk() {
      this.$refs.ruleForm.validateFields().then(() => {
        this.confirmLoading = true

        const data = {
          ...this.data,
          testParamIds: this.paramsData.map(item => item.id).toString(),
        }
        let method = 'POST'

        if (this.isAdd === false) {
          method = 'PUT'
          data.id = this.data.id
        }
        else if (this.isAdd === true) {
          method = 'POST'
        }

        window.$oAjax({
          method,
          url: window.$oApi.reportQuestionType.operation,
          data: qs.stringify(data),
          timeout: 30 * 1000,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        }).then((res) => {
          if (res.code && res.code !== 20010) {
            window.$oAntdMessage.success('操作成功')
            this.$refs.ruleForm.resetFields()
            this.paramsData = []
            this.visible = false
            this.callback()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
          }
          this.confirmLoading = false
        })
      })
    },
    async handleCancel() {
      this.paramsData = []
      this.spinning = await false
      this.visible = await false
      await this.$refs.ruleForm.resetFields()
      this.paramsData.length = await 0
    },
    selectParams() {
      this.$refs.ParamsModal.showModal()
    },
    // 处理正则
    handleInput() {
      // eslint-disable-next-line prefer-regex-literals
      const zz2 = new RegExp('^0*[1-9]\\d*$')
      if (!zz2.test(this.data.orderNumber)) {
        this.data.orderNumber = 0
      }
    },
    getParams(params) {
      let isExist = false
      const arrExist = []
      for (let i = 0; i < params.length; i++) {
        const item = params[i]
        const obj = this.paramsData.find(item2 => item.id === item2.id)
        if (obj) {
          arrExist.push(obj.name)
          isExist = true
        }
      }
      if (!isExist) {
        this.paramsData = [
          ...params.map(item => ({
            id: item.id,
            name: item.displayName,
          })),
          ...this.paramsData,
        ]
      }
      else {
        const strName = arrExist.join(',')
        window.$oAntdModal.warning(
          window.$oMsgTips.info(`所选数据中 ${strName}; 已存在，请重新选择`),
        )
        this.$refs.ParamsModal.visible = false
      }
    },
    onDelete(id) {
      const paramsData = [...this.paramsData]
      this.paramsData = paramsData.filter(item => item.id !== id)
    },
  },
}
</script>
