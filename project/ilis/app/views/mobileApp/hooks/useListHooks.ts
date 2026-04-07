export function useListHooks() {
  const listLoading = ref(false)

  const listFinished = ref(false)

  const listError = ref(false)

  const listPage = ref(0)

  const listPageSize = ref(10)

  return {
    listLoading,
    listFinished,
    listError,
    listPage,
    listPageSize,
  }
}
