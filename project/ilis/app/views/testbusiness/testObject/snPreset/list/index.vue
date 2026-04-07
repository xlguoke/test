<template>
  <div class="disqualification">
    <p class="text-right p-2 text-sm mb-0">
      <span class="icon_dot" style="margin-right: 5px;"></span>代表编号为预设编号，还未被正式使用
    </p>
    <a-table
      :columns="columns"
      :data-source="data"
      :loading="loading"
      bordered
      :scroll="scroll"
      :pagination="false"
      row-key="id"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'taskSns'">
          <p v-for="(item, index) in text" :key="index" class="code_box">
            <a-tag
              style="margin: 3px; cursor: pointer"
              class="text-sm"
              @click="clickCode(item)"
            >
              <span v-if="!item.boUsed" class="icon_dot"></span>
              {{ item.presetSn }}
            </a-tag>
            <span v-show="item.edit">
              <CaretUpOutlined
                class="icon_font"
                @click="codeSort('order', text, index)"
              />
              <CaretDownOutlined
                class="icon_font"
                @click="codeSort('sq', text, index)"
              />
              <EditOutlined
                v-if="!item.boUsed"
                class="icon_font"
                style="font-size: 12px"
                @click="editCode(item)"
              />
              <CloseOutlined
                v-if="!item.boUsed"
                class="icon_font"
                style="font-size: 12px"
                @click="delPresetSn(item.id)"
              />
            </span>
          </p>
          <a-tag
            style="border-style: dashed; margin: 3px;cursor: pointer;"
            @click="handleInputConfirm(record.testObjectId, 1)"
          >
            <PlusOutlined />添加
          </a-tag>
        </template>

        <template v-if="column.dataIndex === 'recordSns'">
          <p v-for="(item, index) in text" :key="index" class="code_box">
            <a-tag
              style="margin: 3px; cursor: pointer"
              class="text-sm"
              @click="clickCode(item)"
            >
              <span v-if="!item.boUsed" class="icon_dot"></span>
              {{ item.presetSn }}
            </a-tag>
            <span v-show="item.edit">
              <CaretUpOutlined
                class="icon_font"
                @click="codeSort('order', text, index)"
              />
              <CaretDownOutlined
                class="icon_font"
                @click="codeSort('sq', text, index)"
              />
              <EditOutlined
                v-if="!item.boUsed"
                class="icon_font"
                style="font-size: 12px"
                @click="editCode(item)"
              />
              <CloseOutlined
                v-if="!item.boUsed"
                class="icon_font"
                style="font-size: 12px"
                @click="delPresetSn(item.id)"
              />
            </span>
          </p>

          <a-tag
            style="border-style: dashed; margin: 3px;cursor: pointer;"
            @click="handleInputConfirm(record.testObjectId, 2)"
          >
            <PlusOutlined />添加
          </a-tag>
        </template>

        <template v-if="column.dataIndex === 'reportSns'">
          <p v-for="(item, index) in text" :key="index" class="code_box">
            <a-tag
              style="margin: 3px; cursor: pointer"
              class="text-sm"
              @click="clickCode(item)"
            >
              <span v-if="!item.boUsed" class="icon_dot"></span>
              {{ item.presetSn }}
            </a-tag>
            <span v-show="item.edit">
              <CaretUpOutlined
                class="icon_font"
                @click="codeSort('order', text, index)"
              />
              <CaretDownOutlined
                class="icon_font"
                @click="codeSort('sq', text, index)"
              />
              <EditOutlined
                v-if="!item.boUsed"
                class="icon_font"
                style="font-size: 12px"
                @click="editCode(item)"
              />
              <CloseOutlined
                v-if="!item.boUsed"
                class="icon_font"
                style="font-size: 12px"
                @click="delPresetSn(item.id)"
              />
            </span>
          </p>

          <a-tag
            style="border-style: dashed; margin: 3px;cursor: pointer;"
            @click="handleInputConfirm(record.testObjectId, 3)"
          >
            <PlusOutlined />添加
          </a-tag>
        </template>
      </template>
    </a-table>

    <ht-modal
      title="修改编号"
      width="350px"
      :open="editCodeVisible"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-input
        v-model:value="editCodeObj.presetSn"
        placeholder="请输入编号"
        size="small"
      />

      <SnRepeatHint :datas="repeatDatas" />
    </ht-modal>
  </div>
</template>

