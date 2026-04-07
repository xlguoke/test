<template>
  <div class="menuPage">
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        :title="title"
        :hide-title="InWeChatWeb"
        :show-user="true"
      />
      <div
        style="
          padding: 15px;
          background: #fff;
          border-bottom: solid 1px #e2e2e2;
        "
      >
        <van-search
          v-model.trim="menuName"
          :show-action="InAndroid"
          placeholder="请输入功能名称"
          @search="onSearch"
          @input="onSearch"
        >
        </van-search>
      </div>
    </van-sticky>

    <div class="menuPage-main">
      <template v-for="item in menuList" :key="item.title">
        <div>
          <div class="menuPage-title">
            {{ item.title }}
          </div>
          <div class="menuPage-main-list">
            <div
              v-for="(i, index2) in item.list"
              :key="index2"
              v-permission="i.functionCode"
              @click="
                () => {
                  i.onclick
                    ? i.onclick()
                    : $router.push({ name: i.routerName, query: i.query })
                }
              "
            >
              <img :src="i.icon" />
              <div class="menuPage-main-name">
                {{ i.name }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { mapState, mapWritableState } from 'pinia'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { InAndroid, InWeChatWeb } from '~/views/mobileApp/provides/utils/referrer'
import { useSampleStore } from '~/views/mobileApp/store/useSampleStore'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      InWeChatWeb,
      InAndroid,
      menuName: '',
      activeKey: 0,
      menuList: [
        {
          title: '审核管理',
          list: [
            {
              name: '审核管理',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/spectmgr.svg`, import.meta.url).href,
              routerName: 'auditManage',
              functionCode: 'mobile_auditManage',
            },
          ],
        },
        {
          title: '样品管理',
          list: [
            {
              name: '现场取样',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/xcqy.svg`, import.meta.url).href,
              routerName: 'samplesSelect',
              functionCode: 'mobile_fieldSampling',
            },
            {
              name: '样品入库',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/yprk.svg`, import.meta.url).href,
              routerName: 'sampleStorage',
              functionCode: 'mobile_sampleWarehousing',
            },
            {
              name: '样品流转',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/yplz.svg`, import.meta.url).href,
              routerName: 'samples',
              functionCode: 'mobile_sampleCirculation',
            },
            {
              name: '标养室出入库',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/byscrk.svg`, import.meta.url).href,
              routerName: 'standardCuringPeriods',
              functionCode: 'mobile_standardCuringPeriods',
            },
          ],
        },
        {
          title: '试验管理',
          list: [
            {
              name: '任务分配',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/rwfp.svg`, import.meta.url).href,
              routerName: 'taskAssigned',
              functionCode: 'mobile_taskAssignment',
            },
            {
              name: '试验任务',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/syrw.svg`, import.meta.url).href,
              routerName: 'testTask',
              functionCode: 'mobile_testTask',
            },
            {
              name: '不合格试验',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/bhgsy.svg`, import.meta.url).href,
              routerName: 'unqualifiedTest',
              functionCode: 'mobile_unqualifiedTest',
            },
            {
              name: '规程查询',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/gccx.svg`, import.meta.url).href,
              routerName: 'standard',
              functionCode: 'mobile_standard',
            },
          ],
        },
        {
          title: '报告管理',
          list: [
            {
              name: '报告审核',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/bgsh.svg`, import.meta.url).href,
              routerName: 'reportAudit',
              functionCode: 'mobile_reportAudit',
            },
            {
              name: '报告批准',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/bgpz.svg`, import.meta.url).href,
              routerName: 'reportApproval',
              functionCode: 'mobile_reportApproval',
            },
            {
              name: '电子签名',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/sign_name.png`, import.meta.url).href,
              routerName: 'electronicSignature',
              functionCode: 'mobile_electronicSignature',
            },
            {
              name: '签章',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/sign_seal.png`, import.meta.url).href,
              routerName: 'electronicSignatureSeal',
              functionCode: 'mobile_electronicSignatureSeal',
            },
          ],
        },
        {
          title: '设备管理',
          list: [
            {
              name: '设备综合管理',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/sbzhgl.svg`, import.meta.url).href,
              routerName: 'equipment',
              functionCode: 'mobile_equipmentManagement',
            },
            // {
            //   name: "设备管理-铁科院",
            //   icon: require("./menuIcon/sbzhgl.svg"),
            //   routerName: "equipmentManagement",
            //   functionCode: "mobile_equipmentManagement"
            // },
            // {
            //   name: "设备调出-铁科院",
            //   icon: require("./menuIcon/sbzhgl.svg"),
            //   routerName: "equipmentCallout",
            //   functionCode: "mobile_equipmentManagement"
            // },
            // {
            //   name: "设备调入-铁科院",
            //   icon: require("./menuIcon/sbzhgl.svg"),
            //   routerName: "equipmentCallin",
            //   functionCode: "mobile_equipmentManagement"
            // },
            // {
            //   name: "设备移交-铁科院",
            //   icon: require("./menuIcon/sbzhgl.svg"),
            //   routerName: "equipmentHandOver",
            //   functionCode: "mobile_egressManagement"
            // },
            // {
            //   name: "设备流转-铁科院",
            //   icon: require("./menuIcon/sbzhgl.svg"),
            //   routerName: "equipmentExchange",
            //   functionCode: "mobile_egressManagement"
            // },
            {
              name: '设备外出管理',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/sbwcgl.svg`, import.meta.url).href,
              routerName: 'equipmentGoOut',
              functionCode: 'mobile_egressManagement',
            },
            // {
            //   name: "设备授权",
            //   icon: require("./menuIcon/sbsq.svg"),
            //   onclick: this.deviceAuthorization,
            //   functionCode: "mobile_equipmentAuthorization"
            // },
            {
              name: '授权设备控制',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/sbsq.svg`, import.meta.url).href,
              routerName: 'iotDeviceRecord',
              functionCode: 'mobile_equipmentAuthorization',
            },
            {
              name: '设备使用记录',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/sbsq.svg`, import.meta.url).href,
              routerName: 'equipmentRecordsList',
              functionCode: 'mobile_EquipmentRecord',
            },
            {
              name: '位置上报',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/sbsq.svg`, import.meta.url).href,
              routerName: 'equipmentLocationReported',
              functionCode: 'mobile_equipmentLocationReported',
            },
            {
              name: '设备维修',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/syrw.svg`, import.meta.url).href,
              routerName: 'equipmentRepairList',
              functionCode: 'mobile_equipmentManagement',
            },
            {
              name: '固定资产盘点',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/sbpd.svg`, import.meta.url).href,
              routerName: 'equipmentInventory',
              functionCode: 'mobile_equipmentInventory',
            },
            {
              name: '设备外出申请',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/sbwc.svg`, import.meta.url).href,
              routerName: 'equipmentOutwardApplication',
              functionCode: 'mobile_waichu',
            },
            {
              name: '设备送检登记',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/bhgsy.svg`, import.meta.url).href,
              routerName: 'equipmentCheckSend',
              functionCode: 'mobile_equipmentCheckSend',
            },
            {
              name: '检校确认',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/bhgsy.svg`, import.meta.url).href,
              routerName: 'equipmentCheckConfirm',
              functionCode: 'mobile_equipmentCheckConfirm',
            },
            {
              name: '标准物质台账',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/lytz.svg`, import.meta.url).href,
              routerName: 'standardMaterialList',
              // functionCode: 'mobile_standardMaterial',
            },
            {
              name: '购置验收',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/sjcrk.svg`, import.meta.url).href,
              routerName: 'standardMaterialAcceptList',
              // functionCode: 'mobile_standardMaterialAccept',
            },
          ],
        },
        {
          title: '台账管理',
          list: [
            {
              name: '取样台账',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/qytz.svg`, import.meta.url).href,
              routerName: 'sampling',
              functionCode: 'mobile_sampleStandingBook',
            },
            {
              name: '样品出入库台账',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/ypcrk.svg`, import.meta.url).href,
              routerName: 'samplesDelivery',
              functionCode: 'mobile_sampleStorageStandingBook',
            },
            {
              name: '试件出入库台账',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/sjcrk.svg`, import.meta.url).href,
              routerName: 'standardCuringDelivery',
              functionCode: 'mobile_testPieceStorageStandingBook',
            },
            {
              name: '留样台账',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/lytz.svg`, import.meta.url).href,
              routerName: 'standingBook',
              functionCode: 'mobile_sampleRetentionStandingBook',
            },
            {
              name: '标养台账',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/bytz.svg`, import.meta.url).href,
              routerName: 'standardCuring',
              functionCode: 'mobile_standardCuringStandingBook',
            },
            {
              name: '外委台账',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/wwtz.svg`, import.meta.url).href,
              routerName: 'samplesSubpackageDelivery',
              functionCode: 'mobile_outsourcingStandingBook',
            },
            {
              name: '巡查台账',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/xuncha.svg`, import.meta.url).href,
              routerName: 'insetApp',
              query: {
                url: '/-/iot-app/index.html#/account-book?inEmbed=1',
              },
              functionCode: 'mobile_xuncha',
            },
            {
              name: '设备外出台账',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/sbwctz.svg`, import.meta.url).href,
              routerName: 'equipmentGoOutBook',
              functionCode: 'mobile_eqGoOutBook',
            },
          ],
        },
        {
          title: '智慧试验室管理',
          list: [
            {
              name: '温湿度管理',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/shiyanshi.svg`, import.meta.url).href,
              routerName: 'insetApp',
              query: {
                url: '/-/iot-app/index.html?inEmbed=1',
              },
              functionCode: 'mobile_shiyanshi',
            },
            {
              name: '预约管理',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/yuyue.svg`, import.meta.url).href,
              routerName: 'insetApp',
              query: {
                url: '/-/iot-app/index.html#/appointment-management?inEmbed=1',
              },
              functionCode: 'mobile_yuyue',
            },
          ],
        },
        {
          title: '环境监测',
          list: [
            {
              name: '温湿度',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/wsd.svg`, import.meta.url).href,
              routerName: 'temperature',
              functionCode: 'mobile_temperature',
            },
          ],
        },
        {
          title: '检查管理',
          list: [
            {
              name: '检查管理',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/spectmgr.svg`, import.meta.url).href,
              routerName: 'inspectList',
              functionCode: 'mobile_temperature',
            },
          ],
        },
        {
          title: '化学品管理',
          list: [
            {
              name: '采购登记',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/chemical-purchase.svg`, import.meta.url).href,
              routerName: 'chemicalPurchase',
              functionCode: 'mobile_chemicalPurchase',
            },
            {
              name: '验收登记',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/chemical-acceptance.svg`, import.meta.url).href,
              routerName: 'chemicalAcceptance',
              functionCode: 'mobile_chemicalAcceptance',
            },
            {
              name: '入库登记',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/chemical-storage-in.svg`, import.meta.url).href,
              routerName: 'chemicalStorageIn',
              functionCode: 'mobile_chemicalStorageIn',
            },
            {
              name: '出库登记',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/chemical-storage-out.svg`, import.meta.url).href,
              routerName: 'chemicalStorageOut',
              functionCode: 'mobile_chemicalStorageOut',
            },
            {
              name: '使用登记',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/chemical-usage.svg`, import.meta.url).href,
              routerName: 'chemicalUseRegistration',
              functionCode: 'mobile_chemicalUsage',
            },
            {
              name: '实时库存',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/chemical-inventory.svg`, import.meta.url).href,
              routerName: 'chemicalInventory',
              functionCode: 'mobile_chemicalInventory',
            },
            {
              name: '化学品存量',
              icon: new URL(`~/views/mobileApp/assets/menuIcon/chemical-stock.svg`, import.meta.url).href,
              routerName: 'chemicalStock',
              functionCode: 'mobile_chemicalStock',
            },
          ],
        },
      ],
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['companyId']),
    ...mapWritableState(useSampleStore, ['sampleInfo', 'sampleStorageInfo']),
    title() {
      return this.companyId === 'gfzx'
        ? '智慧工地试验室'
        : '试验检测管理信息系统'
    },
  },
  mounted() {
    this.clearSampleInfo()
    this.menuViewControl()
  },
  beforeUnmount() {
    this.clearSampleInfo()
    if (window.animaTime) {
      clearTimeout(window.animaTime)
      window.animaTime = null
    }
  },
  methods: {
    changeActive(data) {
      let str = ''
      switch (data) {
        case 0:
          str = 'samples'
          break
        case 1:
          str = 'testRoom'
          break
        case 2:
          str = 'report'
          break
        case 3:
          str = 'equipment'
          break
        case 4:
          str = 'account'
          break
        case 5:
          str = 'monitor'
          break
        default:
          break
      }
      this.moveTo(str)
    },
    moveTo(str) {
      if (!str) {
        return
      }
      const dom = this.$refs[str]
      const menu = this.$refs.menuList
      const menuPositon = menu.getBoundingClientRect()
      const positon = dom.getBoundingClientRect()
      let end = positon.top - menuPositon.top
      let type = 1
      if (positon.top < 0) {
        type = -1
      }
      if (Math.abs(end) < 20) {
        end = 20
      }
      end = end - 20
      this.animation(menu, 'scrollTop', type, end)
    },
    animation(obj, str, type, end) {
      window.animaTime = setTimeout(() => {
        const step = (end - obj[str]) / 30
        const old = obj[str]
        obj[str] += Math.abs(step) < 1 ? end - obj[str] : step
        if (
          Number.isNaN(step)
          || Math.round(step) === 0
          || (type > 0 && obj[str] >= end)
          || (type < 0 && obj[str] <= end)
          || old === obj[str]
        ) {
          obj[str] = end
          clearTimeout(window.animaTime)
          window.animaTime = null
          return
        }
        this.animation(obj, str, type, end)
      }, 10)
    },
    onSearch() {
      this.$router.push({
        name: 'menuSearch',
        query: {
          menuName: this.menuName,
        },
      })
    },
    clearSampleInfo() {
      sessionStorage.removeItem('samplesId')
      sessionStorage.removeItem('samplesName')
      sessionStorage.removeItem('samplesValue')
      sessionStorage.removeItem('samplesLabel')
      sessionStorage.removeItem('samplesDeliveryDetail')

      this.sampleInfo = {}
      this.sampleStorageInfo = {}
    },
    // 菜单视图优化，当菜单下都没权限时，手动隐藏该菜单
    menuViewControl() {
      const eles = document.getElementsByClassName('menuPage-main-list')
      for (let i = 0; i < eles.length; i++) {
        const ele = eles[i]
        if (ele.offsetHeight < 30) {
          ele.parentElement.style.display = 'none'
        }
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
