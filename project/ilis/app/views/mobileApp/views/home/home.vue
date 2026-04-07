<template>
  <div>
    <van-sticky>
      <MobileTitleBar class="left-title" :title="title" :hide-title="InWeChatWeb">
        <template #right>
          <img
            :src="scanSvg"
            width="20px"
            style="margin-right: 6px"
            @click="onScan"
          />
          <span @click="onScan">扫一扫</span>
        </template>
      </MobileTitleBar>

      <div
        v-if="messageList && messageList.length > 0"
        style="padding: 10px 15px; background: #fff"
      >
        <div class="home-notice">
          <div style="flex: 1">
            <van-notice-bar left-icon="volume-o" :scrollable="false">
              <van-swipe
                vertical
                class="notice-swipe"
                :autoplay="5000"
                :show-indicators="false"
              >
                <van-swipe-item
                  v-for="(item, index) in messageList"
                  :key="index"
                >
                  <router-link
                    :to="{ name: 'messageDetail', params: { id: item.id } }"
                  >
                    <div class="textOverflow">
                      {{ item.title }}
                    </div>
                  </router-link>
                </van-swipe-item>
              </van-swipe>
            </van-notice-bar>
          </div>
          <div style="font-size: 12px">
            <router-link to="/message">
              更多通知<van-icon
                name="arrow"
                style="
                  margin-bottom: 2px;
                  vertical-align: middle;
                  margin-left: 4px;
                "
              />
            </router-link>
          </div>
        </div>
      </div>

      <div v-if="noticeList && noticeList.length > 0" class="home-notice">
        <div style="flex: 1">
          <van-notice-bar left-icon="newspaper-o" :scrollable="false">
            <van-swipe
              vertical
              class="notice-swipe"
              :autoplay="5000"
              :show-indicators="false"
            >
              <van-swipe-item v-for="(item, index) in noticeList" :key="index">
                <div @click="goNoticeDetail(item.id)">
                  <div class="textOverflow">
                    {{ item.noticeTitle }}
                  </div>
                </div>
              </van-swipe-item>
            </van-swipe>
          </van-notice-bar>
        </div>
        <div>
          <router-link to="/notice">
            更多公告<van-icon
              name="arrow"
              style="margin-bottom: 2px; vertical-align: middle"
            />
          </router-link>
        </div>
      </div>
    </van-sticky>
    <div class="home-content">
      <div class="home-tile">
        待办事项
        <van-icon v-if="todoLoading" class-prefix="iconfont" name="shuaxin" />
      </div>
      <ul class="home-sample-list">
        <li
          v-for="(item, index) in sampleList"
          :key="index"
          v-permission="item.functionCode"
          class="home-sample-item"
        >
          <div class="home-sample-icon">
            <img
              v-if="item.img"
              class="home-sample-img-icon"
              :src="item.img"
              alt=""
            />
            <van-icon
              v-else
              :color="item.color"
              class-prefix="iconfont"
              :name="item.icon"
              size="22"
            />
          </div>
          <div class="home-sample-content">
            <div class="home-sample-value">
              {{ item.value }}
            </div>
            <div class="home-sample-label">
              {{ item.label }}
              <template v-if="item.isShow">
                <span class="status">(<span style="font-size: 12px">龄期到期</span>)</span>
              </template>
            </div>
          </div>
        </li>
      </ul>
      <div class="home-tile">
        快捷入口
      </div>
      <ul class="home-quick-list">
        <li
          v-for="(item, index) in quickList"
          :key="index"
          v-permission="item.functionCode"
          class="home-quick-item"
        >
          <template v-if="item.clickType">
            <div
              class="home-quick-box-icon"
              :style="`background: ${item.color}`"
              @click.stop="clickHandle(item, index)"
            >
              <img
                v-if="item.img"
                class="home-quick-img-icon"
                :src="item.img"
                alt=""
              />
              <van-icon
                v-else
                class-prefix="iconfont"
                :name="item.icon"
                size="24"
              />
            </div>
            <div class="home-quick-box-name">
              {{ item.name }}
            </div>
          </template>
          <template v-else-if="item.routerName">
            <router-link :to="{ name: item.routerName }">
              <div
                class="home-quick-box-icon"
                :style="`background: ${item.color}`"
              >
                <img
                  v-if="item.img"
                  class="home-quick-img-icon"
                  :src="item.img"
                  alt=""
                />
                <van-icon
                  v-else
                  class-prefix="iconfont"
                  :name="item.icon"
                  size="24"
                />
              </div>
              <div class="home-quick-box-name">
                {{ item.name }}
              </div>
            </router-link>
          </template>
        </li>
      </ul>
    </div>

    <AuthConfirm ref="authConfirmRef" />
  </div>
