<template>
  <a-form>
    <a-row>
      <a-col span="24">
        <ComHeader>基础设置</ComHeader>
      </a-col>

      <a-col :md="md" :xl="xl">
        <a-form-item :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
          <template #label>
            <div class="humiture">
              温湿度展示
              <a-tooltip placement="bottom">
                <template #title>
                  <span>显示屏展示的温湿度信息</span>
                </template>
                <QuestionCircleOutlined />
              </a-tooltip>
            </div>
          </template>
          <a-radio-group
            v-model:value="formData.showReallyTH"
            :options="humitureType"
            :disabled="isDetails"
          />
          <p v-show="!formData.showReallyTH" class="humiture-hint">
            需输入温湿度标准值范围，以便显示屏正常显示
          </p>
        </a-form-item>
      </a-col>

      <a-col v-if="!usedByBatch" :md="md" :xl="xl">
        <a-form-item
          label="物联网系统房间"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 17 }"
        >
          <a-select
            v-model:value="formData.labIotEq.iotEqId"
            style="width: 100%;"
            show-search
            :disabled="isDetails"
            placeholder="请选择"
            :options="iotHouseList"
            :filter-option="filterOption"
            @change="changeLabIotEqId"
          />
        </a-form-item>
      </a-col>
      <a-col v-if="!usedByBatch" :md="md" :xl="xl">
        <a-form-item
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 17 }"
          :colon="false"
        >
          <template #label>
            <span style="display: flex;flex-direction: column;justify-content: flex-start;margin-right: 10px; line-height: 16px;">
              <div>温湿度预约</div>
              <div>提前时间：</div>
            </span>
          </template>
          <div style="display: flex;gap: 10px;">
            <a-input-number
              v-model="formData.temResMin"
              :disabled="isDetails"
              style="width: 100%"
              :min="0"
              :precision="0"
            />
            <span>min</span>
          </div>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row>
      <a-col span="24">
        <ComHeader>温度</ComHeader>
      </a-col>
      <a-col :md="md" :xl="xl">
        <a-form-item
          label="温度可控范围(℃)"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 17 }"
        >
          <div style="display: flex; justify-content: space-between">
            <a-input-number
              v-model:value="formData.minTemCon"
              :disabled="isDetails"
              style="width: 45%"
              placeholder="请输入最低温度"
              @blur="checkTemHum"
            />
            -
            <a-input-number
              v-model:value="formData.maxTemCon"
              :disabled="isDetails"
              style="width: 45%"
              placeholder="请输入最高温度"
              @blur="checkTemHum"
            />
          </div>
        </a-form-item>
      </a-col>
      <a-col :md="md" :xl="xl">
        <a-form-item
          label="温度标准(℃)"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 17 }"
        >
          <div style="display: flex; justify-content: space-between">
            <a-input-number
              v-model:value="formData.minTemperature"
              :disabled="isDetails"
              style="width: 45%"
              placeholder="请输入最低温度"
              @blur="checkTemHum"
            />
            -
            <a-input-number
              v-model:value="formData.maxTemperature"
              :disabled="isDetails"
              style="width: 45%"
              placeholder="请输入最高温度"
              @blur="checkTemHum"
            />
          </div>
        </a-form-item>
      </a-col>
      <!-- <a-col :md="md" :xl="xl">
          <a-form-item label="是否自动恒温" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
            <a-radio-group v-model="formData.openTemAuto">
              <a-radio :value="false">否</a-radio>
              <a-radio :value="true">是</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col> -->
      <!-- <a-col :md="md" :xl="xl">
          <a-form-item
            label="恒温自动调节范围(℃)"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 17 }"
          >
            <div style="display: flex; justify-content: space-between">
              <a-input-number
                v-model="formData.minTemAuto"
                :disabled="isDetails"
                style="width: 45%"
                placeholder="请输入最低温度"
                @blur="checkTemHum"
              />
              -
              <a-input-number
                v-model="formData.maxTemAuto"
                :disabled="isDetails"
                style="width: 45%"
                placeholder="请输入最高温度"
                @blur="checkTemHum"
              />
            </div>
          </a-form-item>
        </a-col> -->
      <a-col :md="md" :xl="xl">
        <a-form-item
          label="温度取值方式"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 17 }"
        >
          <a-radio-group
            v-model:value="formData.temValueTake"
            :disabled="isDetails"
            :options="valueTakeType"
          />
          <a-select
            v-if="formData.temValueTake === 'EQ'"
            v-model:value="formData.temEqId"
            style="width: 80%; margin-top: 4px"
            :disabled="isDetails"
            placeholder="请选择设备"
          >
            <a-select-option
              v-for="item in formData.iotEqList"
              :key="item.iotEqId"
              :value="item.iotEqId"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>
    <a-row>
      <a-col span="24">
        <ComHeader>湿度</ComHeader>
      </a-col>
      <a-col :md="md" :xl="xl">
        <a-form-item
          label="湿度可控范围(%RH)"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 17 }"
        >
          <div style="display: flex; justify-content: space-between">
            <a-input-number
              v-model:value="formData.minHumCon"
              :disabled="isDetails"
              style="width: 45%"
              placeholder="请输入最低湿度"
              @blur="checkTemHum"
            />
            -
            <a-input-number
              v-model:value="formData.maxHumCon"
              :disabled="isDetails"
              style="width: 45%"
              placeholder="请输入最高湿度"
              @blur="checkTemHum"
            />
          </div>
        </a-form-item>
      </a-col>
      <a-col :md="md" :xl="xl">
        <a-form-item
          label="湿度标准(%RH)"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 17 }"
        >
          <div style="display: flex; justify-content: space-between">
            <a-input-number
              v-model:value="formData.minHumidity"
              :disabled="isDetails"
              style="width: 45%"
              placeholder="请输入最低湿度"
              @blur="checkTemHum"
            />
            -
            <a-input-number
              v-model:value="formData.maxHumidity"
              :disabled="isDetails"
              style="width: 45%"
              placeholder="请输入最高湿度"
              @blur="checkTemHum"
            />
          </div>
        </a-form-item>
      </a-col>
      <!-- <a-col :md="md" :xl="xl">
          <a-form-item label="是否自动恒湿" :label-col="{ span: 7 }" :wrapper-col="{ span: 17 }">
            <a-radio-group v-model="formData.openHumAuto">
              <a-radio :value="false">否</a-radio>
              <a-radio :value="true">是</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col> -->
      <!-- <a-col :md="md" :xl="xl">
          <a-form-item
            label="恒湿自动调节范围(%RH)"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 17 }"
          >
            <div style="display: flex; justify-content: space-between">
              <a-input-number
                v-model="formData.minHumAuto"
                :disabled="isDetails"
                style="width: 45%"
                placeholder="请输入最低湿度"
                @blur="checkTemHum"
              />
              -
              <a-input-number
                v-model="formData.maxHumAuto"
                :disabled="isDetails"
                style="width: 45%"
                placeholder="请输入最高湿度"
                @blur="checkTemHum"
              />
            </div>
          </a-form-item>
        </a-col> -->
      <!-- <a-col :md="md" :xl="xl">
          <a-form-item
            label="湿度预约提前时间(分钟)"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 17 }"
          >
            <a-input-number
              v-model="formData.humResMin"
              :disabled="isDetails"
              style="width: 100%"
              :min="0"
              :precision="0"
            />
          </a-form-item>
        </a-col> -->
      <a-col :md="md" :xl="xl">
        <a-form-item
          label="湿度取值方式"
          :label-col="{ span: 7 }"
          :wrapper-col="{ span: 17 }"
        >
          <a-radio-group
            v-model:value="formData.humValueTake"
            :disabled="isDetails"
            :options="valueTakeType"
          />
          <a-select
            v-if="formData.humValueTake === 'EQ'"
            v-model:value="formData.humEqId"
            style="width: 80%; margin-top: 4px"
            :disabled="isDetails"
            placeholder="请选择设备"
          >
            <a-select-option
              v-for="item in formData.iotEqList"
              :key="item.iotEqId"
              :value="item.iotEqId"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>
    <div v-if="!usedByBatch">
      <ComHeader>设备列表</ComHeader>
      <div v-if="!isDetails" style="margin-bottom: 8px">
        <a-button type="primary" @click="openSelEqModal">
          新增
        </a-button>
        <a-button @click="onBatchDelEquipment">
          移除
        </a-button>
      </div>
      <a-table
        :columns="columns"
        :data-source="formData.iotEqList"
        bordered
        :pagination="false"
        :row-selection="isDetails ? null : rowSelection"
        row-key="iotEqId"
        :scroll="{ y: 380 }"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'iotEqList'">
            <a-tree-select
              v-model:value="record.ability"
              placeholder="请选择"
              style="width: 100%"
              :tree-data="treeData"
              tree-checkable
              :disabled="isDetails"
            />
          </template>

          <template v-if="column.dataIndex === 'Action'">
            <span class="table-handle">
              <a v-if="!isDetails" style="color: red" @click="delEquipment(record)">移除</a>
            </span>
          </template>
        </template>
      </a-table>
    </div>

    <SelectIotEquip ref="selectEquipRef" :callback="selectEquipData" />
  </a-form>
