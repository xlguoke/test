<template>
  <IlisContainer app-id="itemDetailCustomFieldConfig">
    <div>
      <a-space class="mb-4">
        <a-button @click="addRow">
          新增
        </a-button>
        <a-button @click="deleteRow">
          删除
        </a-button>
        <a-button @click="editColumn">
          自定义字段
        </a-button>
      </a-space>
      <a-table
        :loading="dataLoading"
        :columns="columns"
        :data-source="data"
        :pagination="false"
        :bordered="true"
        :row-selection="rowSelection"
        :custom-row="customRow"
        row-key="k"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="['conclusion', 'testMaxDeviation', 'detailName', 'testResult', 'standard', 'requirement', 'allowableDeviation'].includes(column.dataIndex)">
            <a-input
              v-model:value="record[columns.dataIndex]"
              placeholder="请输入..."
              @change="inputValue"
            />
          </template>
        </template>
      </a-table>
      <div>
        <p style="padding: 10px 0">
          确认意见:
        </p>
        <a-textarea
          v-model:value="opinion"
          placeholder="请输入确认意见"
          :rows="4"
        />
      </div>
    </div>

    <ht-modal
      title="自定义表头设置"
      :open="visible"
      width="80%"
      @cancel="visible = false"
    >
      <template #footer>
        <div style="height: 30px">
          <a-button
            key="submit"
            type="primary"
            :loading="loading"
            @click="handleOk"
          >
            关闭
          </a-button>
        </div>
      </template>
      <CustomProperty :customize-type="type" @call-back="getcustomList" />
    </ht-modal>
  </IlisContainer>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
import CustomProperty from '../components/CustomProperty.vue'

export default {
  name: 'App',
  components: {
    CustomProperty,
  },
  props: {},
  data() {
    return {
      opinion: '',
      visible: false,
      type: getQueryVariable('type') || '111', // 模块id
      queryName: '',
      pageData: {
        // 页面缓存数据
      },
      resTableData: [
        // 表格数据
      ],
      data: [], // 表格展示数据

      defColumns: [
        {
          title: '检校测试参数',
          dataIndex: 'detailName',
        },
        {
          title: '测试结果',
          dataIndex: 'testResult',
        },
        {
          title: '依据标准',
          dataIndex: 'standard',
        },
        {
          title: '技术要求',
          dataIndex: 'requirement',
        },
        {
          title: '允许偏差',
          dataIndex: 'allowableDeviation',
        },
        {
          title: '校验测试最大偏差',
          dataIndex: 'testMaxDeviation',
        },
        {
          title: '结论',
          dataIndex: 'conclusion',
        },
      ],
      customValues: [],

      columns: [],
      loading: false,
      dataLoading: false,
      selectedRows: [],
      selectedRowKeys: [],

      customRow: () => {
        return {
          onClick: () => {},
        }
      },
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRows = selectedRows
          this.selectedRowKeys = selectedRowKeys
        },
      }
    },
  },

  mounted() {
    this.getcustomList()
    this.echoTabelData()
    window.top.getEquipmentCustomData = this.getEquipmentCustomData
  },
  methods: {
    inputValue() {

    },
    // 返回数据，供ilis调用
    getEquipmentCustomData() {
      const rtData = JSON.parse(JSON.stringify(this.data))
      rtData.forEach((item) => {
        const ct = []
        Object.keys(item).forEach((key) => {
          // 获取自定义字段及值到customValues集合
          if (
            key != 'detailName'
            && key != 'testResult'
            && key != 'standard'
            && key != 'requirement'
            && key != 'allowableDeviation'
            && key != 'testMaxDeviation'
            && key != 'conclusion'
            && key != 'customValues'
          ) {
            ct.push({
              columnId: key,
              columnValue: item[key],
            })
            delete item[key]
          }
          item.customValues = ct
        })
      })

      return {
        detailOpinion: this.opinion,
        details: rtData,
      }
    },
    handleCancel() {
      this.visible = false
    },
    handleOk() {
      this.getcustomList()
      this.visible = false
    },
    addRow() {
      const row = {}
      this.columns.forEach((item) => {
        row[item.dataIndex] = ''
      })
      // row.k = new Date().getTime()
      this.data.push(row)
    },
    deleteRow() {
      this.data = this.data.filter((item, index) => {
        return !this.selectedRowKeys.includes(index)
      })
      this.selectedRowKeys = []
    },
    editColumn() {
      this.visible = true
    },

    getcustomList() {
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: this.type,
          },
        })
        .then((res) => {
          this.customValues = res.data.map((item) => {
            return {
              title: item.columnName,
              dataIndex: item.id,
              scopedSlots: { customRender: 'inputTemplate' },
            }
          })
          this.columns = this.unique([...this.defColumns, ...this.customValues])
        })
    },
    // 去重
    unique(arr) {
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (arr[i].dataIndex == arr[j].dataIndex) {
            // 第一个等同于第二个，splice方法删除第二个
            arr.splice(j, 1)
            j--
          }
        }
      }
      return arr
    },
    // 表格数据回显
    echoTabelData() {
      this.pageData = JSON.parse(localStorage.getItem('resCustomTable'))
      if (!this.pageData) {
        return
      }
      const tableData = this.pageData.details
      this.opinion = this.pageData.detailOpinion

      if (tableData.length) {
        this.data = tableData.map((item) => {
          item = {
            detailName: item.detailName,
            testResult: item.testResult,
            standard: item.standard,
            requirement: item.requirement,
            allowableDeviation: item.allowableDeviation,
            testMaxDeviation: item.testMaxDeviation,
            conclusion: item.conclusion,
            customValues: item.customValues,
          }
          const custom = {}
          item.customValues.forEach((it) => {
            custom[it.columnId] = it.columnValue
          })
          delete item.customValues
          item = { ...item, ...custom }

          return item
        })
      }
    },
  },
}
</script>

<style scoped></style>
