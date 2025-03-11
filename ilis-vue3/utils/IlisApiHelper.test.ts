import { beforeEach, describe, expect, it, vi } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import { IlisApiHelper } from './IlisApiHelper'
import { ILISHTTPError } from '~/types'

// 创建 axios 实例的 mock
const mock = new MockAdapter(ilisAxios)

describe('ilisApiHelper', () => {
  beforeEach(() => {
    // 在每个测试之前重置 mock
    mock.reset()
  })

  it('should handle GET request successfully', async () => {
    const url = '/test-get'
    const params = { key: 'value' }
    const response = { data: 'success' }

    mock.onGet(url, { params }).reply(200, response)

    const result = await IlisApiHelper.get<{ data: string }>(url, params)
    expect(result.data).toEqual(response)
  })

  it('should handle POST request successfully', async () => {
    const url = '/test-post'
    const params = { key: 'value' }
    const response = { data: 'success' }

    mock.onPost(url, params).reply(200, response)

    const result = await IlisApiHelper.post<{ data: string }>(url, params)
    expect(result.data).toEqual(response)
  })

  it('should handle PUT request successfully', async () => {
    const url = '/test-put'
    const params = { key: 'value' }
    const response = { data: 'success' }

    mock.onPut(url, params).reply(200, response)

    const result = await IlisApiHelper.put<{ data: string }>(url, params)
    expect(result.data).toEqual(response)
  })

  it('should handle DELETE request successfully', async () => {
    const url = '/test-delete'
    const params = { key: 'value' }
    const response = { data: 'success' }

    mock.onDelete(url, params).reply(200, response)

    const result = await IlisApiHelper.delete<{ data: string }>(url, params)
    expect(result.data).toEqual(response)
  })

  it('should handle API error', async () => {
    const url = '/test-error'
    const params = { key: 'value' }
    const errorMessage = 'API Error'

    mock.onGet(url, { params }).reply(200, { code: 20010, message: errorMessage })

    const modalErrorSpy = vi.spyOn(IlisApiHelper, 'handleApiError')

    try {
      await IlisApiHelper.get<{ data: string }>(url, params)
    }
    catch (error) {
      expect(error).toBeInstanceOf(ILISHTTPError)
      expect(modalErrorSpy).toHaveBeenCalledWith(errorMessage)
    }
  })
})
