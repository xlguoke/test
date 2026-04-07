<template>
  <div ref="wrap" class="standingBook-wrap">
    <van-sticky>
      <MobileTitleBar title="设备外出台账" left-arrow @click-left="$router.go(-1)">
        <template #right>
          <span @click.stop="showFilter">筛选</span>
        </template>
      </MobileTitleBar>
    </van-sticky>
    <div v-if="filterList.length > 0" class="standingBook-filter-wrap">
      <div class="standingBook-filter-info">
        <!-- 移除 template 上的 key -->
        <template v-for="(item, index) in filterList" :key="index">
          <!-- 将 key 移到这里的 div 上 -->
          <div
            v-if="!item.name.includes('Begin') && !item.name.includes('End')"
            class="standingBook-tag-box"
          >
            <div class="standingBook-tag">
              <template v-if="item.name === 'egressStatus'">
                <span v-if="item.value === '10'"> 已归还 </span>
                <span v-else-if="item.value === '40,50,60,70,80,90'">外出中</span>
              </template>
              <template v-else>
                <span>{{ item.value }}</span>
              </template>
            </div>
            <div class="standingBook-tag-icon" @click="delTag(item, index)">
              <van-icon name="cross" />
            </div>
          </div>
        </template>
      </div>
    </div>
    <!-- 数据展示 -->
    <div class="standingBook-content">
      <van-pull-refresh
        v-model="isLoading"
        success-text="刷新成功"
        @refresh="onRefresh"
      >
        <van-list
          v-model:loading="loading"
          error-text="请求失败，点击重新加载"
          finished-text="没有更多了"
          :finished="finished"
          class="p-4"
          @load="onLoad"
        >
          <ListCard
            v-for="item in equipmentList"
            :key="item.id"
            :rows="[
              { label: '借用人', value: item.borrowUser },
              { label: '外出时间', value: item.egressTime ? dayjs(item.egressTime).format('YYYY-MM-DD HH:mm:ss') : '' },
              { label: '预还时间', value: item.expectReturnTime ? dayjs(item.expectReturnTime).format('YYYY-MM-DD HH:mm:ss') : '' },
              { label: '关联工程项目', value: item.projectName },
            ]"
          >
            <template #title>
              <div class="flex items-center gap-4">
                <div class="flex-1">
                  {{ item.equipmentName }}
                </div>
                <van-tag v-if="statusData.outing.includes(item.status)" color="#f59a23">
                  外出中
                </van-tag>
                <van-tag v-else color="green">
                  已归还
                </van-tag>
              </div>
            </template>
            <template #footer>
              <ListCardAction>
                <van-button size="small" @click="detail(item)">
                  详情
                </van-button>
              </ListCardAction>
            </template>
          </ListCard>
        </van-list>
      </van-pull-refresh>
    </div>
    <VFilter
      v-model:value="filterVisible"
      :inital-data="query"
      @callback="onSearch"
    ></VFilter>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import ListCardAction from '~/views/mobileApp/components/MobileUI/ListCardAction.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import vFilter from './components/filter.vue'