</template>

<script>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import ComHeader from '~/providers/components/comHeader/index.vue'
import SelectIotEquip from './selectIotEquip.vue'

function TempHumFormEntity() {
  this.showReallyTH = false
  this.minTemCon = null
  this.maxTemCon = null
  this.minTemperature = null
  this.maxTemperature = null
  this.openTemAuto = false
  this.minTemAuto = null
  this.maxTemAuto = null
  this.temResMin = 0
  this.temValueTake = 'AVG'
  this.minHumCon = null
  this.maxHumCon = null
  this.minHumidity = null
  this.maxHumidity = null
  this.openHumAuto = false
  this.minHumAuto = null
  this.maxHumAuto = null
  this.humResMin = 0
  this.humValueTake = 'AVG'
  this.humEqId = null
  this.temEqId = null
  this.labIotEq = {}

  this.iotEqList = []
}

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    align: 'center',
    width: '85px',
    customRender: ({ index }) => index + 1,
  },
  {
    title: '设备类别',
    dataIndex: 'type',
    width: '20%',
  },
  {
    title: '设备名称',
    dataIndex: 'name',
    width: '20%',
  },
  {
    title: '设备能力',
    dataIndex: 'iotEqList',
    scopedSlots: { customRender: 'iotEqList' },
    key: 'iotEqList',
  },
  {
    title: '操作',
    dataIndex: 'Action',
    align: 'center',
    scopedSlots: { customRender: 'Action' },
    width: '120px',
  },
]

