/**
 * 树对象中插入树节点
 */
export function insertTreeNode(treeData, id, nodes, _idField) {
  const idField = _idField || 'id'

  if (!treeData)
    return

  for (let i = 0; i < treeData.length; i++) {
    const treeNode = treeData[i]
    if (treeNode[idField] === id) {
      treeNode.children = nodes
      return
    }
    else {
      if (treeNode.children && treeNode.children.length > 0) {
        insertTreeNode(treeNode.children, id, nodes, idField)
      }
    }
  }
}
