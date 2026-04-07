<template>
  <div>
    <ht-modal
      title="预约功能室"
      :open="visible"
      centered
      :mask-closable="false"
      :confirm-loading="confirmLoading"
      width="460px"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <a-form ref="formRef" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }" :model="formData">
        <a-form-item v-if="testTaskList.length > 0" label="任务">
          <p v-for="item in testTaskList" :key="item.testTaskId">
            {{ item.test_sample_display_name }}
            <template v-if="item.test_task_code">
              （{{ item.test_task_code }}）
            </template>
          </p>
        </a-form-item>
        <a-form-item label="预约类型">
          <a-radio-group v-model:value="formData.laboratoryIotEqType">
            <a-radio value="LAB">
              功能室
            </a-radio>
            <a-radio value="BOX" disabled>
              调养箱
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          label="功能室"
          :rules="[{ required: true, message: '请选择' }]"
          name="laboratoryId"
        >
          <a-select
            v-model:value="formData.laboratoryId"
            disabled
            placeholder="请选择"
            @change="onChangeLab"
          >
            <a-select-option
              v-for="item in funRoomData"
              :key="item.id"
              :value="item.id"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="开始时间"
          :rules="[{ required: true, message: '请选择' }]"
          name="startDate"
        >
          <a-date-picker
            v-model:value="formData.startDate"
            placeholder="请选择"
            show-time
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="disabledDate"
          />
        </a-form-item>
        <a-form-item
          label="结束时间"
          :rules="[{ required: true, message: '请选择' }]"
          name="endDate"
        >
          <a-date-picker
            v-model:value="formData.endDate"
            placeholder="请选择"
            show-time
            value-format="YYYY-MM-DD HH:mm:ss"
            :disabled-date="disabledDate"
          />
        </a-form-item>
        <a-form-item
          label="目标温度（℃）"
          :rules="[{ required: true, message: '请输入' }]"
          name="tem"
        >
          <a-input-number
            v-model:value="formData.tem"
            placeholder="最小温度"
            :min="selectedLab.minConTem || undefined"
            :max="selectedLab.maxConTem || undefined"
          />
          ~
          <a-input-number
            v-model:value="formData.maxTem"
            placeholder="最大温度"
            :min="selectedLab.minConTem || undefined"
            :max="selectedLab.maxConTem || undefined"
          />
        </a-form-item>
        <a-form-item
          label="目标湿度（%RH）"
          :rules="[{ required: true, message: '请输入' }]"
          name="hum"
        >
          <a-input-number
            v-model:value="formData.hum"
            placeholder="最小湿度"
            :min="selectedLab.minConHum || undefined"
            :max="selectedLab.maxConHum || undefined"
          />
          ~
          <a-input-number
            v-model:value="formData.maxHum"
            placeholder="最大湿度"
            :min="selectedLab.minConHum || undefined"
            :max="selectedLab.maxConHum || undefined"
          />
        </a-form-item>
        <a-form-item label="结束时处理" required>
          <a-radio-group v-model:value="formData.customType">
            <a-radio value="SET">
              不处理
            </a-radio>
            <a-radio value="CLOSE">
              自动关闭设备
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="预约人员" required>
          <div style="display: flex; align-items: center">
            <div style="flex: 1; font-size: 12px">
              {{ selectedPerson.name }}
            </div>
            <a-button @click="onSelectPerson">
              选择
            </a-button>
          </div>
        </a-form-item>
      </a-form>
    </ht-modal>

    <SelectPersonnel ref="SelectPersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import SelectPersonnel from '~/providers/components/tableTreePersonnel.vue'

