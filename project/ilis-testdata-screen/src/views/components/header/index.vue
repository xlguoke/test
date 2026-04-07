<template>
  <header>
    <div class="header-title">
      <img src="../../../assets/icon/logo.png" />
      {{ title }}
    </div>
    <div class="header-content">
      <img v-if="pageStyleKey == 2" src="../../../assets/icon/time-blue.png" />
      <img v-else src="../../../assets/icon/time-white.png" />

      <div class="header-date">{{ time1 }}</div>
      <div class="header-date">{{ time2 }}</div>

      <div class="header-more" v-show="true">
        <Dropdown
          trigger="click"
          :class="headerDropDownClass"
          placement="bottom-end"
          @on-click="onSelect"
        >
          <img
            v-if="pageStyleKey == 2"
            src="../../../assets/icon/more-blue.png"
          />
          <img v-else src="../../../assets/icon/more-white.png" />
          <template slot="list">
            <DropdownMenu>
              <!-- <Dropdown trigger="click" placement="right-start"> -->
                <!-- <DropdownItem>风格模板设置</DropdownItem> -->
                <DropdownItem name="style1">浅色系风格</DropdownItem>
                <DropdownItem name="style2">深色系风格</DropdownItem>
                <!-- <template slot="list">
                  <DropdownMenu>
                    <DropdownItem name="style1">浅色系风格</DropdownItem>
                    <DropdownItem name="style2">深色系风格</DropdownItem> -->
                    <!-- <DropdownItem name="style3">风格3</DropdownItem> -->
                    <!-- <DropdownItem name="style4">风格4</DropdownItem> -->
                  <!-- </DropdownMenu>
                </template> -->
              <!-- </Dropdown> -->
              <!-- <DropdownItem name="loginout">退出</DropdownItem> -->
            </DropdownMenu>
          </template>
        </Dropdown>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: "HeaderComponent",
  data() {
    return {
      title: "",
      time1: "",
      time2: "",
    };
  },
  computed: {
    headerDropDownClass() {
      if (this.pageStyleKey == 1) {
        return "header-white-dropmenu";
      }

      return "header-blue-dropmenu";
    },
    pageStyleKey() {
      return this.$store.state.pageStyleKey;
    },
  },
  created() {
    this.title = window.$config_title;

    this.getDate();

    setInterval(() => {
      this.getDate();
    }, 1 * 1000);
  },
  methods: {
    onSelect(name) {
      if (name === "loginout") {
        this.$store.commit("loginout");
        this.$router.push({ name: "login" });
      }

      if (name === "style1") {
        this.$store.commit("SET_PAGE_STYLE", 1);
      }

      if (name === "style2") {
        this.$store.commit("SET_PAGE_STYLE", 2);
      }
    },
    getDate() {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const days = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const day = date.getDay();

      const dayObj = {
        0: "日",
        1: "一",
        2: "二",
        3: "三",
        4: "四",
        5: "五",
        6: "六",
      };
      const f = function(num) {
        if (num < 10) {
          return `0${num}`;
        } else {
          return num;
        }
      };

      this.time1 = `${year}-${f(month)}-${f(days)} ${f(hours)}:${f(
        minutes
      )}:${f(seconds)}`;
      this.time2 = `星期${dayObj[day]}`;
    },
  },
};
</script>

<style lang="less">
@import url("./index.less");
</style>
