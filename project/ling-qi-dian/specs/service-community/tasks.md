# service-community Tasks v5.0

---

## Phase 1: 基础设施

- [ ] 1.1 确认云函数目录结构（`cloudfunctions/community-post-create/` 等）
- [ ] 1.2 抽取公共模块：Token 解析、统一响应格式、错误码枚举
- [ ] 1.3 配置数据库连接与集合索引检查

## Phase 2: 帖子相关接口

- [ ] 2.1 实现 `community-post-create`
  - 参数校验（content、images 上限9、route_info 结构）
  - 写入 community_posts
- [ ] 2.2 实现 `community-post-list`
  - 支持 type=all/mine/liked
  - 瀑布流分页（is_top 优先 + create_time 倒序）
  - 联表查询 is_liked
- [ ] 2.3 实现 `community-post-detail`
  - 查询帖子 + 当前用户点赞状态
- [ ] 2.4 实现 `community-post-delete`
  - 权限校验（作者或管理员）
  - 软删除 status=-1

## Phase 3: 点赞与评论接口

- [ ] 3.1 实现 `community-post-like`
  - like/unlike 原子操作
  - 事务或 findOneAndUpdate 保证 likes 计数准确
- [ ] 3.2 实现 `community-comment-create`
  - 支持 reply_to
  - comments_count +1
- [ ] 3.3 实现 `community-comment-list`
  - 一级评论 + 二级回复嵌套
  - 分页

## Phase 4: 测试与验收

- [ ] 4.1 编写接口单元测试（正常流 + 异常流）
- [ ] 4.2 并发测试：同时点赞/取消点赞 10 次，验证 likes 计数正确
- [ ] 4.3 权限测试：非作者/非管理员调用删除，返回 10003
- [ ] 4.4 联调准备：输出接口 host 与测试数据

---

## 优先级

P0: 2.1, 2.2, 2.3, 3.1, 3.2, 3.3（核心功能）
P1: 2.4（管理功能）
P2: 4.x（测试）
