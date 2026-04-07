<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="editTitle"
      :confirm-loading="confirmLoading"
      width="800px"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <a-radio-group
        v-if="!editId"
        v-model:value="editType"
        class="mt-4"
        name="radioGroup"
      >
        <a-radio value="TEST">
          检测设备打包
        </a-radio>
        <a-radio value="EGRESS">
          外带设备打包
        </a-radio>
      </a-radio-group>

      <div style="padding-right: 20px; background: #fff; padding-top: 15px">
        <a-space>
          <span style="color: red">*</span>{{ nameLabel }}

          <a-input
            v-model:value="packName"
            style="width: 400px"
            :disabled="isDetail"
            :placeholder="`请输入${nameLabel}`"
          />
        </a-space>
      </div>
      <br />
      <a-card :title="detailLabel" size="small">
        <a-table
          row-key="id"
          :columns="columns"
          :data-source="equipmentDatas"
          :pagination="false"
          :scroll="{ y: 300 }"
          bordered
          :row-selection="
            editType === 'EGRESS'
              ? {
                selectedRowKeys,
                type: 'radio',
                onChange: onSelectChange,
                columnTitle: '主设备',
              }
              : undefined
          "
        >
          <template #bodyCell="{ column, index }">
            <template v-if="column.dataIndex === 'handle'">
              <a-button type="link" :disabled="isDetail" @click="removeRow(index)">
                移除
              </a-button>
            </template>
          </template>
        </a-table>
        <br />
        <a-button
          type="dashed"
          style="height: 32px"
          block
          :disabled="isDetail"
          @click="openModal('eqVisible')"
        >
          + 选择设备
        </a-button>
      </a-card>
    </ht-modal>

    <ht-modal
      title="选择设备"
      centered
      :open="eqVisible"
      width="96%"
      fixed-height
      @cancel="cancelModal"
      @ok="getEq"
    >
      <iframe
        v-if="eqVisible"
        id="eqVisible"
        style="border: 0"
        width="100%"
        height="100%"
        :src="eqVisibleUrl"
      ></iframe>
    </ht-modal>

    <ht-modal
      v-model:open="visibleSample"
      width="80%"
      :dialog-style="{ top: '50px' }"
      :mask-closable="false"
      title="选择参数"
      @ok="chooseSample"
      @cancel="visibleSample = false"
    >
      <div class="sample-wrap">
        <SampleQuery v-if="visibleSample" sel-type="radio" />
      </div>
    </ht-modal>
  </div>
</template>

<script>
import SampleQuery from '~/providers/components/sampleQuery/index.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

