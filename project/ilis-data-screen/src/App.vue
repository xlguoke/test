<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from "vue"
import { getUrlParam } from "@/utils/utils"
import { useUnitDataHooks } from "./hooks/useUnitDataHooks"

const { unitCode } = useUnitDataHooks()

const bodyClassList = document.getElementsByTagName("body")[0].classList
if (!bodyClassList.contains(`${unitCode.value}-layout`)) {
  bodyClassList.add(`${unitCode.value}-layout`)
}

onMounted(() => {
  const unitCode = getUrlParam("unitCode")
  if (!unitCode) return

  if (
    location.hash === "#/homeScreen?unitCode=qchj" ||
    location.hash === "#/dataScreen?unitCode=qchj"
  ) {
    const { origin, hash, pathname } = location
    const _hash = hash.split("?")
    location.replace(`${origin}${pathname}?${_hash[1]}${_hash[0]}`)
    return
  }
  localStorage.setItem("unitCode", unitCode)
  localStorage.setItem("unitCodeSource", "url")
})
</script>

<style lang="less">
.commonPopupClass {
  .ant-select-tree-switcher {
    width: 0.36rem !important;
    line-height: 0.56rem !important;
  }

  .ant-select-tree-switcher-icon {
    font-size: 0.28rem !important;
  }

  .ant-select-dropdown {
    padding: 0.08rem;
  }

  .ant-select-item-option-content {
    font-size: 0.36rem;
    line-height: 0.62rem;
  }

  .ant-select-tree-title {
    font-size: 0.36rem;
    line-height: 0.36rem;
  }
}

.customSelectClass {
  .ant-select-selection-search-input {
    font-size: 0.36rem;
  }

  .ant-select-selection-item,
  .ant-select-selection-placeholder {
    font-size: 0.36rem;
    display: flex;
    align-items: center;
  }
}

.customDateClass {
  .ant-picker-input {
    input {
      font-size: 0.36rem;
    }
  }

  .ant-picker-clear {
    font-size: 0.36rem;
  }
}

.commonDatePopupClass {
  .ant-picker-header {
    height: 1rem;

    & > button {
      font-size: 0.56rem;

      & > span {
        width: 0.46rem;
        height: 0.46rem;
      }
    }
  }

  .ant-picker-cell-in-view {
    padding: 0.08rem 0;
  }

  .ant-picker-header-view {
    display: flex;
    align-items: center;
    justify-content: center;

    & > button {
      font-size: 0.36rem;
    }
  }

  .ant-picker-date-panel {
    width: 7rem;

    .ant-picker-content {
      width: 6.4rem;

      th {
        width: 0.58rem;
        height: 0.58rem;
      }
    }
  }

  .ant-picker-cell {
    .ant-picker-cell-inner {
      font-size: 0.36rem;
      width: 0.58rem;
      height: 0.58rem;
      line-height: 0.58rem;
    }
  }
}
</style>
