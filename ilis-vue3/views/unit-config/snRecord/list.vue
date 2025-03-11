<template>
  <AppProvider>
    <a-card class=" h-full w-full ">
      <div class=" flex flex-col gap-3 flex-1 h-full ">
        <a-space
          class=" sticky top-0"
          direction="vertical"
          style="width: 100%;"
        >
          <a-form
            ref="formRef"
            :model="formState"
            layout="inline"
            @submit="handleSearch"
          >
            <a-form-item name="sn">
              <a-input
                v-model:value="formState.sn"
                class=" w-[240px]"
                placeholder="请输入编号"
                allow-clear
              ></a-input>
            </a-form-item>
            <a-form-item class=" w-[240px]" name="typeCode">
              <a-select v-model:value="formState.typeCode" placeholder="请选择分类">
                <a-select-option v-for="item in dict" :key="item.id" :value="item.typecode">
                  {{ item.typename }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-button type="primary" html-type="submit">
              查询
            </a-button>
          </a-form>
          <div>
            <BaseTitle>最新编号</BaseTitle>
            <div v-if="changeHistory?.length">
              <div v-for="(log) in changeHistory" :key="log.typeName">
                <div class=" mb-3">
                  <span>{{ log.typeName }}</span>：
                  <span>{{ log.categoryName }}</span>
                </div>
                <div class=" flex flex-wrap gap-3 mb-3">
                  <div v-for="(code, index3) in log.codes" :key="code">
                    <a-tag>
                      {{ code }}
                    </a-tag>
                    <span v-if="index3 < log.codes.length - 1">=></span>
                  </div>
                </div>
              </div>
            </div>
            <a-empty v-else></a-empty>
          </div>
          <div>
            <BaseTitle>使用或修改编号列表</BaseTitle>
            <div v-if="logData?.length">
              <div v-for="(item, index) in logData" :key="index">
                <div class=" mb-3">
                  <span>{{ item.typeName }}</span>：
                  <span>{{ item.categoryName }}</span>
                </div>
                <a-table
                  :loading="loading"
                  :data-source="item.logs"
                  :columns="columns"
                  :pagination="false"
                >
                </a-table>
              </div>
            </div>
            <a-empty v-else></a-empty>
          </div>
        </a-space>
      </div>
    </a-card>
  </AppProvider>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import type { ColumnsType } from 'ant-design-vue/es/table'
import { getSnDictContent, getSnHistoryList, getSnHistoryLog } from './api'
import { OperateTypeDict } from '.'

const formRef = ref()

const formState = ref({
  sn: '',
  typeCode: undefined,
})

const logData = ref([] as any[])

const changeHistory = ref([] as any[])

const dict = ref([] as any[])

const loading = ref(false)

const columns: ColumnsType = [
  { dataIndex: 'operateType', title: '操作类型', ellipsis: true, customRender: ({ text }) => OperateTypeDict.getLabelByKey(text as unknown as string) },
  { dataIndex: 'useSn', title: '使用该编号数据的当前编号', ellipsis: true },
  { dataIndex: 'operateUser', title: '操作人', ellipsis: true },
  { dataIndex: 'operateTime', title: '操作时间', ellipsis: true },
]

async function getSnDict() {
  const { data } = await getSnDictContent({
    list: JSON.stringify(['@SNType@']),
  })
  dict.value = data?.attributes?.SNType || []
}

async function handleSearch() {
  if (!formState.value.typeCode || !formState.value.sn) {
    message.warning('请输入编号并选择分类')
    return
  }
  loading.value = true
  const { data } = await getSnHistoryList((formState.value.typeCode as unknown as string), formState.value.sn)
  const { data: res } = await getSnHistoryLog((formState.value.typeCode as unknown as string), formState.value.sn)
  changeHistory.value = data || []
  logData.value = res || []
  loading.value = false
}

getSnDict()
</script>

<style  lang="less" scoped>
:deep(.ant-card-body){
  width: 100%;
  height: 100%;
  overflow: hidden;
}
.target{
  background: #0066ec;
  color: #fff;
}
</style>
