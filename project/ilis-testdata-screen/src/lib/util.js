Date.prototype.Format = function (fmt) {
  const o = {
    "M+": this.getMonth() + 1, //月份
    "d+": this.getDate(), //日
    "h+": this.getHours(), //小时
    "m+": this.getMinutes(), //分
    "s+": this.getSeconds(), //秒
    "q+": Math.floor((this.getMonth() + 3) / 3), //季度
    "S": this.getMilliseconds(), //毫秒
  };
  const yRet = new RegExp(/(y+)/).exec(fmt);
  if (yRet) {
    const rStr = yRet[1];
    fmt = fmt.replace(rStr, (this.getFullYear() + "").substring(4 - rStr.length));
  }

  for (const k in o) {
    const ret = new RegExp('(' + k + ')').exec(fmt);
    if (ret) {
      const result = (o as any)[k];
      fmt = fmt.replace(ret[1], (ret[1].length === 1) ? result : (('00' + result).substring(('' + result).length)));
    }
  }
  return fmt;
};

class Util {
  formatDate(Data, fmt) {
    if (!Data) return null;
    const date = new Date(Data);
    let month = date.getMonth() + 1;
    let strDate = date.getDate();
    const hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
    const minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
    const seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
    if (month <= 9) {
      month = "0" + month;
    }
    if (strDate <= 9) {
      strDate = "0" + strDate;
    }
    if (fmt == "yyyy-MM-dd HH:mm:ss") {
      return (
        date.getFullYear() +
        "-" +
        month +
        "-" +
        strDate +
        " " +
        hours +
        ":" +
        minutes +
        ":" +
        seconds
      );
    } else if (fmt == "yyyy-MM-dd") {
      return date.getFullYear() + "-" + month + "-" + strDate;
    }
    return fmt;
  }
}

const util = new Util();
export default util;
