<template>
  <div class="sampleScanRecord">
    <div class="header_wrap" :class="[isGscl ? 'header_wrap_gscl' : '']">
      <div class="content">
        <div v-if="isGscl" class="logo">
          <img :src="`${fsStaticPath}/vueImage/logo_gscl.png`" />
        </div>
        <h2 v-else>
          智慧试验检测质量管理控制云平台
        </h2>
        <div class="rt">
          <a-avatar

            :src="userInfo.iconUrl"
            size="large"
            style="margin-right: 15px; border: 1px solid #deecff"
          />
          <a-dropdown size="large">
            <a class="ant-dropdown-link">
              欢迎您！{{ userInfo.realName }}
              <DownOutlined />
            </a>
            <template #overlay>
              <a-menu>
                <a-menu-item>
                  <a href="javascript:;" @click="exitSystem">退出登录</a>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </div>
    </div>
    <div class="page_main">
      <div class="body_wrap tab_view">
        <a-spin :spinning="loading"></a-spin>

        <a-tabs
          v-if="!isGscl"
          size="small"
          style="height: 100%"
          @change="tabChange"
        >
          <a-tab-pane
            v-for="item in data"
            :key="item.id"
            :tab="item.functionName"
          >
            <div
              :id="item.id"
              class="scrollWrap"
              style="width: 100%; height: 100%; overflow: auto"
            >
              <ul v-if="item.subFunctions.length" class="sys_list">
                <li
                  v-for="cit in item.subFunctions"
                  :key="cit.id"
                  class="sys_item"
                >
                  <div class="sys_head">
                    <img :src="cit.iconUrl || defImg" />
                    <div style="flex: 1; width: 0">
                      <p class="sys_name">
                        {{ cit.functionName }}
                      </p>
                      <p class="handle_a">
                        <a @click="goRecords(cit)">数据中心</a>
                        <a @click="goSystem(cit)">进入系统</a>
                      </p>
                    </div>
                  </div>
                  <div class="sys_descride">
                    {{ cit.functionExplain || '' }}
                  </div>
                </li>
              </ul>
              <div
                v-else
                style="text-align: center; height: 81px; line-height: 88px"
              >
                暂无数据！
              </div>
            </div>
          </a-tab-pane>
        </a-tabs>

        <!-- 甘肃畅陇需求：平台菜单不要分类，全部平铺展示 -->
        <template v-else>
          <div class="scrollWrap" style="width: 100%; height: 100%">
            <ul v-if="data.length" class="sys_list">
              <li
                v-for="cit in data"
                :key="cit.id"
                class="sys_item sys_item_gscl"
              >
                <div class="sys_head">
                  <img :src="cit.iconUrl || defImg" />
                  <div style="flex: 1; width: 0">
                    <p class="sys_name">
                      {{ cit.functionName }}
                    </p>
                    <p class="handle_a">
                      <a @click="goRecords(cit)">数据中心</a>
                      <a @click="goSystem(cit)">进入系统</a>
                    </p>
                  </div>
                </div>
                <!-- <div class="sys_descride">{{ cit.functionExplain || "" }}</div> -->
              </li>
            </ul>
            <div
              v-else
              style="text-align: center; height: 81px; line-height: 88px"
            >
              暂无数据！
            </div>
          </div>
        </template>
      </div>
    </div>
    <div style="text-align: center; color: rgb(163, 163, 163); padding: 15px">
      {{
        isGscl
          ? '技术支持：重庆海特科技发展有限公司'
          : '版权所有：重庆市交通规划和技术发展中心，重庆海特科技发展有限公司，招商局重庆公路工程检测中心有限公司，四川升拓检测技术股份有限公司，重庆市交通工程质量检测有限公司'
      }}
    </div>
  </div>
</template>

<script>
/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import { DownOutlined } from '@ant-design/icons-vue'
import OpenHitekUdrTool from '~/providers/libs/openHitekUdrTool'

const baseUrl = `${location.origin}/ilis2`

