<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <!-- <a-button @click="okBtn()">okBtn</a-button> -->
        <div style="padding: 10px; text-align: right; color: green">
          注：标签数量为0或空时，该样品不打印样品标签
        </div>
        <a-table
          id="tableBox"
          :columns="columns"
          :pagination="false"
          :data-source="data"
          bordered
          row-key="index"
          :row-class-name="rowClassName"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'operation'">
              <a-input-number
                v-if="record.processObjectId"
                type="number"
                :value="text"
                @change="
                  (e) => numberChange(e, record.processObjectId, 'operation')
                "
              />
              <span v-else>需完成委托后才能打印该样品</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

const columns = [
  {
    title: '委托编号',
    dataIndex: 'consignCode',
    width: '25%',
  },
  {
    title: '样品编号',
    dataIndex: 'testObjectCode',
    width: '25%',
  },
  {
    title: '样品名称',
    dataIndex: 'testObjectName',
    width: '25%',
  },
  {
    title: '标签数量',
    dataIndex: 'operation',
    width: '25%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {},
  data() {
    return {
      data: [],
      columns,
      spinning: false,

      queryParam: null,
      consignIds: getQueryVariable('consignIds') || '', // 模块id
      processObjectIds: getQueryVariable('processObjectIds') || '', // 样品id
      page: 1,
      size: 10,
    }
  },
  computed: {},
  created() {
    this.getData()
  },
  mounted() {
    // 将GetResult方法绑定到window下面，提供给外部调用\
    // eslint-disable-next-line ts/no-this-alias
    const self = this
    window.GetResult = (layerI, successFunc) => {
      successFunc(layerI, self.okBtn())
    }
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size } = this
      const params = {
        consignIds: this.consignIds,
      }
      if (this.processObjectIds) {
        params.processObjectIds = this.processObjectIds
      }
      this.spinning = true
      window.$oAjax({
        // url: "testObjectController.do?getSimpleInfoFromMetaData",
        url: 'testObjectController.do?getProcessObjectByConsign',
        method: 'GET',
        params,
      }).then((res) => {
        this.spinning = false
        this.data = []
        if (res.success === false) {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
          return
        }
        if (res.success && res.obj && res.obj.length > 0) {
          // this.data = res.obj;
          this.data = []
          // eslint-disable-next-line unused-imports/no-unused-vars
          const arr = []
          // if(this.processObjectIds){
          //   res.obj.map((item, index) => {
          //     if (this.processObjectIds.indexOf(item.processObjectId) > -1) {
          //       arr.push({
          //         ...item,
          //         index: index
          //       });
          //     }
          //   });
          //   this.data = arr;
          // }else{
          this.data = res.obj.map((item, index) => ({
            ...item,
            index,
          }))
          // }
        }
      })
    },
    textNumber() {
      // if (text === 0 || text === '0') {
      //   return 0;
      // }else{
      //   return text ? text : "";
      // }
    },
    isNumber(value) {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      const reg = /(^\d+$)/
      if (value && !reg.test(value)) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请输入正整数'))
        return false
      }
      return true
    },
    numberChange(value, id, column) {
      if (!this.isNumber(value)) {
        setTimeout(() => {
          this.handleChange('', id, column)
        }, 0)
      }
      else {
        this.handleChange(value, id, column)
      }
    },
    handleChange(value, rowId, column) {
      const newData = [...this.data]
      const target = newData.filter(item => rowId === item.processObjectId)[0]
      if (target) {
        target[column] = value
        this.data = newData
      }
    },
    okBtn() {
      const newData = [...this.data]
      const res = []
      // eslint-disable-next-line array-callback-return
      newData.map((item) => {
        // eslint-disable-next-line ts/no-unused-expressions
        item.operation ? res.push(item) : ''
      })
      if (res.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请设置需要打印的标签数量'))
      }
      // if (res.length > 9) {
      //   res = [];
      //   window.$oAntdModal.warning(window.$oMsgTips.info("目前仅支持10组以内的样品按标签打印，请减少选择样品的数量"));
      // }
      return res
    },
  },
}
</script>

<style lang="less" scoped>
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
@import './index.less';
</style>
