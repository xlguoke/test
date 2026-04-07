<!-- eslint-disable vue/valid-v-for -->
<template>
  <ht-modal
    :key="refresh"
    v-model:open="visibleModal"
    :title="title"
    width="900px"
    fixed-height
    @ok="okBtn"
  >
    <div class="modal-warp" :style="`height:${modalWarpHeight}px`">
      <p class="params-name">
        检测参数：{{ rowEditRow.displayName }}
      </p>
      <div class="handle-box">
        <a-button type="primary" @click="importStandardBuild">
          从规程库中引用
        </a-button>
        <a-button @click="useOther">
          应用到其他参数
        </a-button>
      </div>
      <p class="expire-hint">
        表示规程已过期
      </p>
      <a-table
        :data-source="tableData"
        :scroll="scroll"
        :pagination="false"
        bordered
      >
        <template v-for="row in columns">
          <a-table-column
            v-if="row.dataIndex !== 'clauseCode' || editType == 'basis'"
            :title="row.title"
            :width="`${row.width ? row.width : ''}`"
          >
            <template #default="{ text: tags, index }">
              <span
                v-if="row.dataIndex === 'name'"
                :class="`${tags.isExpire ? 'expire' : ''}`"
              >{{ tags[row.dataIndex] }}</span>
              <a-input
                v-else-if="row.dataIndex === 'clauseCode'"
                v-model:value="tags.clauseCode"
              />
              <span v-else-if="row.dataIndex === 'executeDate'">
                {{ tags.executeDate ? dayjs(tags.executeDate).format('YYYY-MM-DD') : '' }}
              </span>
              <a
                v-else-if="row.dataIndex === 'handler'"
                href="#"
                title="删除"
                class="text-red-500"
                @click="deleteRow(index)"
              >
                删除
              </a>
              <span v-else>{{ tags[row.dataIndex] }}</span>
            </template>
          </a-table-column>
        </template>
      </a-table>
    </div>

    <ht-modal
      :key="refreshIframe"
      v-model:open="standardModal"
      width="900px"
      :mask-closable="false"
      title="应用规程库"
      @ok="okBtnImport"
    >
      <iframe
        :style="`height:${modalWarpHeight}px`"
        name="standard"
        class="standard-iframe"
        :src="`${rootUrl}/baseStandardNewController.do?goImportStandards&dataFrom=consign`"
        frameborder="0"
      >
      </iframe>
    </ht-modal>
  </ht-modal>
</template>

<script>
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  name: 'TestParams',
  props: {
    editType: {
      type: String,
      default: 'basis',
    },
    rowEditRow: {
      type: Object,
      // eslint-disable-next-line vue/require-valid-default-prop
      default: {},
    },
  },
  emits: ['useTherParams', 'getTestParams'],
  data() {
    return {
      dayjs,
      standardModal: false,
      visibleModal: false,
      rootUrl,
      refresh: '',
      refreshIframe: '',
      scroll: { y: document.body.clientHeight - (window.pageInto ? 470 : 420) },
      modalWarpHeight:
        document.body.clientHeight - (window.pageInto ? 350 : 300),
      columns: [
        { title: '规程名称', dataIndex: 'name', key: 'name' },
        { title: '颁布号', dataIndex: 'publishCode', dataIndex: 'publishCode' },
        {
          title: '执行时间',
          dataIndex: 'executeDate',
          width: '100px',
        },
        {
          title: '条款号',
          dataIndex: 'clauseCode',
          width: '120px',
          scopedSlots: { customRender: 'clauseCode' },
        },
        {
          title: '操作',
          dataIndex: 'handler',
          width: '60px',
          scopedSlots: { customRender: 'handler' },
        },
      ],
      tableData: [],
    }
  },
  computed: {
    title() {
      return this.editType === 'basis' ? '选择试验依据' : '选择评定标准'
    },
  },
  methods: {
    showModal() {
      this.visibleModal = true
      this.getDatas()
    },
    getDatas() {
      const rowEditRow = this.rowEditRow[this.editType]
      if (rowEditRow.length === 0) {
        this.importStandardBuild()
      }
      const list = rowEditRow.map((d) => {
        return {
          key: d.uniqKey,
          isExpire: d.isExpire || false,
          ...d,
        }
      })
      this.tableData = list
    },
    importStandardBuild() {
      this.refreshIframe = new Date().getTime()
      this.standardModal = true
    },
    okBtnImport() {
      const iframeWin = window.frames.standard.window
      const rows = iframeWin.returnImport()
      if (rows.length === 0) {
        return window.$oAntdMessage.warning('请选择规程')
      }
      const tableData = this.tableData
      const listIds = tableData.map(d => d.key)
      const addList = []
      let repeatStr = ''
      const nowDate = new Date().getTime()

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        if (listIds.includes(row.uniqueKey)) {
          repeatStr
            += repeatStr == '' ? row.standardName : `,${row.standardName}`
          continue
        }
        const expireT = new Date(row.expireDate).getTime()
        addList.push({
          key: row.id,
          // baseStandardId: row.standardId,
          // 后端调整，该字段改为id处理
          baseStandardId: row.id,
          clauseCode: row.clauseCode,
          executeDate: row.executeDate,
          expireDate: row.expireDate,
          isExpire: !row.expireDate ? false : nowDate - expireT > 0,
          name: row.standardName,
          publishCode: row.publishCode,
          type: this.editType == 'basis' ? '1' : '2',
          uniqKey: row.uniqueKey,
        })
      }
      this.standardModal = false
      if (repeatStr !== '') {
        window.$oAntdMessage.warning(
          `所选规程中【${repeatStr}】已被引用，本次不再引用`,
        )
      }
      if (addList.length === 0)
        return
      this.tableData = tableData.concat(addList)
    },
    useOther() {
      if (this.tableData.length === 0) {
        return window.$oAntdMessage.warning('请先选择规程')
      }
      $emit(this, 'useTherParams', this.tableData)
    },
    okBtn() {
      $emit(this, 'getTestParams', this.tableData)
      this.visibleModal = false
    },
    deleteRow(i) {
      window.$oAntdConfirm({
        title: '删除提示',
        content: '确认删除选择的数据?',
        onOk: () => {
          this.tableData.splice(i, 1)
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
.modal-warp {
  overflow: auto;
  position: relative;
  .params-name {
    color: #111;
    font-weight: bold;
  }
  .handle-box {
    margin: 10px 0;
    button {
      margin-right: 10px;
    }
  }
  .expire-hint {
    position: absolute;
    right: 0;
    top: 40px;
    &::before {
      display: inline-block;
      margin-right: 5px;
      width: 12px;
      height: 12px;
      content: '';
      background-color: red;
      vertical-align: middle;
      border-radius: 2px;
    }
  }
  .expire {
    color: red;
  }
}
.standard-iframe {
  position: relative;
  z-index: 10;
  border: none;
  width: 100%;
}
.ant-spin {
  position: absolute;
  left: 50%;
  top: 50%;
}
</style>
