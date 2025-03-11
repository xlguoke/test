export function useCollapseState() {
  const collapseState = ref({
    检测参数: '1',
    取样信息: '1',
    收样要求: '1',
    样品信息: '1',
    附加费用: '0',
    制样信息: '0',
    抽样信息: '0',
    附件: '1',
  })

  return { collapseState }
}
