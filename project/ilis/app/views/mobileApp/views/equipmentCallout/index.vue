<template>
  <div class="equipment">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />

      <van-tabs v-model:active="activeName" @click="onClickTab">
        <van-tab title="待调出设备" :name="1"></van-tab>
        <van-tab title="设备调出记录" :name="2"></van-tab>
      </van-tabs>

      <div v-if="activeName === 1">
        <van-search
          v-model.trim="query.quickQryParam"
          show-action
          placeholder="请输入设备名称或编号"
          @search="onSearch"
        >
          <template #action>
            <div style="padding: 0 8px">
              <van-icon
                color="#154bd0"
                size="20"
                class-prefix="iconfont"
                name="scan"
              />
            </div>
          </template>
        </van-search>

        <SearchBar>
          <SearchBarItem @click="openScreen(1)">
            <van-icon size="18" class-prefix="iconfont" name="search" />筛选
          </SearchBarItem>
          <SearchBarItem @click="openScreen(2)">
            <van-icon size="18" class-prefix="iconfont" name="sort" />排序
          </SearchBarItem>
        </SearchBar>
      </div>
    </van-sticky>
    <div v-if="activeName === 1">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        class="p-4"
        @load="onLoad"
      >
        <ListCard
          v-for="item in list"
          :key="item.id"
          :rows="[
            { label: '设备编号', value: item.equipmentSn },
            { label: '规格型号', value: item.standard },
            { label: '所属部门', value: item.departName },
            { label: '下次检验时间', value: formatDate(item.nextCheckDate, 'YYYY-MM-DD') },
            { label: '所在位置', value: item.serveLocation },
          ]"
        >
          <template #title>
            <div class="flex items-center">
              <div class="flex-1">
                <van-checkbox v-model="item.checked" shape="square">
                  {{ item.name }}
                </van-checkbox>
              </div>
              <van-tag v-if="item.transferStatus === '10'" color="#6fae00">
                闲置
              </van-tag>
              <van-tag v-if="item.transferStatus === '20'" color="#154bd0">
                调拨中
              </van-tag>
              <van-tag v-if="item.transferStatus === '30'" type="warning">
                使用中
              </van-tag>
              <van-tag v-if="item.transferStatus === '40'" type="success">
                已安装
              </van-tag>
              <van-tag v-if="item.transferStatus === '50'" color="#ff99aa">
                已移交
              </van-tag>
              <van-tag color="#93b2ff" class="ml-2">
                {{ item.type }}
              </van-tag>
            </div>
          </template>
          <template #footer>
            <ListCardAction>
              <van-button
                size="small"
                @click="onSelect(item.id)"
              >
                详情
              </van-button>
            </ListCardAction>
          </template>
        </ListCard>
      </van-list>

      <ActionBar>
        <van-button type="primary" @click="openCalloutBox">
          设备调出
        </van-button>
      </ActionBar>
    </div>

    <div v-else-if="activeName === 2">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多了"
        class="p-4"
        @load="getEqRecord"
      >
        <ListCard
          v-for="item in eqRecordList"
          :key="item.id"
          :rows="[
            { label: '设备编号', value: item.equipmentSn },
            { label: '规格型号', value: item.standard },
            { label: '调出方', value: item.callOutName },
            { label: '调出时间', value: formatDate(item.callOutTime, 'YYYY-MM-DD') },
            { label: '调入方', value: item.callInName },
            { label: '调入时间', value: formatDate(item.callInTime, 'YYYY-MM-DD') },
          ]"
        >
          <template #title>
            <div class="flex">
              <div class="flex-1">
                {{ item.name }}
              </div>
              <van-tag v-if="item.transferStatus === '10'" color="#6fae00">
                闲置
              </van-tag>
              <van-tag v-if="item.transferStatus === '20'" color="#154bd0">
                调拨中
              </van-tag>
              <van-tag v-if="item.transferStatus === '30'" type="warning">
                使用中
              </van-tag>
              <van-tag v-if="item.transferStatus === '40'" type="success">
                已安装
              </van-tag>
              <van-tag v-if="item.transferStatus === '50'" color="#ff99aa">
                已移交
              </van-tag>
            </div>
          </template>
        </ListCard>
      </van-list>
    </div>

    <van-action-sheet
      v-model:show="screenVisible"
      title="排序"
      :actions="screenList"
      :round="false"
      @select="onSortSelect"
    />

    <EquipmentSearch
      v-model:value="searchVisible"
      :inital-data="moreCondition"
      @callback="getMoreSearch"
    />

    <van-popup
      v-model:show="showCalloutForm"
      position="bottom"
      :style="{ height: '470px' }"
    >
      <van-form>
        <van-cell-group inset>
          <van-field
            v-model="userInfo.realName"
            name=""
            required
            label="调出人"
            placeholder="调出人"
            readonly
          />
          <van-field
            v-model="selCalloutSide.name"
            name=""
            required
            label="调出方"
            placeholder="调出方"
            readonly
          >
            <template #button>
              <van-button
                size="small"
                type="primary"
                @click="calloutSideShow = true"
              >
                选择
              </van-button>
            </template>
          </van-field>
          <van-field
            v-model="selCallInSide.name"
            name=""
            required
            label="调入方"
            placeholder="调入方"
            readonly
          >
            <template #button>
              <van-button
                size="small"
                type="primary"
                @click="callinSideShow = true"
              >
                选择
              </van-button>
            </template>
          </van-field>
          <van-field
            v-model="selCallInPerson.userName"
            name=""
            required
            label="调入人"
            placeholder="调入人"
            readonly
          >
            <template #button>
              <van-button size="small" type="primary" @click="openCallInPerson">
                选择
              </van-button>
            </template>
          </van-field>

          <FormItemDate
            v-model:value="callOutTime"
            required
            label="调出时间"
            placeholder="请选择调出时间"
          />

          <FormItemDate
            v-model:value="transferStart"
            required
            label="开始时间"
            placeholder="请选择开始时间"
          />

          <FormItemDate
            v-model:value="transferEnd"
            required
            label="归还时间"
            placeholder="请选择归还时间"
          />

          <van-field
            v-model="callOutRemark"
            name="备注"
            label="备注"
            placeholder="请输入备注"
          />
        </van-cell-group>
        <div style="margin: 16px">
          <van-button
            round
            block
            type="primary"
            native-type="submit"
            @click="submitCallout"
          >
            确定
          </van-button>
        </div>
      </van-form>
    </van-popup>

    <!-- 调出方 -->
    <van-popup v-model:show="calloutSideShow" position="bottom">
      <van-picker
        title="调出方"
        :columns="projectCalloutList"
        :columns-field-names="{
          text: 'name',
        }"
        @cancel="calloutSideShow = false"
        @confirm="selProjectCallOutConfirm"
      />
    </van-popup>

    <!-- 调入方 -->
    <van-popup v-model:show="callinSideShow" round position="bottom">
      <van-cascader
        title="调入方"
        :field-names="{ text: 'name', value: 'id', children: 'children' }"
        :options="projectCallInList"
        @close="callinSideShow = false"
        @finish="selProjectCallInConfirm"
      />
    </van-popup>

    <!-- 调入人员选择 -->
    <van-popup v-model:show="callInPersonShow" position="bottom">
      <van-picker
        title="调入人"
        :columns="personCallInList"
        :columns-field-names="{
          text: 'userName',
        }"
        @cancel="callInPersonShow = false"
        @confirm="selCallInPersonConfirm"
      />
    </van-popup>
  </div>
