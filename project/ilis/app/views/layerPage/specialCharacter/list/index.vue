<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div class="sampleScanRecord">
    <a-tabs tab-position="left" size="small">
      <a-tab-pane key="1" tab="上下标">
        <div class="rt_wrap">
          <ul v-for="item in dummySuffix">
            <li v-for="citem in item" @click="selTextVal(citem)">
              {{ citem }}
            </li>
          </ul>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="数字符号">
        <div class="rt_wrap">
          <ul v-for="item in numberSign">
            <li v-for="citem in item" @click="selTextVal(citem)">
              {{ citem }}
            </li>
          </ul>
        </div>
      </a-tab-pane>
      <a-tab-pane key="3" tab="数学序号" disabled>
        Content of Tab 3
      </a-tab-pane>
      <a-tab-pane key="4" tab="大写金额" disabled>
        Content of Tab 3
      </a-tab-pane>
      <a-tab-pane key="5" tab="计量单位" disabled>
        Content of Tab 3
      </a-tab-pane>
      <a-tab-pane key="6" tab="希腊拉丁" disabled>
        Content of Tab 3
      </a-tab-pane>
      <a-tab-pane key="7" tab="其他">
        <div class="rt_wrap">
          <ul v-for="item in other">
            <li v-for="citem in item" @click="selTextVal(citem)">
              {{ citem }}
            </li>
          </ul>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
const dummySuffix = [
  [
    '⁰',
    '¹',
    '²',
    '³',
    '⁴',
    '⁵',
    '⁶',
    '⁷',
    '⁸',
    '⁹',
    '⁺',
    '⁻',
    '⁼',
    '⁽',
    '⁾',
    'ᵃ',
    'ᵇ',
    'ᶜ',
    'ᵈ',
    'ᵉ',
    'ᶠ',
    'ᵍ',
    'ʰ',
    'ⁱ',
    'ʲ',
    'ᵏ',
    'ˡ',
    'ᵐ',
    'ⁿ',
    'ᵒ',
    'ᵖ',
    'ʳ',
    'ˢ',
    'ᵗ',
    'ᵘ',
    'ᵛ',
    'ʷ',
    'ˣ',
    'ʸ',
    'ᶻ',
    'ᵝ',
    'ᵞ',
    'ᵡ',
  ],
  [
    '₀',
    '₁',
    '₂',
    '₃',
    '₄',
    '₅',
    '₆',
    '₇',
    '₈',
    '₉',
    '₊',
    '₋',
    '₌',
    '₍',
    '₎',
    'ₐ',
    'ₑ',
    'ₕ',
    'ᵢ',
    'ⱼ',
    'ₖ',
    'ₗ',
    'ₘ',
    'ₙ',
    'ₒ',
    'ₚ',
    'ᵣ',
    'ₛ',
    'ₜ',
    'ᵤ',
    'ᵥ',
    'ₓ',
    'ᵦ',
    'ᵧ',
    'ᵨ',
    'ᵩ',
    'ᵪ',
  ],
]

const numberSign = [
  [
    '≈',
    '≡',
    '≠',
    '＝',
    '≤≥',
    '＜',
    '＞',
    '≮',
    '≯',
    '∷',
    '±',
    '＋',
    '－',
    '×',
    '÷',
    '／',
    '∫',
    '∮',
    '∝',
    '∞',
    '∧',
    '∨',
    '∑',
    '∏',
    '∪',
    '∩',
    '∈',
    '∵',
    '∴',
    '⊥',
    '‖',
    '∠',
    '⌒',
    '≌',
    '∽',
    '√',
    '（）',
    '【】',
    '｛｝',
    'Ⅰ',
    'Ⅱ',
    '⊕',
    '⊙',
    '∥',
    'α',
    'β',
    'γ',
    'δ',
    'ε',
    'ζ',
    'η',
    'θ',
    'Δ',
  ],
]

const other = [['®']]

export default {
  components: {},
  data() {
    return {
      dummySuffix,
      numberSign,
      other,
      loading: false,
    }
  },
  created() {},
  methods: {
    selTextVal(v) {
      top.SelectSpecialCharacterCB && top.SelectSpecialCharacterCB(v)
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
