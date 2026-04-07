<template>
  <div class="h-full flex flex-col">
    <van-nav-bar
      title="检查要点搜索"
      left-text="返回"
      right-text="更多"
      left-arrow
      @click-left="onClickLeft"
      @click-right="onClickRight"
    >
      <template #right>
        <van-icon name="ellipsis" size="22" @click="showMore = true" />
      </template>
    </van-nav-bar>
    <div v-show="tab_mode === 1" style="border-bottom: 1px solid #f3f3f3cc">
      <van-field
        v-model="getSelTreeValTxt"
        center
        clearable
        label="选择大类"
        placeholder="请选择大类"
        readonly
      >
        <template #button>
          <van-button size="small" type="primary" @click="openSelectTree">
            选择
          </van-button>
        </template>
      </van-field>
    </div>

    <div v-show="tab_mode === 2" style="border-bottom: 1px solid #f3f3f3cc">
      <van-search
        v-model:value="query.quickQry"
        placeholder="请输入检查要点检查"
        @search="onSearchForPoints"
      />
    </div>
    <div
      v-show="tab_mode === 2 && historicalSearch.length && !isShowList"
      style="padding: 10px"
    >
      <p>历史搜索记录：</p>
      <div style="margin-top: 5px">
        <template v-for="(item, index) in historicalSearch" :key="index">
          <van-tag
            plain
            type="primary"
            style="margin: 3px"
            size="medium"
            @click="() => {
              query.quickQry = item
              onSearchForPoints()
            }"
          >
            {{ item }}
          </van-tag>
        </template>
      </div>
    </div>

    <div v-show="isShowList" class="mt-2 flex flex-col flex-1 min-h-0">
      <p class="title_item">
        <span>检查要点 </span>
        <!-- <van-button type="primary" size="mini" @click="checkAll" >全选</van-button> -->
        <van-checkbox v-model="checkedAll" @change="checkAll">
          全选
        </van-checkbox>
      </p>
      <van-list
        v-model:loading="loading"
        :finished="finished"
        finished-text="没有更多数据了"
        class="flex-1 min-h-0 overflow-y-auto"
        @load="laodList"
      >
        <van-checkbox-group ref="checkboxGroup" v-model="result">
          <van-cell
            v-for="(item, index) in pointsData"
            :key="item.id"
            clickable
            :title="item.keypoint"
            @click="toggle(index)"
          >
            <template #right-icon>
              <van-checkbox ref="checkboxes" :name="item" @click.stop="() => {}" />
            </template>
          </van-cell>
        </van-checkbox-group>
      </van-list>
    </div>

    <ActionBar :fixed="false">
      <van-button @click="tabMode">
        {{ tab_mode === 1 ? '切换到按文本搜索' : '切换到层级分类' }}
      </van-button>
      <van-button type="primary" @click="selListOK">
        确定
      </van-button>
    </ActionBar>
    <div class="but_bottom">
    </div>
    <van-action-sheet
      v-model:show="showMore"
      :actions="[{ name: '新增检查要点' }]"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectEssentals"
    />

    <van-popup v-model:show="selectTreePopup" round position="bottom">
      <van-cascader
        :field-names="{
          text: 'name',
          value: 'id',
          children: 'children',
        }"
        title="请选择大类"
        :options="categoryTreeData"
        closeable
        @change="selectTreeOk"
        @close="selectTreePopup = false"
      />
    </van-popup>

    <!-- 添加要点 -->
    <van-popup
      v-if="addEssentialsPopup"
      v-model:show="addEssentialsPopup"
      position="right"
      :overlay="false"
    >
      <div style="height: 100vh; width: 100vw">
        <AddEssentials
          :sel-category="selectTreeVal"
          @close-call="addEssentialsPopup = false"
          @close-points-popup="addEssentialsPopup = false"
          @save-essentials-ok="saveEssentialsOk"
        ></AddEssentials>
      </div>
    </van-popup>
  </div>
</template>

<script>
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { $emit } from '../../utils/gogocodeTransfer'
import AddEssentials from './addEssentials.vue'

