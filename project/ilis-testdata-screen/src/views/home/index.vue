<template>
  <div :class="`home ${styleClass}`">
    <Header />

    <div class="home-main">
      <div class="home-empty" v-if="total == 0">
        <div>
          <img v-if="pageStyleKey == 2" src="../../assets/home/home-empty-2.png" />
          <img v-else src="../../assets/home/home-empty.png" />
          <p>暂无试验</p>
        </div>
      </div>

      <div class="home-list" v-if="total > 0">
        <div class="home-list-head">
          <div class="home-list-tr">
            <div
              :class="`home-list-td home-list-td-${columnItem.value}`"
              v-for="columnItem in COLUMNS"
              :key="columnItem.value"
            >{{ columnItem.label }}</div>
          </div>
        </div>
        <div class="home-list-body" ref="HomeListBody">
        <!-- <transition-group name="slideRight" tag="div" class="home-list-body" ref="HomeListBody"> -->
          <div class="home-list-tr" v-for="item in list" :key="item._ID" :style="getTrStyle(item)">
            <div
              :class="`home-list-td home-list-td-${columnItem.value}`"
              v-for="columnItem in COLUMNS"
              :key="columnItem.value"
              :style="getStyle(columnItem.value, item)"
            >
              <div v-if="columnItem.value == 'StatusStrForDataView'">
                <template v-if="pageStyleKey == 2">
                  <img v-if="item[columnItem.value] == '检测中'" src="../../assets/icon/status-testing-2.png" />
                  <img v-if="item[columnItem.value] == '已结束'" src="../../assets/icon/status-complete-2.png" />
                </template>
                <template v-else>
                  <img v-if="item[columnItem.value] == '检测中'" src="../../assets/icon/status-testing-1.png" />
                  <img v-if="item[columnItem.value] == '已结束'" src="../../assets/icon/status-complete-1.png" />
                </template>
                {{ item[columnItem.value] || "--" }}
              </div>
              <div v-else>{{ item[columnItem.value] || "--" }}</div>
            </div>
          </div>
        </div>
        <!-- </transition-group> -->

        <div v-if="errorStatusInfo" :class="errorInfoClass">{{ errorStatusInfo }}</div>

        <div class="home-info" v-if="pageStyleKey == 2">
          <span>当前试验共<b>{{ total }}</b>条</span>
          <span>当前第<b>{{ page }}</b>页，每页<b>{{ rows }}</b>条数据</span>
        </div>
      </div>

      <div class="home-info" v-if="pageStyleKey == 1">
        <span>当前试验共<b>{{ total }}</b>条</span>
        <span>当前第页，每页<b>{{ rows }}</b>条数据</span>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "@/views/components/header/index.vue";
import ajax from "@/lib/ajax";

