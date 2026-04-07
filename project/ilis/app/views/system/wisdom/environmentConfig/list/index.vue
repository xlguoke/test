<template>
  <a-spin :spinning="spinning">
    <div class="spin-content">
      <a-table
        :columns="columns"
        :data-source="data"
        bordered
        :pagination="false"
        row-key="id"
        :row-class-name="rowClassName"
        :scroll="{ y: tableHeight }"
      >
        <template #headerCell="{ column }">
          <template v-if="column.dataIndex === 'temperature'">
            <span>
              温度要求(°C)
              <a-tooltip
                placement="top"
                title="若无要求则不填，若只有上限或下限则只填写上限或下限"
              >
                <QuestionCircleOutlined
                  style="
                    vertical-align: text-bottom;
                    margin-left: 5px;
                    color: var(--colorPrimary);
                    cursor: pointer;
                  "
                />
              </a-tooltip>
            </span>
          </template>
          <template v-if="column.dataIndex === 'humidity'">
            <span>
              湿度要求(%RH)
              <a-tooltip
                placement="top"
                title="若无要求则不填，若只有上限或下限则只填写上限或下限"
              >
                <QuestionCircleOutlined
                  style="
                    vertical-align: text-bottom;
                    margin-left: 5px;
                    color: var(--colorPrimary);
                    cursor: pointer;
                  "
                />
              </a-tooltip>
            </span>
          </template>
        </template>

        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'temperature'">
            <template v-if="record.editable">
              <a-input
                style="margin: -5px 0; width: 30%"
                :value="record.minTemperature"
                @change="
                  (e) => handleChange(e.target.value, record.id, 'minTemperature')
                "
              />
              -
              <a-input
                style="margin: -5px 0; width: 30%"
                :value="record.maxTemperature"
                @change="
                  (e) => handleChange(e.target.value, record.id, 'maxTemperature')
                "
              />
            </template>
            <template v-else-if="record.minTemperature && !record.maxTemperature">
              ≥{{ record.minTemperature }}
            </template>
            <template v-else-if="!record.minTemperature && record.maxTemperature">
              ≤{{ record.maxTemperature }}
            </template>
            <template v-else-if="record.minTemperature && record.maxTemperature">
              {{ record.minTemperature }} - {{ record.maxTemperature }}
            </template>
            <template v-else>
              /
            </template>
          </template>

          <template v-if="column.dataIndex === 'humidity'">
            <template v-if="record.editable">
              <a-input
                style="margin: -5px 0; width: 30%"
                :value="record.minHumidity"
                @change="
                  (e) => handleChange(e.target.value, record.id, 'minHumidity')
                "
              />
              -
              <a-input
                style="margin: -5px 0; width: 30%"
                :value="record.maxHumidity"
                @change="
                  (e) => handleChange(e.target.value, record.id, 'maxHumidity')
                "
              />
            </template>

            <template v-else-if="record.minHumidity && !record.maxHumidity">
              ≥{{ record.minHumidity }}
            </template>
            <template v-else-if="!record.minHumidity && record.maxHumidity">
              ≤{{ record.maxHumidity }}
            </template>
            <template v-else-if="record.minHumidity && record.maxHumidity">
              {{ record.minHumidity }} - {{ record.maxHumidity }}
            </template>
            <template v-else>
              /
            </template>
          </template>

          <template v-if="column.dataIndex === 'deviceKeys'">
            <span v-if="record.editable">
              <span>{{ record.deviceKeysStr }}</span>
              <PlusCircleOutlined
                v-if="editingKey !== ''"
                style="padding-left: 5px"
                title="选择"
                @click.stop="
                  inspectTimesBtn(record.deviceKeysStr, record.id, 'deviceKeys')
                "
              />
            </span>
            <span v-else>{{ record.deviceKeysStr }}</span>
          </template>

          <template v-if="['name', 'remark'].includes(column.dataIndex)">
            <div>
              <a-input
                v-if="record.editable"
                style="margin: -5px 0"
                :value="text"
                @change="(e) => nameRmkChange(e.target.value, record.id, col)"
              />
              <template v-else>
                {{ text }}
              </template>
            </div>
          </template>

          <template v-if="column.dataIndex === 'operation'">
            <div class="editable-row-operations">
              <template v-if="record.editable">
                <a-space>
                  <a-button type="link" @click="() => saveRow(record.id)">
                    保存
                  </a-button>
                  <a-popconfirm
                    title="确定要取消吗?"
                    @confirm="() => cancelRow(record.id)"
                  >
                    <a-button type="link">
                      取消
                    </a-button>
                  </a-popconfirm>
                </a-space>
              </template>
              <template v-else>
                <a-button type="link" :disabled="editingKey !== ''" @click="() => editRow(record.id)">
                  编辑
                </a-button>
              </template>
            </div>
          </template>
        </template>
      </a-table>
      <ManyDateStr ref="ManyDateStr" :callback="getDate" />
    </div>
  </a-spin>
</template>

<script>
import { PlusCircleOutlined, QuestionCircleOutlined } from '@ant-design/icons-vue'
import ManyDateStr from './components/manyDateStr.vue'