export default {
  components: {
    ActionBar,
    AddEssentials,
  },
  props: ['categoryId'],
  emits: ['selectOk', 'closePointsPopup'],
  data() {
    return {
      addEssentialsPopup: false,
      showMore: false,
      isShowList: true, // 是否显示要点列表
      historicalSearch: [], // 历史搜索缓存
      checkedAll: false, // 全选
      result: [], // 列表选择数据
      finished: false, // 没有更多数据提示
      loading: false, // 请求加载提示
      pointsData: [], // 要点列表
      selectTreeVal: [], // 大类选择的值
      categoryTreeData: [], // 大类树值
      selectTreePopup: false,
      tab_mode: 1,
      // 被选中元素的id
      query: {
        page: 1,
        size: 20,
        quickQry: '',
      },
    }
  },
  computed: {
    getSelTreeValTxt() {
      const arr = this.selectTreeVal.map((item) => {
        return item.name
      })
      return arr.join('>')
    },
  },
  mounted() {
    this.getCategoryTree()
    this.getPointsList()
  },
  methods: {
    onSelectEssentals() {
      if (!this.selectTreeVal.length) {
        showToast('请先选择大类')
        return
      }
      this.addEssentialsPopup = true
    },
    saveEssentialsOk(data) {
      const category = this.selectTreeVal
        .map((item) => {
          return item.name
        })
        .join('-')

      mRequest({
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'post',
        url: api.inspectManage.addKeypoint,
        data: {
          category,
          categoryId: this.selectTreeVal[this.selectTreeVal.length - 1].id,
          keypoint: data.keypoint,
          description: data.description,
          orderNumber: data.orderNumber,
        },
      }).then((res) => {
        if (res.code === 20000) {
          showSuccessToast('添加成功')
          this.addEssentialsPopup = false
          this.query.page = 1
          this.quickQry = ''
          this.pointsData = []
          this.getPointsList(
            this.selectTreeVal[this.selectTreeVal.length - 1].id,
          )
        }
      })
    },
    // 搜索函数
    onSearchForPoints() {
      if (this.query.quickQry) {
        this.query.page = 1
        this.pointsData = []
        this.getPointsList()
        const dtArr = JSON.parse(sessionStorage.getItem('historicalSearch')) || []

        if (dtArr.length > 6) {
          dtArr.splice(5, dtArr.length - 6)
        }
        dtArr.unshift(this.query.quickQry)
        sessionStorage.setItem('historicalSearch', JSON.stringify(dtArr))
        this.historicalSearch = dtArr
      }
    },
    onClickRight() {},
    openSelectTree() {
      this.selectTreePopup = true
      // 样式要求添加个确定按钮，其实就是关闭弹窗
      setTimeout(() => {
        const dom = document.querySelectorAll('.van-cascader__header>i')[0]
        dom.innerHTML = '确定'
        dom.className = 'prop_font_tip'
      }, 200)
    },
    // 全选
    checkAll() {
      if (this.checkedAll) {
        this.$refs.checkboxGroup.toggleAll(true)
      }
      else {
        this.$refs.checkboxGroup.toggleAll(false)
      }
    },
    toggle(index) {
      this.$refs.checkboxes[index].toggle()
    },
    // 确定选择
    selListOK() {
      $emit(this, 'selectOk', this.result)
    },
    // tab切换
    tabMode() {
      if (this.tab_mode === 1) {
        this.tab_mode = 2
      }
      else {
        this.tab_mode = 1
      }

      this.query = {
        page: 1,
        size: 20,
        quickQry: '',
      }
      this.pointsData = []

      if (this.tab_mode === 1) {
        this.laodList()
        this.isShowList = true
      }
      else {
        this.isShowList = false
        const dtArr = JSON.parse(sessionStorage.getItem('historicalSearch')) || []
        this.historicalSearch = dtArr
      }
    },
    // 返回上一层回调
    onClickLeft() {
      $emit(this, 'closePointsPopup')
    },
    // 选择树回调
    selectTreeOk(v) {
      this.selectTreeVal = v.selectedOptions
      this.pointsData = []
      this.getPointsList(v.value)
    },
    laodList() {
      this.getPointsList()
      this.query.page++
    },
    // list大类树请求
    async getCategoryTree() {
      const res = await mRequest({
        method: 'get',
        url: api.inspectManage.categoryTree,
        params: {
          inspectionCategoryId: this.categoryId,
        },
      })
      if (res.code === 20000) {
        this.recursionTree(res.data)
        this.categoryTreeData = res.data
      }
    },

    // 去除空children
    recursionTree(arr) {
      arr.forEach((item) => {
        if (item.children.length) {
          this.recursionTree(item.children)
        }
        else {
          delete item.children
        }
      })
    },
    // 获取数据list
    async getPointsList(id) {
      this.loading = true
      this.isShowList = true
      const res = await mRequest({
        method: 'get',
        url: api.inspectManage.pointsList,
        params: {
          keypointCategoryId: id,
          ...this.query,
        },
      })
      this.loading = false

      if (res.code === 20000) {
        if (res.data.rows && res.data.rows.length > 0) {
          this.pointsData = [...this.pointsData, ...res.data.rows]
        }
        if (res.data.rows && res.data.rows.length === 0) {
          this.finished = true
        }
        if (this.pointsData.length >= res.data.count) {
          this.finished = true
        }
      }
    },
  },
}
</script>

<style scoped>
.title_item {
  display: flex;
  justify-content: space-between;
  padding: 10px 15px;
  align-items: center;
  background: #ededed;
}
.but_bottom {
  position: fixed;
  bottom: 0px;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
</style>
