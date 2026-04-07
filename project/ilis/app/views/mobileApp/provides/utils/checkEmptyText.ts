export function checkEmptyText(val: string, str = '-') {
  switch (val) {
    case undefined:
    case null:
    case 'undefined':
    case 'null':
    case '':
      return str
    default:
      return val
  }
}
