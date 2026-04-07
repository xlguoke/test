<template>
  <div class="layout-box">
    <div class="layout-top">
      <div class="content-left">
        <OverView />
      </div>
      <div class="content-right">
        <RechargeRecord />
      </div>
    </div>
    <div class="layout-bottom">
      <DataQuery />
    </div>
  </div>
</template>

<script>
import DataQuery from './components/DataQuery.vue'
import OverView from './components/OverView.vue'
import RechargeRecord from './components/RechargeRecord.vue'

export default {
  components: {
    OverView,
    RechargeRecord,
    DataQuery,
  },
  data() {
    return {}
  },
  mounted() {},
  methods: {},
}
</script>

<style lang="less">
.layout-box {
  min-height: 100%;
  .layout-top {
    display: flex;
    flex-wrap: wrap;
    height: 50%;
    min-height: 300px;
    .content-left {
      margin-right: 20px;
      width: 520px;
    }
    .content-right {
      flex: 1;
      width: 0;
      min-width: 500px;
    }
  }
  .content-box {
    padding: 0 12px;
  }
  .ant-pagination {
    margin: 4px 0 0;
  }
}
.alert-info {
  display: flex;
  padding: 8px 12px;
  background-color: #e5f3ff;
  color: #555;
  border-radius: 2px;
  font-size: 12px;
  .anticon {
    margin-top: 3px;
    font-size: 14px;
    color: var(--colorPrimary);
  }
  .alert-con {
    margin-left: 6px;
    flex: 1;
    width: 0;
  }
  &.alert-info-error {
    background-color: #ffe8e8;
    .anticon {
      color: red;
    }
  }
}
@media screen and (max-width: 1100px) {
  .layout-box {
    .layout-top {
      .content-left {
        width: 45%;
      }
    }
  }
}
@media screen and (max-width: 1000px) {
  .layout-box {
    .layout-top {
      .content-left {
        width: 520px;
      }
    }
  }
}
.ant-tooltip-inner {
  background-color: #fff;
  color: #333;
  font-size: 12px;
}
.ant-tooltip-arrow:before {
  background-color: #fff;
}
</style>
