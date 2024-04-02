<script lang="ts" setup>
import { Button, Input, Spin } from 'ant-design-vue'
import { computed, onMounted, provide, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { findTemplates } from 'custodian'
import type { Template } from 'custodian'
import { openUdrReadonly } from '../../testTask/udr'
import RollingLoading from '@/components/rollingLoading/index.vue'

const route = useRoute()
const testItemId = ref('')
onMounted(() => {
  testItemId.value = route.query.testItemId as string
  getDatas()
})

const searchParams = reactive({
  keyword: '',
  page: 0,
  pageSize: 100,
})

const moduleDatas = ref<Template[]>([])
const loading = ref(false)
const previewLoading = ref(false)
const total = ref(0)
const dataLength = computed(() => moduleDatas.value.length)

provide('loading', loading)
provide('total', total)
provide('dataLength', dataLength)

async function getDatas(flag?: boolean) {
  loading.value = true
  if (flag)
    searchParams.page++
  else searchParams.page = 1

  const res = await findTemplates(testItemId.value)
  moduleDatas.value = res

  loading.value = false
}

let cacheDatas: Template[] = []
function onSearch(keyword: string) {
  if (cacheDatas.length === 0)
    cacheDatas = moduleDatas.value

  if (keyword) {
    const list = cacheDatas.filter(item => item.name.includes(keyword))
    moduleDatas.value = list
  }
  else {
    moduleDatas.value = cacheDatas
  }
}

// 预览模板
function previewTemplate(item: Template) {
  previewLoading.value = true
  openUdrReadonly(item.main, '模板详情').finally(() => previewLoading.value = false)
}
</script>

<template>
  <div class="show-title-bar module-wrap">
    <TitleBar title="模板" />

    <div class="module-content">
      <div class="module-search pd-lr">
        <Input.Search
          v-model:value.trim="searchParams.keyword"
          allow-clear
          placeholder="请输入文件名称"
          @search="onSearch"
        >
          <template #enterButton>
            <Button type="primary">
              <i class="iconfont icon-sousuo" />
            </Button>
          </template>
        </Input.Search>
      </div>
      <div class="module-datas">
        <RollingLoading @load="getDatas(true)">
          <ul class="pd-lr">
            <Spin :spinning="previewLoading">
              <li
                v-for="item in moduleDatas"
                :key="item.id"
                class="module-list my-list"
                @click="previewTemplate(item)"
              >
                <img
                  class="img-folder"
                  src="@/assets/images/tree-file.svg"
                  alt=""
                >
                <span class="module-name">{{ item.name }}</span>
              </li>
            </Spin>
          </ul>
        </RollingLoading>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.module-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.module-tabs {
  background-color: #fff;
  .ant-tabs-nav-list {
    width: 100%;
    .ant-tabs-tab {
      flex: 1;
    }
  }
}
.module-search {
  margin-top: 1rem;
  background-color: #fff;
  .batch-handle {
    padding: 1rem 0 0.2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .handles {
      margin-right: -1.2rem;
      min-height: 40px;
    }
  }
}

.module-datas {
  padding-top: 1rem;
  padding-bottom: 1rem;
  flex: 1;
  height: 0;
  .module-list {
    display: flex;
    align-items: center;
    .img-folder {
      margin-right: 6px;
      width: 32px;
      height: 32px;
    }
  }
  .module-name {
    width: 60%;
  }
}

@media screen and (max-width: 480px) {
  .module-datas {
    .module-name {
      font-size: 14px;
    }
  }
}
</style>