</template>

<script>
import { mapState, mapWritableState } from 'pinia'
import qs from 'qs'
import AuthConfirm from '~/views/mobileApp/components/authConfirm.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { qrCodeScanTool } from '~/views/mobileApp/provides/modules/qr-code-scan-tool'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import {
  InAndroid,
  InMiniProgram,
  InWeChatWeb,
} from '~/views/mobileApp/provides/utils/referrer'
import { useSampleStore } from '~/views/mobileApp/store/useSampleStore'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

export default {
  components: {
    AuthConfirm,
    MobileTitleBar,
  },
  data() {
    return {
      scanSvg: new URL(`~/views/mobileApp/assets/icon/scan.svg`, import.meta.url).href,
      InWeChatWeb,
      noticeList: [],
      messageList: [],
      todoLoading: false,
      sampleList: [
        {
          label: '待入库样品',
          img: new URL(`~/views/mobileApp/assets/home-img/icon1.svg`, import.meta.url).href,
          value: '-',
          str: 'waitStorageObject',
          functionCode: 'mobile_samplesWarehousedStatistics',
        },
        {
          label: '待检测',
          value: '-',
          str: 'waitTestTask',
          img: new URL(`~/views/mobileApp/assets/home-img/icon2.svg`, import.meta.url).href,
          isShow: true,
          functionCode: 'mobile_testStatistics',
        },
        {
          label: '留样到期',
          value: '-',
          str: 'expiredProcessObject',
          img: new URL(`~/views/mobileApp/assets/home-img/icon3.svg`, import.meta.url).href,
          functionCode: 'mobile_retentionStatistics',
        },
        {
          label: '标养到期',
          value: '-',
          str: 'expiredPeriodObject',
          img: new URL(`~/views/mobileApp/assets/home-img/icon4.svg`, import.meta.url).href,
          functionCode: 'mobile_standardCuringStatistics',
        },
        {
          label: '报告审核',
          value: '-',
          str: 'unAudited',
          img: new URL(`~/views/mobileApp/assets/home-img/icon5.svg`, import.meta.url).href,
          icon: 'examine',
          color: '#154bd0',
          functionCode: 'mobile_reportAuditStatistics',
        },
        {
          label: '报告批准',
          value: '-',
          str: 'unApproved',
          img: new URL(`~/views/mobileApp/assets/home-img/icon6.svg`, import.meta.url).href,
          icon: 'approval',
          color: '#154bd0',
          functionCode: 'mobile_reportApprovalStatistics',
        },
        {
          label: '不合格试验',
          value: '-',
          str: 'disqualifications',
          img: new URL(`~/views/mobileApp/assets/home-img/icon7.svg`, import.meta.url).href,
          functionCode: 'mobile_unqualifiedTestStatistics',
        },
        {
          label: '检校到期',
          value: '-',
          str: 'expiredEquipment',
          img: new URL(`~/views/mobileApp/assets/home-img/icon8.svg`, import.meta.url).href,
          functionCode: 'mobile_calibrationDueStatistics',
        },
      ],
      quickList: [
        {
          routerName: 'samplesSelect',
          name: '现场取样',
          icon: 'shijiguanlixuanzhong',
          img: new URL(`~/views/mobileApp/assets/home-img/entryIcon1.svg`, import.meta.url).href,
          moudleName: '样品管理',
          functionCode: 'mobile_fieldSampling',
        },
        {
          routerName: 'sampleStorage',
          name: '样品入库',
          icon: 'ruku',
          img: new URL(`~/views/mobileApp/assets/home-img/entryIcon2.svg`, import.meta.url).href,
          moudleName: '样品管理',
          functionCode: 'mobile_sampleWarehousing',
        },
        {
          routerName: 'standardCuring',
          name: '标养台账',
          icon: 'equipment',
          // clickType: 99,
          img: new URL(`~/views/mobileApp/assets/home-img/entryIcon3.svg`, import.meta.url).href,
          moudleName: '设备管理',
          functionCode: 'mobile_standardCuringStandingBook',
        },
        {
          routerName: 'temperature',
          name: '温湿度',
          icon: 'wendu1',
          img: new URL(`~/views/mobileApp/assets/home-img/entryIcon4.svg`, import.meta.url).href,
          moudleName: '环境监测',
          functionCode: 'mobile_temperature',
        },
        {
          routerName: 'iotDeviceRecord',
          name: '授权设备控制',
          icon: 'shouquan',
          img: new URL(`~/views/mobileApp/assets/home-img/entryIcon5.svg`, import.meta.url).href,
          moudleName: '设备管理',
          functionCode: 'mobile_equipmentAuthorization',
        },
        {
          routerName: 'testTask',
          name: '试验任务',
          img: new URL(`~/views/mobileApp/assets/home-img/entryIcon6.svg`, import.meta.url).href,
          moudleName: '样品管理',
          functionCode: 'mobile_testTask',
        },
        {
          routerName: 'reportAudit',
          name: '报告审核',
          img: new URL(`~/views/mobileApp/assets/home-img/entryIcon7.svg`, import.meta.url).href,
          moudleName: '报告管理',
          functionCode: 'mobile_reportAudit',
        },
        // {
        //   routerName: "equipmentGoOut",
        //   name: "设备外出管理",
        //   color: "#3f51b5",
        //   icon: "warehouseOut",
        //   moudleName: "设备管理",
        // },
        {
          routerName: 'reportApproval',
          name: '报告批准',
          img: new URL(`~/views/mobileApp/assets/home-img/entryIcon8.svg`, import.meta.url).href,
          moudleName: '报告管理',
          functionCode: 'mobile_reportApproval',
        },
      ],
      todoInfo: {},
      scanType: null,
      isBoss: true,
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['companyLogo', 'companyId']),
    ...mapWritableState(useSampleStore, ['sampleInfo', 'sampleStorageInfo']),
    title() {
      return this.companyId === 'gfzx'
        ? '智慧工地试验室'
        : '试验检测管理信息系统'
    },
    enableScanQrCode() {
      return InAndroid || InMiniProgram
    },
  },
  created() {
    this.getMessage()
    this.getNotice()
    this.getStatisticTodo()
  },
  mounted() {
    this.menuViewControl()
  },
  beforeUnmount() {
    this.clearSampleInfo()
  },
  methods: {
    clickHandle(item) {
      // eslint-disable-next-line no-console
      console.log(item)
    },
    goNoticeDetail(id) {
      mRequest.get(api.home.updateNoticeRead, {
        params: {
          noticeId: id,
        },
      })

      this.$router.push({
        name: 'noticeDetail',
        params: { id },
      })
    },
    // 扫码
    onScan() {
      qrCodeScanTool.scan(async (r) => {
        // 设备详情
        if (r.includes('equipment/goEquipmentDetail') || r.includes('eq/edt')) {
          const id = qrCodeScanTool.getParamByResult(r, 'id')
          this.$router.push({
            name: 'equipmentDetail',
            params: {
              id,
            },
          })
        }
        else if (r.includes('asset/detail')) {
          // 扫码资产二维码
          const id = qrCodeScanTool.getParamByResult(r, 'id')
          this.$router.push({
            name: 'assetDetail',
            params: {
              id,
            },
          })
        }
        else if (r.includes('processObjectViewController/goObjectDetail') || r.includes('pov/dtl')) {
          // 首页扫码样品标签
          const id = qrCodeScanTool.getParamByResult(r, 'id')
          this.$router.push({
            path: `/samples/detail/${id}`,
            query: { isScanEnter: 1 },
          })
        }
        else if (r.includes('I:S:')) {
          // 首页扫码 智慧屏授权
          const res = await mRequest.get(
            `rest/intelligent/sampling/qr-code/confirm/${r}`,
          )
          if (res.code !== 20000) {
            showDialog({
              title: '提示',
              message: res.message || res.msg,
            })
          }
        }
        else if (r.includes('S:A:')) {
          this.$refs.authConfirmRef.open(async () => {
            // 首页扫码 门口屏授权
            const res = await mRequest
              .post(`rest/screen/auth/qr-code/${r}`)
              .catch(() => {})
            if (res.code !== 21000 && res.code !== 20000) {
              showDialog({
                title: '提示',
                message: res.message || res.msg,
              })
            }
          })
        }
        else if (r.includes('http') || r.includes('https')) {
          this.$router.push({
            name: 'outsideView',
            params: { url: r },
          })
        }
        else if (r.includes('chemicalWasteReg')) {
          // 化学废物登记
          const id = r.split(':')[1]
          this.$router.push({
            name: 'chemicalWasteScanReg',
            query: { id },
          })
        }
        else if (/\d{5,11}/.test(r)) {
          mRequest.get(`rest/rfid/records/${r}`).then((res) => {
            if (res.code === 20000) {
              if ('2' in res.data) {
                // 2：人员
                this.$router.push({
                  name: 'personnelInfo',
                  query: {
                    id: res.data['2'][0].id,
                  },
                })
              }
              else {
                // 1,4：代表样品，流转样品
                let d = {}
                if ('1' in res.data) {
                  d = res.data['1'][0]
                }
                else if ('4' in res.data) {
                  d = res.data['4'][0]
                }
                this.$router.push({
                  name: 'sampleDetail',
                  params: {
                    id: d.id,
                  },
                })
              }
            }
            else {
              showDialog({
                title: '提示',
                message: res.message || res.msg,
              })
            }
          })
        }
        else {
          showDialog({
            title: '提示',
            message: '无效二维码！',
          })
        }
      })
    },
    async getMessage() {
      const res = await mRequest.get(api.home.getMessage, {
        params: {
          page: 1,
          size: 5,
        },
      })

      if (res.code === 20000) {
        this.messageList = res.data.rows ? res.data.rows : []
      }
    },
    async getNotice() {
      const res = await mRequest.post(
        api.home.getNotice,
        qs.stringify({
          page: 1,
          rows: 5,
          sort: 'createTime',
          order: 'desc',
        }),
        {
          params: {
            field: 'id,isRead,noticeTitle,createTime,',
          },
        },
      )

      this.noticeList = res.rows
        ? res.rows.filter(item => item.isRead === '0')
        : []
    },
    getStatisticTodo() {
      // const toast = showLoadingToast({
      //   duration: 0,
      //   message: "加载中...",
      //   forbidClick: true,
      // });
      this.todoLoading = true

      mRequest
        .get(api.home.statisticTodo)
        .then((res) => {
          // toast && toast.close();
          this.todoLoading = false
          if (res.code === 20000) {
            this.todoInfo = res.data ? res.data : {}
            this.sampleList.forEach((item) => {
              const value = this.todoInfo[item.str]
              item.value = value || 0
            })
          }
        })
        .catch((_) => {
          // toast && toast.close();
        })
    },
    // 选中事件
    noticeDetail(id) {
      this.$router.push({
        name: 'noticeBoxDetail',
        query: {
          id,
        },
      })
    },
    clearSampleInfo() {
      sessionStorage.removeItem('samplesId')
      sessionStorage.removeItem('samplesName')
      sessionStorage.removeItem('samplesValue')
      sessionStorage.removeItem('samplesLabel')

      this.sampleInfo = {}
      this.sampleStorageInfo = {}
    },
    // 菜单视图优化，当菜单下都没权限时，手动隐藏该菜单
    menuViewControl() {
      // 当快捷入口都无权限时，直接隐藏该模块
      const ele = document.getElementsByClassName('home-quick-list')[0]
      if (ele.offsetHeight < 60) {
        ele.style.display = 'none'
        document.getElementsByClassName('home-tile')[1].style.display = 'none'
      }

      // 当待办事项都无权限时，直接隐藏该模块
      const sEle = document.getElementsByClassName('home-sample-list')[0]
      if (sEle.offsetHeight < 60) {
        sEle.style.display = 'none'
        document.getElementsByClassName('home-tile')[0].style.display = 'none'
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
