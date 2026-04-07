<template>
  <div>
    <ComHeader>基础设置</ComHeader>
    <a-form layout="inline" :label-col="{ style: { width: '120px' } }">
      <a-form-item label="物联网系统房间：">
        <a-select
          v-model:value="selIotRoomId"
          style="width: 300px;"
          show-search
          placeholder="请选择物联网系统房间"
          :disabled="isDetails"
          :options="iotHouseList"
          :filter-option="filterOption"
        />
      </a-form-item>
    </a-form>

    <ComHeader class="mt-3">
      设备列表
    </ComHeader>
    <div v-if="!isDetails" class="mb-2">
      <a-button type="primary" @click="openSelEqModal">
        新增
      </a-button>
      <a-button @click="onBatchDelEquipment">
        移除
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      bordered
      :pagination="false"
      :row-selection="isDetails ? null : rowSelection"
      row-key="iotEqId"
      :scroll="{ y: 380 }"
    >
      <template #bodyCell="{ column, index }">
        <template v-if="column.dataIndex === 'action'">
          <a-button v-if="!isDetails" type="link" danger @click="delEquipment(index)">
            移除
          </a-button>
        </template>
      </template>
    </a-table>

    <SelectIotEquip ref="selectEquipRef" :callback="selectEquipData" />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import ComHeader from '~/providers/components/comHeader/index.vue'
import { IlisApiHelper } from '~/utils/IlisApiHelper'
import SelectIotEquip from './selectIotEquip.vue'

const columns = [
  { title: '调养箱名称', dataIndex: 'name' },
  { title: '调养箱编号', dataIndex: 'equipmentSn' },
  { title: '类型', dataIndex: 'type' },
  { title: '操作', dataIndex: 'action' },
]

export default {
  components: {
    ComHeader,
    SelectIotEquip,
  },
  props: ['iotRoomId', 'isDetails', 'editData'],
  emits: ['update:iotRoomId'],
  data() {
    return {
      columns,
      selIotRoomId: this.iotRoomId,
      iotHouseList: [],
      dataSource: [],
      selectedRowKeys: [],
      selectedRows: [],
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
  },
  watch: {
    editData(data) {
      if (!data)
        return

      this.dataSource = data.bookIotEqList || []
    },
    iotRoomId(newVal) {
      this.selIotRoomId = newVal || undefined
    },
    selIotRoomId(val) {
      this.$emit('update:iotRoomId', val)
    },
  },
  created() {
    this.getIotHouseList()
  },
  methods: {
    filterOption(input, option) {
      return option.label.toLowerCase().includes(input.toLowerCase())
    },
    async getIotHouseList() {
      const { data } = await IlisApiHelper.get('rest/eq/iots/env')
      const list = data || []
      this.iotHouseList = list.map(d => ({
        label: d.name,
        value: d.id.id,
        id: d.id.id,
        data: d,
      }))
    },
    async openSelEqModal() {
      if (!this.selIotRoomId) {
        message.warning('请先选择物联网系统房间！')
        return
      }
      this.$refs.selectEquipRef.showModal(
        'checkbox',
        undefined,
        this.selIotRoomId,
        2,
      )
    },
    selectEquipData(d) {
      const iotEqList = this.dataSource.map(d => d.iotEqId)
      const repeatEq = []

      d.forEach((it) => {
        const flag = iotEqList.includes(it.to.id)

        if (flag) {
          repeatEq.push(it.toName)
        }
        else {
          this.dataSource.push({
            iotEqId: it.to.id,
            name: it.toName,
            type: it.type,
            equipmentSn: it.sn,
            ability: [],
          })
        }
      })

      if (repeatEq.length > 0) {
        message.warn(`已存在:${repeatEq.toString()}`)
      }
    },
    onBatchDelEquipment() {
      if (this.selectedRowKeys.length === 0) {
        message.warning('请先选择要删除的设备！')
        return
      }
      this.dataSource = this.dataSource.filter(item => !this.selectedRowKeys.includes(item.iotEqId))
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    delEquipment(ind) {
      this.dataSource.splice(ind, 1)
    },
    getFormData() {
      return {
        bookIotEqList: this.dataSource.map(i => ({
          ...i,
          ability: i.ability ? i.ability.join(',') : '',
        })),
      }
    },
  },
}
</script>

<style lang="less" scoped>

</style>
