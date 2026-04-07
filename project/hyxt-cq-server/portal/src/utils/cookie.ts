export function getCookie(name: string) {
  let arr,
    reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)")
  if ((arr = document.cookie.match(reg))) {
    return unescape(arr[2])
  } else {
    return null
  }
}

export function delCookie(name) {
  let exp = new Date()
  exp.setTime(-1000)
  document.cookie =
    name +
    "='';expires=" +
    exp.toUTCString() +
    ";domain=." +
    document.domain.split(".").slice(-3).join(".") +
    ";path=/"
  document.cookie =
    name + "='';expires=" + exp.toUTCString() + ";domain=." + document.domain + ";path=/"
}

export function setCookie(name, value) {
  let Days = 30
  let exp = new Date()
  exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000)
  document.cookie =
    name +
    "=" +
    escape(value) +
    ";expires=" +
    exp.toUTCString() +
    ";domain=." +
    document.domain +
    ";path=/"
}
