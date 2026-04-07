<template>
  <div>
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        title="检校确认"
        left-arrow
        @click-left="$router.go(-1)"
      >
        <template #right>
          <van-popover
            v-model:value="showPopover"
            :actions="[{ text: '按设备新增' }, { text: '按送检登记新增' }]"
            trigger="click"
            placement="bottom-end"
            close-on-click-outside
            @select="onSelect"
          >
            <template #reference>
              <span style="display: flex; align-items: center">
                <span>创建</span>
              </span>
            </template>
          </van-popover>
        </template>
      </MobileTitleBar>

      <SearchBar>
        <SearchBarItem @click="openScreen(1)">
          <van-icon size="18" class-prefix="iconfont" name="search" />搜索
        </SearchBarItem>
        <SearchBarItem @click="openScreen(2)">
          <van-icon size="18" class-prefix="iconfont" name="sort" />筛选
        </SearchBarItem>
      </SearchBar>

      <van-search
        v-if="quickSearchVisible"
        v-model.trim="query.quickQryParam"
        placeholder="请输入设备名称/设备编号/证书编号"
        @search="onSearch"
      />
    </van-sticky>
    <van-list
      v-model:loading="loading"
      finished-text="没有更多了"
      :finished="finished"
      class="p-4"
      @load="onLoad()"
    >
      <ListCard
        v-for="item in list"
        :key="item.id"
        :rows="[
          { label: '设备编号', value: item.equipmentSn },
          { label: '检校类型', value: item.typeName },
          { label: '检校日期', value: dayjs(item.checkTime).format('YYYY-MM-DD') },
          { label: '证书编号', value: item.certificateSn },
          { label: '确认人员', value: item.confirmerName },
        ]"
        @click="handleClick(item)"
      >
        <template #title>
          <div class="flex justify-between">
            <span>{{ item.name }}</span>
            <van-tag :color="statusMap[item.status] && statusMap[item.status].color">
              {{ statusMap[item.status] && statusMap[item.status].label }}
            </van-tag>
          </div>
        </template>
      </ListCard>
    </van-list>

    <CheckConfirmSearch
      v-model:value="searchVisible"
      :inital-data="moreCondition"
      @callback="getMoreSearch"
    />

    <SelectEquipment
      v-model:value="selectEquipmentVisible"
      :is-multiple="false"
      :show-sub-eq="false"
      :filter="[
        'quickQryParam',
        'eqDepartId',
        'eqLaboratoryName',
        'nextCheckDate',
      ]"
      :init-selected="[]"
      @selected-ok="getEquipment"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import SearchBar from '~/views/mobileApp/components/MobileUI/SearchBar.vue'
import SearchBarItem from '~/views/mobileApp/components/MobileUI/SearchBarItem.vue'
import SelectEquipment from '~/views/mobileApp/components/selectEquipment.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import CheckConfirmSearch from './component/CheckConfirmSearch.vue'

export default {
  components: {
    SearchBar,
    SearchBarItem,
    ListCard,
    CheckConfirmSearch,
    SelectEquipment,
    MobileTitleBar,
  },
  data() {
    return {
      dayjs,
      loading: false,
      finished: false,
      list: [],
      query: {
        page: 0,
        size: 10,
        quickQryParam: '',
      },
      quickSearchVisible: false,
      searchVisible: false,
      moreCondition: {},
      showPopover: false,
      selectEquipmentVisible: false,
      statusMap: {
        10: { label: '填写中', color: '#0066ec' },
        20: { label: '审核中', color: '#f59a23' },
        30: { label: '未通过', color: '#d9001b' },
        40: { label: '已通过', color: '#4b7902' },
        50: { label: '审核驳回', color: '#d9001b' },
      },
    }
  },
  async created() {
    await this.getTypeDict()
  },
  methods: {
    openScreen(type) {
      if (type === 1) {
        this.quickSearchVisible = !this.quickSearchVisible
      }
      else if (type === 2) {
        this.searchVisible = !this.searchVisible
      }
    },
    async onLoad() {
      this.query.page += 1
      this.loading = true
      const res = await mRequest
        .get('checkController.do?datagrid', {
          params: {
            ...this.query,
            ...this.moreCondition,
          },
        })
        .catch((err) => {
          showFailToast(err.message || '获取列表数据失败')
        })

      if (res.rows && res.rows.length > 0) {
        res.rows.forEach((item) => {
          try {
            item.typeName = this.typeDict.find(
              i => i.typeCode === item.checkType,
            ).typeName
          }
          catch (error) {
            item.typeName = ''
            console.error('获取类型名称失败', error)
          }
        })
        this.list = [...this.list, ...res.rows]
      }

      if (res.rows && res.rows.length === 0) {
        this.finished = true
      }
      this.loading = false

      if (this.list.length >= res.count) {
        this.finished = true
      }
    },
    onSearch() {
      this.finished = false
      this.query.page = 0
      this.list = []
      this.onLoad()
    },
    getMoreSearch(data) {
      this.moreCondition = { ...data }
      this.onSearch()
    },
    onSelect(action) {
      switch (action.text) {
        case '按设备新增':
          this.selectEquipmentVisible = true
          break
        case '按送检登记新增':
          this.$router.push({
            name: 'equipmentCheckConfirmAddBySend',
          })
          break
      }
    },

    getEquipment(res) {
      localStorage.setItem('equipmentCheckConfirmEQ', JSON.stringify(res[0]))
      this.$router.push({
        path: '/equipment/equipmentCheckConfirm/add',
      })
    },
    async getTypeDict() {
      const { data, code } = await mRequest.get(
        'rest/type/getTypesByGroupCode',
        {
          params: { groupCode: 'eq_ck_type' },
        },
      )
      if (code === 20000) {
        this.typeDict = data
      }
    },
    handleClick(item) {
      this.$router.push({
        name: 'equipmentCheckConfirmAdd',
        params: { id: item.id },
      })
    },
  },
}
</script>

<style lang="less" scoped>
.list {
  padding: 12px;
  .list-item-title {
    font-size: 14px;
    display: flex;
    align-items: center;
    .tag {
      font-size: 8px !important;
      color: #fff;
      width: 16px;
      height: 16px;
      border-radius: 4px;
      margin-left: 4px;
      text-align: center;
      line-height: 16px;
      flex-shrink: 0;
    }
  }
  .list-item-code {
    font-size: 12px;
    color: #777;
  }
  .list-item-file {
    font-size: 12px;
    color: #154bd0;
    display: flex;
    align-items: center;
    .file-name {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin-left: 4px;
    }
  }
}
.filter-row {
  .van-col {
    padding: 10px 0;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    border-bottom: solid 1px #f5f5f5;
    color: #777;

    .iconfont {
      margin-right: 4px;
    }
  }
}
</style>
