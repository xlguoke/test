<template>
  <div class="sampleScanRecord">
    <a-tabs tab-position="left" size="small">
      <a-tab-pane key="1" tab="上下标">
        <div class="rt_wrap">
          <ul v-for="(item, index) in dummySuffix" :key="index">
            <li v-for="citem in item" :key="index + citem" @click="selTextVal(citem)">
              {{ citem }}
            </li>
          </ul>
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="数字符号">
        <div class="rt_wrap">
          <ul v-for="(item, index) in numberSign" :key="index">
            <li v-for="citem in item" :key="citem + index" @click="selTextVal(citem)">
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
          <ul v-for="(item, index) in other" :key="index">
            <li v-for="citem in item" :key="index + citem" @click="selTextVal(citem)">
              {{ citem }}
            </li>
          </ul>
        </div>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script setup lang='ts'>
const emits = defineEmits<{
  (e: 'select', data: string): void
}>()
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
    '≤',
    '≥',
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
    '（',
    '）',
    '【',
    '】',
    '｛',
    '｝',
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

function selTextVal(v: string) {
  emits('select', v)
}
</script>

<style scoped>
.rt_wrap {
  height: 400px;
  max-height: 80vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.rt_wrap ul {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
  width: 100%;
  max-width: 501px;
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
}
.rt_wrap ul li {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 50px;
  border: 1px solid #ccc;
  border-left: none;
  border-top: none;
  font-size: 20px;
  padding: 8px;
  cursor: pointer;
  overflow: hidden;
}
.rt_wrap ul li:hover {
  background: #eeeeee;
}
</style>
