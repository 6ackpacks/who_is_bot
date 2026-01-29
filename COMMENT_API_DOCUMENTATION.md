# 评论功能 API 文档

## 📋 概述

评论功能允许用户和游客对内容（视频/图片/文字）发表评论、回复评论、点赞评论和删除自己的评论。

---

## 🔌 API 端点

### 1. 创建评论

**端点**: `POST /comments`

**描述**: 创建新评论或回复已有评论

**请求体**:
```json
{
  "contentId": "content-uuid",
  "userId": "user-uuid",        // 可选，登录用户提供
  "guestId": "guest-id",        // 可选，游客提供
  "content": "评论内容",
  "parentId": "parent-comment-uuid"  // 可选，回复评论时提供
}
```

**响应**:
```json
{
  "success": true,
  "message": "评论发表成功",
  "data": {
    "id": "comment-uuid",
    "contentId": "content-uuid",
    "content": "评论内容",
    "likes": 0,
    "createdAt": "2026-01-29T12:00:00.000Z",
    "updatedAt": "2026-01-29T12:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "nickname": "用户昵称",
      "avatar": "头像URL",
      "level": 2
    },
    "isGuest": false,
    "guestId": null
  }
}
```

**验证规则**:
- `contentId`: 必填，内容必须存在
- `userId` 或 `guestId`: 至少提供一个
- `content`: 必填，最大长度 500 字符
- `parentId`: 可选，如果提供则父评论必须存在

---

### 2. 获取评论列表

**端点**: `GET /comments?contentId={contentId}`

**描述**: 获取指定内容的所有评论（包含回复）

**查询参数**:
- `contentId`: 必填，内容ID

**响应**:
```json
{
  "success": true,
  "data": {
    "total": 15,
    "comments": [
      {
        "id": "comment-uuid-1",
        "contentId": "content-uuid",
        "content": "这个视频太真实了！",
        "likes": 5,
        "createdAt": "2026-01-29T12:00:00.000Z",
        "updatedAt": "2026-01-29T12:00:00.000Z",
        "user": {
          "id": "user-uuid",
          "nickname": "侦探小王",
          "avatar": "https://...",
          "level": 3
        },
        "isGuest": false,
        "guestId": null,
        "replies": [
          {
            "id": "comment-uuid-2",
            "contentId": "content-uuid",
            "content": "同意！",
            "likes": 2,
            "createdAt": "2026-01-29T12:05:00.000Z",
            "updatedAt": "2026-01-29T12:05:00.000Z",
            "user": null,
            "isGuest": true,
            "guestId": "guest-123"
          }
        ]
      }
    ]
  }
}
```

**说明**:
- 评论按创建时间倒序排列（最新的在前）
- 每个顶级评论包含其所有回复
- 游客评论的 `user` 字段为 `null`，`isGuest` 为 `true`

---

### 3. 删除评论

**端点**: `DELETE /comments/{commentId}?userId={userId}&guestId={guestId}`

**描述**: 删除自己的评论

**路径参数**:
- `commentId`: 评论ID

**查询参数**:
- `userId`: 可选，登录用户提供
- `guestId`: 可选，游客提供

**响应**:
```json
{
  "success": true,
  "message": "评论已删除"
}
```

**权限验证**:
- 只有评论作者可以删除自己的评论
- 必须提供 `userId` 或 `guestId`
- 如果评论有回复，删除评论会级联删除所有回复

---

### 4. 点赞评论

**端点**: `POST /comments/{commentId}/like`

**描述**: 为评论点赞

**路径参数**:
- `commentId`: 评论ID

**响应**:
```json
{
  "success": true,
  "likes": 6
}
```

**说明**:
- 点赞数会立即增加
- 目前不限制重复点赞（可以后续添加防重复机制）

---

## 🎯 使用场景

### 场景 1: 用户判定后查看评论

```javascript
// 1. 用户提交判定
const judgmentResult = await wx.cloud.callContainer({
  path: '/judgments',
  method: 'POST',
  data: {
    contentId: 'xxx',
    userId: 'yyy',
    userChoice: 'ai'
  }
});

// 2. 显示判定结果后，立即获取评论
const commentsResult = await wx.cloud.callContainer({
  path: '/comments',
  method: 'GET',
  data: {
    contentId: 'xxx'
  }
});

// 3. 展示评论列表
console.log(commentsResult.data.comments);
```

### 场景 2: 用户发表评论

```javascript
// 用户输入评论内容后提交
const result = await wx.cloud.callContainer({
  path: '/comments',
  method: 'POST',
  data: {
    contentId: 'xxx',
    userId: 'yyy',
    content: '这个AI生成的太逼真了！'
  }
});

// 评论成功后刷新评论列表
if (result.success) {
  // 重新获取评论列表
  this.loadComments();
}
```

### 场景 3: 回复评论

```javascript
// 点击回复按钮，传入父评论ID
const result = await wx.cloud.callContainer({
  path: '/comments',
  method: 'POST',
  data: {
    contentId: 'xxx',
    userId: 'yyy',
    content: '我也这么觉得！',
    parentId: 'parent-comment-id'  // 父评论ID
  }
});
```

### 场景 4: 游客评论

```javascript
// 游客使用 guestId 而不是 userId
const result = await wx.cloud.callContainer({
  path: '/comments',
  method: 'POST',
  data: {
    contentId: 'xxx',
    guestId: 'guest-123',  // 游客ID
    content: '路过点个赞'
  }
});
```

---