<script>
import { CaretDownOutlined, CaretUpOutlined, CloseOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { getQueryVariable } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import { useIndustryStore } from '~/store/industryStore'
import SnRepeatHint from '~/views/system/sn/snModification/snModification/components/SnRepeatHint.vue'

export default {
  components: {
    SnRepeatHint,
    CaretDownOutlined,
    CaretUpOutlined,
    CloseOutlined,
    EditOutlined,
    PlusOutlined,
  },
  data() {
    return {
      editCodeObj: {},
      editCodeVisible: false,
      confirmLoading: false,
      // 编号预设
      consignId: getQueryVariable('consignId') || '',
      rootUrl,
      data: [],
      repeatDatas: [],
      loading: false,
      scroll: {},
      columns: this.getColumns(),
    }
  },
  created() {
    this.getData()
  },
  methods: {
    clickCode(item) {
      this.resetEdit()
      item.edit = true
    },
    editCode(item) {
      this.repeatDatas = []
      this.editCodeVisible = true
      this.editCodeObj = JSON.parse(JSON.stringify(item))
    },
    codeSort(type, arr, i) {
      const aid = arr[i].id
      let bid = ''
      if (type == 'order') {
        if (i == 0) {
          return
        }
        bid = arr[i - 1].id
      }
      else {
        if (i == arr.length - 1) {
          return
        }
        bid = arr[i + 1].id
      }
      window.$oAjax({
        method: 'put',
        url: `rest/snPreset/flip?a=${aid}&b=${bid}`,
      }).then(() => {
        this.getData()
      })
    },
    handleOk() {
      if (!this.editCodeObj.presetSn) {
        window.$oAntdMessage.error('编号不能为空')
        return
      }
      this.confirmLoading = true
      this.repeatDatas = []
      window.$oAjax({
        method: 'POST',
        url: `/rest/snHistoryController/editSn`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
        data: {
          modelId: this.editCodeObj.modelId,
          objectId: this.editCodeObj.id,
          realValue: this.editCodeObj.presetSn,
          snType: this.editCodeObj.codeType,
        },
      }).then((res) => {
        this.confirmLoading = false
        if (res.code == '20000') {
          this.editCodeVisible = false
          window.$oAntdMessage.success(`操作成功`)
          this.getData()
        }
        else if (res.code === -10000) {
          this.repeatDatas = res.data
        }
        else {
          window.$oAntdMessage.error(res.message || res.msg || '修改失败！')
        }
      })
    },
    handleCancel() {
      this.editCodeVisible = false
    },
    getTopWindow() {
      try {
        if (window.top && window.top.location.href) {
          return window.top
        }
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {
        return window
      }

      return window
    },
    getColumns() {
      const { term } = useIndustryStore()

      const configColumns = [
        { title: term('样品编号'), dataIndex: 'testObjectCode', width: '10%' },
        { title: term('样品名称'), dataIndex: 'testSampleDisplayName', width: '10%' },
        { title: '规格型号', dataIndex: 'standard', width: '10%' },
      ]
      const config = this.getTopWindow().numberPresetConfig || 'taskRecordReport'
      // 生成任务编号和记录编号
      if (config == 'taskAndRecord') {
        configColumns.push({
          title: '任务编号（预设）',
          dataIndex: 'taskSns',
          width: '25%',
          scopedSlots: { customRender: 'taskSns' },
        })
        configColumns.push({
          title: '记录编号（预设）',
          dataIndex: 'recordSns',
          width: '25%',
          scopedSlots: { customRender: 'recordSns' },
        })
        // 生成任务/记录和报告编号
      }
      else if (config == 'taskRecordReport') {
        configColumns.push({
          title: '任务编号（预设）',
          dataIndex: 'taskSns',
          width: '23%',
          scopedSlots: { customRender: 'taskSns' },
        })
        configColumns.push({
          title: '记录编号（预设）',
          dataIndex: 'recordSns',
          width: '23%',
          scopedSlots: { customRender: 'recordSns' },
        })
        configColumns.push({
          title: '报告编号（预设）',
          dataIndex: 'reportSns',
          width: '23%',
          scopedSlots: { customRender: 'reportSns' },
        })
      }
      else {
        message.error('获取系统控制参数:编号预设模式错误')
      }
      return configColumns
    },
    handleInputConfirm(id, type) {
      window.$oAjax({
        method: 'get',
        url: `rest/snPreset/createNew?testObjectId=${id}&presetSnType=${type}`,
      }).then((res) => {
        if (res.code === 20000) {
          this.getData()
        }
        else {
          message.error(res.message || res.msg)
        }
      })
    },
    delPresetSn(id) {
      event.preventDefault()
      Modal.confirm({
        title: '提示',
        content: `确定删除`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oAjax({
            method: 'get',
            url: `rest/snPreset/del?presetSnId=${id}`,
          }).then((res) => {
            this.getData()
            if (res.code == '20000') {
              this.getData()
            }
            else {
              message.error(res.message || res.msg)
            }
          })
        },
      })
    },

    getData(flag) {
      if (flag) {
        this.page = 1
      }
      const { page, size, query } = this
      this.loading = true
      window.$oAjax
        .get(`rest/snPreset/listByConsign?consignId=${this.consignId}`, {
          params: {
            page,
            size,
            ...query,
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            res.data.forEach((ritem) => {
              if (ritem.recordSns) {
                ritem.recordSns.forEach((item) => {
                  item.edit = false
                })
              }
              if (ritem.reportSns) {
                ritem.reportSns.forEach((item) => {
                  item.edit = false
                })
              }

              if (ritem.taskSns) {
                ritem.taskSns.forEach((item) => {
                  item.edit = false
                })
              }
            })
            this.data = res.data
          }
          else {
            message.error(res.msg || res.message)
          }
          this.loading = false
        })
    },

    resetEdit() {
      this.data.forEach((ritem) => {
        ritem.recordSns.forEach((item) => {
          item.edit = false
        })
        ritem.reportSns.forEach((item) => {
          item.edit = false
        })
        ritem.taskSns.forEach((item) => {
          item.edit = false
        })
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