const columns = [
  {
    title: '功能室名称',
    dataIndex: 'name',
    width: '17%',
  },
  {
    dataIndex: 'temperature',
    width: '17%',
  },
  {
    dataIndex: 'humidity',
    width: '17%',
  },
  {
    title: '采集设备钥匙',
    dataIndex: 'deviceKeys',
    width: '17%',
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: '17%',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '15%',
  },
]

export default {
  components: { ManyDateStr, PlusCircleOutlined, QuestionCircleOutlined },
  data() {
    return {
      spinning: false,
      tableHeight: document.body.clientHeight - 130,
      data: [],
      cacheData: [],
      editingKey: '',
      columns,
      currentRow: null, // 暂时保存当前行信息 id
    }
  },
  created() {
    this.getData()
  },
  mounted() {
    window.$oNextTick(() => {
      const height = document.body.clientHeight
      const tableHeader = document.querySelector('.spin-content .ant-table-header').clientHeight
      this.tableHeight = height - 30 - tableHeader
    })
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.laboratory.tableUrl,
        data: window.$oQs.stringify({}),
      }).then((res) => {
        this.data = []
        if (res.rows && res.rows.length > 0) {
          this.data = res.rows.map((item) => {
            let deviceKeysStr = ''
            const deviceKeysArr = []
            if (item.deviceKeys && item.deviceKeys.length > 0) {
              // 10: 温湿度设备;20: 数据采集设备
              // eslint-disable-next-line array-callback-return
              item.deviceKeys.map((itemA) => {
                const labTypeStr
                  = `${itemA.labType}` === '10' ? '温湿度设备' : '数据采集设备'
                const str = `${itemA.deviceKey}: ${labTypeStr}`
                deviceKeysArr.push(str)
              })
              deviceKeysStr = deviceKeysArr.join(';')
            }
            item.deviceKeysStr = deviceKeysStr
            return item
          })
        }
        this.cacheData = JSON.parse(JSON.stringify(this.data))
        this.spinning = false
      })
    },
    nameRmkChange(value, did, column) {
      const newData = [...this.data]
      const target = newData.filter(item => did === item.id)[0]
      if (target) {
        target[column] = value
        this.data = newData
      }
    },
    handleChange(value, did, valueName) {
      const newData = [...this.data]
      const target = newData.filter(item => did === item.id)[0]
      if (target) {
        target[valueName] = value
        this.data = newData
      }
    },
    editRow(did) {
      const newData = [...this.data]
      const target = newData.filter(item => did === item.id)[0]
      if (target) {
        target.editable = true
        this.data = newData
      }
      this.editingKey = did
    },
    deleteRow(did, key) {
      if (did) {
        this.spinning = true
        window.$oAjax({
          url: window.$oApi.laboratory.delUrl,
          data: window.$oQs.stringify({ id: did }),
          method: 'post',
        }).then((res) => {
          if (res.success) {
            this.getData()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.spinning = false
        })
      }
      else {
        const newData = [...this.data]
        this.data = newData.filter(item => item.key !== key)
      }
    },
    saveRow(did) {
      const newData = [...this.data]
      const target = newData.filter(item => did === item.id)[0]
      delete target.deviceKeys
      const deviceKeysArr = target.deviceKeysStr.split(';')
      const labs = []
      // eslint-disable-next-line array-callback-return
      deviceKeysArr.map((item) => {
        const newItem = item.split(': ')
        labs.push({
          deviceKey: newItem[0],
          labType: newItem[1] === '温湿度设备' ? '10' : '20',
        })
      })
      const data = {
        ...target,
        name: target.name,
        minTemperature: target.minTemperature,
        maxTemperature: target.maxTemperature,
        minHumidity: target.minHumidity,
        maxHumidity: target.maxHumidity,
        remark: target.remark,
      }
      // eslint-disable-next-line array-callback-return
      labs.map((item, index) => {
        data[`labs[${index}].deviceKey`] = item.deviceKey
        data[`labs[${index}].labType`] = item.labType
      })
      delete data.deviceKeysStr
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.laboratory.saveUrl,
        method: 'post',
        data: window.$oQs.stringify(data),
      }).then((res) => {
        if (res.success) {
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.editingKey = ''
        this.spinning = false
      })
    },
    cancelRow(did) {
      const newData = [...this.data]
      const target = newData.filter(item => did === item.id)[0]
      if (target) {
        Object.assign(
          target,
          this.cacheData.filter(item => did === item.id)[0],
        )
        delete target.editable
        this.data = newData
      }
      this.editingKey = ''
    },
    handleAdd() {
      const newData = {
        key: this.data.length,
        name: '',
        minTemperature: '',
        maxTemperature: '',
        minHumidity: '',
        maxHumidity: '',
        remark: '',
        deviceKeys: '',
      }
      this.data = [...this.data, newData]
    },
    // 选择 期间核查时间
    inspectTimesBtn(value, id, column) {
      this.currentRow = { id, column }
      this.$refs.ManyDateStr.showModal(value, id)
    },
    getDate(value) {
      this.newDataSource(value)
    },
    newDataSource(value) {
      const newData = [...this.data]
      const target = newData.filter(item => this.currentRow.id === item.id)[0]
      if (target) {
        target[this.currentRow.column] = value.split(';')
        target[`${this.currentRow.column}Str`] = value
        this.data = newData
      }
      this.currentRow = null
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
