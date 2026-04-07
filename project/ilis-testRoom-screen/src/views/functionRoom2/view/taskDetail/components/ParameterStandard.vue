<template>
  <div class="list">
    <CommonTitle>
      <template #icon>
        <img
          style="width: 100%; height: 100%"
          src="@/assets/images/functionRoom2/taskIcon.png"
          alt=""
        />
      </template>
      参数规范
    </CommonTitle>
    <van-skeleton :row="5" class="line" :loading="loading">
      <div v-if="paramList?.length">
        <Container v-for="i in paramList" :key="i.id" class="item">
          <CommonLine
            class="line"
            align="left"
            label="检测参数："
            :value="i.testParamDisplayName"
          ></CommonLine>
          <CommonLine class="line" align="left" label="试验依据：">
            <template #value>
              <span
                v-for="(item, index) in i?.testObjectParamUseStandardVOs?.filter((i) =>
                  ['1', '3'].includes(i.baseStandardUseType)
                )"
                :key="index"
                :style="{ color: item.fileUrl ? '#0066ec' : '#999' }"
                @click="handleLookOut(item)"
              >
                {{
                  `
                  ${item.baseStandardName || ""}${
                    item.clauseCode ? `（${item.clauseCode || ""}）` : ""
                  }
                  ${
                    index ===
                    i?.testObjectParamUseStandardVOs?.filter((i) =>
                      ["1", "3"].includes(i.baseStandardUseType)
                    )?.length -
                      1
                      ? ""
                      : "，"
                  }
                  `
                }}
              </span>
            </template>
          </CommonLine>
          <CommonLine class="line" align="left" label="评定标准：">
            <template #value>
              <span
                v-for="(item, index) in i?.testObjectParamUseStandardVOs?.filter((i) =>
                  ['2', '3'].includes(i.baseStandardUseType)
                )"
                :key="index"
                :style="{ color: item.fileUrl ? '#0066ec' : '#999' }"
                @click="handleLookOut(item)"
              >
                {{
                  `
                  ${item.baseStandardName}${item.clauseCode ? `（${item.clauseCode}）` : ""}
                  ${
                    index ===
                    i?.testObjectParamUseStandardVOs?.filter((i) =>
                      ["2", "3"].includes(i.baseStandardUseType)
                    )?.length -
                      1
                      ? ""
                      : "，"
                  }
                  `
                }}
              </span>
            </template>
          </CommonLine>
        </Container>
      </div>
      <van-empty v-else description="暂无数据" :image="emptyImage" />
    </van-skeleton>
    <van-popup v-model:show="showCenter" round :style="{ width: '90%', height: '90%' }" closeable>
      <div class="title"></div>
      <div style="height: calc(100% - 0.6rem)">
        <PreView v-if="currentData && showCenter" class="content" :data="currentData"></PreView>
      </div>
    </van-popup>
  </div>
</template>
<script lang="ts" setup>
import { getLabSubTaskParam } from "@/api/functionRoom2.api"
import { ITask } from "@/interface/ITask"
import CommonLine from "@/views/functionRoom2/components/CommonLine.vue"
import CommonTitle from "@/views/functionRoom2/components/CommonTitle.vue"
import Container from "@/views/functionRoom2/components/Container.vue"
import { ref } from "vue"
import emptyImage from "@/assets/images/functionRoom2/empty.svg"
import PreView from "@/views/functionRoom2/view/deviceDetail/components/PreView.vue"
const props = defineProps<{
  data: ITask
}>()

const paramList = ref<any[]>([])

const loading = ref(false)

const showCenter = ref(false)

const currentData = ref<any>()

async function getParamList() {
  loading.value = true
  const { code, data } = await getLabSubTaskParam(props.data.taskId).finally(() => {
    loading.value = false
  })
  if (code === 20000) {
    paramList.value = data
  }
}
getParamList()

function handleLookOut(data: any) {
  if (data.fileUrl) {
    currentData.value = {
      name: data.baseStandardName,
      url: data.fileUrl
    }
    showCenter.value = true
  }
  // window.open(`https://www.doc88.com/tag/${name}`)
}
</script>
<style lang="less" scoped>
.list {
  .item {
    margin-bottom: 0.32rem;
    .line {
      & + .line {
        margin-top: 0.24rem;
      }
    }
  }
}
.title {
  height: 0.6rem;
  background-color: linear-gradient(180deg, #97a6b2 0%, #697f90 100%);
}
</style>
