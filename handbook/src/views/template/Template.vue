<script lang="ts" setup name="Module">
import { Button, Input, Spin, message } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { groupTemplateTestItem } from 'custodian'
import NoData from '@/components/noData/index.vue'
import { translateError } from '@/utils/translateError'

const router = useRouter()
interface TestItemDTO {
  testItemId: string
  testItemName: string
}

onMounted(() => {
  getDatas()
})

// 查询数据
const loading = ref(false)
const searchValue = ref('')
const moduleDatas = ref<TestItemDTO[]>([])
async function getDatas() {
  try {
    loading.value = true
    const res = await groupTemplateTestItem()
    moduleDatas.value = res
  }
  catch (err) {
    const error = translateError(err)
    message.error(error.message)
  }
  loading.value = false
}

let cacheDatas: TestItemDTO[] = []
function onSearch(keyword: string) {
  if (cacheDatas.length === 0)
    cacheDatas = moduleDatas.value

  if (keyword) {
    const list = cacheDatas.filter(item => item.testItemName.includes(keyword))
    moduleDatas.value = list
  }
  else {
    moduleDatas.value = cacheDatas
  }
}

// 点击模板
function moduleDetail(testItemId: string) {
  router.push({
    path: '/templateList',
    query: { testItemId },
  })
}
</script>

<template>
  <div class="show-title-bar module-wrap">
    <TitleBar hide-left />
    <Spin :spinning="loading" class="custom-spin" />
    <div class="module-content">
      <div class="module-search pd-lr">
        <div class="search-or-more">
          <Input.Search
            v-model:value.trim="searchValue"
            placeholder="请输入检测项目名称查询"
            allow-clear
            @search="onSearch"
          >
            <template #enterButton>
              <Button type="primary">
                <i class="iconfont icon-sousuo" />
              </Button>
            </template>
          </Input.Search>
        </div>
      </div>
      <div class="module-datas">
        <ul class="pd-lr">
          <li
            v-for="item in moduleDatas"
            :key="item.testItemId"
            class="module-item my-list"
            @click="moduleDetail(item.testItemId)"
          >
            <img
              class="img-folder"
              src="@/assets/images/tree-close.svg"
              alt=""
            >
            <span class="module-name">{{ item.testItemName }}</span>
          </li>
          <NoData v-if="moduleDatas.length === 0" />
        </ul>
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
.module-search {
  padding: 1.5rem 2.5rem 0.5rem;
  .handles {
    margin-top: 1.5rem;
    .hint {
      float: right;
      font-size: 14px;
      color: #999;
      line-height: 32px;
    }
  }
}

.module-datas {
  flex: 1;
  overflow-y: auto;
  .module-item {
    padding: 8px 12px;
    display: flex;
    align-items: center;
    font-size: 16px;
    line-height: 20px;

    .img-folder {
      margin-right: 12px;
      width: 32px;
      height: 32px;
    }
  }
}

@media screen and (max-width: 480px) {
  .module-datas {
    .module-item {
      font-size: 14px;
    }
  }
}
</style>
