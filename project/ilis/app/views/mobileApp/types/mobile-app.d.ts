/** Hbuilder注入对象 */
declare const plus: any

declare global {
  interface Window {
    plus?: plus
  }
}
