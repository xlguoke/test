<template>
  <div>
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        title="规程查询"
        left-arrow
        @click-left="$router.go(-1)"
      >
      </MobileTitleBar>
      <van-row class="filter-row">
        <van-col span="12" @click="openScreen(1)">
          <van-icon size="18" class-prefix="iconfont" name="search" />
          搜索
        </van-col>
        <van-col span="12" @click="openScreen(2)">
          <van-icon size="18" class-prefix="iconfont" name="sort" />筛选
        </van-col>
      </van-row>
      <van-search
        v-if="quickSearchVisible"
        v-model.trim="query.quickQryParam"
        placeholder="请输入规程名称/颁布号"
        @search="onSearch"
      />
    </van-sticky>
    <van-list
      v-model:loading="loading"
      finished-text="没有更多了"
      :finished="finished"
      @load="onLoad()"
    >
      <div class="list">
        <ListCard
          v-for="item in list"
          :key="item.id"
        >
          <template #title>
            <!-- 具体类型对应见app\types\standard.ts -->
            <van-tag v-if="item.type === '1' || item.type === '3'" color="#02a7f0" class="mr-1">
              检
            </van-tag>
            <van-tag v-if="item.type === '2' || item.type === '3'" color="#f59a23" class="mr-1">
              评
            </van-tag>
            {{ item.standardName }}
          </template>

          <div>
            <div class="list-item-code">
              {{ item.publishCode }}
            </div>
            <div v-if="item.fileName" class="flex items-center gap-1 text-[#154bd0]" @click="handlePreview(item)">
              <van-icon name="eye-o" />
              <div class="file-name">
                {{ item.fileName }}
              </div>
            </div>
          </div>
        </ListCard>
      </div>
    </van-list>
    <StandardSearch
      v-model:value="searchVisible"
      :inital-data="moreCondition"
      @callback="getMoreSearch"
    />

    <!-- 查看PDF -->
    <MobileCheckPDF ref="mobileCheckPDFRef" />
  </div>
</template>

<script>
import MobileCheckPDF from '~/views/mobileApp/components/MobileCheckPDF.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ListCard from '~/views/mobileApp/components/MobileUI/ListCard.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import StandardSearch from './component/StandardSearch.vue'

export default {
  components: {
    StandardSearch,
    MobileTitleBar,
    ListCard,
    MobileCheckPDF,
  },
  data() {
    return {
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
    }
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
        .get('baseStandardManageController.do?datagrid', {
          params: {
            ...this.query,
            ...this.moreCondition,
          },
        })
        .catch((err) => {
          showFailToast(err.message || '获取列表数据失败')
        })

      if (res.rows && res.rows.length > 0) {
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
    handlePreview(item) {
      this.$refs.mobileCheckPDFRef.open(item.fileUrl, item.fileName)
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
