<template>
  <div style="height: 100%">
    <div class="spin-content">
      <div style="display: flex">
        <div style="margin-right: 20px">
          <div style="padding-bottom: 10px">
            <a-button
              v-permission="'newEgress'"

              type="primary"
              @click="eqVisible = true"
            >
              选择检测设备
            </a-button>
          </div>
          <a-list
            item-layout="horizontal"
            :data-source="eqData"
            style="
              width: 300px;
              border: 1px solid rgb(232 232 232);
              min-height: 206px;
              max-height: 800px;
              overflow: auto;
            "
          >
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #description>
                    <div
                      style="
                        display: flex;
                        justify-content: space-between;
                        padding: 0 20px;
                        align-items: center;
                      "
                    >
                      <div class="eq_item">
                        <p>
                          <span class="lable">设备：</span>
                          {{ item.name }}
                        </p>
                        <p>
                          <span class="lable">编号：</span>
                          {{ item.archiveSn }}
                        </p>
                        <p>
                          <span class="lable">型号：</span>
                          {{ item.standard }}
                        </p>
                      </div>
                      <a-button @click="deleteEqRow(index)">
                        删除
                      </a-button>
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
        <div style="width: 100%">
          <div
            style="
              padding-bottom: 10px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            "
          >
            <a-button
              v-permission="'newEgress'"
              type="primary"

              @click="selParamVisible = true"
            >
              选择检测参数
            </a-button>

            <p style="color: red">
              注：批量设置设备关联参数时，将清空所选设备已有的设备关联参数配置
            </p>
          </div>
          <a-table
            :columns="columns"
            :pagination="false"
            :data-source="paramsList"
            :bordered="true"
          >
            <template #bodyCell="{ column, record, text, index }">
              <template v-if="column.dataIndex === 'operation'">
                <span class="table-handle">
                  <a-button @click="deleteParamRow(record, index)">删除</a-button>
                </span>
              </template>

              <template v-if="column.dataIndex === 'bigCategory'">
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
      v-model:open="selParamVisible"
      title="检测参数"
      width="90%"
      @ok="handleOkParam"
    >
      <iframe
        ref="Iframe"
        style="width: 100%; height: 400px; border: none"
        :src="`${rootUrl}/testParamController.do?params-copy`"
      ></iframe>
    </ht-modal>

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
        :src="`${rootUrl}/equipmentNewController.do?goEquipmentList&onlySelect=2`"
      ></iframe>
    </ht-modal>
  </div>
</template>

<script>
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {},
  data() {
    return {
      eqVisible: false,
      eqData: [],
      paramsList: [],
      selParamVisible: false,
      rootUrl,
      data: [],
      columns: [
        {
          title: '检测大类',
          dataIndex: 'bigCategory',
          width: '6%',
        },
        {
          title: '系统检测项目',
          dataIndex: 'testItemName',
          width: '9%',
        },
        {
          title: '试验参数系统名称',
          dataIndex: 'displayName',
          width: '9%',
        },
        {
          title: '试验参数显示名称',
          dataIndex: 'name',
          width: '9%',
        },
        {
          title: '备注',
          dataIndex: 'remark',
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
      confirmVisible: false,
      formLayout: 'horizontal',

      spinning: false,
      queryParams: null,
    }
  },
  created() {
    if (window.parent && window.parent.$ && window.parent.$('#dataGrid')) {
      const getAllSelections = window.parent.$('#dataGrid').data('getAllSelections')
      if (getAllSelections) {
        this.eqData = getAllSelections()
      }
      else {
        this.eqData = window.parent.$('#dataGrid').datagrid('getSelections')
      }
    }
    window.returnEqParam = this.returnEqParam
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
      const list = [...data, ...this.eqData]
      this.eqData = this.removeDuplication(list)
    },
    deleteEqRow(index) {
      this.eqData.splice(index, 1)
    },
    deleteParamRow(v, index) {
      this.paramsList.splice(index, 1)
    },
    // 选择参数
    handleOkParam() {
      const selList = this.getIframeData().map((item) => {
        delete item.children
        return item
      })
      if (selList.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择数据'))
        return
      }

      const list = [...this.paramsList, ...selList]
      this.paramsList = this.removeDuplication(list)
      this.selParamVisible = false
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
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 获取选择数据
    getIframeData() {
      const ele = this.$refs.Iframe
      const contentWindow = ele.contentWindow
      return contentWindow.$('#dataGridOfTestParam').treegrid('getSelections')
    },
    returnEqParam() {
      return {
        eqData: this.eqData,
        paramsList: this.paramsList,
      }
    },
    // getData: function () {
    //   let { page, size } = this;
    //   this.spinning = true;
    //   window.$oAjax.get(`${window.$oApi.eqEgressList.views}`, {
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
