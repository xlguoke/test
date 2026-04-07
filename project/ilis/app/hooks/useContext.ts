export function useContext<T>(context: T, key: string) {
  function provideContext() {
    provide(key, context)
  }

  function injectContext() {
    return inject(key) as T
  }

  return { provideContext, injectContext }
}
