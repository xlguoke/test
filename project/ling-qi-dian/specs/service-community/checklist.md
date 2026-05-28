# service-community Checklist v5.0

---

## API 功能验收

- [ ] `POST /community-post-create`
  - [ ] content 为空或仅空白字符时返回 10001
  - [ ] images 超过 9 张返回 10001
  - [ ] 正常创建返回 post_id 和 create_time
- [ ] `POST /community-post-list`
  - [ ] type=all 返回全部正常帖子，is_top 置顶优先
  - [ ] type=mine 仅返回当前用户帖子
  - [ ] type=liked 仅返回当前用户点赞过的帖子
  - [ ] 每条返回 is_liked 布尔值
  - [ ] 分页参数 page/pageSize 生效
- [ ] `POST /community-post-detail`
  - [ ] 返回完整 route_info（含 duration, path）
  - [ ] 已删除帖子返回 10004
- [ ] `POST /community-post-like`
  - [ ] like 后 is_liked=true, likes+1
  - [ ] unlike 后 is_liked=false, likes-1
  - [ ] 重复 like 不报错、不重复计数
  - [ ] 并发场景下计数准确
- [ ] `POST /community-comment-create`
  - [ ] content 为空返回 10001
  - [ ] reply_to 为空时创建一级评论
  - [ ] reply_to 有值时创建二级回复
  - [ ] 创建后帖子 comments_count +1
- [ ] `POST /community-comment-list`
  - [ ] 返回一级评论列表
  - [ ] 每条一级评论含最近 3 条二级回复
  - [ ] 分页生效
- [ ] `POST /community-post-delete`
  - [ ] 作者本人可删除
  - [ ] 管理员可删除
  - [ ] 非作者/非管理员返回 10003
  - [ ] 删除后帖子 status=-1

## 性能与安全

- [ ] 所有接口校验 Authorization Token
- [ ] 未携带 Token 返回 10002
- [ ] 列表查询响应时间 < 200ms（1000条数据）
- [ ] 点赞原子操作无竞态条件
