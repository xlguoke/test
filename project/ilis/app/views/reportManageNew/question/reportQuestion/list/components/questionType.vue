<template>
  <div>
    <ht-modal
      title="选择问题内容"
      :open="visible"
      :mask="false"
      width="80%"
      class="questionType-modal"
      :centered="true"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div style="margin-bottom: 10px">
        <a-input
          v-model:value="quickQry"
          placeholder="请输入问题内容"
          style="width: 300px; vertical-align: middle"
        />
        <a-button style="vertical-align: middle" @click="getData">
          查询
        </a-button>
      </div>
      <a-table
        id="refTable"
        :row-selection="rowSelection"
        :pagination="false"
        :scroll="{ y: 240 }"
        :columns="columns"
        :data-source="data"
        bordered
        :loading="loading"
        row-key="id"
        :custom-row="customRow"
        :row-class-name="rowClassName"
        @expand="expandedRowRender"
      >
        <template #bodyCell="{ column, text }">
          <template v-if="column.dataIndex === 'percent'">
            <div class="projectManageList-percent">
              <div
                :class="`projectManageList-percent-bar ${
                  text == 100 ? 'active' : ''
                }`"
                :style="`width:${text}%`"
              ></div>
            </div>
            <span v-if="(text || 0) < 100" style="vertical-align: middle">{{
              `${text || 0}%`
            }}</span>
            <span v-else style="vertical-align: middle">
              <CheckCircleOutlined />
            </span>
          </template>
        </template>
      </a-table>
    </ht-modal>
  </div>
</template>

<script>
import { CheckCircleOutlined } from '@ant-design/icons-vue'

const columns = [
  {
    title: '问题内容',
    dataIndex: 'name',
    width: '70%',
  },
  {
    title: '错误严重程度',
    dataIndex: 'severity',
    width: '30%',
  },
]
// function getTree (data, selectedRowKeys) {
//   if (!Array.isArray(data)) {
//     return;
//   }
//   let arr = [],
//     obj = {},
//     selectedRows = [];
//   for (let i = 0; i < data.length; i++) {
//     if (selectedRowKeys.length > 0 && selectedRowKeys[0] === data[i].id) {
//       selectedRows = [{ ...data[i] }];
//     }

//     if (obj[data[i].bigType]) {
//       arr.filter(item => {
//         if (item.name === data[i].bigType) {
//           item.children.push({
//             ...data[i],
//             name: data[i].type
//           });
//         }
//       });
//     } else {
//       obj[data[i].bigType] = true;
//       arr.push({
//         name: data[i].bigType,
//         children: [{ ...data[i], name: data[i].type }]
//       });
//     }
//   }
//   for (let j = 0; j < arr.length; j++) {
//     if (arr[j].children.length === 0) {
//       delete arr[j].children;
//     } else {
//       arr[j].disabled = true;
//     }
//   }
//   return { arr: arr, selectedRows: selectedRows };
// }
function toTree(nodes) {
  const result = []
  // 如果值是 Array，则为true; 否则为false。
  if (!Array.isArray(nodes)) {
    return result
  }
  // 深拷贝，否则会影响原数组
  const node = JSON.parse(JSON.stringify(nodes))
  // 根据父节点进行拼接子节点，
  node.forEach(item => delete item.children) // 已经有的话就删掉
  // 把每一项的引用放入map对象里
  const map = {}
  node.forEach(item => (map[item.id] = item))
  const newNode = []
  node.forEach((dt) => {
    const parents = map[dt.parentId]
    if (parents) {
      ;(parents.children || (parents.children = [])).push(dt)
    }
    else {
      newNode.push(dt)
    }
  })
  return newNode
}
let bool = false
export default {
  components: {
    CheckCircleOutlined,
  },
  props: ['callback'],
  data() {
    return {
      visible: false,
      data: [],
      columns,
      selectedRowKeys: [],
      selectedRows: [],
      isAdd: true,
      quickQry: '',
      loading: false,
      page: 1,
      size: 999,
      // reportId: getQueryVariable("reportId"),
      reportId: '4028b20d867d251d01867d4608e1008f',
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.id]
            this.selectedRows = [record]
          },
        }
      },
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          this.getData()
        },
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        type: 'radio',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  created() {
    this.getData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    showModal(questionTypeId) {
      bool = false
      if (questionTypeId) {
        this.selectedRowKeys = [questionTypeId]
      }
      this.visible = true
      this.getData()
    },
    handleCancel() {
      this.visible = false
      this.quickQry = ''
      this.selectedRowKeys = []
      this.selectedRows = []
    },
    handleOk() {
      // delete this.selectedRows[0].name;
      this.callback(this.selectedRows)
      this.handleCancel()
    },
    expandedRowRender() {
      if (bool) {
        window.$oNextTick(() => {
          const ele1 = document
            .getElementById('refTable')
            .getElementsByClassName('ant-table-row-level-1')
          // 隐藏
          if (ele1) {
            for (let i = 0; i < ele1.length; i++) {
              ele1[i].getElementsByClassName(
                'ant-radio-wrapper',
              )[0].style.display = 'none'
            }
          }
        })
      }
    },
    getData() {
      const { page, size, quickQry } = this
      const params = {
        page,
        size,
        quickQry,
        reportId: this.reportId,
      }

      this.loading = true
      window.$oAjax
        .get(window.$oApi.reportQuestion.typeList, {
          params,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.data) {
            this.data = toTree(res.data.rows) || []
            if (res.data.rows) {
              const listData = [...res.data.rows]
              const find = listData.filter(
                item => item.id == this.selectedRowKeys[0],
              )
              if (find && find.length) {
                this.selectedRows = find
              }
              // 判断是否是3级或者二级
              const tempData = [...this.data]
              // 获取拖动节点层数
              function getMaxDepth(arr) {
                // 递归计算树形数据最大的层级数
                let maxLevel = 0
                function multiArr(arr, level) {
                  ++level
                  maxLevel = Math.max(level, maxLevel)
                  for (let i = 0; i < arr.length; i++) {
                    const item = arr[i]
                    item.level = level
                    if (item.children && item.children.length > 0) {
                      multiArr(item.children, level)
                    }
                    else {
                      delete item.children
                    }
                  }
                }
                multiArr(arr, 0)
                return maxLevel
              }
              const maxLevel = getMaxDepth(tempData)
              // 层级大于1
              if (maxLevel > 2) {
                bool = true
              }
            }
            this.pagination.total = res.data.count || 0
            this.pagination.current = page
            this.pagination.pageSize = size
            window.$oNextTick(() => {
              // 隐藏父级
              if (document.getElementById('refTable')) {
                const ele = document
                  .getElementById('refTable')
                  .getElementsByClassName('ant-table-row-level-0')
                // 隐藏
                if (ele) {
                  for (let i = 0; i < ele.length; i++) {
                    ele[i].getElementsByClassName(
                      'ant-radio-wrapper',
                    )[0].style.display = 'none'
                  }
                }
              }
            })
            this.loading = false
          }
        })
    },
  },
}
</script>

<style lang="less">
.questionType-modal {
  .ant-modal-body {
    height: 350px;
    overflow-y: auto;
  }

  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 5px 8px;
  }
}
</style>
