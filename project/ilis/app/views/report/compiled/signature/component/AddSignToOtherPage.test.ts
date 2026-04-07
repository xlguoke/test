import { mount } from '@vue/test-utils'
import { message } from 'ant-design-vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SignPostionConfigEntity } from '../SignPostionConfigEntity'
import AddSignToOtherPage from './AddSignToOtherPage.vue'
import { parsePageRange, validatePageRange } from './utils/pageRangeUtils'

/**
 * # 测试parsePageRange函数 ⚙️
 * - 测试各种页码范围解析场景
 * - 验证边界条件和错误处理
 */
describe('parsePageRange', () => {
  const pageCount = 10

  it('应该正确解析单个页码', () => {
    expect(parsePageRange('3', pageCount)).toEqual([3])
    expect(parsePageRange('1', pageCount)).toEqual([1])
    expect(parsePageRange('10', pageCount)).toEqual([10])
  })

  it('应该正确解析多个页码', () => {
    expect(parsePageRange('3,5,6', pageCount)).toEqual([3, 5, 6])
    expect(parsePageRange('1,2,3', pageCount)).toEqual([1, 2, 3])
    expect(parsePageRange('8,9,10', pageCount)).toEqual([8, 9, 10])
  })

  it('应该正确解析页码范围', () => {
    expect(parsePageRange('5-7', pageCount)).toEqual([5, 6, 7])
    expect(parsePageRange('1-3', pageCount)).toEqual([1, 2, 3])
    expect(parsePageRange('8-10', pageCount)).toEqual([8, 9, 10])
  })

  it('应该正确解析从某页开始的页码范围', () => {
    expect(parsePageRange('5-', pageCount)).toEqual([5, 6, 7, 8, 9, 10])
    expect(parsePageRange('1-', pageCount)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    expect(parsePageRange('10-', pageCount)).toEqual([10])
  })

  it('应该正确解析到某页结束的页码范围', () => {
    expect(parsePageRange('-7', pageCount)).toEqual([1, 2, 3, 4, 5, 6, 7])
    expect(parsePageRange('-3', pageCount)).toEqual([1, 2, 3])
    expect(parsePageRange('-10', pageCount)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('应该处理混合格式的页码输入', () => {
    expect(parsePageRange('1,3-5,8', pageCount)).toEqual([1, 3, 4, 5, 8])
    expect(parsePageRange('2-4,6,9-10', pageCount)).toEqual([2, 3, 4, 6, 9, 10])
    expect(parsePageRange('1-2,5-,8', pageCount)).toEqual([1, 2, 5, 6, 7, 8, 9, 10])
  })

  it('应该忽略超出范围的页码', () => {
    expect(parsePageRange('0,3,11', pageCount)).toEqual([3])
    expect(parsePageRange('15-20', pageCount)).toEqual([])
    expect(parsePageRange('-15', pageCount)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('应该处理无效的页码范围', () => {
    expect(parsePageRange('5-3', pageCount)).toEqual([]) // 起始页大于结束页
    expect(parsePageRange('abc,3', pageCount)).toEqual([3])
    expect(parsePageRange('3-abc', pageCount)).toEqual([])
  })

  it('应该处理空字符串和空白字符', () => {
    expect(parsePageRange('', pageCount)).toEqual([])
    expect(parsePageRange('   ', pageCount)).toEqual([])
    expect(parsePageRange(' 3 , 5 ', pageCount)).toEqual([3, 5])
  })

  it('应该处理中英文逗号和空格分隔符', () => {
    expect(parsePageRange('3，5，6', pageCount)).toEqual([3, 5, 6])
    expect(parsePageRange('3 5 6', pageCount)).toEqual([3, 5, 6])
    expect(parsePageRange('3, 5， 6', pageCount)).toEqual([3, 5, 6])
  })

  it('应该返回排序后的页码数组', () => {
    expect(parsePageRange('5,3,1', pageCount)).toEqual([1, 3, 5])
    expect(parsePageRange('10-8', pageCount)).toEqual([]) // 无效范围
    expect(parsePageRange('8,10,9', pageCount)).toEqual([8, 9, 10])
  })

  it('应该处理边界情况', () => {
    // 最小页数
    expect(parsePageRange('1', 1)).toEqual([1])
    expect(parsePageRange('2', 1)).toEqual([])

    // 最大页数
    expect(parsePageRange('100', 100)).toEqual([100])
    expect(parsePageRange('101', 100)).toEqual([])
  })
})

/**
 * # 测试validatePageRange函数 ⚙️
 * - 测试各种页码范围验证场景
 * - 验证错误消息和边界条件
 */
describe('validatePageRange', () => {
  const pageCount = 10

  it('应该验证空字符串', () => {
    const result = validatePageRange('', pageCount)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('请输入页码范围')
  })

  it('应该验证空白字符', () => {
    const result = validatePageRange('   ', pageCount)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('请输入页码范围')
  })

  it('应该验证有效的单个页码', () => {
    expect(validatePageRange('3', pageCount)).toEqual({ isValid: true })
    expect(validatePageRange('1', pageCount)).toEqual({ isValid: true })
    expect(validatePageRange('10', pageCount)).toEqual({ isValid: true })
  })

  it('应该验证有效的多个页码', () => {
    expect(validatePageRange('3,5,6', pageCount)).toEqual({ isValid: true })
    expect(validatePageRange('1,2,3', pageCount)).toEqual({ isValid: true })
    expect(validatePageRange('8,9,10', pageCount)).toEqual({ isValid: true })
  })

  it('应该验证有效的页码范围', () => {
    expect(validatePageRange('5-7', pageCount)).toEqual({ isValid: true })
    expect(validatePageRange('1-3', pageCount)).toEqual({ isValid: true })
    expect(validatePageRange('8-10', pageCount)).toEqual({ isValid: true })
  })

  it('应该验证有效的从某页开始的页码范围', () => {
    expect(validatePageRange('5-', pageCount)).toEqual({ isValid: true })
    expect(validatePageRange('1-', pageCount)).toEqual({ isValid: true })
    expect(validatePageRange('10-', pageCount)).toEqual({ isValid: true })
  })

  it('应该验证有效的到某页结束的页码范围', () => {
    expect(validatePageRange('-7', pageCount)).toEqual({ isValid: true })
    expect(validatePageRange('-3', pageCount)).toEqual({ isValid: true })
    expect(validatePageRange('-10', pageCount)).toEqual({ isValid: true })
  })

  it('应该验证超出范围的页码', () => {
    const result1 = validatePageRange('0', pageCount)
    expect(result1.isValid).toBe(false)
    expect(result1.error).toBe('页码 0 超出范围（1-10）')

    const result2 = validatePageRange('11', pageCount)
    expect(result2.isValid).toBe(false)
    expect(result2.error).toBe('页码 11 超出范围（1-10）')

    const result3 = validatePageRange('15', pageCount)
    expect(result3.isValid).toBe(false)
    expect(result3.error).toBe('页码 15 超出范围（1-10）')
  })

  it('应该验证超出范围的页码范围', () => {
    const result1 = validatePageRange('8-12', pageCount)
    expect(result1.isValid).toBe(false)
    expect(result1.error).toBe('结束页 12 超出范围（1-10）')

    const result2 = validatePageRange('0-5', pageCount)
    expect(result2.isValid).toBe(false)
    expect(result2.error).toBe('起始页 0 超出范围（1-10）')

    const result3 = validatePageRange('15-20', pageCount)
    expect(result3.isValid).toBe(false)
    expect(result3.error).toBe('起始页 15 超出范围（1-10）')
  })

  it('应该验证无效的页码范围格式', () => {
    const result1 = validatePageRange('abc', pageCount)
    expect(result1.isValid).toBe(false)
    expect(result1.error).toBe('格式错误："abc"，请使用数字、范围（如5-7）或起始页（如5-）')

    const result2 = validatePageRange('3-abc', pageCount)
    expect(result2.isValid).toBe(false)
    expect(result2.error).toBe('格式错误："3-abc"，请使用数字、范围（如5-7）或起始页（如5-）')

    const result3 = validatePageRange('1.5', pageCount)
    expect(result3.isValid).toBe(false)
    expect(result3.error).toContain('格式错误')
  })

  it('应该验证起始页大于结束页的情况', () => {
    const result = validatePageRange('7-5', pageCount)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('起始页 7 不能大于结束页 5')
  })

  it('应该处理混合格式的验证', () => {
    expect(validatePageRange('1,3-5,8', pageCount)).toEqual({ isValid: true })
    expect(validatePageRange('2-4,6,9-10', pageCount)).toEqual({ isValid: true })
  })

  it('应该验证部分无效的混合格式', () => {
    const result = validatePageRange('1,15,3-5', pageCount)
    expect(result.isValid).toBe(false)
    expect(result.error).toBe('页码 15 超出范围（1-10）')
  })

  it('应该处理中英文逗号和空格分隔符', () => {
    expect(validatePageRange('3，5，6', pageCount)).toEqual({ isValid: true })
    expect(validatePageRange('3 5 6', pageCount)).toEqual({ isValid: true })
    expect(validatePageRange('3, 5， 6', pageCount)).toEqual({ isValid: true })
  })

  it('应该处理边界页数', () => {
    // 最小页数
    expect(validatePageRange('1', 1)).toEqual({ isValid: true })
    expect(validatePageRange('2', 1)).toEqual({
      isValid: false,
      error: '页码 2 超出范围（1-1）',
    })

    // 最大页数
    expect(validatePageRange('100', 100)).toEqual({ isValid: true })
    expect(validatePageRange('101', 100)).toEqual({
      isValid: false,
      error: '页码 101 超出范围（1-100）',
    })
  })

  it('应该验证复杂的无效格式', () => {
    const result1 = validatePageRange('1-2-3', pageCount)
    expect(result1.isValid).toBe(false)
    expect(result1.error).toContain('格式错误')

    const result2 = validatePageRange('1--3', pageCount)
    expect(result2.isValid).toBe(false)
    expect(result2.error).toContain('格式错误')
  })
})

/**
 * # 组件级别测试 ⚙️
 * - 测试onOk函数的完整逻辑
 * - 验证onConfirm回调的正确性
 * - 测试异常情况处理
 */
describe('addSignToOtherPage 组件', () => {
  let wrapper: any
  const mockOnConfirm = vi.fn()
  const mockParam = {
    pageCount: 10,
    currentPage: 1,
    signItems: SignPostionConfigEntity.fromJsonArray([
      { id: '1', tag: '负责人', userName: '用户1', signX: 100, signY: 200, signWidth: 50, signHeight: 30 },
      { id: '2', tag: '审核人', userName: '用户2', signX: 150, signY: 250, signWidth: 50, signHeight: 30 },
    ]),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    wrapper = mount(AddSignToOtherPage, {
      props: {
        param: mockParam,
        onConfirm: mockOnConfirm,
        onClosed: () => {}, // 实际用于处理组件卸载，此处不需要模拟
      },
    })
  })

  it('应该正确初始化组件状态', () => {
    expect(wrapper.vm.showDialog).toBe(true)
    expect(wrapper.vm.usedType).toBe('ALL')
    expect(wrapper.vm.pageRange).toBe('')
    expect(wrapper.vm.state.checkedList).toEqual([])
  })

  it('应该处理没有选择签字项的情况', async () => {
    const messageSpy = vi.spyOn(message, 'warning')

    await wrapper.vm.onOk()

    expect(messageSpy).toHaveBeenCalledWith('请选择要应用的签字项')
    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  it('应该处理应用到所有页面的情况', async () => {
    wrapper.vm.state.checkedList = ['1', '2']

    await wrapper.vm.onOk()

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    const result = mockOnConfirm.mock.calls[0][0]

    // 验证结果数量：9页（排除当前页） * 2个签字项 = 18个
    expect(result).toHaveLength(18)

    // 验证每个结果都是SignPostionConfigEntity实例
    result.forEach((item: any) => {
      expect(item).toBeInstanceOf(SignPostionConfigEntity)
      expect(item.pageNo).toBeGreaterThanOrEqual(2)
      expect(item.pageNo).toBeLessThanOrEqual(10)
    })

    // 验证对话框关闭
    expect(wrapper.vm.showDialog).toBe(false)
  })

  it('应该验证应用到所有页面时过滤当前页', async () => {
    wrapper.vm.state.checkedList = ['1']

    await wrapper.vm.onOk()

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    const result = mockOnConfirm.mock.calls[0][0]

    // 验证结果数量：9页（排除当前页） * 1个签字项 = 9个
    expect(result).toHaveLength(9)

    // 验证页码范围（排除当前页1）
    const pageNos = [...new Set(result.map((item: any) => item.pageNo))]
    expect(pageNos).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10])

    // 验证不包含当前页
    expect(pageNos).not.toContain(1)
  })

  it('应该处理应用到指定范围的情况', async () => {
    wrapper.vm.state.checkedList = ['1', '2']
    wrapper.vm.usedType = 'RANGE'
    wrapper.vm.pageRange = '3-5'

    await wrapper.vm.onOk()

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    const result = mockOnConfirm.mock.calls[0][0]

    // 验证结果数量：3页 * 2个签字项 = 6个
    expect(result).toHaveLength(6)

    // 验证页码范围
    const pageNos = [...new Set(result.map((item: any) => item.pageNo))]
    expect(pageNos).toEqual([3, 4, 5])

    // 验证每个结果都是SignPostionConfigEntity实例
    result.forEach((item: any) => {
      expect(item).toBeInstanceOf(SignPostionConfigEntity)
    })
  })

  it('应该处理无效的范围输入', async () => {
    wrapper.vm.state.checkedList = ['1', '2']
    wrapper.vm.usedType = 'RANGE'
    wrapper.vm.pageRange = '15-20' // 超出范围

    const messageSpy = vi.spyOn(message, 'error')

    await wrapper.vm.onOk()

    expect(messageSpy).toHaveBeenCalledWith('起始页 15 超出范围（1-10）')
    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  it('应该处理小于有效范围的解析结果', async () => {
    wrapper.vm.state.checkedList = ['1', '2']
    wrapper.vm.usedType = 'RANGE'
    wrapper.vm.pageRange = '0' // 页码0，格式正确但超出范围，解析后为空

    const messageSpy = vi.spyOn(message, 'error')

    await wrapper.vm.onOk()

    expect(messageSpy).toHaveBeenCalledWith('页码 0 超出范围（1-10）')
    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  it('应该处理大于有效范围的解析结果', async () => {
    wrapper.vm.state.checkedList = ['1', '2']
    wrapper.vm.usedType = 'RANGE'
    wrapper.vm.pageRange = '11' // 页码11超出总页数10，解析后为空

    const messageSpy = vi.spyOn(message, 'error')

    await wrapper.vm.onOk()

    expect(messageSpy).toHaveBeenCalledWith('页码 11 超出范围（1-10）')
    expect(mockOnConfirm).not.toHaveBeenCalled()
  })

  it('应该正确处理复杂的页码范围', async () => {
    wrapper.vm.state.checkedList = ['1']
    wrapper.vm.usedType = 'RANGE'
    wrapper.vm.pageRange = '2,4-6,8'

    await wrapper.vm.onOk()

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    const result = mockOnConfirm.mock.calls[0][0]

    // 验证结果数量：2,4,5,6,8 共5页 * 1个签字项 = 5个
    expect(result).toHaveLength(5)

    // 验证页码
    const pageNos = [...new Set(result.map((item: any) => item.pageNo))]
    expect(pageNos).toEqual([2, 4, 5, 6, 8])
  })

  it('应该处理边界页数情况', async () => {
    wrapper.vm.state.checkedList = ['1']
    wrapper.vm.usedType = 'RANGE'
    wrapper.vm.pageRange = '1-10'

    await wrapper.vm.onOk()

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    const result = mockOnConfirm.mock.calls[0][0]

    // 验证结果数量：10页（不排除当前页） * 1个签字项 = 10个
    expect(result).toHaveLength(10)

    // 验证页码范围（不排除当前页1）
    const pageNos = [...new Set(result.map((item: any) => item.pageNo))]
    expect(pageNos).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })

  it('应该处理中英文分隔符', async () => {
    wrapper.vm.state.checkedList = ['1']
    wrapper.vm.usedType = 'RANGE'
    wrapper.vm.pageRange = '2，4-6，8'

    await wrapper.vm.onOk()

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    const result = mockOnConfirm.mock.calls[0][0]

    // 验证结果数量
    expect(result).toHaveLength(5)

    // 验证页码
    const pageNos = [...new Set(result.map((item: any) => item.pageNo))]
    expect(pageNos).toEqual([2, 4, 5, 6, 8])
  })

  it('应该处理从某页开始的范围', async () => {
    wrapper.vm.state.checkedList = ['1']
    wrapper.vm.usedType = 'RANGE'
    wrapper.vm.pageRange = '5-'

    await wrapper.vm.onOk()

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    const result = mockOnConfirm.mock.calls[0][0]

    // 验证结果数量：从第5页到第10页（排除当前页1）
    expect(result).toHaveLength(6)

    // 验证页码范围
    const pageNos = [...new Set(result.map((item: any) => item.pageNo))]
    expect(pageNos).toEqual([5, 6, 7, 8, 9, 10])
  })

  it('应该处理到某页结束的范围', async () => {
    wrapper.vm.state.checkedList = ['1']
    wrapper.vm.usedType = 'RANGE'
    wrapper.vm.pageRange = '-5'

    await wrapper.vm.onOk()

    expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    const result = mockOnConfirm.mock.calls[0][0]

    // 验证结果数量：从第1页到第5页（不排除当前页1）
    expect(result).toHaveLength(5)

    // 验证页码范围
    const pageNos = [...new Set(result.map((item: any) => item.pageNo))]
    expect(pageNos).toEqual([1, 2, 3, 4, 5])
  })
})