const equipmentColumns = [
  {
    title: '设备名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
    key: 'equipmentSn',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    key: 'standard',
  },
  {
    title: '操作',
    dataIndex: 'handle',
    key: 'handle',
    width: 80,
    scopedSlots: { customRender: 'handle' },
  },
]
export default {
  components: {
    SampleQuery,
  },
  props: ['isAdd', 'callback'],
  data() {
    return {
      isDetail: false,
      editTitle: '新增',
      editId: '',
      packName: '',
      selParamsData: {},
      visibleSample: false,
      fileList: [],
      attachmentIds: '',
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      visible: false,
      confirmLoading: false,
      formLayout: 'horizontal',
      eqVisible: false,
      eqVisibleUrl: `${rootUrl}/equipmentNewController.do?goEquipmentListNoAuth&onlySelect=1`,
      eqData: {},
      taskVisibleUrl: `${rootUrl}/reportCreateController.do?goRelationTaskChoosePage`,
      isSameProjectOutEquipment: false,
      taskData: '',
      columns: equipmentColumns,
      equipmentDatas: [],
      editType: 'TEST',
      selectedRowKeys: [],
    }
  },
  computed: {
    nameLabel() {
      if (this.editType === 'TEST') {
        return '设备组名称'
      }
      return '打包名称'
    },
    detailLabel() {
      if (this.editType === 'TEST') {
        return '设备详情'
      }
      return '打包设备'
    },
  },
  created() {},
  methods: {
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    // 选择大类及参数
    chooseSample() {
      const data = window.GetResult()

      if (!data) {
        window.$oAntdMessage.warning('请选择大类')
        return
      }
      if (data.selectedParamIds.length === 0) {
        window.$oAntdMessage.warning('请选择参数')
        return
      }

      data.paramList.forEach((it) => {
        if (it.id === data.selectedParamIds[0]) {
          this.selParamsData.id = it.id
          this.selParamsData.testSampleId = data.Sample.sampleId
          this.selParamsData.name
            = `${data.bigCategoryNames
            }/${
              data.Sample.text
            }/${
              it.displayName}`
        }
      })
      this.visibleSample = false
    },

    showModal({ row, isDetail = false, editType }) {
      editType && (this.editType = editType)
      this.isDetail = isDetail
      if (row) {
        this.isDetail ? (this.editTitle = '详情') : (this.editTitle = '编辑')

        if (this.editType === 'EGRESS' && row.eqList && row.eqList.length) {
          const chief = row.eqList.find(i => i.eqType === 'CHIEF')
          if (chief) {
            this.selectedRowKeys = [chief.id]
          }
        }

        this.packName = row.name
        this.selParamsData.name = `${row.bigCategoryName}/${row.testSampleName}/${row.testParamName}`
        this.selParamsData.testSampleId = row.testSampleId || ''
        this.selParamsData.id = row.testParamId
        this.editId = row.id
        window.$oAjax({
          method: 'GET',
          url: `/rest/equipment/pack/detail/${row.id}`,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        }).then((res) => {
          if (res && res.code === 20000) {
            this.equipmentDatas = res.data
          }
        })
      }
      this.visible = true
    },
    handleOk() {
      if (this.isDetail) {
        this.handleCancel()
        return
      }
      const equipmentDatas = this.equipmentDatas
      this.packName = this.packName.trim()
      if (!this.packName) {
        return window.$oAntdMessage.warning('请输入打包名称')
      }

      if (!equipmentDatas.length) {
        return window.$oAntdMessage.warning('请选择打包设备')
      }
      if (
        this.editType === 'EGRESS'
        && (!this.selectedRowKeys || !this.selectedRowKeys.length)
      ) {
        return window.$oAntdMessage.warning('请选择主设备')
      }
      const ids = equipmentDatas.map(d => d.id)
      this.confirmLoading = true
      window.$oAjax({
        method: 'POST',
        url: `/rest/equipment/pack/detail/save`,
        data: {
          testParamId: this.selParamsData.id,
          testSampleId: this.selParamsData.testSampleId,
          eqId: ids.join(','),
          name: this.packName,
          id: this.editId,
          type: this.editType,
          ...(this.editType === 'EGRESS'
            ? { chiefEqId: this.selectedRowKeys[0] }
            : false),
        },
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      })
        .then((res) => {
          if (res.code && res.code !== 20010) {
            window.$oAntdMessage.success('操作成功')
            this.callback()
            this.handleCancel()
          }
          else {
            const originalMsg = res.msg || res.message || '请求出错'
            const message = originalMsg.split(/<\/\s*br\s*>/i).filter(line => line.trim() !== '')
            window.$oAntdModal.warning(
              {
                title: '提示',
                content: h(
                  'div',
                  {},
                  message.map(i => h('div', null, i)),
                ),
              },
            )
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    handleCancel() {
      this.fileList = []
      this.attachmentIds = ''
      this.eqData = {}
      this.taskData = ''
      this.equipmentDatas = []
      this.visible = false
      this.packName = ''
    },
    openModal(field) {
      this[field] = true
    },
    cancelModal() {
      this.eqVisible = false
    },
    // 移除设备
    removeRow(ind) {
      const row = this.equipmentDatas[ind]
      this.equipmentDatas.splice(ind, 1)
      if (row.id === this.selectedRowKeys[0]) {
        this.selectedRowKeys = []
      }
    },
    // 获取外出设备
    getEq() {
      const dataGrid = document
        .getElementById('eqVisible')
        .contentWindow
        .$('#dataGrid')
      const data = dataGrid.datagrid('getSelections')
      dataGrid.datagrid('clearSelections')
      this.eqVisible = false
      if (data.length > 0) {
        const ids = this.equipmentDatas.map(d => d.id)
        const filterData = data.filter(d => !ids.includes(d.id))
        const list = data.filter(d => ids.includes(d.id))
        if (list.length > 0) {
          const equipments = []
          list.forEach((d) => {
            equipments.push(`${d.name}(${d.equipmentSn})`)
          })
          window.$oAntdMessage.warning(`请勿重复选择同一设备！`)
        }
        if (filterData.length === 0)
          return
        this.equipmentDatas.push(...filterData)
        if (!this.selectedRowKeys.length) {
          this.selectedRowKeys = [this.equipmentDatas[0].id]
        }
      }
    },
  },
}
</script>

<style lang="less">
.equipmentOutgo-add-modal {
  .ant-modal-body {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }

  .ant-card-head-title {
    padding: 10px 0;
  }

  .ant-card-body {
    padding: 15px 20px;
  }
}
</style>
