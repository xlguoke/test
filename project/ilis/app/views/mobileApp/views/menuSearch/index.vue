<template>
  <div class="menuSearch">
    <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    <van-search
      v-model.trim="menuName"
      placeholder="请输入功能名称"
      @search="onSearch()"
      @input="onSearch()"
    >
    </van-search>
    <div class="menuSearch-body">
      <div class="menuSearch-result">
        <div v-if="result.length > 0">
          <div v-for="(item, index) in result" :key="index">
            <van-divider>{{ item.moudleName }}</van-divider>
            <div class="menuSearch-box">
              <div
                v-for="(item2, index2) in item.children"
                :key="item2.functionCode"
                v-permission="item2.functionCode"
              >
                <template v-if="item2.clickType">
                  <div
                    class="menuSearch-box-icon"
                    :style="`background: ${item2.color}`"
                    @click.stop="clickHandle(item, index, item2, index2)"
                  >
                    <van-icon
                      class-prefix="iconfont"
                      :name="item2.icon"
                      size="24"
                    />
                  </div>
                  <div class="menuSearch-box-name">
                    {{ item2.name }}
                  </div>
                </template>
                <!-- -if="item2.routerName" -->
                <template v-else>
                  <router-link :to="{ name: item2.routerName }">
                    <div
                      class="menuSearch-box-icon"
                      :style="`background: ${item2.color}`"
                    >
                      <van-icon
                        class-prefix="iconfont"
                        :name="item2.icon"
                        size="24"
                      />
                    </div>
                    <div class="menuSearch-box-name">
                      {{ item2.name }}
                    </div>
                  </router-link>
                </template>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <van-empty description="未查询到菜单功能" />
        </div>
      </div>
      <div v-if="recordList.length > 0" class="menuSearch-record">
        <p>历史搜索记录：</p>
        <p
          v-for="(name, index) in recordList"
          :key="index"
          @click="onSearch(name)"
        >
          {{ name }}
        </p>
        <div style="text-align: center; color: #999" @click="clearData">
          清除历史纪录
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      menuName: '',
      allMenu: [
        // 审核管理
        {
          routerName: 'auditManage',
          name: '审核管理',
          color: '#197afd',
          icon: 'examine',
          moudleName: '审核管理',
          functionCode: 'mobile_auditManage',
        },
        // 样品管理
        {
          routerName: 'samplesSelect',
          name: '现场取样',
          color: '#C280FF',
          icon: 'shijiguanlixuanzhong',
          moudleName: '样品管理',
          functionCode: 'mobile_fieldSampling',
        },
        {
          routerName: 'sampleStorage',
          name: '样品入库',
          color: '#bfbf00',
          icon: 'ruku',
          moudleName: '样品管理',
          functionCode: 'mobile_sampleWarehousing',
        },
        {
          routerName: 'samples',
          name: '样品流转',
          color: '#ffb00b',
          icon: 'circulation',
          moudleName: '样品管理',
          functionCode: 'mobile_sampleCirculation',
        },
        {
          routerName: 'standardCuringPeriods',
          name: '标养室出入库',
          color: '#197afd',
          icon: 'ruku',
          moudleName: '样品管理',
          functionCode: 'mobile_standardCuringPeriods',
        },
        // 试验管理
        {
          routerName: '',
          name: '任务分配',
          color: '#71b604',
          icon: 'fenpeipeizhi',
          clickType: 99,
          moudleName: '试验管理',
          functionCode: 'mobile_taskAssignment',
        },
        {
          routerName: '',
          name: '试验任务',
          color: '#027db4',
          icon: 'shiyan',
          clickType: 99,
          moudleName: '试验管理',
          functionCode: 'mobile_testTask',
        },
        {
          routerName: '',
          name: '不合格试验',
          color: '#ffb00b',
          icon: 'neishenbuhegegaishanliucheng',
          clickType: 99,
          moudleName: '试验管理',
          functionCode: 'mobile_unqualifiedTest',
        },
        // 报告管理
        {
          routerName: 'reportAudit',
          name: '报告审核',
          color: '#ff5d65',
          icon: 'examine',
          moudleName: '报告管理',
          functionCode: 'mobile_reportAudit',
        },
        {
          routerName: 'reportApproval',
          name: '报告批准',
          color: '#53cfb5',
          icon: 'approval',
          moudleName: '报告管理',
          functionCode: 'mobile_reportApproval',
        },
        {
          routerName: 'electronicSignature',
          name: '电子签名',
          color: '#53cfb5',
          icon: 'examine',
          moudleName: '报告管理',
          functionCode: 'mobile_electronicSignature',
        },
        {
          routerName: 'electronicSignatureSeal',
          name: '签章',
          color: '#53cfb5',
          icon: 'examine',
          moudleName: '报告管理',
          functionCode: 'mobile_electronicSignatureSeal',
        },
        // 设备管理
        {
          routerName: 'equipment',
          name: '设备综合管理',
          color: '#32bbe9',
          icon: 'equipment',
          moudleName: '设备管理',
          functionCode: 'mobile_equipmentManagement',
        },
        {
          routerName: 'equipmentGoOut',
          name: '设备外出管理',
          color: '#3f51b5',
          icon: 'warehouseOut',
          moudleName: '设备管理',
          functionCode: 'mobile_egressManagement',
        },
        // {
        //   routerName: "iotDeviceRecord",
        //   name: "设备授权",
        //   color: "#66cc66",
        //   icon: "shouquan",
        //   moudleName: "设备管理",
        //   functionCode: "mobile_equipmentAuthorization"
        // },
        // 台账管理
        {
          routerName: 'standingBook',
          name: '取样台账',
          color: '#c280ff',
          icon: 'shikuaiquyang',
          moudleName: '台账管理',
          functionCode: 'mobile_sampleStandingBook',
        },
        {
          routerName: 'samplesDelivery',
          name: '样品出入库台账',
          color: '#3394fe',
          icon: 'ziyuan72',
          moudleName: '台账管理',
          functionCode: 'mobile_sampleStorageStandingBook',
        },
        {
          routerName: '',
          name: '试件出入库台账',
          color: '#71b604',
          icon: 'churuku',
          moudleName: '台账管理',
          functionCode: 'mobile_testPieceStorageStandingBook',
        },
        {
          routerName: '',
          name: '留样台账',
          color: '#ffb00b',
          icon: 'img3_liuyangchuli',
          moudleName: '台账管理',
          functionCode: 'mobile_sampleRetentionStandingBook',
        },
        {
          routerName: '',
          name: '标养台账',
          color: '#ff5d65',
          icon: 'biaoyangshi',
          moudleName: '台账管理',
          functionCode: 'mobile_standardCuringStandingBook',
        },
        {
          routerName: '',
          name: '外委台账',
          color: '#ff3399',
          icon: 'weiwaijihua',
          moudleName: '台账管理',
          functionCode: 'mobile_outsourcingStandingBook',
        },
        // 环境监测
        {
          routerName: 'temperature',
          name: '温湿度',
          color: '#26b226',
          icon: 'wendu1',
          moudleName: '环境监测',
          functionCode: 'mobile_temperature',
        },
      ],
      result: [],
      recordList: [],
    }
  },
  created() {
    this.menuName = this.$route.query.menuName || ''
    this.getRecordList()
    this.buildResult()
  },
  mounted() {
    this.menuViewControl()
  },
  methods: {
    clickHandle(item, index, item2) {
      // eslint-disable-next-line no-console
      console.log(item2)
    },
    getRecordList() {
      const list = JSON.parse(localStorage.getItem('menuSearchList') || '[]')
      this.recordList = list
    },
    clearData() {
      this.recordList = []
      localStorage.setItem('menuSearchList', '[]')
    },
    onSearch(name) {
      if (name) {
        this.menuName = name
      }
      this.result = []
      this.$router.replace({
        name: 'menuSearch',
        query: { menuName: this.menuName },
      })
      this.buildResult()
      this.$nextTick(() => {
        this.menuViewControl()
      })
    },
    buildResult() {
      this.cacheRecord()

      const arr = []
      for (let i = 0; i < this.allMenu.length; i++) {
        const item = this.allMenu[i]
        if (item.name.includes(this.menuName)) {
          const index = arr.findIndex(i => i.moudleName === item.moudleName)
          if (index >= 0) {
            arr[index].children.push({ ...item })
          }
          else {
            arr.push({
              moudleName: item.moudleName,
              children: [{ ...item }],
            })
          }
        }
      }

      this.result = arr
    },
    cacheRecord() {
      const list = JSON.parse(localStorage.getItem('menuSearchList') || '[]')
      if (list.findIndex(item => item === this.menuName) === -1) {
        list.push(this.menuName)
      }

      localStorage.setItem('menuSearchList', JSON.stringify(list))
      this.getRecordList()
    },
    // 菜单视图优化，当菜单下都没权限时，手动隐藏该菜单
    menuViewControl() {
      const eles = document.getElementsByClassName('menuSearch-box')
      for (let i = 0; i < eles.length; i++) {
        const ele = eles[i]
        ele.parentElement.style.display = 'block'
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