export default {
  components: {
    DownOutlined
  },
  data() {
    return {
      defImg:
        'https://pro.ilis.cn/fileShare/csdw/A03/images/2023/952566ab-7bd5-4ee7-ba6d-366377c84a20.png',
      data: [],
      loading: false,
      userInfo: {},
      fsStaticPath: window.$fsStaticPath,
    }
  },
  computed: {
    isGscl() {
      return this.userInfo.unitCode === 'gscl'
    },
  },
  async created() {
    document.title = '智慧试验检测质量管理控制云平台'
    try {
      this.loading = true
      await this.getUserInfo()
      await this.getData()
    } catch (err) {}
    this.loading = false
  },
  methods: {
    goSystem(row) {
      // 指定使用ie浏览器打开
      let openIE = row.browser === 'IE'
      const browser = this.getBrowser()
      // 当前浏览器就是ie，则直接打开
      if (browser.includes('IE')) {
        openIE = false
      }
      this.goTokenByUrl(row.id, row.functionUrl, openIE)
    },
    goRecords(row) {
      this.goTokenByUrl(row.id, row.boardUrl)
    },
    exitSystem() {
      window.$oAjax.get(`${baseUrl}/loginController.do?logout`).then((res) => {
        location.href = `${baseUrl}`
      })
    },
    goTokenByUrl(functionId, url, openIE = false) {
      window.$oAjax
        .get(`${baseUrl}/rest/auth/platformToken?functionId=${functionId}`)
        .then((res) => {
          if (res.code === 20000) {
            if (!url) {
              window.$oAntdMessage.warning('地址未配置!')
              return
            }
            const connector = url.includes('?') ? '&' : '?'
            const href = `${url}${connector}auth_token=${res.data}`
            if (!openIE) {
              window.open(href)
            } else {
              OpenHitekUdrTool(href, 'max')
            }
          }
        })
    },
    tabChange(v) {
      this.data.forEach((item) => {
        if (item.id == v) {
          if (item.subFunctions.length) {
            this.nowOpenData = item.subFunctions[0]
          } else {
            this.nowOpenData = {}
          }
        }
      })
    },
    // 查询
    search(e) {
      e && e.preventDefault && e.preventDefault()
      this.page = 1
      this.getData()
    },

    async getData() {
      return await window.$oAjax
        .post(
          `${baseUrl}/functionController.do?getUserFunctionTreeJson&functionType=10`
        )
        .then((res) => {
          if (res.success) {
            if (res.obj.length && res.obj[0].subFunctions) {
              if (this.isGscl) {
                const list = []
                res.obj[0].subFunctions.forEach((item) => {
                  item.subFunctions && list.push(...item.subFunctions)
                })
                this.data = list
              } else {
                this.data = res.obj[0].subFunctions
              }
            }
          }
          return res
        })
        .catch((err) => {
          window.$oAntdMessage.error(
            err.message || '系统异常，请稍后重试或联系系统技术支持人员！'
          )
          return Promise.reject(err)
        })
    },

    async getUserInfo() {
      return await window.$oAjax
        .get(`${baseUrl}/userController.do?getCurrentUser`)
        .then((res) => {
          if (res.success) {
            this.userInfo = res.obj
          }
          return res
        })
        .catch((err) => {
          return Promise.reject(err)
        })
    },
    getBrowser() {
      const userAgent = navigator.userAgent
      const isIE11 = userAgent.toLowerCase().match(/rv:([\d.]+)\) like gecko/)
      const isOpera = userAgent.includes('Opera')
      const isIE =
        (userAgent.includes('compatible') &&
          userAgent.includes('MSIE') &&
          !isOpera) ||
        isIE11
      const isEdge = userAgent.includes('Edge')
      const isFF = userAgent.includes('Firefox')
      const isSafari =
        userAgent.includes('Safari') && !userAgent.includes('Chrome')
      const isChrome =
        userAgent.includes('Chrome') && userAgent.includes('Safari')

      if (isIE) {
        const reIE = new RegExp('MSIE (\\d+\\.\\d+);')
        reIE.test(userAgent)
        const fIEVersion = Number.parseFloat(RegExp.$1)
        if (fIEVersion === 7) {
          return 'IE7'
        } else if (fIEVersion === 8) {
          return 'IE8'
        } else if (fIEVersion === 9) {
          return 'IE9'
        } else if (fIEVersion === 10) {
          return 'IE10'
        } else if (isIE11) {
          return 'IE11'
        } else {
          return 'IE'
        }
      }
      if (isOpera) {
        return 'Opera'
      }
      if (isEdge) {
        return 'Edge'
      }
      if (isFF) {
        return 'Firefox'
      }
      if (isSafari) {
        return 'Safari'
      }
      if (isChrome) {
        return 'Chrome'
      }
      return 'Unknown'
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
