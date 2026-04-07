<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="baseInfo">
    <a-row>
      <a-col span="16">
        <a-form ref="formRef" :model="formState">
          <a-form-item>
            <template #label>
              <label>
                样品标签打印机名称
                <QuestionCircleOutlined
                  title="打印样品标签时，根据名称自动匹配您的打印设备，未设置或未匹配成功时，将选择系统默认打印设备"
                  class="baseInfo-label-tip"
                />
              </label>
            </template>
            <a-input v-model:value="formState.object_label_print" />
          </a-form-item>
          <a-form-item>
            <template #label>
              <label>
                设备标签打印机名称
                <QuestionCircleOutlined
                  title="打印设备标签时，根据名称自动匹配您的打印设备，未设置或未匹配成功时，将选择系统默认打印设备"
                  class="baseInfo-label-tip"
                />
              </label>
            </template>
            <a-input v-model:value="formState.equipment_label_print" />
          </a-form-item>
        </a-form>
        <a-button
          :loading="confirmLoading"
          style="margin-top: 10px"
          type="primary"
          @click="updateInfo"
        >
          更新信息
        </a-button>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'

export default {
  components: {
    QuestionCircleOutlined,
  },
  data() {
    return {
      equipment_label_print_id: null,
      object_label_print_id: null,
      formState: {},
      confirmLoading: false,
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size, query } = this
      window.$oAjax.get('/rest/user/config/detail').then((res) => {
        if (res.code !== 20010) {
          const data = res.data
          const equipment_label_print = data.find(
            i => i.configKey === 'equipment_label_print',
          )
          const object_label_print = data.find(
            i => i.configKey === 'object_label_print',
          )

          if (equipment_label_print) {
            this.equipment_label_print_id = equipment_label_print.id
            this.formState.equipment_label_print = equipment_label_print.printer
          }

          if (object_label_print) {
            this.object_label_print_id = object_label_print.id
            this.formState.object_label_print = object_label_print.printer
          }
        }
      })
    },
    async updateInfo() {
      try {
        this.confirmLoading = true
        await this.saveInfo('equipment_label_print')
        await this.saveInfo('object_label_print')
        window.$oAntdMessage.success('保存成功！')
        this.getData()
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
      }

      this.confirmLoading = false
    },
    async saveInfo(configKey) {
      const id = `${configKey}_id`

      await window.$oAjax({
        method: this[id] ? 'PUT' : 'POST',
        url: '/rest/user/config',
        headers: {
          'Content-Type': 'application/json',
        },
        data: JSON.stringify({
          id: this[id] || undefined,
          configKey,
          printer: (this.formState[configKey] || '').trim(),
        }),
      })
    },
  },
}
</script>

<style lang="less" scoped>
.baseInfo {
  .ant-form-item {
    margin-bottom: 10px;
    font-size: 12px;
  }

  .ant-form-explain {
    font-size: 12px;
    padding-top: 3px;
  }

  .baseInfo-label-tip {
    color: #1890ff;
    vertical-align: middle;
    margin-bottom: 2px;
  }
}
</style>
