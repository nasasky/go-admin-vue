# 店铺信息管理

## 功能概述

店铺信息管理模块提供了完整的店铺信息CRUD操作，包括新增、编辑、删除、查询等功能。

## 主要功能

### 1. 店铺列表
- 支持分页查询
- 支持按店铺名称、负责人、电话、地址搜索
- 支持按状态筛选（启用/禁用）
- 显示店铺Logo、营业时间等详细信息

### 2. 新增店铺
- 店铺基本信息填写（名称、负责人、电话、地址等）
- 店铺Logo上传
- 营业时间设置（支持多时间段）
- 店铺描述

### 3. 编辑店铺
- 修改店铺所有信息
- 支持营业时间的动态添加和删除

### 4. 状态管理
- 启用/禁用店铺
- 批量操作支持

### 5. 删除功能
- 单个删除
- 批量删除（待实现）

## 技术实现

### 前端组件
- `ProTable`: 使用项目统一的表格组件
- `StoreForm`: 自定义店铺表单组件
- `UploadImg`: 图片上传组件

### API接口
- `GET /api/admin/store`: 获取店铺列表
- `GET /api/admin/store/detail`: 获取店铺详情
- `POST /api/admin/store`: 新增店铺
- `PUT /api/admin/store`: 更新店铺信息
- `DELETE /api/admin/store/{id}`: 删除店铺
- `PUT /api/admin/store/{id}/status`: 更新店铺状态

### 数据结构

#### 店铺信息
```typescript
interface StoreInfo {
  id?: number;
  store_name: string;
  manager: string;
  manager_id: number;
  phone: string;
  address: string;
  business_hours?: string; // JSON字符串
  logo?: string;
  description?: string;
  status: number; // 1-启用 0-禁用
  create_time?: string;
  update_time?: string;
}
```

#### 营业时间
```typescript
interface BusinessHours {
  day: string;        // 星期几
  start_time: string; // 开始时间
  end_time: string;   // 结束时间
  is_open: boolean;   // 是否营业
}
```

## 使用说明

1. **查看店铺列表**: 进入页面后自动加载店铺列表
2. **搜索店铺**: 在搜索框中输入关键词，支持店铺名称、负责人、电话、地址的模糊搜索
3. **新增店铺**: 点击"新增店铺"按钮，填写店铺信息并保存
4. **编辑店铺**: 点击操作列的"编辑"按钮，修改店铺信息
5. **启用/禁用**: 点击操作列的"启用"或"禁用"按钮，快速切换店铺状态
6. **删除店铺**: 点击操作列的"删除"按钮，确认后删除店铺

## 注意事项

1. 店铺名称、负责人、负责人ID、电话、地址为必填字段
2. 营业时间使用JSON格式存储，前端会自动处理序列化和反序列化
3. 状态字段：1表示启用，0表示禁用
4. 删除操作为物理删除，请谨慎操作
5. 负责人ID需要关联到实际的用户ID 