const treeData = [
  {
    title: '全部',
    value: 'ALL',
    key: 'ALL',
    children: [
      {
        title: '采集能力',
        value: 'COLLECT',
        key: 'COLLECT',
        children: [
          {
            title: '温度采集',
            value: 'TEM_COL',
            key: 'TEM_COL',
          },
          {
            title: '湿度采集',
            value: 'HUM_COL',
            key: 'HUM_COL',
          },
        ],
      },
      {
        title: '控制能力',
        value: 'CONTROL',
        key: 'CONTROL',
        children: [
          {
            title: '温度设备开关',
            value: 'TEM_DIS',
            key: 'TEM_DIS',
          },
          {
            title: '加湿设备开关',
            value: 'HUM_ADD_DIS',
            key: 'HUM_ADD_DIS',
          },
          {
            title: '除湿设备开关',
            value: 'HUM_SUB_DIS',
            key: 'HUM_SUB_DIS',
          },
          {
            title: '温度+-',
            value: 'TEM_CON',
            key: 'TEM_CON',
          },
          {
            title: '湿度+',
            value: 'HUM_ADD',
            key: 'HUM_ADD',
          },
          {
            title: '湿度-',
            value: 'HUM_SUB',
            key: 'HUM_SUB',
          },
        ],
      },
    ],
  },
]

