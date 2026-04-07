<template>
  <div>
    <ht-modal
      title="详情"
      centered
      :open="visible"
      :footer="false"
      width="60%"
      @cancel="handleCancel"
    >
      <div>
        <a-row
          :gutter="20"
          style="padding: 10px 0; border-bottom: 1px dashed #ccc"
        >
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
        <a-row
          :gutter="20"
          style="padding: 10px 0; border-bottom: 1px dashed #ccc"
        >
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
              <a-col v-else-if="item.field == 'attachments'" :span="14">
                <p v-for="(acitem, i) in dataSource[item.field]" :key="i">
                  <a
                    :href="acitem.realpath"
                    target="_blank"
                    rel="noopener noreferrer"
                  >{{ acitem.attachmenttitle }}</a>
                </p>
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
          style="padding: 10px 0; border-bottom: 1px dashed #ccc"
        >
          <a-col
            v-for="(item2, index2) in fields[item.operationType]"
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
              <a-col v-else-if="item2.field == 'equipmentStatus'" :span="14">
                {{
                  item[item2.field]
                    ? statusData.find(
                      (status) => status.typecode == item[item2.field],
                    ).typename
                    : ''
                }}
              </a-col>
              <a-col v-else-if="item2.field == 'createName'" :span="14">
                {{ item[item2.field] }}
              </a-col>
              <a-col
                v-else-if="item2.name == '确认结果' || item2.name == '操作'"
                :span="14"
              >
                {{ item2.field }}
              </a-col>
              <a-col v-else-if="item2.field == 'attachments'" :span="14">
                <p v-for="(acitem, i) in item[item2.field]" :key="i">
                  <a
                    :href="acitem.realpath"
                    target="_blank"
                    rel="noopener noreferrer"
                  >{{ acitem.attachmenttitle }}</a>
                </p>
              </a-col>
              <a-col v-else :span="14">
                {{ item[item2.field] }}
              </a-col>
            </a-row>
          </a-col>
        </a-row>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import qs from 'qs'
import { formatTime } from '~/providers/common/utils'

export default {
  props: ['egressStatusData'],
  data() {
    return {
      visible: false,
      formLayout: 'horizontal',

      base: [
        // { name:"借取日期", field:"borrowTime" },  外出
        { name: '借用人', field: 'borrowUser' },
        { name: '借取操作人', field: 'createName' },
        { name: '外出前状态', field: 'beforeStatus' },
        { name: '关联任务', field: 'testTaskSn' },
        { name: '关联工程项目', field: 'projectNames' },
        { name: '项目编号', field: 'projectCodes' },
        { name: '外出时间', field: 'egressTime' },
        { name: '预还时间', field: 'expectReturnTime' },
        { name: '备注', field: 'remark' },
        { name: '附件材料', field: 'attachments' },
      ],
      equipmentVo: [
        { name: '设备名称', field: 'name' },
        { name: '设备编号', field: 'equipmentSn' },
        { name: '档案编号', field: 'archiveSn' },
        { name: '资产编号', field: 'assetSn' },
        { name: '设备状态', field: 'status' },
        { name: '规格型号', field: 'standard' },
        { name: '量程', field: 'eqRange' },
        { name: '精度', field: 'accuracy' },
        { name: '下次检校日期', field: 'nextCheckDate' },
      ],
      fields: {
        // operationType
        20: [
          /** "20" 外出确认 "30" 外出拒绝 */
          { name: '外出确认日期', field: 'operationTime' },
          { name: '外出确认人', field: 'operator' },
          { name: '确认结果', field: '通过' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
        30: [
          /** "20" 外出确认 "30" 外出拒绝 */
          { name: '外出确认日期', field: 'operationTime' },
          { name: '外出确认人', field: 'operator' },
          { name: '确认结果', field: '拒绝' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
        40: [
          /** "40" 归还 */
          { name: '归还时间', field: 'operationTime' },
          { name: '归还人', field: 'operator' },
          { name: '归还操作人', field: 'createName' },
          { name: '归还时设备状态', field: 'equipmentStatus' },
          { name: '附件材料', field: 'attachments' },
        ],
        50: [
          /** "50" 归还确认 "60" 归还拒绝 */
          { name: '归还确认时间', field: 'operationTime' },
          { name: '归还确认人', field: 'operator' },
          { name: '确认结果', field: '通过' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
        60: [
          /** "50" 归还确认 "60" 归还拒绝 */
          { name: '归还确认时间', field: 'operationTime' },
          { name: '归还确认人', field: 'operator' },
          { name: '确认结果', field: '拒绝' },
          { name: '备注', field: 'remark' },
          { name: '附件材料', field: 'attachments' },
        ],
        70: [
          /** "70" 撤回 */
          { name: '撤回时间', field: 'operationTime' },
          { name: '撤回人', field: 'operator' },
          { name: '操作', field: '撤回' },
          { name: '备注', field: 'remark' },
        ],
      },
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
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.eqEgressList.status}`,
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
      window.$oAjax({
        method: 'GET',
        url: `${window.$oApi.eqEgressList.detail}`,
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
