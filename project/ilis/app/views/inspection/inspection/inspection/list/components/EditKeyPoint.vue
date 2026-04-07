<template>
  <a-form ref="formRef" :label-col="labelCol" :wrapper-col="wrapperCol" :model="variableData">
    <a-form-item hidden>
      <a-input v-model:value="variableData.id" hidden />
    </a-form-item>
    <a-form-item hidden>
      <a-input
        v-model:value="variableData.categoryId"
        hidden
      />
    </a-form-item>
    <a-form-item label="所属大类">
      <a-input
        v-model:value="variableData.category"
        disabled
      />
    </a-form-item>
    <a-form-item
      label="排序"
      :rules="[
        {
          required: true,
          validator: orderNumberChange,
          message: '请输入正整数',
        },
      ]"
      name="orderNumber"
    >
      <a-input-number
        v-model:value="variableData.orderNumber"
        placeholder="请输入序号"
      />
    </a-form-item>
    <a-form-item
      label="检查要点"
      :rules="[{ required: true, message: '请输入检查要点' }]"
      name="keypoint"
    >
      <a-input
        v-model:value="variableData.keypoint"
        placeholder="请输入检查要点"
      />
    </a-form-item>
    <a-form-item label="要点说明">
      <a-input
        v-model:value="variableData.description"
        placeholder="要点说明"
      />
    </a-form-item>
    <a-row>
      <a-col :span="24">
        <a-table
          :data-source="variableData.problems"
          :columns="problemColumns"
          row-key="id"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'orderNumber'">
              <div :key="record.id">
                <a-input-number
                  v-if="record.edit"
                  style="margin: -5px 0"
                  :value="text"
                  @change="(e) => problemOrderNumberChange(e, record)"
                />
                <template v-else>
                  {{ text }}
                </template>
              </div>
            </template>

            <template v-if="column.dataIndex === 'content'">
              <div :key="record.id">
                <a-input
                  v-if="record.edit"
                  style="margin: -5px 0"
                  :value="text"
                  @change="(e) => problemContentChange(e.target.value, record)"
                />
                <template v-else>
                  {{ text }}
                </template>
              </div>
            </template>

            <template v-if="column.dataIndex === 'level'">
              <div :key="record.id">
                <a-select
                  v-if="record.edit"
                  v-model:value="record.level"
                  class="w-full"
                >
                  <a-select-option
                    v-for="item in problemLevel"
                    :key="item.typename"
                    :value="item.typename"
                  >
                    {{ item.typename }}
                  </a-select-option>
                </a-select>

                <template v-else>
                  {{ text }}
                </template>
              </div>
            </template>

            <template v-if="column.dataIndex === 'operation'">
              <div class="table-handle">
                <template v-if="record.edit">
                  <a @click="() => problemEave(record)">确定</a>
                  <a-popconfirm
                    title="确定要取消吗?"
                    @confirm="() => problemCancel(record)"
                  >
                    <a>取消</a>
                  </a-popconfirm>
                </template>
                <template v-else>
                  <a-button
                    v-permission="'syncCenterCode'"

                    type="link"
                    @click="
                      () => {
                        problemEdit(record)
                      }
                    "
                  >
                    编辑
                  </a-button>
                  <a-popconfirm
                    v-if="variableData.problems.length"
                    title="确定要删除吗？"
                    @confirm="() => problemOnDelete(record)"
                  >
                    <a-button
                      v-permission="'syncCenterCode'"

                      type="link"
                    >
                      删除
                    </a-button>
                  </a-popconfirm>
                </template>
              </div>
            </template>
          </template>
        </a-table>
      </a-col>
    </a-row>
    <a-row>
      <a-col :span="24">
        <a-button
          class="ant-plus mt-2"
          type="primary"
          @click="plusItem"
        >
          新增
        </a-button>
      </a-col>
    </a-row>
  </a-form>
</template>

<script>
import { TreeSelect } from 'ant-design-vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import requestApi from '../../request'

const SHOW_ALL = TreeSelect.SHOW_ALL
export default {
  name: 'EditKeyPoint',
  props: {
    data: {},
  },
  emits: ['cancel'],
  data() {
    return {
      newProblemId: {},
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      variableData: {},
      SHOW_ALL,

      problemLevel: [],
      problemColumns: [
        {
          title: '序号',
          dataIndex: 'orderNumber',
          scopedSlots: { customRender: 'orderNumber' },
        },
        {
          title: '常见问题描述',
          dataIndex: 'content',
          scopedSlots: { customRender: 'content' },
        },
        {
          title: '问题级别',
          dataIndex: 'level',
          ellipsis: true,
          scopedSlots: { customRender: 'level' },
        },
        {
          title: '操作',
          dataIndex: 'operation',
          ellipsis: true,
          scopedSlots: { customRender: 'operation' },
        },
      ],
    }
  },
  created() {
    this.variableData = JSON.parse(JSON.stringify(this.data))
    if (!this.variableData.problems) {
      this.variableData.problems = []
    }
    this.initProblemLevel()
  },
  methods: {
    orderNumberChange(rule, value, callback) {
      // eslint-disable-next-line regexp/no-unused-capturing-group
      const reg = /(^\d+$)/
      if (!value || !reg.test(value)) {
        return callback(new Error(rule))
      }
      else {
        callback()
      }
    },

    initProblemLevel() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      requestApi.inspection.problemLevel().then((res) => {
        _this.problemLevel = res.rows
      })
    },

    plusItem() {
      const idIndex = Object.getOwnPropertyNames(this.newProblemId).length
      const id = `_new_${idIndex}`
      this.newProblemId[id] = true
      const item = {
        id,
        orderNumber: null,
        keypointId: null,
        level: '',
        content: '',
        edit: true,
      }
      this.variableData.problems.push(item)
    },
    problemOrderNumberChange(value, record) {
      record.orderNumber = value
    },
    problemLevelChange(value, record) {
      record.level = value
    },
    problemContentChange(value, record) {
      record.content = value
    },
    problemOnDelete(record) {
      this.variableData.problems = this.variableData.problems.filter(
        item => item.id !== record.id,
      )
    },
    problemEdit(record) {
      record.edit = true
    },
    problemEave(record) {
      record.edit = false
    },
    problemCancel(record) {
      record.edit = false
      if (this.newProblemId[record.id]) {
        this.variableData.problems = this.variableData.problems.filter(
          item => item.id !== record.id,
        )
        delete this.newProblemId[record.id]
      }
      else {
        Object.assign(
          record.problems,
          this.data.problems.filter(item => record.id === item.id)[0],
        )
      }
    },

    submit() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      const index = _this.variableData.problems.findIndex(it => it.edit)
      if (index > -1) {
        window.$oAntdModal.error(
          window.$oMsgTips.info(
            '您的【常见问题】有未完成的数据修改，请完成后再次点击确定。',
          ),
        )
        return false
      }

      this.$refs.formRef.validateFields().then(() => {
        const value = { ...this.variableData }
        const problems = JSON.parse(JSON.stringify(_this.variableData.problems))
        // eslint-disable-next-line array-callback-return
        problems.map((it) => {
          if (typeof it.id === 'string' && it.id.includes('_new_')) {
            it.id = null
          }
          delete it.edit
        })
        const submitData = { ...value, problems }

        requestApi.keyPoint.edit(submitData).then(() => {
          $emit(_this, 'cancel')
        })
      })
    },
  },
}
</script>

<style scoped></style>
