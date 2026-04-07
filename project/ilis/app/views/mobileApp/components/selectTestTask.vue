<!-- eslint-disable -->
<template>
  <div>
    <van-popup
      duration="0.2"
      position="right"
      :style="{ width: '100%', height: '100%' }"
      :show="value"
      class="selectTestTask"
    >
      <div class="selectTestTask-wrap">
        <MobileTitleBar left-arrow left-text="关闭" @click-left="onCancel" :title="title || '选择检测任务'" />
        <van-search
          style="border-bottom: solid 1px #e2e2e2"
          v-model.trim="query.quickQryParam"
          placeholder="请输入任务编号/检测人员/委托单位/工程项目!"
          @search="onSearch"
          @blur="packFun"
          @focus="popupFun"
        ></van-search>

        <div class="selectTestTask-list">
          <van-list
            v-model:loading="loading"
            :finished="finished"
            finished-text="没有更多了"
            @load="onLoad"
          >
            <div
              class="selectTestTask-row"
              v-for="item in list"
              :key="item.id"
              @click="onSelect(item)"
            >
              <div class="selectTestTask-content">
                <b>{{ item.testTaskCode }}</b>
                <p>{{ item[field || "projectName"] }}</p>
                <p>{{ item.testPersons }}</p>
              </div>
              <div class="selectTestTask-radio">
                <van-icon
                  name="checked"
                  size="28"
                  :color="
                    selected.find((i) => i.testTaskCode == item.testTaskCode) ? '#1989fa' : '#999'
                  "
                />
              </div>
            </div>
          </van-list>
        </div>
        <div style="height: 50px"></div>

        <div class="selectTestTask-btns" v-show="!buttonHide">
          <van-row>
            <van-col span="12"
              ><van-button block type="primary" square @click="onOk"
                >确定</van-button
              ></van-col
            >
            <van-col span="12"
              ><van-button block square @click="onCancel"
                >取消</van-button
              ></van-col
            >
          </van-row>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<!-- eslint-disable -->
<script>
import qs from 'qs'
import { showDialog } from "vant";
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'

export default {
  data() {
    return {
      buttonHide:false,
      list: [],
      loading: false,
      finished: false,
      paramIds:'',
      query: {
        quickQryParam: "",
        equipmentIds:'',
        page: 0,
        rows: 10,
      },
      selected: [],
    };
  },
  components: {
    MobileTitleBar,
  },
  props: ["value", "title", "isMultiple", "field","equipmentIds",'payload','initSelected'],
  mounted(){
    //获取原窗口的高度
      let originalHeight = document.documentElement.clientHeight || document.body.clientHeight
      console.log("键盘弹出")
      window.οnresize = function() {
        //键盘弹起与隐藏都会引发窗口的高度发生变化
        let resizeHeight = document.documentElement.clientHeight || document.body.clientHeight
        if (resizeHeight < originalHeight) {
          //当键盘弹起，在此处操做
          console.log("键盘弹出")
          this.popupFun();
        } else {
          //当键盘收起，在此处操做
          console.log("键盘收起")
          this.packFun()
        }
      }
  },
  watch: {
    initSelected(val) {
      if (val) {
        this.selected = [...val]
      }
    },
  },
  methods: {
    //收起
    packFun(){
      this.buttonHide=false
    },
    // 弹出
    popupFun(){
      this.buttonHide=true
    },
    async onLoad() {
      this.query.page += 1;

      this.loading = true;


      this.query.equipmentIds = this.equipmentIds

      let res = await mRequest.post(
        api.common.getTaskWithUnitAndProject,
        qs.stringify({
          ...this.query,
          ...this.payload,
        })
      );
      if (res.rows && res.rows.length > 0) {
        this.list = [...this.list, ...res.rows];
      }

      if (res.rows && res.rows.length == 0) {
        this.finished = true;
      }
      this.loading = false;

      if (this.list.length >= res.totalCount) {
        this.finished = true;
      }
      if (res.msg){
        this.paramIds = res.msg
      }
    },
    onSearch() {
      this.finished = false;
      this.query.page = 0;
      this.list = [];
      this.onLoad();
    },
    onOk() {
      if (this.selected.length == 0) {
        showDialog({ message: "请选择检测任务" });
        return;
      }
      this.selected.map(s =>{
        s.paramIds = this.paramIds
      })
      this.$emit("selected-ok", this.selected);
      this.onCancel();
    },
    onCancel() {
      this.$emit("update:value", false);
    },
    onSelect(row) {
      if (this.isMultiple === true) {
        if (!this.selected.find((item) => item.testTaskCode == row.testTaskCode)) {
          this.selected = [...this.selected, row];
        } else {
          this.selected = this.selected.filter((item) => item.testTaskCode !== row.testTaskCode);
        }
      } else {
        this.selected = [row];
      }
    },
  },
};
</script>

<style lang="less" scoped>
.selectTestTask {
  .selectTestTask-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .selectTestTask-btns {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 46px;

    .van-button {
      height: 46px;
      line-height: 46px;
    }
  }

  .selectTestTask-list {
    flex: 1;
    overflow-y: auto;

    .selectTestTask-row {
      border-bottom: solid 1px #e2e2e2;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 15px;
      color: #666;

      .selectTestTask-content {
        padding-right: 10px;
      }

      .selectTestTask-radio {
        display: flex;
        align-items: center;
      }

      p {
        color: #888;
        word-break: break-all;
      }
    }
  }
}
</style>