export default {
  name: 'ReservationFunctionRoom',
  components: {
    SelectPersonnel,
  },
  data() {
    return {
      formData: {
        id: undefined,
        customType: 'SET',
        endDate: null,
        hum: null,
        maxHum: null,
        laboratoryId: undefined,
        laboratoryIotEqType: 'LAB',
        resUserId: undefined,
        startDate: null,
        taskId: '',
        tem: null,
        maxTem: null,
        createName: '',
      },
      visible: false,
      confirmLoading: false,
      funRoomData: [],

      selectedPerson: {},
      testTaskList: [],
      selectedLab: {},
      hasTaskConfig: false,
    }
  },
  created() {
    this.getLaboratory()
  },
  methods: {
    checkIsDefine(val) {
      return val !== undefined && val !== null
    },
    onChangeLab(val) {
      const item = this.funRoomData.find(i => i.id === val)

      if (item) {
        this.selectedLab = item

        if (this.hasTaskConfig === false) {
          this.formData.tem = item.minTemperature
          this.formData.maxTem = item.maxTemperature
          this.formData.hum = item.minHumidity
          this.formData.maxHum = item.maxHumidity
        }
      }
    },
    disabledDate(current) {
      return current && current < dayjs().startOf('day')
    },
    onSelectPerson() {
      this.$refs.SelectPersonnel.showModal(
        'radio',
        '',
        [...this.selectedPerson],
        '选择人员',
        false,
      )
    },
    async getLaboratory() {
      const res = await window.$oAjax({
        method: 'get',
        url: `/rest/laboratoryController?dataGridPage&size=99999&page=1&isIotLab=1`,
      })

      this.funRoomData = res.obj.rows
    },
    getPerson(ids, rows) {
      if (rows.length === 0) {
        window.$oAntdMessage.warn('请选择预约人员！')
        return
      }

      this.selectedPerson = rows[0]
    },
    getTemHumVal(val, newVal, type) {
      if (newVal !== null && newVal !== undefined) {
        if (val === null) {
          return newVal
        }

        if (type === 'min') {
          if (newVal < val) {
            return newVal
          }
        }

        if (type === 'max') {
          if (newVal > val) {
            return newVal
          }
        }
      }

      return val
    },
    async getRelationTestTask(data) {
      const res = await window.$oAjax.post(
        `rest/humiture/res/period/in/${data.siteId}`,
        null,
        {
          params: {
            periodIds: data.periodIds,
          },
        },
      )

      if (res.code !== 20010) {
        const { testTask, paramHumiture, laboratory } = res.data
        let minTem = null
        let maxTem = null
        let minHum = null
        let maxHum = null

        this.testTaskList = testTask

        const hasConfig = (paramHumiture || []).find(
          i =>
            i.houseTemMin !== null
            || i.houseTemMax !== null
            || i.houseHumMin !== null
            || i.houseHumMax !== null,
        )

        if (hasConfig) {
          paramHumiture.forEach((item) => {
            minTem = this.getTemHumVal(minTem, item.houseTemMin, 'min')
            maxTem = this.getTemHumVal(minTem, item.houseTemMax, 'max')

            minHum = this.getTemHumVal(minHum, item.houseHumMin, 'min')
            maxHum = this.getTemHumVal(maxHum, item.houseHumMax, 'max')
          })
        }

        if (minTem !== null && maxTem !== null) {
          this.hasTaskConfig = true
          this.formData.tem = minTem
          this.formData.maxTem = maxTem
        }

        if (minHum !== null && maxHum !== null) {
          this.hasTaskConfig = true
          this.formData.hum = minHum
          this.formData.maxHum = maxHum
        }

        // 默认功能室
        if (laboratory && laboratory.length > 0) {
          const labItem = laboratory[0]
          this.formData.laboratoryId = labItem.laboratoryId
          this.onChangeLab(labItem.laboratoryId)
        }
      }
    },
    showModal(data) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))

      this.selectedPerson = {
        id: userInfo.userId,
        name: userInfo.realName,
      }

      this.formData = {
        id: undefined,
        customType: 'SET',
        endDate: null,
        hum: null,
        maxHum: null,
        laboratoryId: undefined,
        laboratoryIotEqType: 'LAB',
        resUserId: undefined,
        startDate: null,
        taskId: '',
        tem: null,
        maxTem: null,
        createName: userInfo.realName,
      }

      this.getRelationTestTask(data)

      this.visible = true
    },
    handleCancel() {
      this.visible = false
      this.formData = {}
      this.selectedPerson = {}
      this.selectedLab = {}
      this.hasTaskConfig = false
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(async () => {
        if (!this.selectedPerson.id) {
          window.$oAntdMessage.warn('请选择预约人员！')
          return
        }

        const formData = { ...this.formData }
        formData.resUserId = this.selectedPerson.id
        formData.taskId = this.testTaskList.map(i => i.testTaskId).join(',')

        if (+new Date(formData.endDate) <= +new Date(formData.startDate)) {
          window.$oAntdModal.warning(window.$oMsgTips.info('结束时间必须大于开始时间！'))
          return
        }

        if (formData.tem > formData.maxTem) {
          window.$oAntdModal.warning(
            window.$oMsgTips.info('目标温度，最小温度不能大于最大温度！'),
          )
          return
        }

        if (formData.hum > formData.maxHum) {
          window.$oAntdModal.warning(
            window.$oMsgTips.info('目标湿度，最小湿度不能大于最大湿度！'),
          )
          return
        }

        if (formData.startDate) {
          formData.startDate = dayjs(formData.startDate).format(
            'YYYY-MM-DD HH:mm:ss',
          )
        }

        if (formData.endDate) {
          formData.endDate = dayjs(formData.endDate).format(
            'YYYY-MM-DD HH:mm:ss',
          )
        }

        this.confirmLoading = true
        const res = await window.$oAjax
          .post('rest/humiture/res', JSON.stringify(formData), {
            headers: {
              'content-type': 'application/json',
            },
          })
          .finally(() => {
            this.confirmLoading = false
          })

        if (res !== 20010) {
          window.$oAntdMessage.success('保存成功！')
          this.handleCancel()
        }
      })
    },
  },
}
</script>
