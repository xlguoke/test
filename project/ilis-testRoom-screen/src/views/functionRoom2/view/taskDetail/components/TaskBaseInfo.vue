<template>
  <div class="task-baseinfo">
    <CommonTitle>
      <template #icon>
        <img
          style="width: 100%; height: 100%"
          src="@/assets/images/functionRoom2/sampleIcon.png"
          alt=""
        />
      </template>
      样品信息
    </CommonTitle>
    <Container>
      <van-skeleton :row="5" :loading="loading">
        <CommonLine
          class="line"
          label="样品名称："
          :value="testObj.testSampleDisplayName || '--'"
        ></CommonLine>
        <CommonLine class="line" label="规格型号：" :value="testObj.standard || '--'"></CommonLine>
        <CommonLine
          class="line"
          label="样品描述："
          :value="testObj.description || '--'"
        ></CommonLine>
        <CommonLine class="line" label="样品数量：" :value="testObj.sampleNum || '--'"></CommonLine>
        <CommonLine
          class="line"
          label="生产厂家："
          :value="
            testObj?.testObjectOtherInfos?.find((i) => i.systemFieldName === '生产厂家')?.value ||
            '--'
          "
        ></CommonLine>
      </van-skeleton>
    </Container>
  </div>
</template>
<script lang="ts" setup>
import CommonLine from "@/views/functionRoom2/components/CommonLine.vue"
// import CommonSteps from "@/views/functionRoom2/components/CommonSteps.vue"
import CommonTitle from "@/views/functionRoom2/components/CommonTitle.vue"
import Container from "@/views/functionRoom2/components/Container.vue"
import { ITask } from "@/interface/ITask"
import { ref } from "vue"
import { getLabTaskPage, getTaskTestObject } from "@/api/functionRoom2.api"
const props = defineProps<{
  data: ITask
  labId: string
}>()

const testObj = ref<any>({})

const loading = ref(false)

async function getTestObj() {
  loading.value = true
  const { code, data } = await getTaskTestObject(props.data.testObjectId).finally(() => {
    loading.value = false
  })
  if (code === 20000) {
    testObj.value = data
  }
}
getTestObj()

const detail = ref<any>(props.data)
async function getDetail() {
  if (!props.data.taskId) {
    return
  }
  const { code, data: res } = await getLabTaskPage({
    taskId: props.data.taskId,
    labId: props.labId
  })
  if (code === 20000 && res.rows.length) {
    detail.value = res.rows[0]
  }
}
getDetail()
</script>
<style lang="less" scoped>
.label {
  color: #707c8c;
}
.line {
  margin-bottom: 0.16rem;
  &:nth-last-child(1) {
    margin-bottom: 0rem;
  }
  &.line_flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &.action {
    display: flex;
    justify-content: flex-end;
    .btn + .btn {
      margin-left: 0.24rem;
    }
  }
  .info_item {
    display: flex;
    align-items: center;
    & + .info_item {
      margin-top: 0.16rem;
    }
    > span {
      flex: 1;
      display: flex;
      align-items: center;
      .label {
        white-space: nowrap;
        margin-right: 0.12rem;
      }
      .value {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
    img {
      width: 0.24rem;
      height: 0.24rem;
      margin-right: 0.12rem;
    }
  }
}
.title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .name {
    flex: 1;
    white-space: nowrap;
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .status {
    font-weight: bold;
    font-size: 0.28rem;
  }
}
</style>
