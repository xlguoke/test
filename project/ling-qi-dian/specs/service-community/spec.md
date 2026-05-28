# service-community Spec v5.0

> 社区模块后端云函数规格
> 版本: v5.0 | 日期: 2026-05-23

---

## 1. 目标

提供社区动态广场所需的全部后端接口，覆盖帖子 CRUD、点赞、评论。

---

## 2. 依赖

- 数据库集合：`community_posts`、`community_comments`、`community_likes`、`members`
- 接口契约：`api-contracts.md` v2.0 #19~#25
- Schema 定义：`db-schema.md` v2.0

---

## 3. 接口清单

### 3.1 community-post-create

- **功能**：创建帖子
- **请求**：`content`, `images`(最多9张), `route_info`
- **校验**：
  - `content` 必填，去除首尾空白后长度 > 0
  - `images` 为数组，长度 0~9，元素为字符串 URL
  - `route_info` 可选，含 `start`, `end`, `distance`(km), `duration`(分钟)
- **逻辑**：
  - 从 Token 解析 `author_id`
  - 插入 `community_posts`，初始 `likes=0`, `comments_count=0`, `status=1`
- **响应**：`{ post_id, create_time }`

### 3.2 community-post-list

- **功能**：帖子列表，瀑布流分页
- **请求**：`type`=(all|mine|liked), `page`, `pageSize`
- **校验**：`type` 枚举校验，默认 `all`
- **逻辑**：
  - `all`：查询 `status=1`，按 `is_top` 降序 + `create_time` 降序
  - `mine`：查询 `author_id=当前用户` 且 `status!=-1`
  - `liked`：联表 `community_likes` 查询当前用户点赞过的帖子
  - 返回每条帖子的 `is_liked` 状态（当前用户是否点赞）
- **分页**：标准分页格式 `{ list, total, page, pageSize }`
- **响应字段**：`post_id`, `author`({uid,nickname,avatar}), `content`, `images`, `route_info`({start,end,distance}), `likes`, `comments_count`, `is_liked`, `create_time`

### 3.3 community-post-detail

- **功能**：帖子详情
- **请求**：`post_id`
- **校验**：帖子存在且 `status!=-1`
- **逻辑**：
  - 查询帖子基本信息
  - 查询当前用户是否点赞（`is_liked`）
- **响应**：完整帖子字段，含 `route_info` 全量（含 `duration`, `path`）

### 3.4 community-post-like

- **功能**：点赞 / 取消点赞
- **请求**：`post_id`, `action`=(like|unlike)
- **校验**：帖子存在且 `status=1`
- **逻辑（原子操作）**：
  - `like`：插入 `community_likes`，若已存在则忽略；`community_posts.likes` +1
  - `unlike`：删除 `community_likes`；`community_posts.likes` -1（不低于0）
  - 使用 MongoDB 事务或原子更新保证一致性
- **响应**：`{ post_id, is_liked, likes }`

### 3.5 community-comment-create

- **功能**：发表评论
- **请求**：`post_id`, `content`, `reply_to`(可选，被回复用户ID)
- **校验**：
  - `content` 必填且去除空白后长度 > 0
  - `post_id` 对应帖子存在且 `status=1`
- **逻辑**：
  - 插入 `community_comments`
  - `community_posts.comments_count` +1
- **响应**：`{ comment_id, create_time }`

### 3.6 community-comment-list

- **功能**：评论列表
- **请求**：`post_id`, `page`, `pageSize`
- **逻辑**：
  - 查询 `post_id` 对应的一级评论（`reply_to=""` 或不存在）
  - 每条一级评论附带最近 3 条二级回复（`reply_to=该评论author_id` 或按 `reply_to` 关联）
  - 按 `create_time` 升序排列
- **响应**：`{ list:[{comment_id,author,content,reply_to,replies:[...],create_time}], total, page, pageSize }`

### 3.7 community-post-delete

- **功能**：删除帖子
- **请求**：`post_id`
- **校验**：
  - 帖子存在
  - 当前用户为作者 **或** 当前用户为管理员（`role=super/admin`）
- **逻辑**：
  - 软删除：`community_posts.status` 设为 `-1`
  - 同步隐藏该帖子下所有评论 `status=0`（可选，视产品策略）
- **响应**：`{ post_id }`

---

## 4. 数据模型

沿用 `db-schema.md` v2.0 中 `community_posts`、`community_comments`、`community_likes` 定义，无变更。

---

## 5. 安全与性能

- 所有接口需校验 `Authorization: Bearer <token>`
- 点赞操作需防并发，使用 `findOneAndUpdate` 或事务
- 列表查询需命中索引（`create_time` 倒序、`author_id` 等）
- 图片 URL 由前端上传至云存储后传入，后端仅做长度校验

---

## 6. Done Contract

- [ ] 7 个云函数全部实现并通过本地单元测试
- [ ] 接口契约与 `api-contracts.md` v2.0 完全一致
- [ ] 点赞原子操作通过并发测试验证
- [ ] 删除权限（作者/管理员）通过边界测试
