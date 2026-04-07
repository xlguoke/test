<template>
  <div>
    <van-form ref="form" label-width="110px">
      <van-field
        v-if="!hideFields.includes('taskId')"
        readonly
        autosize
        required
        input-align="right"
        label="试验任务"
      >
        <template #input>
          <div>
            {{ `${testTask.testSampleDisplayName}(${testTask.testTaskCode})` }}
          </div>
        </template>
      </van-field>

      <FormItemRadio
        v-if="!hideFields.includes('laboratoryIotEqType')"
        v-model:value="formData.laboratoryIotEqType"
        label="预约类型"
        :options="[
          { label: '功能室', value: 'LAB' },
          { label: '调养箱', value: 'LABOXB' },
        ]"
      />

      <van-field
        v-if="!hideFields.includes('laboratoryId')"
        v-model="lab.name"
        readonly
        autosize
        required
        label="功能室"
        placeholder="请选择"
        is-link
        input-align="right"
        :rules="[{ required: true, message: '请选择功能室' }]"
        @click-input="selectLabVsibile = true"
      />

      <van-field
        v-if="formData.laboratoryIotEqType === 'BOX'"
        v-model="iotEq.toName"
        readonly
        autosize
        required
        label="调养箱"
        placeholder="请选择"
        is-link
        input-align="right"
        :rules="[{ required: true, message: '请选择调养箱' }]"
        @click-input="openSelectIotEq"
      />

      <van-field
        v-if="
          formData.laboratoryId
            && formData.taskId
            && formData.laboratoryIotEqType === 'LAB'
        "
        autosize
        label="试验参数"
        input-align="right"
      >
        <template #input>
          <van-checkbox-group
            v-if="testParamOptions.length > 0"
            v-model="formData.testParams"
            direction="horizontal"
            @change="clacDefaultHumiture"
          >
            <van-checkbox
              v-for="item in testParamOptions"
              :key="item.value"
              :name="item.value"
              shape="square"
              style="margin: 4px"
            >
              {{ item.label }}
            </van-checkbox>
          </van-checkbox-group>
          <span v-else style="color: gray">无符合条件的试验参数</span>
        </template>
      </van-field>

      <FormItemPerson
        v-model:value="formData.resUser"
        label="预约人员"
        name="resUser"
        :rules="[{ validator: resUserValidator, message: '请选择预约人员' }]"
        required
      />

      <FormItemDate
        v-model:value="formData.startDate"
        label="开始时间"
        required
        enable-time
        :rules="[{ required: true, message: '请选择开始时间' }]"
        placeholder="请选择"
      />

      <FormItemDate
        v-model:value="formData.endDate"
        label="结束时间"
        required
        enable-time
        :rules="[{ required: true, message: '请选择结束时间' }]"
        placeholder="请选择"
      />

      <van-field
        v-if="formData.laboratoryIotEqType === 'LAB'"
        required
        name="tem"
        label="目标温度(℃)"
        placeholder="请输入"
        center
        :rules="[{ validator: temValidator, message: '请输入目标温度' }]"
      >
        <template #input>
          <van-row>
            <van-col span="11">
              <input
                v-model="formData.tem"
                type="number"
                class="reservationLab-num"
                placeholder="最小温度"
                @change="checkTemHum('tem')"
              />
            </van-col>
            <van-col span="2" style="text-align: center; margin-top: 4px">
              ~
            </van-col>
            <van-col span="11">
              <input
                v-model="formData.maxTem"
                type="number"
                class="reservationLab-num"
                placeholder="最大温度"
                @change="checkTemHum('maxTem')"
              />
            </van-col>
          </van-row>
        </template>
      </van-field>

      <van-field
        v-if="formData.laboratoryIotEqType === 'LAB'"
        required
        name="hum"
        label="目标湿度(%RH)"
        placeholder="请输入"
        center
        :rules="[{ validator: humValidator, message: '请输入目标湿度' }]"
      >
        <template #input>
          <van-row>
            <van-col span="11">
              <input
                v-model="formData.hum"
                type="number"
                class="reservationLab-num"
                placeholder="最小湿度"
                @change="checkTemHum('hum')"
              />
            </van-col>
            <van-col span="2" style="text-align: center; margin-top: 4px">
              ~
            </van-col>
            <van-col span="11">
              <input
                v-model="formData.maxHum"
                type="number"
                class="reservationLab-num"
                placeholder="最大湿度"
                @change="checkTemHum('maxHum')"
              />
            </van-col>
          </van-row>
        </template>
      </van-field>

      <FormItemRadio
        v-model:value="formData.customType"
        label="结束时处理"
        :options="[
          { label: '不处理', value: 'SET' },
          { label: '自动关闭设备', value: 'CLOSE' },
        ]"
      />
    </van-form>

    <MobileLabSelector
      v-model:open="selectLabVsibile"
      :query="{ isIotLab: 1 }"
      :selected-rows="[lab]"
      @select="getLab"
    />

    <SelectIotEq
      v-model:value="selectIotEqVsibile"
      :iot-eq-id="lab.iotEqId"
      @selected-ok="getIotEq"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { showDialog } from 'vant'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import FormItemRadio from '~/views/mobileApp/components/MobileFormItem/FormItemRadio.vue'
