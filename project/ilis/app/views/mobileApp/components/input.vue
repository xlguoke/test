<template>
  <div class="input-wrap">
    <div class="input-box">
      <input
        v-bind="$attrs"
        ref="input"
        v-model.trim="inputValue"
        class="input"
        type="text"
        @input="inputChange"
        @focus="inputFocus"
        @blur="inputBlur"
      />
    </div>
    <template v-if="tips">
      <ul v-show="tipsShow" class="input-tips-list">
        <li
          v-for="(item, index) in columns"
          v-show="filter(item, index)"
          :key="index"
          class="input-tips-item"
          @click.stop="tipClick(item, index)"
        >
          {{ item }}
        </li>
      </ul>
    </template>
    <slot name="right">
    </slot>
    <div v-if="history" class="history-btn" @click.stop="inputClick">
      选择
    </div>
    <SelectTips
      v-if="history"
      v-model="picker"
      v-bind="$attrs"
      :input-value="inputValue"
      :columns="columns"
      @selected-ok="selectedOk"
    ></SelectTips>
  </div>
</template>

<script>
import SelectTips from '../components/selectTips.vue'

export default {
  name: 'VInput',
  components: {
    SelectTips,
  },
  props: {
    value: {
      type: [Array, String, Number, Boolean],
      default: null,
    },
    history: {
      type: Boolean,
      default: false,
    },
    tips: {
      type: Boolean,
      default: false,
    },
    columns: {
      type: Array,
      default: () => [],
    },
    tipSelect: {
      type: Function,
      default: null,
    },
  },
  emits: ['update:value', 'focus', 'blur'],
  data() {
    return {
      inputValue: '',
      picker: false,
      tipsShow: false,
      tipList: [],
      blurTime: null,
    }
  },
  computed: {},
  watch: {
    value(val) {
      this.inputValue = val
    },
  },
  mounted() {
    this.inputValue = this.value
  },
  beforeUnmount() {
    if (this.blurTime) {
      clearTimeout(this.blurTime)
      this.blurTime = null
    }
  },
  methods: {
    tipClick(row) {
      this.inputValue = row
      this.$emit('update:value', this.inputValue)
    },
    inputClick() {
      if (this.history) {
        this.picker = true
        this.$refs.input.blur()
      }
    },
    inputFocus() {
      this.tipsShow = true
      this.$emit('focus', this.inputValue)
    },
    inputBlur() {
      if (this.blurTime) {
        clearTimeout(this.blurTime)
        this.blurTime = null
      }
      this.blurTime = setTimeout(() => {
        this.tipsShow = false
      }, 100)
      this.$emit('blur', this.inputValue)
    },
    filter(item) {
      return this.inputValue
        ? item
            .toLocaleLowerCase()
            .includes(this.inputValue.toLocaleLowerCase())
        : true
    },
    inputChange() {
      this.$emit('update:value', this.inputValue)
    },
    selectedOk(row) {
      this.picker = false
      if (this.tipSelect) {
        this.tipSelect(row)
      }
      else {
        this.inputValue = row[0]
        this.$emit('update:value', row[0])
      }
    },
  },
}
</script>

<style lang="less" scoped>
.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
  .input-box {
    position: relative;
    flex: 1;
    z-index: 1;
  }
  .input {
    position: relative;
    width: 100%;
    height: 100%;
    border: none;
    box-sizing: border-box;
    color: #333;
    z-index: 0;
    &::placeholder {
      opacity: 0.55;
    }
  }
}
.history-btn {
  font-size: 12px;
  line-height: 24px;
  color: #1e9fff;
}
.history-wrap {
  width: 100vw;
  height: 100vh;
  padding: 50px 15px 0;
  box-sizing: border-box;
  .van-search {
    position: relative;
    z-index: 1;
  }
  .tips-list {
    position: absolute;
    width: calc(100% - 6.4vw);
    max-height: calc(100vh - 110px);
    overflow: auto;
    top: calc(100% - 2vw);
    text-align: left;
    border: 1px solid #e2e2e2;
    border-top: none;
    border-bottom: none;
    .tip-item {
      width: 100%;
      z-index: 10;
      font-size: 12px;
      line-height: 32px;
      padding: 0 15px;
      box-sizing: border-box;
      border-bottom: 1px solid #e2e2e2;
    }
  }
}
.input-tips-list {
  position: absolute;
  width: 90%;
  left: 0;
  top: 100%;
  z-index: 200;
  max-height: 180px;
  overflow: auto;

  .input-tips-item {
    width: 100%;
    font-size: 13px;
    background: #fff;
    padding: 4px 10px;
    box-sizing: border-box;
    border: 1px solid #e5e5e5;
    &:nth-child(n + 2) {
      border-top: none;
    }
  }
}
</style>
