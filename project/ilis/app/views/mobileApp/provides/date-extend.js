// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).Format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).Format("yyyy-M-d h:m:s.S")==> 2006-7-2 8:9:4.18
Date.prototype.Format = function (fmt) {
  const o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    'S': this.getMilliseconds(), // 毫秒
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (`${this.getFullYear()}`).substr(4 - RegExp.$1.length),
    )
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : (`00${o[k]}`).substr((`${o[k]}`).length),
      )
    }
  }
  return fmt
}

Date.prototype.pattern = function (fmt) {
  const o = {
    'M+': this.getMonth() + 1, // 月份
    'd+': this.getDate(), // 日
    'h+': this.getHours() % 12 == 0 ? 12 : this.getHours() % 12, // 小时
    'H+': this.getHours(), // 小时
    'm+': this.getMinutes(), // 分
    's+': this.getSeconds(), // 秒
    'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
    'S': this.getMilliseconds(), // 毫秒
  }
  const week = {
    0: '/u65e5',
    1: '/u4e00',
    2: '/u4e8c',
    3: '/u4e09',
    4: '/u56db',
    5: '/u4e94',
    6: '/u516d',
  }
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (`${this.getFullYear()}`).substr(4 - RegExp.$1.length),
    )
  }
  if (/(E+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (RegExp.$1.length > 1
        ? RegExp.$1.length > 2
          ? '/u661f/u671f'
          : '/u5468'
        : '') + week[`${this.getDay()}`],
    )
  }
  for (const k in o) {
    if (new RegExp(`(${k})`).test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : (`00${o[k]}`).substr((`${o[k]}`).length),
      )
    }
  }
  return fmt
}

/*
* 日期大小验证
* @param minDate - 日期允许的最小值 - null表示不限制日期的最小值(参数类型可以是字符串也可以是日期)
* @param maxValue - 日期允许的最大值 - null表示不限制日期的最大值 (参数类型可以是字符串也可以是日期)
* @return 验证成功返回true，失败返回false
*/
Date.prototype.compareDate = function (minValue, maxValue) {
  const dateValue = this
  if (minValue != null) {
    if (typeof minValue == 'string') {
      minValue = minValue.toDate()
    }
    if (dateValue < minValue) {
      return false
    }
  }
  if (maxValue != null) {
    if (typeof maxValue == 'string') {
      maxValue = maxValue.toDate()
    }
    if (dateValue > maxValue) {
      return false
    }
  }
  return true
}

/**
 * 重写日期add方法
 * @returns {Date}
 */
Date.prototype.add = function (interval, value) {
  const d = this
  switch (interval) {
    case 'mill':
      d.setMilliseconds(this.getMilliseconds() + value)
      break
    case 's':
      d.setSeconds(this.getSeconds() + value)
      break
    case 'm':
      d.setMinutes(this.getMinutes() + value)
      break
    case 'h':
      d.setHours(this.getHours() + value)
      break
    case 'd':
      d.setDate(this.getDate() + value)
      break
    case 'M':
      var day = this.getDate()
      if (day > 28) {
        day = Math.min(day, this.getFirstDateOfMonth().add('month', value).getLastDateOfMonth().getDate())
      }
      d.setDate(day)
      d.setMonth(this.getMonth() + value)
      break
    case 'y':
      d.setFullYear(this.getFullYear() + value)
      break
  }
  return d
}

/*
* 年的增减操作
* @year - 正数表示增加的年数，负数表示减去的年数
*/
Date.prototype.addYear = function (year) {
  this.setFullYear(this.getFullYear() + year)
  return this
}

/*
* 月的增减操作
* @month - 正数表示增加的月数，负数表示减去的月数
*/
Date.prototype.addMonth = function (month) {
  this.setMonth(this.getMonth() + month)
  return this
}

/*
* 日的增减操作
* @day - 正数表示增加的天数，负数表示减去的天数
*/
Date.prototype.addDay = function (day) {
  this.setDate(this.getDate() + day)
  return this
}

/*
* 时的增减操作
* @hour - 正数表示增加的小时数，负数表示减去的小时数
*/
Date.prototype.addHour = function (hour) {
  this.setHours(this.getHours() + hour)
  return this
}

/*
* 分的增减操作
* @minute - 正数表示增加的分钟数，负数表示减去的分钟数
*/
Date.prototype.addMinute = function (minute) {
  this.setMinutes(this.getMinutes() + minute)
  return this
}

/*
* 秒的增减操作
* @second - 正数表示增加的秒数，负数表示减去的秒数
*/
Date.prototype.addSecond = function (second) {
  this.setSeconds(this.getSeconds() + second)
  return this
}

/*
* 获取两个日期间年的间隔（年份相减，跟日期其他部分无关）
* @date - 被减的日期(参数类型可以是字符串也可以是日期)
*/
Date.prototype.getDiffYear = function (date) {
  if (typeof date == 'string') {
    date = date.toDate()
  }
  return Math.abs(this.getFullYear() - date.getFullYear())
}

/*
* 获取两个日期间月的间隔（年份月份相减，跟日期其他部分无关）
* @date - 被减的日期(参数类型可以是字符串也可以是日期)
*/
Date.prototype.getDiffMonth = function (date) {
  if (typeof date == 'string') {
    date = date.toDate()
  }
  return Math.abs((this.getFullYear() - date.getFullYear()) * 12 + (this.getMonth() - date.getMonth()))
}

/*
* 获取两个日期间日的间隔(两个日期相减得到毫秒数，再转换为天数，向下取整)
* @date - 被减的日期(参数类型可以是字符串也可以是日期)
*/
Date.prototype.getDiffDay = function (date) {
  if (typeof date == 'string') {
    date = date.toDate()
  }
  return Math.floor(Math.abs((this.getTime() - date.getTime()) / (24 * 60 * 60 * 1000)))
}

/*
* 获取两个日期间小时的间隔(两个日期相减得到毫秒数，再转换为小时数，向下取整)
* @date - 被减的日期(参数类型可以是字符串也可以是日期)
*/
Date.prototype.getDiffHour = function (date) {
  if (typeof date == 'string') {
    date = date.toDate()
  }
  return Math.floor(Math.abs((this.getTime() - date.getTime()) / (60 * 60 * 1000)))
}

/*
* 获取两个日期间分钟的间隔(两个日期相减得到毫秒数，再转换为分钟数，向下取整)
* @date - 被减的日期(参数类型可以是字符串也可以是日期)
*/
Date.prototype.getDiffMinute = function (date) {
  if (typeof date == 'string') {
    date = date.toDate()
  }
  return Math.floor(Math.abs((this.getTime() - date.getTime()) / (60 * 1000)))
}

/*
* 获取两个日期间秒的间隔(两个日期相减得到毫秒数，再转换为秒数，向下取整)
* @date - 被减的日期(参数类型可以是字符串也可以是日期)
*/
Date.prototype.getDiffSecond = function (date) {
  if (typeof date == 'string') {
    date = date.toDate()
  }
  return Math.floor(Math.abs((this.getTime() - date.getTime()) / 1000))
}