export default {
  name: "HomePage",
  components: {
    Header
  },
  data() {
    return {
      page: 1,
      rows: 10,
      total: 0,
      userLaboratoryID: null,
      api: null,
      ilisApi: "/ilis2/api/equipment/use/log/screen",
      trMaxHeight: "72px",
      mergeMap: {},
      columnsILIS: [
        { label: "任务编号", value: "taskCode" },
        { label: "样品编号", value: "sampleCode" },
        { label: "样品名称", value: "sampleName" },
        { label: "设备编号", value: "deviceCode" },
        { label: "设备名称", value: "deviceName" },
        { label: "功能室", value: "deviceTypeName" },
        { label: "检测状态", value: "statusStrForDataView" },
        { label: "开始时间", value: "startDate" },
        { label: "结束时间", value: "endDate" },
        { label: "检测时长", value: "durationStr" }
      ],
      list: [],
      errorStatusInfo: null,
      errorStatusCount: 0,
      // lastRunGetListTime: null
    }
  },
  computed: {
    // userLaboratoryID() {
    //   return this.$store.state.userLaboratoryID;
    // },
    tableStyleKey() {
      return this.$store.state.tableStyleKey;
    },
    pageStyleKey() {
      return this.$store.state.pageStyleKey;
    },
    styleClass() {
      const { pageStyleKey, tableStyleKey } = this;
      
      return `home-style-${pageStyleKey} home-table-style-${tableStyleKey}`;
    },
    errorInfoClass() {
      const { pageStyleKey } = this;

      return `home-erorrinfo home-erorrinfo-${pageStyleKey}`;
    },
    COLUMNS() {
      const { unitCode, columnsILIS, tableStyleKey } = this;

      if (unitCode) {
        return columnsILIS;
      } else {
        if (tableStyleKey == 2) {
          return [
            { label: "任务编号", value: "TaskCode" },
            { label: "样品编号", value: "SampleCode" },
            { label: "样品名称", value: "SampleName" },
            { label: "设备编号", value: "DeviceCode" },
            { label: "设备名称", value: "DeviceName" },
            { label: "功能室", value: "DeviceTypeName" },
            { label: "检测状态", value: "StatusStrForDataView" },
            { label: "开始时间", value: "StartDate" },
            { label: "结束时间", value: "EndDate" },
            { label: "检测时长", value: "DurationStr" }
          ];
        }

        return [
          { label: "任务编号", value: "TaskCode" },
          { label: "样品编号", value: "SampleCode" },
          { label: "样品名称", value: "SampleName" },
          { label: "功能室", value: "DeviceTypeName" },
          { label: "检测状态", value: "StatusStrForDataView" },
          { label: "开始时间", value: "StartDate" },
          { label: "结束时间", value: "EndDate" },
          { label: "检测时长", value: "DurationStr" }
        ];
      }
    }
  },
  created() {
    const { query } = this.$route;
    const { labId, api, unitCode } = query;
    const _origin = location.origin.indexOf("localhost") === -1 ? location.origin : 'http://192.168.2.65:8080'
    this.userLaboratoryID = labId;
    this.api = api || (_origin + this.ilisApi);
    this.unitCode = unitCode;

    this.getList();

    // setInterval(() => {
    //   this.checkRun();
    // }, 60 * 1000);

    window.onresize = () => {
      this.initTrHeight();
    }
  },
  mounted() {
    const slice = (window.innerWidth || document.body.clientWidth) / 1920
    document.body.style.zoom = slice
  },
  methods: {
    getStyle(key, item) {
      if (key == "StatusStrForDataView" || key == "statusStrForDataView") {
        let val = item[key];
        if (val == "检测中") {
          if (this.pageStyleKey == 2) {
            return { color: "#00FF93" };
          } else {
            return { color: "#24B276" };
          }
        } else if (val == "已结束") {
          return { color: "#FF6666" };
        }
      }
    },
    getTrStyle(item) {
      const { mergeMap, trMaxHeight } = this;
      let r = { maxHeight: trMaxHeight };

      try {
        const { SampleCode,sampleCode, _ID } = item;

        if (mergeMap[SampleCode] && mergeMap[SampleCode].includes(_ID)) {
          r.marginTop = "0px";
        } else if (mergeMap[sampleCode] && mergeMap[sampleCode].includes(_ID)) {
          r.marginTop = "0px";
        }

        return r;
      } catch(e) {
        console.log(e);
        return r;
      }
    },
    initTrHeight() {
      const { mergeMap, total } = this;
      
      if (total == 0) {
        return;
      }

      try {
        let bodyEle = this.$refs.HomeListBody;
        let height = bodyEle.clientHeight;
        let count = 9;

        let sampleCodes = Object.keys(mergeMap);
        sampleCodes.map(key => {
          if (mergeMap[key].length > 1) {
            count = count - (mergeMap[key].length - 1);
          }
        });

        this.trMaxHeight = `${height / 10}px`;
      } catch(e) {
        console.log(e);
      }
    },
    calcMerge(list) {
      try {
        let mergeMap = {};
        
        list.map(item => {
          const { SampleCode, _ID } = item;
  
          if (mergeMap[SampleCode]) {
            mergeMap[SampleCode].push(_ID);
          } else {
            mergeMap[SampleCode] = [];
          }
        });
  
        this.mergeMap = mergeMap;
      } catch(e) {
        console.log(e);
        this.mergeMap = {};
      }
    },
    formatDate(str) {
      if (str) {
        const arr = str.split("-");
        arr.splice(0, 1);
        return arr.join("-");
      } else {
        return "";
      }
    },
    onErrorStatus() {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const day = now.getDate();
      const h = now.getHours();
      const m = now.getMinutes();
      const s = now.getSeconds();

      const f = function(num) {
        if (num < 10) {
          return `0${num}`;
        } else {
          return num;
        }
      };

      const time = `${year}-${f(month)}-${f(day)} ${f(h)}:${f(m)}:${f(s)}`;

      this.errorStatusCount += 1;
      this.errorStatusInfo = `链接异常:${time} 数据获取失败,正在重试(${this.errorStatusCount})...`;
    },
    onSuccessStatus() {
      if (this.errorStatusInfo !== null) {
        this.errorStatusInfo = null;
        this.errorStatusCount = 0;
        
        const { href } = location;
        const hrefArr = href.split("&")
        const ind = hrefArr.findIndex(d => d.indexOf("v=") > -1)
        if(ind > -1){
          hrefArr.splice(ind, 1)
        }
        location.href = `${hrefArr.join("&")}&v=${new Date().getTime()}`;
      }
    },
    async checkRun() {
      const { lastRunGetListTime } = this;
      const nowTime = new Date().getTime();

      if (lastRunGetListTime && (nowTime - lastRunGetListTime)/1000 > 60) {
        window.location.reload();
      }
    },
    async getList() {
      const { page, rows, unitCode } = this;
      const stamp = 10 * 1000;

      try {
        // this.lastRunGetListTime = new Date().getTime();
        let res = await ajax.get(this.api, {
          params: {
            rows: rows,
            page: page,
            IsDataView: true
          },
          headers: {
            "Unit-Code": unitCode
          }
        });
  
        const { state, data } = res;
  
        if (state == 1) {
          this.onSuccessStatus();

          const list = data.rows.map(item => ({
            ...item,
            StartDate: this.formatDate(item.StartDate),
            EndDate: this.formatDate(item.EndDate),
            _ID: item.id
          }));
  
          this.calcMerge(list);
          
          if (page == 1) {
            this.total = data.total;
          }
  
          this.list = list;
          
          setTimeout(() => {
            this.nextPage(data);
          }, stamp);

          setTimeout(() => {
            this.initTrHeight();
          }, 50);
        } else {
          this.onErrorStatus();
          setTimeout(() => {
            this.getList();
          }, stamp);
        }
      } catch(e) {
        this.onErrorStatus();
        setTimeout(() => {
          this.getList();
        }, stamp);
      }
    },
    nextPage(data) {
      const { rows, page } = this;

      if (this.total == 0 || Math.ceil(data.total / rows) == page) {
        this.page = 1;
      } else {
        this.page = page + 1;
      }

      if (this.total !== data.total) {
        this.page = 1;
      }

      this.getList();
    }
  }
};
</script>

<style lang="less">
@import url("./index.less");
</style>
