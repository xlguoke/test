<template>
  <li class="common-list card">
    <p class="title">
      <i :class="`iconfont ${icon}`"></i>
      {{ title }}
    </p>
    <p class="data-list">
      <router-link
        v-for="item in datas"
        :key="item.id"
        :to="`${code=='Technical'?'/technical/detail?id='+item.id:'newsDetail?id='+item.id}`"
        tag="a"
        target="_blank"
        :class="`item font-1 ${item.isTop && validDate(item) ? 'top' : ''}`"
      >{{ item.title }}</router-link>
      <span class="no-data" v-if="datas.length === 0">暂无数据</span>
    </p>
    <p class="more">
      <router-link v-if="datas.length > 0" :to="`/news/${code}`">
        查看更多
        <i class="iconfont icon--you"></i>
      </router-link>
    </p>
  </li>
</template>
    
<script setup lang='ts'>
const props = defineProps(["title", "icon", "code", "datas"]);

// 置顶过期日期
const validDate = (d) => {
  return d.topExpirationDate && new Date().getTime() < d.topExpirationDate;
};
</script>
    
<style scoped lang="less">
.common-list {
  width: 32%;
  .title {
    line-height: 48px;
    font-size: 18px;
    font-weight: 700;
    text-align: center;
    background: #77bdf2;
    color: #fff;
    &.title2 {
      background: #78d5ef;
    }
    &.title2 {
      background: #73dad0;
    }
    .iconfont {
      margin-right: 6px;
      font-size: 22px;
      font-weight: 400;
      vertical-align: middle;
    }
  }

  .data-list {
    padding: 12px;
    height: 169px;
    box-sizing: border-box;
    .no-data {
      display: block;
      color: #999;
      text-align: center;
      line-height: 100px;
    }
    .item {
      padding-left: 20px;
      margin-top: 8px;
      position: relative;
      display: block;
      &:hover {
        color: @theme_color_hover;
      }

      &::before {
        content: "";
        position: absolute;
        left: 5px;
        top: 7px;
        width: 5px;
        height: 5px;
        border-radius: 10px;
        border: 1px solid @theme_color;
      }

      &.top::before {
        content: "顶";
        display: inline-block;
        top: 3px;
        left: 0;
        width: 16px;
        height: 16px;
        text-align: center;
        line-height: 16px;
        border-radius: 2px;
        color: #fff;
        background-color: #fe6550;
        font-size: 12px;
        vertical-align: middle;
        border: 0;
      }
    }
  }

  .more {
    margin-bottom: 15px;
    text-align: center;
    &:hover {
      a {
        color: @theme_color_hover;
      }
    }

    a {
      color: @theme_color;
    }
    .iconfont {
      margin-left: 3px;
      font-size: 14px;
    }
  }
}
</style>