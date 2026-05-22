/**
 * 共享类型定义
 * 包含业务实体类型、API 类型、通用类型
 */

// ==================== 通用类型 ====================

/** API 响应基础结构 */
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

/** 分页响应结构 */
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

/** API 错误 */
export interface ApiError {
  code: number
  message: string
}

// ==================== 会员相关类型 ====================

/** 会员等级 */
export interface MemberLevel {
  level: number
  level_name: string
  recharge_threshold: number
  drink_discount: number
  labor_discount: number
  parts_discount: number
  points_multiplier: number
  car_wash_count: number
  maintenance_discount: number
  rescue_km: number
  spare_car_days: number
  has_exclusive_service: boolean
  birthday_coupon_count: number
}

/** 会员信息 */
export interface MemberInfo {
  uid: string
  nickname: string
  avatar: string
  mobile: string
  level: number
  level_name: string
  next_level_name?: string
  next_level_amount?: number
  total_recharge: number
  points: number
  total_points_earned: number
  total_points_used: number
  total_points_expired: number
  balance: number
  total_consume: number
  last_check_in_date?: string
  continuous_check_in_days: number
  create_time: string
  update_time: string
}

/** 会员权益 */
export interface MemberBenefits {
  current: MemberLevel
  all_levels: MemberLevel[]
}

/** 积分流水 */
export interface PointLog {
  _id: string
  member_id: string
  change: number
  after_points: number
  reason: string
  reason_code: PointReasonCode
  order_id?: string
  expire_time?: string
  create_time: string
}

/** 积分变动原因代码 */
export type PointReasonCode =
  | 'recharge'
  | 'consume'
  | 'check_in'
  | 'share'
  | 'task'
  | 'exchange'
  | 'lottery'
  | 'expire'
  | 'deduct'
  | 'manual_adjust'

/** 充值档位 */
export interface RechargeTier {
  tier_id: number
  amount: number
  bonus_balance: number
  bonus_points: number
  reach_level: number | null
  level_name: string
}

/** 充值记录 */
export interface RechargeLog {
  _id: string
  member_id: string
  recharge_amount: number
  bonus_balance: number
  bonus_points: number
  total_amount: number
  tier_id: number
  order_no: string
  pay_status: number
  pay_time?: string
  create_time: string
}

// ==================== 商品相关类型 ====================

/** SKU 规格 */
export interface SkuSpec {
  [key: string]: string
}

/** SKU */
export interface Sku {
  sku_id: string
  name: string
  price: number
  stock: number
  specs: SkuSpec
}

/** 商品 */
export interface Goods {
  _id: string
  name: string
  category: string
  description: string
  images: string[]
  status: number
  sort_order: number
  sku_list: Sku[]
  create_time: string
  update_time: string
}

/** 商品列表项（简化） */
export interface GoodsItem {
  id: string
  name: string
  category: string
  image: string
  price: number
  status: number
}

/** 商品详情 */
export interface GoodsDetail extends Goods {
  id: string
}

// ==================== 订单相关类型 ====================

/** 订单商品项 */
export interface OrderGoodsItem {
  goods_id: string
  goods_name: string
  sku_id: string
  sku_name: string
  price: number
  quantity: number
  subtotal: number
}

/** 订单状态 */
export type OrderStatus = 'pending' | 'paid' | 'making' | 'completed' | 'cancelled' | 'refunded'

/** 订单 */
export interface Order {
  _id: string
  order_no: string
  member_id: string
  table_no: string
  source: 'customer' | 'cashier'
  cashier_id?: string
  goods: OrderGoodsItem[]
  original_amount: number
  discount_amount: number
  point_deduct: number
  pay_amount: number
  pay_way: 'wechat' | 'balance' | 'cash'
  pay_status: number
  pay_time?: string
  order_status: OrderStatus
  remark: string
  create_time: string
  update_time: string
}

/** 订单列表项（简化） */
export interface OrderItem {
  order_no: string
  goods: OrderGoodsItem[]
  pay_amount: number
  order_status: OrderStatus
  create_time: string
}

// ==================== 购物车相关类型 ====================

/** 购物车商品项 */
export interface CartItem {
  goods_id: string
  goods_name: string
  sku_id: string
  sku_name: string
  price: number
  quantity: number
  image: string
}

// ==================== 社区相关类型 ====================

/** 路线信息 */
export interface RouteInfo {
  start: string
  end: string
  distance: number
  duration: number
  path?: number[][]
}

/** 社区帖子作者 */
export interface PostAuthor {
  uid: string
  nickname: string
  avatar: string
}

/** 社区帖子 */
export interface CommunityPost {
  _id: string
  post_id: string
  author: PostAuthor
  content: string
  images: string[]
  route_info?: RouteInfo
  likes: number
  comments_count: number
  is_liked: boolean
  status: number
  is_top: boolean
  create_time: string
  update_time: string
}

/** 社区评论 */
export interface CommunityComment {
  _id: string
  comment_id: string
  post_id: string
  author: PostAuthor
  content: string
  reply_to?: string
  status: number
  create_time: string
}

// ==================== 后台管理相关类型 ====================

/** 后台管理员 */
export interface AdminUser {
  _id: string
  username: string
  nickname: string
  role: 'super' | 'admin' | 'staff'
  status: number
  last_login_time?: string
  create_time: string
}

/** 后台商品列表项 */
export interface AdminGoodsItem {
  id: string
  name: string
  category: string
  price_range: string
  stock: number
  status: number
  create_time: string
}

/** 后台订单列表项 */
export interface AdminOrderItem {
  order_no: string
  member_nickname: string
  goods_summary: string
  pay_amount: number
  pay_way: string
  order_status: OrderStatus
  create_time: string
}