</template>

<script>
import qs from 'qs'
import {
  showNotify,
} from 'vant'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import SearchBar from '~/views/mobileApp/components/MobileUI/SearchBar.vue'
import SearchBarItem from '~/views/mobileApp/components/MobileUI/SearchBarItem.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import EquipmentSearch from './components/search.vue'

export default {
  components: {
    SearchBar,
    SearchBarItem,
    ActionBar,
    ListCardAction,
    ListCard,
    FormItemDate,
    EquipmentSearch,
    MobileTitleBar,
  },
  data() {
    return {
      eqRecordList: [],
      currentDate: new Date(),
      userInfo: JSON.parse(localStorage.getItem('userInfo')),
      formatDate,
      callinSideShow: false,
      calloutSideShow: false,
      showCalloutForm: false,
      callInPersonShow: false,
      activeName: 1,
      checked: false,
      list: [],
      loading: false,
      finished: false,
      searchVisible: false,
      screenVisible: false,
      searchValue: '',
      query: {
        quickQryParam: '',
        page: 0,
        rows: 10,
      },
      recaordPage: 0,
      screenCondition: {},
      screenList: [
        { name: '默认排序', color: '#154bd0' },
        { name: '设备编号', field: 'equipmentSn' },
        { name: '下次检校时间', field: 'preCheckDate' },
      ],
      scrollTop: 0,
      moreCondition: {},

      callOutTime: formatDate(new Date(), 'YYYY-MM-DD'),
      transferStart: formatDate(new Date(), 'YYYY-MM-DD'),
      transferEnd: '',

      projectCalloutList: [],
      selCalloutSide: {},

      projectCallInList: [],
      selCallInSide: {},

      personCallInList: [],
      selCallInPerson: {},

      callOutRemark: '',
    }
  },
  created() {
    this.resetPage()
    this.getProjectCallOutList()
    this.getProjectCallInList()
  },
  methods: {
    getEqRecord() {
      // 获取调出记录
      this.recaordPage++
      mRequest
        .get('rest/eqTransfer/user/record/list', {
          params: {
            userId: this.userInfo.userId,
            callType: 10,
            page: this.recaordPage,
            rows: 10,
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.eqRecordList = [...this.eqRecordList, ...res.data.rows]
            if (res.data.rows && res.data.rows.length === 0) {
              this.finished = true
            }
            this.loading = false

            if (this.eqRecordList.length >= res.data.count) {
              this.finished = true
            }
          }
        })
    },

    getProjectCallOutList() {
      // 获取调出方
      mRequest
        .get('rest/eqTransfer/user/projectOrg/list', {
          params: { userId: this.userInfo.userId },
        })
        .then((res) => {
          if (res.code === 20000) {
            if (res.data.length) {
              this.projectCalloutList = res.data
              this.selCalloutSide = res.data[0]
            }
          }
        })
    },

    getProjectCallInList() {
      // 获取调入方
      mRequest.get('rest/eqTransfer/projectOrg/list', {}).then((res) => {
        if (res.code === 20000) {
          if (res.data.length) {
            res.data.forEach((item) => {
              if (!item.id) {
                item.id = item.name
              }
            })
            this.projectCallInList = res.data
          }
        }
      })
    },
    getCallInPerson() {
      // 获取调入方人员
      let url = ''
      if (this.selCallInSide.type === '20') {
        // 10代表部门  20代表工程项目
        url = `rest/userRelation/list?objectId=${this.selCallInSide.id}`
      }
      else {
        url = `rest/departController/principal?departId=${this.selCallInSide.id}`
      }
      mRequest.get(url, {}).then((res) => {
        if (res.code === 20000) {
          const data = res.data || []
          if (this.selCallInSide.type === '20') {
            this.personCallInList = data
            if (data.length) {
              this.selCallInPerson = data[0]
            }
            else {
              this.selCallInPerson = {}
            }
          }
          else {
            this.personCallInList = [data]
            this.selCallInPerson = data
          }
        }
      })
    },
    openCallInPerson() {
      // 打开调入人
      if (!this.selCallInSide.id) {
        showNotify({ type: 'warning', message: '请先选择调出方' })
        return
      }
      this.callInPersonShow = true
    },
    selProjectCallInConfirm(v) {
      this.callinSideShow = false
      this.selCallInSide = v.selectedOptions.pop()
      this.getCallInPerson()
    },
    selProjectCallOutConfirm({ selectedOptions }) {
      this.selCalloutSide = selectedOptions[0]
      this.calloutSideShow = false
    },
    selCallInPersonConfirm({ selectedOptions }) {
      this.selCallInPerson = selectedOptions[0]
      this.callInPersonShow = false
    },
    submitCallout() {
      const ids = []
      this.list.forEach((item) => {
        if (item.checked) {
          ids.push(item.id)
        }
      })

      if (
        !ids.length
        || !this.selCalloutSide.id
        || !this.selCallInSide.id
        || !this.selCallInPerson.userId
        || !this.callOutTime
        || !this.transferStart
        || !this.transferEnd
      ) {
        showNotify({ type: 'warning', message: '请检查数据表单是否填写完整' })
        return
      }

      const params = {
        eqIds: ids,
        transferWay: '10',
        operateType: '10',

        callOutUserId: this.userInfo.userId,
        callOutUserName: this.userInfo.username,
        callOutId: this.selCalloutSide.id,
        callOutName: this.selCalloutSide.name,

        callInId: this.selCallInSide.id,
        callInName: this.selCallInSide.name,
        callInType: this.selCallInSide.type,

        callInUserId: this.selCallInPerson.userId,
        callInUserName: this.selCallInPerson.userName,

        callOutTime: `${this.callOutTime} 00:00:00`,
        transferStart: `${this.transferStart} 00:00:00`,
        transferEnd: `${this.transferEnd} 00:00:00`,

        callOutRemark: this.callOutRemark,
      }

      mRequest({
        method: 'POST',
        url: 'rest/eqTransfer/record',
        data: JSON.stringify(params),
        headers: {
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res.code === 20000) {
          showNotify({ type: 'success', message: '操作成功' })
          this.$router.go(0)
        }
      })
    },
    onClickTab() {
      if (this.activeName === 1) {
        this.resetPage()
      }
      else {
        this.recaordPage = 0
        this.eqRecordList = []
        this.getEqRecord()
      }
    },
    openCalloutBox() {
      const selData = this.list.filter((item) => {
        return item.checked
      })
      if (!selData.length) {
        showNotify({ type: 'warning', message: '请选择设备进行调出' })
        return
      }
      this.showCalloutForm = true
    },
    getMoreSearch(data) {
      this.moreCondition = { ...data }
      this.onSearch()
    },
    resetPage() {
      window.scrollTo(0, 0)
      this.query = {
        quickQryParam: '',
        page: 0,
        rows: 10,
      }
      this.screenCondition = {}
      this.moreCondition = {}
      this.screenList = this.screenList.map(item => ({
        ...item,
        color: '',
      }))
      this.screenList[0].color = '#154bd0'
      this.searchVisible = false
      this.onSearch()
    },
    openScreen(type) {
      if (type === 1) {
        this.searchVisible = !this.searchVisible
      }
      else if (type === 2) {
        this.screenVisible = true
      }
    },
    onSearch() {
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    // 选择排序
    onSortSelect(row, index) {
      !row.field
        ? (this.screenCondition = {})
        : (this.screenCondition = {
            sort: row.field,
            order: 'asc',
          })

      this.screenList = this.screenList.map(item => ({
        ...item,
        color: '',
      }))
      this.screenList[index].color = '#154bd0'

      this.screenVisible = false
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    // 选中事件
    onSelect(id) {
      this.$router.push({
        name: 'equipmentCalloutDetail',
        params: {
          id,
        },
      })
    },
    async onLoad() {
      this.query.page += 1

      this.loading = true
      const res = await mRequest.post(
        api.equipment.list,
        qs.stringify({
          transferStatus: 10,
          sort: 'recordTime',
          order: 'desc',
          ...this.query,
          ...this.screenCondition,
          ...this.moreCondition,
        }),
      )
      if (res.rows && res.rows.length > 0) {
        res.rows.forEach((item) => {
          item.checked = false
        })
        this.list = [...this.list, ...res.rows]
      }

      if (res.rows && res.rows.length === 0) {
        this.finished = true
      }
      this.loading = false

      if (this.list.length >= res.totalCount) {
        this.finished = true
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
