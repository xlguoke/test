<template>
  <a-modal
    v-model:visible="visible"
    title="专家评价"
    :mask-closable="false"
    :keyboard="false"
    width="70%"
    @ok="saveModal"
  >
    <a-spin :spinning="spinning" tip="Loading...">
      <a-table
        :data-source="dataSource"
        :columns="columns"
        bordered
        size="small"
        :pagination="false"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key == 'score'">
            <a-select v-model:value="record.score" style="width: 100px" placeholder="请选择">
              <a-select-option value>请选择</a-select-option>
              <a-select-option value="AA">AA</a-select-option>
              <a-select-option value="A">A</a-select-option>
              <a-select-option value="B">B</a-select-option>
              <a-select-option value="C">C</a-select-option>
              <a-select-option value="D">D</a-select-option>
            </a-select>
          </template>
          <template v-if="column.key == 'scoreRemark'">
            <a-input v-model:value="record.scoreRemark" placeholder="请输入备注" />
          </template>
        </template>
      </a-table>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue"
import { message } from "ant-design-vue"
import { actEvaluation, actDetailApi } from "@/api/specialistDb.api"
import type { TableColumnType } from "ant-design-vue"

const visible = ref<boolean>(false)
const spinning = ref<boolean>(false)
const dataId = ref<string>("")
const openModal = (id: string) => {
  dataId.value = id || ""
  visible.value = true
  id && getDetailData()
}

defineExpose({
  openModal
})

const dataSource = ref<any[]>([])
// 获取详情数据
const getDetailData = () => {
  spinning.value = true
  actDetailApi(dataId.value).then((res: any) => {
    spinning.value = false
    const list = res.experts.map((d) => ({
      id: d.id,
      expertId: d.expertId,
      leader: d.leader,
      name: d.expert.name,
      idCard: d.expert.idCard,
      duty: d.expert.duty,
      professional: d.expert.professional,
      score: d.score,
      scoreRemark: d.scoreRemark
    }))
    dataSource.value = list
  })
}

const columns = reactive<TableColumnType[]>([
  {
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    customRender: ({ index }) => {
      return index + 1
    }
  },
  {
    title: "角色",
    dataIndex: "leader",
    key: "leader",
    customRender: ({ text }) => {
      return text ? "组长" : "组员"
    }
  },
  {
    title: "姓名",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "身份证号",
    dataIndex: "idCard",
    key: "idCard"
  },
  {
    title: "职务",
    dataIndex: "duty",
    key: "duty"
  },
  {
    title: "职称",
    dataIndex: "professional",
    key: "professional"
  },
  {
    title: "评价",
    dataIndex: "score",
    key: "score",
    width: 100
  },
  {
    title: "备注",
    dataIndex: "scoreRemark",
    key: "scoreRemark"
  }
])

// 保存
const saveModal = () => {
  const datas = dataSource.value.map((d: any) => ({
    id: d.id,
    score: d.score,
    scoreRemark: d.scoreRemark
  }))
  actEvaluation(datas)
    .then(() => {
      message.success("评价成功")
      visible.value = false
    })
    .catch(() => {
      visible.value = false
    })
}
</script>

<style lang="less" scoped>
.tag-item {
  display: inline-block;
  margin-right: 5px;
  margin-bottom: 5px;
  padding: 3px 8px;
  border-radius: 4px;
  background-color: #f9f9f9;
  color: #555;
  border: 1px solid #ddd;
}
</style>
