<template>
  <div class="main">
    <router-view v-slot="{ Component }">
      <keep-alive :include="keepAliveRouteNames">
        <component :is="Component"></component>
      </keep-alive>
    </router-view>

    <van-tabbar v-if="showTabBar" v-model="active" :placeholder="true">
      <van-tabbar-item to="/home" name="home" icon="notes-o">
        首页
        <template #icon="props">
          <svg
            width="22px"
            height="22px"
            viewBox="0 0 44 44"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
          >
            <g
              id="页面-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
            >
              <g
                id="菜单页"
                transform="translate(-103.000000, -1924.000000)"
                :fill="props.active ? '#154BD0' : '#B6BEC6'"
                fill-rule="nonzero"
              >
                <g id="编组-8" transform="translate(0.000000, 1914.000000)">
                  <g
                    id="首页-选中"
                    transform="translate(103.000000, 10.000000)"
                  >
                    <path
                      id="形状"
                      d="M15.094166,25.304713 L15.094166,25.3047141 C15.094166,29.1190287 18.1862782,32.2111323 22.0005842,32.2111323 C25.8148988,32.2111323 28.9070024,29.1190201 28.9070024,25.3047141 L28.9070024,25.3047141 C28.9070024,21.4903995 25.8148902,18.3982959 22.0005842,18.3982959 C18.1862696,18.3982959 15.094166,21.4904081 15.094166,25.3047141 L15.094166,25.304713 Z M25.4751273,1.51353301 L42.059881,15.3263694 L42.059881,15.3263694 C42.8793433,16.2049095 43.3340606,17.3621968 43.331843,18.5635916 L43.331843,38.5828844 L43.331843,38.5842177 C43.331843,41.2056367 41.2067529,43.3307232 38.5853295,43.3307232 C38.584885,43.3307232 38.5844405,43.3307232 38.5839961,43.3307232 L5.41315669,43.3307232 L5.41315686,43.3307232 C2.79173779,43.3307232 0.666651333,41.2056408 0.666651333,38.5842175 C0.666651333,38.5837731 0.666651333,38.5833288 0.666651333,38.5828845 L0.666651333,18.5609276 C0.666651333,17.3596359 1.11996806,16.2023443 1.93860964,15.3263738 L18.5246953,1.51353741 L18.5246951,1.51353766 C20.3102206,-0.405771213 23.3135679,-0.514220167 25.2328982,1.27130707 C25.3165301,1.34910938 25.3973261,1.42990534 25.4751284,1.51353723 L25.4751273,1.51353301 Z"
                    ></path>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/menuPage" name="menuPage" icon="apps-o">
        工作台
        <template #icon="props">
          <svg
            width="22px"
            height="22px"
            viewBox="0 0 44 44"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
          >
            <title>工作台</title>
            <g
              id="页面-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
            >
              <g
                id="菜单页"
                transform="translate(-353.000000, -1924.000000)"
                :fill="props.active ? '#154BD0' : '#B6BEC6'"
                fill-rule="nonzero"
              >
                <g id="编组-8" transform="translate(0.000000, 1914.000000)">
                  <g id="编组-4" transform="translate(250.000000, 0.000000)">
                    <g
                      id="编组-10"
                      transform="translate(103.000000, 10.000000)"
                    >
                      <g id="编组" transform="translate(0.000000, 0.000000)">
                        <g id="菜单" transform="translate(2.000000, 0.000000)">
                          <path
                            id="形状"
                            d="M20.0000256,0 L39.250048,11.0000128 L39.250048,33.0000384 L20.0000256,44.0000512 L0.7500032,33.0000384 L0.7500032,11.0000128 L20.0000256,0 Z M22.6840287,23.4135272 L32.2980399,18.8540219 L32.29804,18.8540219 C33.5985122,18.0694976 34.0167748,16.3792768 33.2322504,15.0788003 C32.4738597,13.8216407 30.8616703,13.3819538 29.5700368,14.0800164 L19.9340256,18.3810214 L10.3090144,14.0800164 L10.3090145,14.0800165 C8.97287822,13.3579043 7.30433527,13.8556703 6.5822274,15.1918084 C5.88416916,16.4834419 6.32385557,18.0956313 7.58101137,18.854022 L17.1840225,23.4135273 L17.1840225,32.9670384 L17.1840225,32.9670388 C17.1840228,34.4858226 18.4152419,35.717042 19.9340257,35.717042 C21.4528095,35.717042 22.6840289,34.4858226 22.6840289,32.9670388 L22.6840289,23.4135277 L22.6840287,23.4135272 Z"
                          ></path>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </template>
      </van-tabbar-item>
      <van-tabbar-item to="/setting" name="setting" icon="user-o">
        我的
        <template #icon="props">
          <svg
            width="22px"
            height="22px"
            viewBox="0 0 44 44"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
          >
            <title>我的</title>
            <g
              id="页面-1"
              stroke="none"
              stroke-width="1"
              fill="none"
              fill-rule="evenodd"
            >
              <g
                id="菜单页"
                transform="translate(-603.000000, -1924.000000)"
                :fill="props.active ? '#154BD0' : '#B6BEC6'"
                fill-rule="nonzero"
              >
                <g id="编组-8" transform="translate(0.000000, 1914.000000)">
                  <g id="编组-5" transform="translate(500.000000, 0.000000)">
                    <g
                      id="编组-11"
                      transform="translate(103.000000, 10.000000)"
                    >
                      <g id="我-的" transform="translate(2.000000, 0.000000)">
                        <path
                          id="形状结合"
                          d="M30.8158353,27.0377095 C35.4880282,27.0377095 39.2746251,30.776338 39.2746251,35.3874549 L39.2746251,36.5805889 C39.2746251,40.5351592 36.0245953,43.7350378 32.0242192,43.7350378 L7.84529349,43.7350378 C3.83837374,43.7350378 0.594883849,40.5286308 0.594883849,36.5805889 L0.594883849,35.3874549 C0.590525173,30.776338 4.37713906,27.0377095 9.0558757,27.0377095 L30.8158353,27.0377095 Z M30.5,32 L24.5,32 C23.1192881,32 22,33.1192881 22,34.5 C22,35.8807119 23.1192881,37 24.5,37 L24.5,37 L30.5,37 C31.8807119,37 33,35.8807119 33,34.5 C33,33.1192881 31.8807119,32 30.5,32 L30.5,32 Z M32.0220721,0.793176706 L32.0220721,12.7223192 C32.0220721,19.3118127 26.6126407,24.6514617 19.9336828,24.6514617 C13.2569231,24.6514617 7.84529349,19.3118127 7.84529349,12.7223192 C7.84529349,6.1328258 13.2547249,0.793176706 19.9336828,0.793176706 L32.0220721,0.793176706 Z"
                        ></path>
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </template>
      </van-tabbar-item>
    </van-tabbar>

    <!-- 扫描二维码 -->
    <QrCodeScaner />
  </div>
