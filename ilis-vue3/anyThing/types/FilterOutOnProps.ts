export type FilterOutOnProps<T> = {
  [K in keyof T as string extends K ? never : K extends `on${string}`
    ? never
    : K]: T[K];
}