/** 后台会员列表项 */
export interface AdminMemberItem {
  uid: string
  nickname: string
  level: number
  level_name: string
  points: number
  balance: number
  total_consume: number
  create_time: string
}

/** 后台帖子列表项 */
export interface AdminPostItem {
  post_id: string
  author_nickname: string
  content_preview: string
  likes: number
  comments_count: number
  status: number
  create_time: string
}

// ==================== API 请求/响应类型 ====================

// 认证模块
export interface WxAuthRequest {
  code: string
}

export interface WxAuthResponse {
  token: string
  expire: number
  userInfo: {
    uid: string
    nickname: string
    avatar: string
    level: number
    level_name: string
  }
}

export interface AdminLoginRequest {
  username: string
  password: string
}

export interface AdminLoginResponse {
  token: string
  expire: number
  userInfo: {
    id: string
    username: string
    nickname: string
    role: string
  }
}

// 商品模块
export interface GoodsListRequest {
  category?: string
  page?: number
  pageSize?: number
}

export type GoodsListResponse = PaginatedResponse<GoodsItem>

export interface GoodsDetailRequest {
  goods_id: string
}

export type GoodsDetailResponse = GoodsDetail

// 订单模块
export interface OrderCreateRequest {
  table_no?: string
  goods: {
    goods_id: string
    sku_id: string
    quantity: number
  }[]
  remark?: string
  use_points?: number
}

export interface OrderCreateResponse {
  order_no: string
  pay_amount: number
  pay_params: {
    appId: string
    timeStamp: string
    nonceStr: string
    package: string
    signType: string
    paySign: string
  }
}

export interface OrderListRequest {
  status?: string
  page?: number
  pageSize?: number
}

export type OrderListResponse = PaginatedResponse<OrderItem>

export interface OrderDetailRequest {
  order_no: string
}

export type OrderDetailResponse = Order

// 会员模块
export type MemberInfoResponse = MemberInfo

export type MemberBenefitsResponse = MemberBenefits

export interface MemberPointLogsRequest {
  reason_code?: string
  page?: number
  pageSize?: number
}

export type MemberPointLogsResponse = PaginatedResponse<PointLog>

export interface MemberRechargeRequest {
  tier_id: number
}

export interface MemberRechargeResponse {
  order_no: string
  amount: number
  pay_params: {
    appId: string
    timeStamp: string
    nonceStr: string
    package: string
    signType: string
    paySign: string
  }
}

export interface MemberRechargeLogsRequest {
  page?: number
  pageSize?: number
}

export type MemberRechargeLogsResponse = PaginatedResponse<RechargeLog>

// 社区模块
export interface CommunityPostCreateRequest {
  content: string
  images?: string[]
  route_info?: RouteInfo
}

export interface CommunityPostCreateResponse {
  post_id: string
  create_time: string
}

export interface CommunityPostListRequest {
  type?: 'all' | 'mine'
  page?: number
  pageSize?: number
}

export type CommunityPostListResponse = PaginatedResponse<CommunityPost>

export interface CommunityPostDetailRequest {
  post_id: string
}

export type CommunityPostDetailResponse = CommunityPost

export interface CommunityPostLikeRequest {
  post_id: string
  action: 'like' | 'unlike'
}

export interface CommunityPostLikeResponse {
  post_id: string
  is_liked: boolean
  likes: number
}

export interface CommunityCommentCreateRequest {
  post_id: string
  content: string
  reply_to?: string
}

export interface CommunityCommentCreateResponse {
  comment_id: string
  create_time: string
}

export interface CommunityCommentListRequest {
  post_id: string
  page?: number
  pageSize?: number
}

export type CommunityCommentListResponse = PaginatedResponse<CommunityComment>

export interface CommunityPostDeleteRequest {
  post_id: string
}

// 后台管理模块
export interface AdminGoodsListRequest {
  keyword?: string
  category?: string
  status?: number
  page?: number
  pageSize?: number
}

export type AdminGoodsListResponse = PaginatedResponse<AdminGoodsItem>

export interface AdminGoodsSaveRequest {
  id?: string
  name: string
  category: string
  description?: string
  images?: string[]
  status: number
  sku_list: Sku[]
}

export interface AdminGoodsSaveResponse {
  id: string
}

export interface AdminOrdersListRequest {
  order_no?: string
  status?: string
  start_time?: string
  end_time?: string
  page?: number
  pageSize?: number
}

export type AdminOrdersListResponse = PaginatedResponse<AdminOrderItem>

export interface AdminMembersListRequest {
  keyword?: string
  level?: number
  page?: number
  pageSize?: number
}

export type AdminMembersListResponse = PaginatedResponse<AdminMemberItem>

export interface AdminMembersDetailRequest {
  uid: string
}

export interface AdminMembersDetailResponse extends MemberInfo {
  recent_orders: OrderItem[]
  recent_points: PointLog[]
}

export interface AdminPointAdjustRequest {
  uid: string
  change: number
  reason: string
}

export interface AdminPointAdjustResponse {
  uid: string
  points_before: number
  points_after: number
  change: number
}

export interface AdminCommunityPostsRequest {
  keyword?: string
  status?: number
  page?: number
  pageSize?: number
}

export type AdminCommunityPostsResponse = PaginatedResponse<AdminPostItem>

export interface AdminPostDeleteRequest {
  post_id: string
}

export interface AdminOrderUpdateRequest {
  order_no: string
  order_status: OrderStatus
}

export interface AdminOrderUpdateResponse {
  order_no: string
  order_status: OrderStatus
  update_time: string
}
