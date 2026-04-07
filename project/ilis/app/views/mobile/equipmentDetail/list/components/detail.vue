<!-- eslint-disable vue/eqeqeq -->
<template>
  <div>
    <a-modal
      title="详情"
      :open="visible"
      :footer="false"
      width="600px"
      @cancel="handleCancel"
    >
      <div>
        <a-row :gutter="20">
          <a-col v-for="(item, index) in equipmentVo" :key="index" :span="12">
            <a-row :gutter="4">
              <a-col :span="10" style="text-align: right">
                {{ item.name }}：
              </a-col>
              <a-col :span="14">
                {{ dataSource.equipmentVo[item.field] }}
              </a-col>
            </a-row>
          </a-col>
        </a-row>

        <a-row :gutter="20" style="padding-top: 15px">
          <a-col v-for="(item, index) in base" :key="index" :span="12">
            <a-row :gutter="4">
              <a-col :span="10" style="text-align: right">
                {{ item.name }}：
              </a-col>
              <a-col
                v-if="
                  item.field == 'borrowTime'
                    || item.field == 'egressTime'
                    || item.field == 'expectReturnTime'
                "
                :span="14"
              >
                {{
                  dataSource[item.field]
                    ? formatTime(dataSource[item.field], 'YYYY-MM-DD HH:mm:ss')
                    : ''
                }}
              </a-col>
              <a-col v-else-if="item.field == 'beforeStatus'" :span="14">
                {{
                  dataSource[item.field]
                    ? statusData.find(
                      (status) => status.typecode == dataSource[item.field],
                    ).typename
                    : ''
                }}
              </a-col>
              <a-col v-else :span="14">
                {{ dataSource[item.field] }}
              </a-col>
            </a-row>
          </a-col>
        </a-row>

        <a-row
          v-for="(item, index) in dataSource.operationVos"
          :key="index"
          :gutter="20"
          style="padding-top: 15px"
        >
          <a-col
            v-for="(item2, index2) in fields[index]"
            :key="index2"
            :span="12"
          >
            <a-row :gutter="4">
              <a-col :span="10" style="text-align: right">
                {{ item2.name }}：
              </a-col>
              <a-col v-if="item2.field == 'operationTime'" :span="14">
                {{
                  item[item2.field]
                    ? formatTime(item[item2.field], 'YYYY-MM-DD HH:mm:ss')
                    : ''
                }}
              </a-col>
              <a-col v-else-if="item2.field == 'operationType'" :span="14">
                {{
                  item[item2.field]
                    ? egressStatusData.find(
                      (status) => status.value == item[item2.field],
                    ).name
                    : ''
                }}
              </a-col>
              <a-col v-else :span="14">
                {{ item[item2.field] }}
              </a-col>
            </a-row>
          </a-col>
        </a-row>
      </div>
    </a-modal>
  </div>
</template>

<script>
import qs from 'qs'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'
import { formatTime } from '~/providers-moblie/common/utils'

export default {
  props: ['egressStatusData'],
  data() {
    return {
      visible: false,
      formLayout: 'horizontal',
      base: [
        { name: '借取日期', field: 'borrowTime' },
        { name: '借取人', field: 'borrowUser' },
        { name: '外出前状态', field: 'beforeStatus' },
        { name: '关联任务', field: 'testTaskSn' },
        { name: '外出时间', field: 'egressTime' },
        { name: '预还时间', field: 'expectReturnTime' },
      ],
      equipmentVo: [
        { name: '设备名称', field: 'name' },
        { name: '档案编号', field: 'archiveSn' },
        { name: '资产编号', field: 'assetSn' },
        { name: '设备状态', field: 'status' },
        { name: '规格型号', field: 'standard' },
        { name: '量程', field: 'eqRange' },
        { name: '精度', field: 'accuracy' },
        { name: '下次检校日期', field: 'nextCheckDate' },
      ],
      fields: [
        [
          { name: '外出确认日期', field: 'operationTime' },
          { name: '外出确认人', field: 'operator' },
          { name: '备注', field: 'remark' },
        ],
        [
          { name: '归还时间', field: 'operationTime' },
          { name: '归还人', field: 'operator' },
          { name: '归还时设备状态', field: 'operationType' },
        ],
        [
          { name: '归还确认时间', field: 'operationTime' },
          { name: '归还确认人', field: 'operator' },
          { name: '备注', field: 'remark' },
        ],
      ],
      dataSource: {
        equipmentVo: {},
        operationVos: [],
      },
      formatTime,
      statusData: [],
    }
  },
  created() {
    this.getStatus()
  },
  methods: {
    getStatus() {
      mAjax({
        method: 'POST',
        url: `${mApi.eqEgressList.status}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: '402882cd5f998a58015f9998ff71001b',
        }),
      }).then((res) => {
        if (res && res.success) {
          this.statusData = res.obj
        }
      })
    },
    showModal(id) {
      mAjax({
        method: 'GET',
        url: `${mApi.eqEgressList.detail}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        params: {
          id,
        },
      }).then((res) => {
        if (res.code && res.code === 20000) {
          this.dataSource = res.data
        }
      })
      this.visible = true
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style></style>
