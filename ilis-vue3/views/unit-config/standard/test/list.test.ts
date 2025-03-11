import { nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { setupServer } from 'msw/node'
import { HttpResponse, http } from 'msw'
import ListSearch from '../components/ListSearch.vue'
import List from '../components/List.vue'
import { BOOLEAN_OPT, SOURCE_TYPE } from '..'

const handler = [
  http.get(`/ilis2/baseStandardManageController.do?datagrid`, () => {
    return HttpResponse.json({
      rows: [{
        id: '1',
        standardName: '11',
        publishCode: '1',
        sourceType: SOURCE_TYPE.USER,
        whetherThisUnit: BOOLEAN_OPT.FALSE,
        isUploadFile: BOOLEAN_OPT.FALSE,
        executeDate: '2024-01-01',
        expireDate: '2024-01-01',
        fileId: '1',
        fileName: '11',
      }],
      total: 1,
    })
  }),
]

const server = setupServer(...handler)

setActivePinia(createPinia())

function $getDomById(name: string) {
  return document.querySelector(`#form_item_${name}`) as Element
}

describe('standard list', () => {
  beforeAll(() => {
    server.listen()
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
    globalThis.window.getComputedStyle = vi.fn().mockImplementation(() => ({
      width: '100px',
      height: '100px',
    }))
  })

  it('test search', async () => {
    const wrapper = mount(ListSearch)
    const vm = wrapper.vm as any
    const $quickQuery = wrapper.get('[data-test="quickQuery"]')

    expect($quickQuery.attributes('placeholder')).toBe('输入规程名称/颁布号后回车即可查询')
    $quickQuery.setValue('测试规程')

    vm.handleSearch()
    const form = wrapper.emitted('search')
    expect(form).toBeTruthy()
    expect(form?.[0][0]).toEqual({
      standardTypeId: '',
      quickQryParam: '测试规程',
    })

    // 重置
    wrapper.get('[data-test="resetBtn"]').trigger('click')
    await nextTick()
    const form2 = wrapper.emitted('reset')
    expect(form2?.[0][0]).toEqual({
      quickQryParam: '',
      standardTypeId: '',
    })
  })

  it('test advanced search', async () => {
    const wrapper = mount(ListSearch)
    const vm = wrapper.vm as any
    wrapper.get('[data-test="advancedSearch"]').trigger('click')
    expect(vm.visible).toBe(true)
    await nextTick()
    const modalDom = document.querySelector('[placeholder="请输入规程名称"]')
    expect(modalDom).toBeTruthy()
    vm.form2.standardName = '1'
    vm.form2.publishCode = '2'
    ;($getDomById('sourceType').children[1] as any).click()
    ;($getDomById('whetherThisUnit').children[1] as any).click()
    ;($getDomById('isUploadFile').children[1] as any).click()
    ;(document.querySelector('[data-test="searchBtn2"]') as any).click()
    // 搜索
    const form = wrapper.emitted('search')
    expect(form).toBeTruthy()
    expect(form?.[0][0]).toEqual({
      standardTypeId: '',
      standardName: '1',
      publishCode: '2',
      sourceType: SOURCE_TYPE.USER,
      whetherThisUnit: BOOLEAN_OPT.FALSE,
      isUploadFile: BOOLEAN_OPT.FALSE,
    })
    // 重置
    ;(document.querySelector('[data-test="resetBtn2"]') as any).click()
    await nextTick()
    expect(vm.visible).toBe(false)
    const form2 = wrapper.emitted('reset')
    expect(form2).toBeTruthy()
    expect(form2?.[0][0]).toEqual({
      standardTypeId: '',
      standardName: undefined,
      publishCode: undefined,
      sourceType: SOURCE_TYPE.ALL,
      whetherThisUnit: BOOLEAN_OPT.ALL,
      isUploadFile: BOOLEAN_OPT.ALL,
    })
  })

  // 数据列表
  it('standard list', async () => {
    const wrapper = mount(List, {
      global: {
        provide: {
          parentRefreshTypes: vi.fn(),
        },
      },
    })
    const vm = wrapper.vm as any
    await flushPromises()
    expect(vm.dataSource.length).toBe(1)
    const item = vm.dataSource[0]
    expect(item).toEqual({
      id: '1',
      standardName: '11',
      publishCode: '1',
      sourceType: SOURCE_TYPE.USER,
      whetherThisUnit: BOOLEAN_OPT.FALSE,
      isUploadFile: BOOLEAN_OPT.FALSE,
      executeDate: '2024-01-01',
      expireDate: '2024-01-01',
      fileId: '1',
      fileName: '11',
    })
  })
})