## 🎨 前端集成建议

### 1. 评论列表组件

```javascript
// pages/result/result.js
Page({
  data: {
    comments: [],
    commentInput: '',
    replyingTo: null  // 正在回复的评论
  },

  onLoad(options) {
    this.setData({
      contentId: options.contentId
    });
    this.loadComments();
  },

  // 加载评论列表
  async loadComments() {
    const result = await wx.cloud.callContainer({
      path: '/comments',
      method: 'GET',
      data: {
        contentId: this.data.contentId
      }
    });

    if (result.success) {
      this.setData({
        comments: result.data.comments
      });
    }
  },

  // 发表评论
  async submitComment() {
    const { commentInput, contentId, replyingTo } = this.data;

    if (!commentInput.trim()) {
      wx.showToast({ title: '请输入评论内容', icon: 'none' });
      return;
    }

    const result = await wx.cloud.callContainer({
      path: '/comments',
      method: 'POST',
      data: {
        contentId,
        userId: wx.getStorageSync('userId'),
        content: commentInput,
        parentId: replyingTo?.id  // 如果是回复，传入父评论ID
      }
    });

    if (result.success) {
      wx.showToast({ title: '评论成功', icon: 'success' });
      this.setData({ commentInput: '', replyingTo: null });
      this.loadComments();  // 刷新评论列表
    }
  },

  // 点击回复按钮
  onReply(e) {
    const comment = e.currentTarget.dataset.comment;
    this.setData({
      replyingTo: comment
    });
  },

  // 点赞评论
  async onLike(e) {
    const commentId = e.currentTarget.dataset.id;

    const result = await wx.cloud.callContainer({
      path: `/comments/${commentId}/like`,
      method: 'POST'
    });

    if (result.success) {
      // 更新本地点赞数
      this.loadComments();
    }
  },

  // 删除评论
  async onDelete(e) {
    const commentId = e.currentTarget.dataset.id;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条评论吗？',
      success: async (res) => {
        if (res.confirm) {
          const result = await wx.cloud.callContainer({
            path: `/comments/${commentId}`,
            method: 'DELETE',
            data: {
              userId: wx.getStorageSync('userId')
            }
          });

          if (result.success) {
            wx.showToast({ title: '删除成功', icon: 'success' });
            this.loadComments();
          }
        }
      }
    });
  }
});
```

### 2. WXML 模板示例

```xml
<!-- 评论列表 -->
<view class="comments-section">
  <view class="comments-header">
    <text class="comments-title">评论 ({{comments.length}})</text>
  </view>

  <!-- 评论输入框 -->
  <view class="comment-input-box">
    <input
      class="comment-input"
      placeholder="{{replyingTo ? '回复 ' + replyingTo.user.nickname : '说点什么...'}}"
      value="{{commentInput}}"
      bindinput="onCommentInput"
      maxlength="500"
    />
    <button class="submit-btn" bindtap="submitComment">发送</button>
  </view>

  <!-- 评论列表 -->
  <view class="comments-list">
    <block wx:for="{{comments}}" wx:key="id">
      <view class="comment-item">
        <!-- 用户信息 -->
        <image class="avatar" src="{{item.user ? item.user.avatar : '/images/default-avatar.png'}}" />
        <view class="comment-content">
          <view class="comment-header">
            <text class="nickname">{{item.user ? item.user.nickname : '游客'}}</text>
            <text class="time">{{item.createdAt}}</text>
          </view>
          <text class="comment-text">{{item.content}}</text>

          <!-- 操作按钮 -->
          <view class="comment-actions">
            <view class="action-btn" bindtap="onLike" data-id="{{item.id}}">
              <text class="icon">👍</text>
              <text>{{item.likes}}</text>
            </view>
            <view class="action-btn" bindtap="onReply" data-comment="{{item}}">
              <text class="icon">💬</text>
              <text>回复</text>
            </view>
            <view wx:if="{{item.userId === userId}}" class="action-btn" bindtap="onDelete" data-id="{{item.id}}">
              <text class="icon">🗑️</text>
              <text>删除</text>
            </view>
          </view>

          <!-- 回复列表 -->
          <view wx:if="{{item.replies && item.replies.length > 0}}" class="replies">
            <block wx:for="{{item.replies}}" wx:key="id" wx:for-item="reply">
              <view class="reply-item">
                <text class="reply-author">{{reply.user ? reply.user.nickname : '游客'}}</text>
                <text class="reply-text">: {{reply.content}}</text>
              </view>
            </block>
          </view>
        </view>
      </view>
    </block>
  </view>
</view>
```

---

## 🔒 安全考虑

1. **内容审核**: 建议接入微信内容安全 API 对评论内容进行审核
2. **频率限制**: 已集成到后端的 RateLimitService，防止刷评论
3. **权限验证**: 只有评论作者可以删除自己的评论
4. **XSS 防护**: 前端显示评论时需要转义 HTML 特殊字符

---

## 📊 数据库表结构

详见 `DATABASE_DESIGN.md` 中的 `comments` 表定义。

---

## 🚀 后续优化建议

1. **点赞防重复**: 添加 `comment_likes` 表记录用户点赞关系
2. **评论举报**: 添加举报功能和审核机制
3. **热门评论**: 根据点赞数和时间排序显示热门评论
4. **分页加载**: 当评论数量很多时，实现分页或无限滚动
5. **@提及功能**: 支持 @其他用户
6. **表情包支持**: 支持发送表情包
7. **图片评论**: 支持上传图片评论
