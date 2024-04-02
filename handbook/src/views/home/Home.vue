<script lang="ts" setup>
import { RightOutlined } from '@ant-design/icons-vue'
import { Spin } from 'ant-design-vue'
import { onMounted, ref } from 'vue'
import { TaskQuery, countTask } from 'custodian'
import { z } from 'zod'
import DataVersion from './DataVersion.vue'
import { request } from '@/axios'
import router from '@/router'
import autoUpdate from '@/stores/autoUpdate'

onMounted(() => {
  initOnlineData()
  getWriteCount()
  getEditedCount()
  getUploadedCount()
})

// 初始化在线数据
const dataVersionRef = ref()
function initOnlineData() {
  getOnlineTaskCount()
  dataVersionRef.value.checkDataVersion()
  autoUpdate().initAutoUpdate()
}

const query = new TaskQuery()
const writeCount = ref(0)
const editedCount = ref(0)
const uploadedCount = ref(0)
function getWriteCount() {
  query.status = ['pending']
  countTask(query).then((res) => {
    writeCount.value = res
  })
}
function getEditedCount() {
  query.status = ['edited']
  countTask(query).then((res) => {
    editedCount.value = res
  })
}
function getUploadedCount() {
  query.status = ['uploaded']
  countTask(query).then((res) => {
    uploadedCount.value = res
  })
}

// 在线任务数
const spinning = ref(false)
const onlineCount = ref<number>(0)
async function getOnlineTaskCount() {
  spinning.value = true
  try {
    spinning.value = false
    const res = await request({
      url: '/ilis2/rest/handbook/online/task/list',
      method: 'get',
      params: {
        page: 1,
        size: 1,
        status: '10',
      },
      schema: z.object({
        count: z.number(),
      }),
    })

    onlineCount.value = res.count

    return true
  }
  catch (err) {
    spinning.value = false
    return false
  }
}

function goCreateTask() {
  router.push({
    path: '/testTaskRegister',
  })
}

function goTaskListPage(key: string, status?: string) {
  router.push({
    path: '/testTask',
    query: {
      tabKey: key,
      status,
    },
  })
}
</script>

<template>
  <div class="home-wrap pd">
    <Spin :spinning="spinning">
      <div class="banner">
        <img class="img-bg" src="@/assets/images/home-bg.svg" alt="背景">
      </div>
      <h3 class="page-title">
        试验任务
      </h3>
      <ul class="my-card-box test-task">
        <li class="my-card wait-handle" @click="goTaskListPage('1', '10')">
          <p class="count">
            {{ onlineCount }}
          </p>
          <p class="title">
            待处理-在线任务
          </p>
        </li>
        <li class="my-card finish" @click="goTaskListPage('2', 'pending')">
          <p class="count">
            {{ writeCount }}
          </p>
          <p class="title">
            未填写-离线任务
          </p>
        </li>
      </ul>
      <h3 class="page-title">
        离线管理
      </h3>
      <ul class="my-card-box off-line-manage">
        <li class="my-card">
          <div class="datas">
            <p class="count">
              {{ editedCount }}
            </p>
            <p class="title">
              待上传任务
            </p>
          </div>
          <a class="link" href="#" @click="goTaskListPage('2', 'edited')">
            立即同步
            <RightOutlined class="icon-right" />
          </a>
        </li>
        <li class="my-card">
          <div class="datas">
            <p class="count">
              {{ uploadedCount }}
            </p>
            <p class="title">
              已上传任务
            </p>
          </div>
          <a class="link" href="#" @click="goTaskListPage('2', 'uploaded')">
            查看详情
            <RightOutlined class="icon-right" />
          </a>
        </li>
      </ul>
      <div class="my-card-box off-line-help">
        <div class="my-card">
          <div class="datas">
            <p class="count">
              没有网络怎么填写记录？
            </p>
            <p class="title">
              如需在无网络环境下填写数据，请当有网络时提前将您需要的试验对应模板下载到本地缓存。
            </p>
          </div>
          <a class="link" href="#" @click="goCreateTask">
            去创建
            <RightOutlined class="icon-right" />
          </a>
        </div>
      </div>
    </Spin>

    <DataVersion ref="dataVersionRef" />
  </div>
</template>

<style lang="less" scoped>
.page-title {
  margin-top: 1.5rem;
}

.banner {
  display: flex;
  align-items: center;
  width: 100%;
  height: auto;
  min-height: 100px;
  background: linear-gradient(#0657f1, #0284fe);
  border-radius: 1.6rem;

  .img-bg {
    display: block;
    width: 100%;
    height: auto;
  }

  .welcome-msg {
    margin-left: 5%;
    font-size: 3.6rem;
    font-weight: bold;
    color: #fff;
  }
}

.my-card-box {
  display: flex;

  .my-card {
    padding: 2.4rem 3.2rem;
    flex: 1;

    &:last-child:not(:first-child) {
      margin-left: 2rem;
    }
  }
}

/* 试验任务 */
.test-task {
  .wait-handle {
    background: url('@/assets/images/img-test-1.png') 96% 92%/9.7rem 9.7rem
        no-repeat,
      linear-gradient(145deg, #dee9f8, #fff 60%);
  }

  .finish {
    background: url('@/assets/images/img-test-2.png') 96% 92%/9.7rem 9.7rem
        no-repeat,
      linear-gradient(145deg, #fbf0dd, #fff 60%);
  }

  .count {
    margin-top: 1.5rem;
    font-size: 40px;
    font-weight: bold;
  }

  .title {
    margin-top: 1rem;
    margin-bottom: 1rem;
    font-size: 18px;
  }
}

/* 离线管理 */
.off-line-manage,
.off-line-help {
  font-size: 14px;

  .count {
    font-size: 40px;
    font-weight: bold;
    color: var(--primary-color);
  }

  .title {
    margin-top: 1rem;
    line-height: 20px;
  }

  .link {
    display: block;
    margin-top: 1.5rem;
    color: var(--primary-color);
  }
}

.off-line-help {
  margin-top: 2.5rem;

  .count {
    color: var(--text-color);
    font-size: 18px;
  }
}

/* 横屏模式 */
.main-horizontal {
  .banner {
    .welcome-msg {
      font-size: 34px;
    }
  }

  .test-task {
    .my-card {
      padding: 1.5rem 3.2rem;
    }

    .count {
      margin-top: 0;
    }

    .wait-handle,
    .finish {
      background-size: 8rem 8rem, 100% 100%;
    }
  }

  .off-line-manage,
  .off-line-help {
    .my-card {
      display: flex;
      align-items: center;

      .datas {
        flex: 1;
      }

      .link {
        margin-top: 0;
      }
    }
  }
}

@media screen and (max-width: 480px) {
  .page-title {
    margin-top: 3rem;
    font-size: 16px;
  }

  .test-task .my-card{
    padding: 1.6rem 2.4rem;
  }

  .my-card-box {

  .my-card {
    padding: 1.6rem 2.4rem;
  }
}

  .test-task,
  .off-line-manage {
    .count {
      font-size: 26px;
    }

    .title {
      font-size: 14px;
    }
  }

  .off-line-help {
    .count {
      font-size: 14px;
    }
    .title, .link{
      font-size: 12px;
      line-height: 16px;
    }
  }
}

@media screen and (max-width: 414px) {
  .test-task,
  .off-line-manage {
    .count {
      font-size: 24px;
    }

    .title, .link {
      font-size: 12px;
    }
  }
}
</style>
