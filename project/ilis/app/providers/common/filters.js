export default {
  formatMoney(val) {
    val = val.toString().replace(/\$|,/g, '')
    // eslint-disable-next-line unicorn/prefer-number-properties
    if (isNaN(val)) {
      val = '0'
    }
    const sign = val == (val = Math.abs(val))
    val = Math.floor(val * 100 + 0.50000000001)
    let cents = val % 100
    val = Math.floor(val / 100).toString()
    if (cents < 10) {
      cents = `0${cents}`
    }
    for (let i = 0; i < Math.floor((val.length - (1 + i)) / 3); i++) {
      val
        = `${val.substring(0, val.length - (4 * i + 3))
        },${
          val.substring(val.length - (4 * i + 3))}`
    }

    return `${(sign ? '' : '-') + val}.${cents}`
  },
  capitalize(value) {
    if (!value)
      return ''
    value = value.toString()
    return value.charAt(0).toUpperCase() + value.slice(1)
  },
}
