<template>
  <div style="height: 100%">
    <div class="spin-content">
      <div style="display: flex">
        <div style="width: 100%">
          <div style="padding-bottom: 10px">
            <a-button
              v-permission="'newEgress'"
              type="primary"

              @click="eqVisible = true"
            >
              选择检测设备
            </a-button>
          </div>
          <a-table
            :columns="columns"
            :pagination="false"
            :data-source="eqData"
            :bordered="true"
          >
            <template #bodyCell="{ column, record, text, index }">
              <template v-if="column.dataIndex === 'operation'">
                <span>
                  <a-button @click="deleteEQRow(record, index)">删除</a-button>
                </span>
              </template>

              <template v-if="column.dataIndex === 'category'">
                <span>
                  <span>{{ text.name }}</span>
                </span>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </div>
    <ht-modal
      v-model:open="eqVisible"
      title="选择设备"
      width="80%"
      @ok="handleOkEq"
    >
      <iframe
        id="eqVisible"
        style="border: 0"
        width="100%"
        height="400px"
        :src="`${rootUrl}/equipmentNewController.do?goEquipmentListNoAuth&onlySelect=2`"
      ></iframe>
    </ht-modal>
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {},
  data() {
    return {
      paramId: getQueryVariable('paramId') || '',
      eqVisible: false,
      eqData: [],
      rootUrl,
      data: [],
      columns: [
        {
          title: '设备名称',
          dataIndex: 'name',
          width: '6%',
        },
        {
          title: '设备编号',
          dataIndex: 'equipmentSn',
          width: '9%',
        },
        {
          title: '档案编号',
          dataIndex: 'archiveSn',
          width: '9%',
        },
        {
          title: '资产编号',
          dataIndex: 'assetSn',
          width: '9%',
        },
        {
          title: '规格型号',
          dataIndex: 'standard',
          width: '9%',
        },
        {
          title: '所属部门',
          dataIndex: 'departName',
          width: '9%',
        },
        {
          title: '所属功能室',
          dataIndex: 'laboratoryName',
          width: '9%',
        },
        {
          title: '设备状态',
          dataIndex: 'status',
          width: '9%',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: '8%',
          scopedSlots: { customRender: 'operation' },
        },
      ],
      // columns: getColumns.bind(this)(),

      spinning: false,
    }
  },
  created() {
    window.returnEqList = this.returnEqList
    if (this.paramId) {
      this.getEqForParams()
    }
  },
  methods: {
    // 选择设备
    handleOkEq() {
      const data = document
        .getElementById('eqVisible')
        .contentWindow
        .$('#dataGrid')
        .datagrid('getSelections')
      if (data.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择数据'))
        return
      }
      this.eqVisible = false
      if (data.length > 0) {
        const list = [...data, ...this.eqData]
        this.eqData = this.removeDuplication(list)
      }
    },
    deleteEQRow(v, index) {
      this.eqData.splice(index, 1)
    },

    // 去重
    removeDuplication(list) {
      for (let i = 0; i < list.length - 1; i++) {
        for (let j = i + 1; j < list.length; j++) {
          if (list[i].id == list[j].id) {
            list.splice(j, 1)
            // 因为数组长度减小1，所以直接 j++ 会漏掉一个元素，所以要 j--
            j--
          }
        }
      }
      return list
    },

    // 获取选择数据
    getIframeData() {
      const ele = this.$refs.Iframe
      const contentWindow = ele.contentWindow
      return contentWindow.$('#dataGridOfTestParam').datagrid('getSelections')
    },
    returnEqList() {
      return this.eqData
    },
    getEqForParams() {
      window.$oAjax
        .get(`/rest/param-equipment/${this.paramId}`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'paramsIsTrim': true,
          },
        })
        .then((res) => {
          if (res.code == '20000') {
            this.eqData = res.data
          }
        })
    },
    // getData: function () {
    //   let { page, size } = this;
    //   this.spinning = true;
    //   window.$oAjax.get(`${window.$oApi.eqEgressList.list}`, {
    //     params: {
    //       page,
    //       size,
    //       ...this.queryParams
    //     },
    //     headers: {
    //       "X-Requested-With": "XMLHttpRequest",
    //       paramsIsTrim: true,
    //     }
    //   }).then(res => {
    //     if (res && res.data) {
    //       this.data = res.data.rows;
    //       this.pagination.total = res.data.count || 0;
    //       this.pagination.current = page;
    //       this.pagination.pageSize = size;
    //       this.spinning = false;
    //     }
    //   });
    // },
  },
}
</script>

<style lang="less">
@import './index.less';
.eq_item {
  font-size: 12px;
}
.eq_item .lable {
  font-weight: 900;
  color: #767676;
}
.ant-list-item {
  padding: 5px 0 !important;
}
</style>