</template>

<script setup lang='ts'>
import { useRoute } from 'vue-router'
import { keepAliveRouteNames } from '~/views/mobileApp/router'
import { useAppIndustryStore } from '~/views/mobileApp/store/useAppIndustryStore.ts'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'
import QrCodeScaner from './components/qrCodeScaner/index.vue'

const { userInfo } = useAppUserStore()

const hashParams = useUrlSearchParams('hash')

const urlParams = useUrlSearchParams('history')

const route = useRoute()

const active = ref('home')

const showTabBar = computed(() => {
  const name = route.name
  return name === 'home' || name === 'menuPage' || name === 'setting'
})

watch(route, (newObj) => {
  active.value = newObj.name as string
})

onMounted(() => {
  document.addEventListener('plusready', () => {
    if (plus && plus.navigator && plus.navigator.setStatusBarStyle) {
      plus.navigator.setStatusBarBackground('#154bd0')
    }
  })

  // 避免第三方登录逻辑触发时，获取领域导致cookie异常报错
  if (userInfo && !urlParams.htplat_token && !hashParams.htplat_token) {
    useAppIndustryStore().init()
  }
})
</script>

<style lang="less" scoped>
.main {
  .main-footBar {
    border-top: solid 1px #e2e2e2;
  }
}
</style>
