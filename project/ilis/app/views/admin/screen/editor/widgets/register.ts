import type { IWidget } from '~/interface/IWidget'

export const register = Object.entries(import.meta.glob('./*/index.ts', {
  eager: true,
})).map(([path, module]) => {
  // 提取文件夹名称
  const folderName = path.match(/\.\/(.+)\/index\.ts/)?.[1] || ''

  return markRaw({
    name: folderName,
    ...(module as any).default,
  }) as IWidget
})
