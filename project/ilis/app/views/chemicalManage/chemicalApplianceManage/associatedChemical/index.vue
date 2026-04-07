<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <div style="padding: 10px 0">
          <a-button type="primary" @click="addEditRow">
            选择
          </a-button>
        </div>
        <a-table
          :columns="columns"
          :data-source="selChemicalsData"
          :pagination="false"
          row-key="chemicalCategoryId"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'dosage'">
              <a-input-number
                v-model:value="record.dosage"
                :min="0"
                :disabled="isDetail"
              />
            </template>
            <template v-if="column.dataIndex === 'remark'">
              <a-input
                v-model:value="record.remark"
                :min="0"
                :disabled="isDetail"
              />
            </template>
            <template v-if="column.dataIndex === 'actions'">
              <a
                v-if="isDetail"
                href="javascript:;"
                @click="onChemicalsRemove(record)"
              >移除</a>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>

    <SelChemicals ref="selChemicalsRef" :callback="getChemicalsData" />
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
import SelChemicals from '../components/selChemicals.vue'

export default {

  components: {
    SelChemicals,
  },
  data() {
    return {
      isDetail: false,
      selChemicalsData: [],
      spinning: false,
      columns: [
        {
          title: '化学名称',
          dataIndex: 'name',
        },
        {
          title: '化学名称编号',
          dataIndex: 'sn',
        },
        {
          title: '纯度',
          dataIndex: 'purity',
        },
        {
          title: '浓度',
          dataIndex: 'concentration',
        },
        {
          title: '规格型号',
          dataIndex: 'specification',
        },
        {
          title: '管理等级',
          dataIndex: 'manageLevel',
        },
        {
          title: '计量单位',
          dataIndex: 'unit',
        },
        {
          title: '单位用量',
          dataIndex: 'dosage',
        },
        {
          title: '备注',
          dataIndex: 'remark',
        },
        {
          title: '操作',
          dataIndex: 'actions',
        },
      ],
    }
  },
  computed: {},
  created() {},
  mounted() {
    this.initFun()
    window.layerCbForSelChemica = this.okBtn
  },
  methods: {
    okBtn() {
      return this.selChemicalsData
    },
    addEditRow() {
      this.$refs.selChemicalsRef.showModal(
        'checkbox',
        this.selChemicalsData.map((it) => {
          it.id = it.chemicalCategoryId
          return it
        }),
      )
    },
    echoData() {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      self.spinning = true
      window.$oAjax
        .get(
          `rest/chemical/testParamChemical/detail/${
            getQueryVariable('paramsId')}`,
        )
        .then((res) => {
          self.spinning = false

          if (res.code === 20000) {
            self.selChemicalsData = res.data
          }
          else {
            window.$oAntdMessage.warning(res.message)
          }
        })
    },
    getChemicalsData(row) {
      const d = row.map((it) => {
        it.dosage = 1
        it.remark = ''
        this.selChemicalsData.forEach((tit) => {
          // eslint-disable-next-line eqeqeq
          if (tit.chemicalCategoryId == it.id) {
            it.dosage = tit.dosage
            it.remark = tit.remark
          }
        })
        it.chemicalCategoryId = it.id
        it.id = ''
        return JSON.parse(JSON.stringify(it))
      })
      this.selChemicalsData = d
    },

    initFun() {
      if (getQueryVariable('paramsId')) {
        this.echoData()
      }
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },

    onChemicalsRemove(row) {
      this.selChemicalsData.forEach((it, index) => {
        // eslint-disable-next-line eqeqeq
        if (row.chemicalCategoryId == it.chemicalCategoryId) {
          this.selChemicalsData.splice(index, 1)
        }
      })
    },

    // deleteRow(e, record) {
    //   e.stopPropagation();
    //   e.preventDefault();
    //   let self = this;
    //   window.$oAntdConfirm({
    //     title: "提示",
    //     content: "确定要删除吗?",
    //     onOk() {
    //       self.spinning = true;
    //       window.$oAjax
    //         .delete("rest/chemical/solution/del", {
    //           params: {
    //             id: record.id,
    //           },
    //         })
    //         .then((res) => {
    //           self.spinning = false;
    //           if (res.code === 20000) {
    //             window.$oAntdMessage.success("删除成功");
    //             self.getData();
    //           } else {
    //             window.$oAntdMessage.warning(res.message);
    //           }
    //         });
    //     },
    //     onCancel() {},
    //   });
    // },
  },
}
</script>

<style lang="less">
.container-search-all {
  width: 400px;
  margin-right: 5px;
  .ant-table-thead {
    .ant-checkbox {
      display: none;
    }
  }
}
.more-header {
  padding: 8px;
  border-bottom: 1px dashed;
  margin-bottom: 10px;
  color: var(--colorPrimary);
}
</style>
