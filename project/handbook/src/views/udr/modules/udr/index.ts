export enum HandwriteType {
  '文本' = '1',
  '笔迹' = '2',
  '文本+笔迹' = '3',
}

export const HandwriteMap = {
  [HandwriteType['文本']]: '文本',
  [HandwriteType['笔迹']]: '笔迹',
  [HandwriteType['文本+笔迹']]: '文本+笔迹',
}