export default {
  components: {
    ComHeader,
    SelectIotEquip,
    QuestionCircleOutlined,
  },
  props: ['iotRoomId', 'isDetails', 'editData', 'usedByBatch'],
  emits: ['update:iotRoomId'],
  data() {
    return {
      columns,
      treeData,
      formData: new TempHumFormEntity(),
      humitureType: [
        { label: '实时（设备采集）', value: true },
        { label: '标准（手动设置）', value: false },
      ],
      selectedRowKeys: [],
      selectedRows: [],
      iotHouseList: [],
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        type: 'checkbox',
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
    valueTakeType() {
      return this.usedByBatch
        ? [
            { label: '平均值', value: 'AVG' },
            { label: '中位数', value: 'MED' },
          ]
        : [
            { label: '平均值', value: 'AVG' },
            { label: '中位数', value: 'MED' },
            { label: '选择设备', value: 'EQ' },
          ]
    },
    md() {
      return this.usedByBatch ? 24 : 12
    },
    xl() {
      return this.usedByBatch ? 24 : 8
    },
  },
  watch: {
    editData: {
      handler(data) {
        const formData = new TempHumFormEntity()

        if (data) {
          Object.keys(formData).forEach((key) => {
            formData[key] = data[key]
          })

          formData.iotEqList = data.iotEqList.map(i => ({
            ...i,
            ability: i.ability ? i.ability.split(',') : [],
          }))

          formData.labIotEq = data.labIotEq || {}
        }

        this.formData = formData
      },
      deep: true,
      immediate: true,
    },
    iotRoomId(id) {
      this.formData.labIotEq.iotEqId = id || ''
    },
  },
  created() {
    this.getIotHouseList()
  },
  methods: {
    filterOption(input, option) {
      return option.label.toLowerCase().includes(input.toLowerCase())
    },
    checkHasNum(val) {
      return val !== null && val !== undefined
    },
    checkTemHum() {
      const formData = this.formData

      // 判断温度可控范围
      if (this.checkHasNum(formData.minTemCon)) {
        if (this.checkHasNum(formData.maxTemCon)) {
          if (formData.minTemCon > formData.maxTemCon) {
            formData.minTemCon = formData.maxTemCon
          }

          if (this.checkHasNum(formData.minTemperature)) {
            if (formData.minTemperature > formData.maxTemCon) {
              formData.minTemperature = formData.maxTemCon
            }
          }
        }

        if (this.checkHasNum(formData.minTemperature)) {
          if (formData.minTemperature < formData.minTemCon) {
            formData.minTemperature = formData.minTemCon
          }
        }

        if (this.checkHasNum(formData.minTemAuto)) {
          if (formData.minTemAuto < formData.minTemCon) {
            formData.minTemAuto = formData.minTemCon
          }
        }
      }

      if (this.checkHasNum(formData.maxTemCon)) {
        if (this.checkHasNum(formData.minTemCon)) {
          if (formData.maxTemCon < formData.minTemCon) {
            formData.maxTemCon = formData.minTemCon
          }

          if (this.checkHasNum(formData.maxTemperature)) {
            if (formData.maxTemperature < formData.minTemCon) {
              formData.maxTemperature = formData.minTemCon
            }
          }
        }

        if (this.checkHasNum(formData.maxTemperature)) {
          if (formData.maxTemperature > formData.maxTemCon) {
            formData.maxTemperature = formData.maxTemCon
          }
        }

        if (this.checkHasNum(formData.maxTemAuto)) {
          if (formData.maxTemAuto > formData.maxTemCon) {
            formData.maxTemAuto = formData.maxTemCon
          }
        }
      }

      // 判断标准温度
      if (this.checkHasNum(formData.minTemperature)) {
        if (this.checkHasNum(formData.maxTemperature)) {
          if (formData.minTemperature > formData.maxTemperature) {
            formData.minTemperature = formData.maxTemperature
          }

          if (this.checkHasNum(formData.minTemAuto)) {
            if (formData.minTemAuto > formData.maxTemperature) {
              formData.minTemAuto = formData.maxTemperature
            }
          }
        }

        if (this.checkHasNum(formData.minTemAuto)) {
          if (formData.minTemAuto < formData.minTemperature) {
            formData.minTemAuto = formData.minTemperature
          }
        }
      }

      if (this.checkHasNum(formData.maxTemperature)) {
        if (this.checkHasNum(formData.minTemperature)) {
          if (formData.maxTemperature < formData.minTemperature) {
            formData.maxTemperature = formData.minTemperature
          }

          if (this.checkHasNum(formData.maxTemAuto)) {
            if (formData.maxTemAuto < formData.minTemperature) {
              formData.maxTemAuto = formData.minTemperature
            }
          }
        }

        if (this.checkHasNum(formData.maxTemAuto)) {
          if (formData.maxTemAuto > formData.maxTemperature) {
            formData.maxTemAuto = formData.maxTemperature
          }
        }
      }

      // 恒温
      if (this.checkHasNum(formData.maxTemAuto)) {
        if (this.checkHasNum(formData.minTemAuto)) {
          if (formData.maxTemAuto < formData.minTemAuto) {
            formData.maxTemAuto = formData.minTemAuto
          }
        }
      }

      if (this.checkHasNum(formData.minTemAuto)) {
        if (this.checkHasNum(formData.maxTemAuto)) {
          if (formData.minTemAuto > formData.maxTemAuto) {
            formData.minTemAuto = formData.maxTemAuto
          }
        }
      }

      // 判断湿度可控范围
      if (this.checkHasNum(formData.minHumCon)) {
        if (this.checkHasNum(formData.maxHumCon)) {
          if (formData.minHumCon > formData.maxHumCon) {
            formData.minHumCon = formData.maxHumCon
          }

          if (this.checkHasNum(formData.minHumidity)) {
            if (formData.minHumidity > formData.maxHumCon) {
              formData.minHumidity = formData.maxHumCon
            }
          }
        }

        if (this.checkHasNum(formData.minHumidity)) {
          if (formData.minHumidity < formData.minHumCon) {
            formData.minHumidity = formData.minHumCon
          }
        }

        if (this.checkHasNum(formData.minHumAuto)) {
          if (formData.minHumAuto < formData.minHumCon) {
            formData.minHumAuto = formData.minHumCon
          }
        }
      }

      if (this.checkHasNum(formData.maxHumCon)) {
        if (this.checkHasNum(formData.minHumCon)) {
          if (formData.maxHumCon < formData.minHumCon) {
            formData.maxHumCon = formData.minHumCon
          }

          if (this.checkHasNum(formData.maxHumidity)) {
            if (formData.maxHumidity < formData.minHumCon) {
              formData.maxHumidity = formData.minHumCon
            }
          }
        }

        if (this.checkHasNum(formData.maxHumidity)) {
          if (formData.maxHumidity > formData.maxHumCon) {
            formData.maxHumidity = formData.maxHumCon
          }
        }

        if (this.checkHasNum(formData.maxHumAuto)) {
          if (formData.maxHumAuto > formData.maxHumCon) {
            formData.maxHumAuto = formData.maxHumCon
          }
        }
      }

      // 判断标准湿度
      if (this.checkHasNum(formData.minHumidity)) {
        if (this.checkHasNum(formData.maxHumidity)) {
          if (formData.minHumidity > formData.maxHumidity) {
            formData.minHumidity = formData.maxHumidity
          }

          if (this.checkHasNum(formData.minHumAuto)) {
            if (formData.minHumAuto > formData.maxHumidity) {
              formData.minHumAuto = formData.maxHumidity
            }
          }
        }

        if (this.checkHasNum(formData.minHumAuto)) {
          if (formData.minHumAuto < formData.minHumidity) {
            formData.minHumAuto = formData.minHumidity
          }
        }
      }

      if (this.checkHasNum(formData.maxHumidity)) {
        if (this.checkHasNum(formData.minHumidity)) {
          if (formData.maxHumidity < formData.minHumidity) {
            formData.maxHumidity = formData.minHumidity
          }

          if (this.checkHasNum(formData.maxHumAuto)) {
            if (formData.maxHumAuto < formData.minHumidity) {
              formData.maxHumAuto = formData.minHumidity
            }
          }
        }

        if (this.checkHasNum(formData.maxHumAuto)) {
          if (formData.maxHumAuto > formData.maxHumidity) {
            formData.maxHumAuto = formData.maxHumidity
          }
        }
      }

      if (this.checkHasNum(formData.maxHumAuto)) {
        if (this.checkHasNum(formData.minHumAuto)) {
          if (formData.maxHumAuto < formData.minHumAuto) {
            formData.maxHumAuto = formData.minHumAuto
          }
        }
      }

      if (this.checkHasNum(formData.minHumAuto)) {
        if (this.checkHasNum(formData.maxHumAuto)) {
          if (formData.minHumAuto > formData.maxHumAuto) {
            formData.minHumAuto = formData.maxHumAuto
          }
        }
      }
    },
    changeLabIotEqId() {
      const labIotEq = this.formData.labIotEq
      const item = this.iotHouseList.find(i => i.id === labIotEq.iotEqId)
      if (item) {
        this.formData.labIotEq = {
          iotEqId: item.id,
          name: item.label,
        }
        this.$emit('update:iotRoomId', item.id)
      }
      this.formData.iotEqList = []
    },
    getIotHouseList() {
      window.$oAjax({
        url: 'rest/eq/iots/env',
      }).then((res) => {
        const list = res.data || []
        this.iotHouseList = list.map(d => ({
          label: d.name,
          value: d.id.id,
          id: d.id.id,
          data: d,
        }))
      })
    },
    getFormData() {
      return {
        ...this.formData,
        iotEqList: this.formData.iotEqList.map(i => ({
          ...i,
          ability: i.ability.join(','),
        })),
      }
    },
    openSelEqModal() {
      if (!this.formData.labIotEq.iotEqId) {
        window.$oAntdModal.warning({
          title: '提示',
          content: '请先选择物联网系统房间！',
        })
        return
      }
      this.$refs.selectEquipRef.showModal(
        'checkbox',
        undefined,
        this.formData.labIotEq.iotEqId,
      )
    },
    selectEquipData(d) {
      const iotEqList = this.formData.iotEqList

      d.forEach((it) => {
        const flag = iotEqList.some(rawIt => rawIt.iotEqId == it.to.id)

        if (flag) {
          message.warn(`已存在:${it.toName}`)
        }
        else {
          this.formData.iotEqList.push({
            iotEqId: it.to.id,
            name: it.toName,
            type: it.type,
            ability: [],
          })
        }
      })
    },
    onBatchDelEquipment() {
      if (!this.selectedRowKeys.length) {
        window.$oAntdMessage.warn('请勾选要移除的设备！')
        return
      }

      this.formData.iotEqList = this.formData.iotEqList.filter(
        i => !this.selectedRowKeys.includes(i.iotEqId),
      )
    },
    delEquipment(row) {
      this.formData.iotEqList = this.formData.iotEqList.filter(
        i => i.iotEqId !== row.iotEqId,
      )
    },
  },
}
</script>

<style lang="less" scoped>
.ant-form-item {
  min-height: 30px;
}
.required label::before {
  content: '*';
  color: red;
}
.humiture {
  display: inline-flex;
  align-items: center;
  .anticon {
    margin-left: 2px;
    color: #1890ff;
    cursor: pointer;
  }
}
.humiture-hint {
  font-size: 12px;
  color: #999;
  line-height: 14px;
}
</style>