import MobileLabSelector from '~/views/mobileApp/components/MobileSelector/MobileLabSelector.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'
import SelectIotEq from './selectIotEq.vue'

export default {
  components: {
    SelectIotEq,
    FormItemDate,
    FormItemPerson,
    FormItemRadio,
    MobileLabSelector,
  },
  props: {
    hideFields: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      formData: {
        testParams: [],
        customType: 'SET',
        startDate: '',
        endDate: '',
        hum: '',
        tem: '',
        maxHum: '',
        maxTem: '',
        laboratoryId: '',
        laboratoryIotEqId: null,
        laboratoryIotEqType: 'LAB',
        resUserId: '',
        taskId: '',
        resUserName: '',
        boxName: '',
        resUser: [],
      },
      nowDate: new Date(),
      testTask: {},
      lab: {},
      iotEq: {},
      selectIotEqVsibile: false,
      selectLabVsibile: false,
      testParamOptions: [],
      paramHumConfig: [],
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['userInfo']),
  },
  async created() {
    this.init()
  },
  methods: {
    init() {
      const testTaskData = JSON.parse(
        sessionStorage.getItem('reservationLabPageData'),
      )

      this.formData.resUser = [{
        id: this.userInfo.id,
        name: this.userInfo.realName,
      }]
      this.formData.taskId = testTaskData.id

      this.testTask = testTaskData
    },
    resUserValidator() {
      if (this.formData.resUser && this.formData.resUser.length > 0) {
        return true
      }
      return false
    },
    temValidator() {
      const { tem, maxTem } = this.formData
      if ((!tem && tem !== 0) || (!maxTem && tem !== 0)) {
        return false
      }
      return true
    },
    humValidator() {
      const { hum, maxHum } = this.formData
      if ((!hum && hum !== 0) || (!maxHum && maxHum !== 0)) {
        return false
      }
      return true
    },
    async getTestParamConfig() {
      if (
        this.formData.laboratoryIotEqType === 'LAB'
        && this.formData.laboratoryId
        && this.formData.taskId
      ) {
        const res = await mRequest.post(
          `rest/humiture/res/${this.formData.laboratoryId}/${this.formData.taskId}/param/config`,
        )
        this.testParamOptions = res.data.paramList.map(i => ({
          label: i.displayName,
          value: i.id,
        }))
        this.paramHumConfig = res.data.paramHumConfig

        this.formData.testParams = []

        this.clacDefaultHumiture()
      }
    },
    // 根据选择参数计算温湿度默认值
    clacDefaultHumiture() {
      if (this.formData.laboratoryIotEqType !== 'LAB') {
        return
      }

      let minTem = this.checkIsDefine(this.lab.minTemperature)
        ? this.lab.minTemperature
        : null
      let maxTem = this.checkIsDefine(this.lab.maxTemperature)
        ? this.lab.maxTemperature
        : null
      let minHum = this.checkIsDefine(this.lab.minHumidity)
        ? this.lab.minHumidity
        : null
      let maxHum = this.checkIsDefine(this.lab.maxHumidity)
        ? this.lab.maxHumidity
        : null

      if (this.paramHumConfig.length) {
        this.paramHumConfig.forEach((item) => {
          if (this.formData.testParams.includes(item.testParamId)) {
            minTem = this.getTemHumVal(minTem, item.houseTemMin, 'min')
            maxTem = this.getTemHumVal(maxTem, item.houseTemMax, 'max')

            minHum = this.getTemHumVal(minHum, item.houseHumMin, 'min')
            maxHum = this.getTemHumVal(maxHum, item.houseHumMax, 'max')
          }
        })
      }

      this.formData.tem = minTem
      this.formData.maxTem = maxTem
      this.formData.hum = minHum
      this.formData.maxHum = maxHum

      this.$refs.form.validate('tem')
      this.$refs.form.validate('maxTem')
      this.$refs.form.validate('hum')
      this.$refs.form.validate('maxHum')
    },
    getTemHumVal(val, newVal, type) {
      if (newVal !== null && newVal !== undefined) {
        if (val === null) {
          return newVal
        }

        if (type === 'min') {
          if (newVal > val) {
            return newVal
          }
        }

        if (type === 'max') {
          if (newVal < val) {
            return newVal
          }
        }
      }

      return val
    },
    checkIsDefine(val) {
      return val !== null && val !== undefined
    },
    // 保存操作
    async getFormData() {
      return new Promise((resolve, _reject) => {
        this.$refs.form.validate().then((result) => {
          const { startDate, endDate, tem, maxTem, hum, maxHum } = this.formData
          const nowDate = this.nowDate

          if (result) {
            return
          }

          if (nowDate > +new Date(startDate) || nowDate > +new Date(endDate)) {
            showDialog({ message: '开始时间和结束时间，必须大于当前时间' })
            return
          }

          if (+new Date(endDate) <= +new Date(startDate)) {
            showDialog({ message: '结束时间必须大于开始时间' })
            return
          }

          if (Number.parseFloat(tem) > Number.parseFloat(maxTem)) {
            showDialog({ message: '目标温度，最小温度不能大于最大温度！' })
            return
          }

          if (Number.parseFloat(hum) > Number.parseFloat(maxHum)) {
            showDialog({ message: '目标湿度，最小湿度不能大于最大湿度！' })
            return
          }

          const data = {
            ...this.formData,
            testParams:
              this.formData.laboratoryIotEqType === 'LAB'
                ? this.formData.testParams.join(',')
                : '',
          }

          if (this.formData.resUser.length) {
            data.resUserId = this.formData.resUser[0].id
            data.resUserName = this.formData.resUser[0].name
            delete data.resUser
          }

          resolve(data)
        })
      })
    },
    openSelectIotEq() {
      if (!this.lab.id) {
        showDialog({ message: '请先选择功能室！' })
        return
      }

      this.selectIotEqVsibile = true
    },
    getLab(rows) {
      const [item] = rows

      this.formData.laboratoryId = item.id

      if (this.lab.id !== item.id) {
        this.formData.laboratoryIotEqId = null
        this.formData.boxName = ''
        this.iotEq = {}
      }

      this.lab = item

      this.getTestParamConfig()
    },
    getIotEq(data) {
      const [item] = data

      this.formData.laboratoryIotEqId = item.to.id
      this.formData.boxName = item.toName
      this.iotEq = item
    },
    checkTemHum(name) {
      const { lab } = this
      if (lab && lab.id) {
        const minTem = lab.minConTem
        const maxTem = lab.maxConTem
        const minHum = lab.minConHum
        const maxHum = lab.maxConHum

        const val = this.formData[name]
        const minVal = ['tem', 'maxTem'].includes(name) ? minTem : minHum
        const maxVal = ['tem', 'maxTem'].includes(name) ? maxTem : maxHum

        if (val) {
          if (this.checkIsDefine(minVal) && val < minVal) {
            this.formData[name] = minVal
          }

          if (this.checkIsDefine(maxVal) && val > maxVal) {
            this.formData[name] = maxVal
          }
        }
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