export default {
  components: {
    ListCardAction,
    ListCard,
    VFilter: vFilter,
    MobileTitleBar,
  },
  data() {
    return {
      dayjs,
      formatDate,
      filterVisible: false,
      params: {},
      query: {
        egressStatus: '10,40,50,60,70,80,90',
      },
      isLoading: false,
      loading: false,
      finished: false,
      equipmentList: [],
      finishedText: '没有更多了',
      filterList: [],
      statusData: {
        outing: ['40', '50', '60', '70', '80', '90'],
        returned: ['10'],
      },
      currentPage: 1,
      pageSize: 10,
    }
  },
  mounted() {
    this.changeScroll()
  },
  methods: {
    changeScroll() {
      if (this.$refs && this.$refs.wrap) {
        this.$refs.wrap.scrollTop = 0
      }
    },
    onLoad() {
      // 如果是刷新操作，不设置loading状态，由pull-refresh处理
      const toast = this.isLoading
        ? showLoadingToast({
            duration: 0,
            message: '加载中...',
            forbidClick: true,
          })
        : ''
      if (!this.isLoading) {
        this.loading = true
      }
      mRequest
        .get(api.equipment.goOutList, {
          params: {
            page: this.currentPage,
            size: this.pageSize,
            ...this.query,
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            const arr = res.data ? (res.data.rows ? res.data.rows : []) : []
            this.equipmentList
              = this.currentPage === 1 ? arr : [...this.equipmentList, ...arr]

            // 判断是否还有更多数据
            if (
              !arr
              || !arr.length
              || (res.data && this.equipmentList.length >= res.data.count)
            ) {
              // 数据全部加载完成
              this.finished = true
            }
            else {
              // 还有数据，增加页码
              this.currentPage++
            }
          }
        })
        .catch((error) => {
          console.error('加载数据失败:', error)
        })
        .finally(() => {
          // 关闭加载状态
          this.isLoading = false
          this.loading = false
          if (toast) {
            toast.close()
          }
        })
    },
    detail(row) {
      this.$router.push({
        name: 'equipmentGoOutBookDetail',
        query: {
          id: row.id,
          type: 'equipmentGoOutBook',
        },
      })
    },
    delTag(item, index) {
      if (item.name === 'egressTime' || item.name === 'returnTime') {
        this.filterList = this.filterList.filter((f) => {
          return !f.name.includes(item.name)
        })
      }
      else {
        this.filterList.splice(index, 1)
      }
      this.query = this.filterList.reduce((acc, cur) => {
        acc[cur.name] = cur.value
        return acc
      }, {})
      if (!this.query.egressStatus) {
        this.query.egressStatus = '10,40,50,60,70,80,90'
      }
      this.onRefresh()
    },
    // 下拉刷新
    onRefresh() {
      this.finished = false
      this.isLoading = true
      this.currentPage = 1
      this.equipmentList = []
      this.onLoad()
    },
    transFormParams(formData) {
      this.filterList = []
      this.query = { ...formData }
      if (formData.egressStatus) {
        if (formData.egressStatus === '全部') {
          this.query.egressStatus = '10,40,50,60,70,80,90'
        }
        else if (formData.egressStatus === '外出中') {
          this.query.egressStatus = '40,50,60,70,80,90' // 外出
        }
        else if (formData.egressStatus === '已归还') {
          this.query.egressStatus = '10' // 10-在库
        }
      }
      if (formData.egressTimeBegin) {
        this.query.egressTimeBegin = formatDate(formData.egressTimeBegin, 'YYYY-MM-DD HH:mm:ss')
        this.query.egressTimeEnd = formatDate(formData.egressTimeEnd, 'YYYY-MM-DD 23:59:59')
      }
      if (formData.returnTimeBegin) {
        this.query.returnTimeBegin = formatDate(formData.returnTimeBegin, 'YYYY-MM-DD HH:mm:ss')
        this.query.returnTimeEnd = formatDate(formData.returnTimeEnd, 'YYYY-MM-DD 23:59:59')
      }
      // 处理筛选信息，有的才渲染
      Object.keys(this.query).forEach((key) => {
        if (this.query[key] && this.query[key] !== '10,40,50,60,70,80,90')
          this.filterList.push({ name: key, value: this.query[key] })
      })
    },
    // 筛选界面搜索回调
    onSearch(formData) {
      this.query = { ...formData }
      this.transFormParams(formData)
      this.onRefresh()
    },
    showFilter() {
      this.filterVisible = true
    },
  },
}
</script>

<style lang="less" scoped>
.standingBook-wrap {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  .standingBook-filter-wrap {
    width: 100%;
    height: 46px;
    padding: 10px;
    overflow: hidden;
  }
  .standingBook-filter-info {
    white-space: nowrap;
    padding-bottom: 20px;
    box-sizing: border-box;
    overflow-x: auto;

    .standingBook-tag-box {
      display: inline-block;
      margin-left: 5px;
      text-align: center;
      font-size: 12px;
      line-height: 24px;
      color: #0079fe;
      border-radius: 5px;
      border: 1px solid #0079fe;

      .standingBook-tag {
        display: inline-block;
        padding: 0 10px;
      }

      .standingBook-tag-icon {
        display: inline-block;
        text-align: center;
        width: 20px;
        line-height: 24px;
        border-left: 1px solid #0079fe;
      }
    }
  }
}
.standingBook-content {
  flex: 1;
  overflow: auto;
  background-color: #f5f5f5;
}
</style>
