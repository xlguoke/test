/**
 * wrapper for axios
 * @example
 *
 * // typing a request
 * const schema = z.object({
 *  name: z.string(),
 *  username: z.string(),
 * })
 * // user will automatically infer as z.infer<typeof schema>
 * const user = request('/api/user', { schema })
 */
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { useCredentialStore } from '@/stores/credentials'
import { useServerStore } from '@/stores/servers'
import { ILisRestResponseError } from '@/type/errors'

export interface FetchOptions<T, D = any> extends AxiosRequestConfig<D> {
  /**
   * Will use credential store for api authentication
   */
  useCredentials?: boolean
  /**
   * Will use server store for determining which ilis server to use
   */
  useServer?: boolean
  /**
   * Use a validation schema to validate the response, which then returns the parsed data with the types inferred
   */
  schema?: {
    parse: (data: unknown) => T
  }
}

function IlisRestResponseTransformer(data: any) {
  if (data.code === 20000)
    return data.data
  else if (data.code > 20000)
    throw new ILisRestResponseError(data.message, data.code)
  return data
}

export function request<T, D = any>(url: string, options?: FetchOptions<T, D>, instance?: AxiosInstance): Promise<T>
export function request<T, D = any>(options: FetchOptions<T, D>, instance?: AxiosInstance): Promise<T>

/**
 * make a request
 * @param args
 * @throws AxiosError
 * @throws ZodError
 * @example
 *
 * // typing a request
 * const schema = z.object({
 *  name: z.string(),
 *  username: z.string(),
 * })
 * // user will automatically infer as z.infer<typeof schema>
 * const user = request('/api/user', { schema })
 */
export async function request<T, D = any>(...args: any[]) {
  const url: string | undefined = typeof args[0] === 'string' ? args[0] : undefined
  const argsPlaceholder = typeof url === 'string' ? 1 : 0
  const isAxiosInstance = (val: any) => !!val?.request
  const credentialStore = useCredentialStore()
  const defaultOptions: FetchOptions<T, D> = {
    useCredentials: true,
    useServer: true,
    maxRedirects: 0,
    transformResponse: [...shallowCopyAxiosDefaultResponseTransformer(), IlisRestResponseTransformer],
  }
  const options: FetchOptions<D> = { ...defaultOptions, ...args[argsPlaceholder] }
  let instance = axios
  if (isAxiosInstance(args[args.length - 1]))
    instance = args[args.length - 1]
  if (options.useCredentials) {
    options.headers = {
      ...options.headers,
      'Unit-Code': credentialStore.code,
      'Authorization': credentialStore.token,
    }
  }
  if (options.useServer) {
    const serverStore = useServerStore()
    const server = await serverStore.getServer(credentialStore.code)
    options.baseURL = server.addr
  }
  const res = await instance<T, AxiosResponse<T>, D>(url || (options.url!), options)
  return options.schema ? options.schema.parse(res.data) : res.data
}

function shallowCopyAxiosDefaultResponseTransformer() {
  if (Array.isArray(axios.defaults.transformResponse))
    return [...axios.defaults.transformResponse]
  if (typeof axios.defaults.transformResponse === 'function')
    return [axios.defaults.transformResponse]
  return []
}
