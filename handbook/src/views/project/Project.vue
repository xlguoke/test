<script lang="ts" setup>
import { RightOutlined } from '@ant-design/icons-vue'
import { Input, message } from 'ant-design-vue'
import { computed, onMounted, provide, ref } from 'vue'
import type { Project } from 'custodian'
import { ProjectQuery, countProjects, findProjects } from 'custodian'
import { useRouter } from 'vue-router'
import RollingLoading from '@/components/rollingLoading/index.vue'

const router = useRouter()
const query = new ProjectQuery()

onMounted(() => {
  query.size = 20
  getCount()
  getDatas()
})

const keyword = ref('')
let cahceKeyWord = ''
function onSearch(val: string) {
  if (cahceKeyWord !== val)
    getCount()
  cahceKeyWord = val
  getDatas()
}

const loading = ref(false)
const projectDatas = ref<Project[]>([])
const total = ref(0)
const dataLength = computed(() => projectDatas.value.length)

// rollingloading 组件使用
provide('loading', loading)
provide('total', total)
provide('dataLength', dataLength)

async function getDatas(flag?: boolean) {
  loading.value = true
  if (flag)
    query.page++
  else query.page = 1
  query.fuzzy = keyword.value
  try {
    const res = await findProjects(query)
    if (flag)
      projectDatas.value.push(...res)
    else projectDatas.value = res
  }
  catch (err: any) {
    console.error(err)
    message.error(err.message || '获取项目列表失败')
  }
  loading.value = false
}

// 查询总条数
async function getCount() {
  const count = await countProjects(query)
  total.value = count
}

function lookTask(name: string) {
  router.push({
    path: '/testTask',
    query: {
      tabKey: 1,
      projectName: name,
    },
  })
}
</script>

<template>
  <div class="show-title-bar project-wrap">
    <TitleBar hide-left />
    <div class="project-content">
      <div class="project-search pd-lr">
        <div class="search-or-more">
          <Input.Search
            v-model:value="keyword"
            allow-clear
            placeholder="请输入项目名称"
            @search="onSearch"
          >
            <template #enterButton>
              <i class="iconfont icon-sousuo" />
            </template>
          </Input.Search>
        </div>
      </div>

      <div class="project-datas">
        <RollingLoading @load="getDatas(true)">
          <ul class="pd-lr">
            <li
              v-for="item in projectDatas"
              :key="item.id"
              class="common-media-wrap my-list"
            >
              <div class="common-media-content">
                <div class="project-name">
                  <h4 class="name">
                    {{ item.name }}
                  </h4>
                  <!-- <div class="project-status project-status-2">
                    <span class="status">完成</span>
                    完成0/任务数0
                  </div> -->
                </div>
                <ul class="project-info">
                  <li class="item">
                    项目编号：{{ item.projectCode }}
                  </li>
                  <li class="item">
                    所属部门：{{ item.departNames }}
                  </li>
                  <li class="item">
                    项目创建日期：{{ item.createDate }}
                  </li>
                  <li class="item">
                    项目创建人：{{ item.constructionUnitName }}
                  </li>
                </ul>
              </div>
              <div class="common-media-handle">
                <a class="handle-item" @click="lookTask(item.name)">
                  <i class="iconfont icon-a-zu904" />
                  查看任务<RightOutlined />
                </a>
              </div>
            </li>
          </ul>
        </RollingLoading>
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.project-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.project-search {
  padding: 1.5rem 2.5rem;
  .search-or-more {
    display: flex;
    align-items: center;
    & > .iconfont {
      margin-left: 1.6rem;
      font-size: 26px;
      color: var(--primary-color);
    }
  }
  .batch-handle {
    padding: 1rem 0 0.2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .handles {
      margin-right: -1.2rem;
    }
  }
}

.project-datas {
  padding-bottom: 1rem;
  flex: 1;
  height: 0;
  .project-name {
    display: flex;
    align-items: center;
    font-size: 14px;
    .project-status {
      margin-left: 2rem;
      color: var(--success-color);
      .status {
        display: inline-block;
        padding: 0.4rem 0.8rem;
        margin-right: 0.5rem;
        transform: skewX(-15deg);
        background-color: var(--success-color);
        border-radius: 2px;
        font-size: 12px;
        color: #fff;
      }
    }
    .project-status-1 {
      color: var(--warning-color);
      .status {
        background-color: var(--warning-color);
      }
    }
    .project-status-2 {
      color: var(--primary-color);
      .status {
        background: linear-gradient(to right, var(--primary-color), #17c5ff);
      }
    }
  }
  .project-info {
    margin-top: 0.8rem;
    font-size: 12px;
    .item {
      display: inline-flex;
      padding: 0.5rem 1rem 0.5rem 0;
      width: 50%;
      line-height: 16px;
      box-sizing: border-box;
      span {
        white-space: nowrap;
      }
    }
  }
}

@media screen and (max-width: 480px) {
  .project-datas {
    .project-name .project-status {
      font-size: 12px;
    }
    .project-info {
      .item {
        width: 100%;
        line-height: 18px;
      }
    }
  }
}
</style>
