import type { App, Component } from 'vue'
import type { IDialogPropsSelector, IPromptProps } from '../interface/IDialogProps'
import { createApp } from 'vue'
import AppProvider from '~/components/AppProvider.vue'
import BasePrompt from '~/components/UI/BasePrompt.vue'
import { directivePlugin } from '~/directives'
import { useIndustryStore } from '~/store/industryStore'
import 'ant-design-vue/dist/reset.css'

/**
 * 对话框帮助类
 * @description 用于创建对话框
 * @example
 * ```ts
 * // 创建一个对话框
 * AnyDialogHelper.showModel(HelloWorld, { name: 'world' })
 * ```
 */
export class AnyDialogHelper {
  /**
   * 创建一个对话框
   * @param view 对话框内组件
   * @param param 对话框内组件的参数
   * @param isTop 是否在顶层窗口创建， 顶层窗口创建会脱离当前窗口，无法获取父级已创建的pinia实例
   * @returns 对话框的Promise
   */
  static #bulid<RES>(view: Component, param: Record<string, any>, isTop?: boolean): Promise<RES> {
    const parentNode = document.createElement('div')
    const domId = `any_dialog_${Math.random()}`
    parentNode.setAttribute('id', domId)
    let app: App<Element> | undefined
    // 卸载dom的方法
    function unmount() {
      if (app) {
        app.unmount()
        document.body.removeChild(parentNode)
        app = undefined
      }
    }
    return new Promise<RES>((resolve, reject) => {
      try {
        if (app) {
          return
        }
        const dialogParam = {
          onConfirm: async (p: RES) => {
            resolve(p)
          },
          onClosed: () => {
            unmount()
          },
          ...param,
        }
        /**
         * 创建App实例
         */
        const renderApp = {
          render: () => h(
            AppProvider,
            { },
            { default: () => h(view, dialogParam) },
          ),
        }

        app = createApp(renderApp, dialogParam)
          .use(directivePlugin)

        if (isTop) {
          AppInitHelper.usePermission(app).then(async () => {
            const { setIndustryId } = useIndustryStore()
            await setIndustryId(param.param.industryId)

            document.body.appendChild(parentNode)
            // 挂载组件
            app!.mount(parentNode)
          })
          return
        }

        document.body.appendChild(parentNode)
        // 挂载组件
        app!.mount(parentNode)
      }
      catch (error) {
        reject(error)
      }
    })
  }

  /**
   * 显示一个对话框
   * @param view 对话框内组件
   * @param param 对话框内组件的参数
   * @param isTop 是否在顶层窗口创建， 顶层窗口创建会脱离当前窗口，无法获取父级已创建的pinia实例
   * @returns 对话框的异步结果
   */
  static showModel<RES>(view: Component, param?: Record<string, any>, isTop?: boolean): Promise<RES> {
    return this.#bulid(view, { param: param || {} }, isTop)
  }

  /**
   * # 显示一个选择器
   * T 选择器组件的返回类型
   * @param view 选择器组件
   * @param param 选择器组件的参数
   * @returns 选择器的异步结果（数组）
   */
  static showSelector<T>(view: Component, param?: Omit<IDialogPropsSelector<T>, 'onConfirm' | 'onClosed'>): Promise<T[]> {
    return this.#bulid(view, param || {})
  }

  /**
   * # 显示一个输入提示框
   * @param param 提示框组件的参数
   * @returns 提示框的异步结果（字符串）
   */
  static showPrompt(param?: Omit<IPromptProps, 'onConfirm' | 'onClosed'>): Promise<string> {
    return this.#bulid(BasePrompt, param || {})
  }
}
