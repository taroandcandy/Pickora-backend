# Silicon Valley Backend Gateway

一个基于 Node.js + Express 的后台管理系统，用本地 JSON 文件作为数据源，提供用户认证、权限管理、品牌管理、商品分类、平台属性、SPU/SKU 管理和图片上传等接口。

## 技术栈

- Node.js
- Express 4
- CORS
- Formidable
- Swagger UI / swagger-jsdoc
- 本地 JSON 文件持久化

## 环境要求

- Node.js 16 或更高版本
- npm

## 安装与启动

```bash
npm install
npm start
```

项目默认监听：

```text
http://localhost:3000
```

Swagger 接口文档：

```text
http://localhost:3000/api-docs
```

静态图片访问：

```text
http://localhost:3000/images/<filename>
```

## 项目结构

```text
.
├── app.js                         # Express 应用入口
├── swagger.js                     # Swagger 配置
├── router/
│   └── user.js                    # 接口路由定义
├── router_handler/
│   └── user_handler.js            # 接口处理逻辑
├── utils/                         # JSON 数据读写工具
├── data/                          # 本地模拟数据
├── public/
│   └── images/                    # 上传图片和静态图片
├── views/                         # EJS 视图目录
├── package.json
└── README.md
```

## 数据文件说明

项目没有连接数据库，接口数据主要读写 `data` 目录下的 JSON 文件。

| 文件 | 说明 |
| --- | --- |
| `data/userData.json` | 用户、token、角色、路由权限和按钮权限 |
| `data/roleData.json` | 角色列表及角色权限 |
| `data/menuData.json` | 权限菜单树 |
| `data/brandData.json` | 品牌管理数据 |
| `data/categories.json` | 一、二、三级商品分类 |
| `data/platformAttributes.json` | 平台属性和属性值 |
| `data/spuData.json` | SPU 商品数据 |
| `data/skuData.json` | SKU 商品数据 |
| `data/brandList_spu.json` | 指定分类下可选品牌数据 |

默认可用账号示例：

| 账号 | 密码 |
| --- | --- |
| `admin` | `111111` |

## 接口约定

- 所有业务接口都挂载在 `/myApi` 前缀下。
- 登录接口会生成新的 token，并写回 `data/userData.json`。
- 需要登录态的接口通常通过请求头传递 token：

```text
token: <login response token>
```

- 常见响应结构：

```json
{
  "code": 200,
  "message": "请求成功",
  "data": {},
  "ok": true
}
```

## 快速请求示例

登录：

```bash
curl -X POST http://localhost:3000/myApi/login \
  -H "Content-Type: application/json" \
  -d "{\"userNumber\":\"admin\",\"passWord\":\"111111\"}"
```

获取用户信息：

```bash
curl http://localhost:3000/myApi/getUserinfo \
  -H "token: <login response token>"
```

获取品牌分页：

```bash
curl http://localhost:3000/myApi/getBrandData/1/10
```

## 接口总览

### 用户认证

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/myApi/login` | 用户登录 |
| `POST` | `/myApi/logout` | 用户退出登录 |
| `GET` | `/myApi/getUserinfo` | 获取当前用户信息 |

### 用户管理

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/myApi/getAclUserData` | 获取用户列表，支持 `pageNum`、`pageSize` 查询参数 |
| `POST` | `/myApi/createUserData` | 新增或更新用户 |
| `POST` | `/myApi/deleteUser` | 删除用户，支持批量删除 |
| `POST` | `/myApi/assignUserRoles` | 给用户分配角色 |

### 角色与权限

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/myApi/getRoleList` | 获取角色列表，支持 `page`、`pageSize` 查询参数 |
| `POST` | `/myApi/roles` | 新增或更新角色 |
| `DELETE` | `/myApi/roles/:id` | 删除角色 |
| `GET` | `/myApi/roles/:roleId/permissions` | 获取角色权限树 |
| `POST` | `/myApi/role/:roleId/permissions` | 更新角色权限 |
| `GET` | `/myApi/permissions` | 获取全部权限菜单 |
| `POST` | `/myApi/permission/saveOrUpdate` | 新增或更新权限菜单 |
| `DELETE` | `/myApi/permission/delete/:id` | 删除权限菜单 |

### 品牌管理

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/myApi/getBrandData/:currentPage/:pageSize` | 获取品牌分页数据 |
| `POST` | `/myApi/addBrandData` | 新增品牌 |
| `POST` | `/myApi/updateBrandData` | 更新品牌 |
| `DELETE` | `/myApi/deleteBrand/:id` | 删除品牌 |
| `POST` | `/myApi/uploadImg` | 上传品牌图片，字段名为 `file` |

### 商品分类与平台属性

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/myApi/product/get/category1` | 获取一级分类 |
| `GET` | `/myApi/product/get/category2/:category1Id` | 获取指定一级分类下的二级分类 |
| `GET` | `/myApi/product/get/category3/:category2Id` | 获取指定二级分类下的三级分类 |
| `GET` | `/myApi/product/attrInfoList/:category3Id` | 获取三级分类下的平台属性 |
| `POST` | `/myApi/product/saveOrUpdateAttr` | 新增或更新平台属性 |
| `DELETE` | `/myApi/product/attr/:id` | 删除平台属性 |

### SPU 管理

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/myApi/product/spu/list/:page/:limit` | 获取指定三级分类下的 SPU 分页，查询参数 `category3Id` 必填 |
| `GET` | `/myApi/product/brand/category3/:category3Id` | 获取三级分类下可选品牌 |
| `POST` | `/myApi/product/spu/uploadImage` | 上传 SPU 图片，字段名为 `file` |
| `POST` | `/myApi/product/spu/saveOrUpdate` | 新增或更新 SPU |
| `DELETE` | `/myApi/product/spu/:id` | 删除 SPU |
| `GET` | `/myApi/product/spu/posterAndimage/:spuId` | 获取 SPU 海报图和图片列表 |
| `GET` | `/myApi/product/spu/category3/:spuId` | 获取 SPU 所属三级分类 ID |

### SKU 管理

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/myApi/product/sku/add` | 新增 SKU |
| `GET` | `/myApi/product/sku/list/:spuId` | 获取指定 SPU 下的 SKU 列表 |
| `GET` | `/myApi/product/sku/list` | 获取全部 SKU 分页，支持 `currentPage`、`pageSize` 查询参数 |
| `PUT` | `/myApi/product/sku/:id` | 更新 SKU |
| `DELETE` | `/myApi/product/sku/:id` | 删除 SKU |

## 图片上传

品牌图片上传到：

```text
public/images
```

SPU 图片上传到：

```text
public/images/spu
```

上传接口使用 `multipart/form-data`，文件字段名为 `file`。接口返回的图片地址可通过 `/images` 静态目录访问。

## 开发说明

- 修改接口路由：`router/user.js`
- 修改业务逻辑：`router_handler/user_handler.js`
- 修改 Swagger 配置：`swagger.js`
- 修改模拟数据：`data/*.json`
- 修改数据读写工具：`utils/*.js`

当前 `npm test` 仍是占位脚本，没有配置自动化测试。
