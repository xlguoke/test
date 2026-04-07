import { nextTick } from "vue"
import { deepCopy } from "./utils"

/**
 * # 数字自增效果
 */
export const numAnimate = (num1, num2, fn) => {
  let timer
  let step = {}
  ;(function add() {
    let isEnd = true
    for (let k in num1) {
      let sub = Number(num2[k]) - Number(num1[k])
      if (!step[k]) {
        step[k] = parseInt(Math.max(30, sub / 15) + "")
      }
      if (sub > 0) {
        isEnd = false
        num1[k] = Number(num1[k]) + step[k]
        if (num1[k] > num2[k]) {
          num1[k] = num2[k]
        }
      } else if (sub < 0) {
        isEnd = false
        num1[k] = Number(num1[k]) - step[k]
        if (num1[k] < num2[k]) {
          num1[k] = num2[k]
        }
      }
    }
    if (!isEnd) {
      fn && fn(num1)
      timer = setTimeout(() => {
        add()
      }, 100)
    } else {
      clearTimeout(timer)
    }
  })()
}

/**
 * # 数字转千分位
 */
export const numberToCurrencyNo = (value) => {
  if (!value) return "0"

  const intPart = Math.trunc(value)
  const intPartFormat = intPart.toString().replace(/(\d)(?=(?:\d{3})+$)/g, "$1,")
  let floatPart = ""
  const valueArray = value.toString().split(".")
  if (valueArray.length === 2) {
    floatPart = valueArray[1].toString()
    return intPartFormat + "." + floatPart
  }
  return intPartFormat + floatPart
}

/**
 * # 轮播
 */
export const autoPlayData = (opt) => {
  const { domId, datas, isMove, timer, callback, delay = 5000 } = opt
  nextTick(() => {
    const warp = document.getElementById(domId) as any
    const con = warp?.querySelector(".scroll-box")
    const warpH = warp.clientHeight
    const conH = con.clientHeight
    let t: any = null
    if (warpH >= conH) return
    t && clearTimeout(t)
    timer.value && clearInterval(timer.value)
    timer.value = setInterval(() => {
      isMove.value = true
      t = setTimeout(() => {
        const obj = datas.value.shift()

        if (!obj) {
          isMove.value = false
          return
        }

        callback && callback(obj)
        datas.value.push(deepCopy(obj))
        isMove.value = false
      }, 1000)
    }, delay)
  })
}
