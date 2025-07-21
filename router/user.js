const express = require("express");
const router = express.Router();
const userHandler = require("../router_handler/user_handler");

// 登录相关
/**
 * @openapi
 * /myApi/login:
 *   post:
 *     summary: 用户登录接口
 *     description: 用户使用账号和密码进行登录操作
 *     tags:
 *       - 用户认证
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userNumber
 *               - passWord
 *             properties:
 *               userNumber:
 *                 type: string
 *                 description: 用户账号
 *               passWord:
 *                 type: string
 *                 description: 用户密码
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                   description: 状态码，200 表示成功
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR..."
 *                   description: 登录成功后返回的 token
 *                 message:
 *                   type: string
 *                   example: 登录成功
 *                   description: 提示信息
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                   description: 是否成功
 *       401:
 *         description: 密码错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: 密码错误
 *       404:
 *         description: 账号不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: 账号不存在
 */
router.post("/login", userHandler.login_handler);

/**
 * @openapi
 * /myApi/logout:
 *   post:
 *     summary: 用户退出登录接口
 *     description: 前端调用此接口通知服务器用户退出登录。Token 可选由前端清除，后端可用作记录或验证。
 *     tags:
 *       - 用户认证
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         description: 用户登录后返回的 token，需放在请求头中
 *     responses:
 *       200:
 *         description: 退出成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                   description: 状态码，200 表示成功
 *                 message:
 *                   type: string
 *                   example: 退出成功
 *                   description: 提示信息
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                   description: 是否成功
 *       401:
 *         description: token 无效或用户已退出
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: 用户已注销或TOKEN无效
 */
router.post("/logout", userHandler.logout_handler);

/**
 * @openapi
 * /myApi/getUserinfo:
 *   get:
 *     summary: 获取用户信息接口
 *     description: 前端传入 token，后端根据 token 返回用户详细信息，如用户名、头像、权限路由等
 *     tags:
 *       - 用户认证
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *         description: 登录成功后返回的 token
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                   description: 状态码，200 表示成功
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                   description: 响应信息
 *                 data:
 *                   type: object
 *                   properties:
 *                     userName:
 *                       type: string
 *                       example: 张三
 *                       description: 用户姓名
 *                     avatar:
 *                       type: string
 *                       example: https://example.com/avatar.jpg
 *                       description: 用户头像链接
 *                     routes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["/home", "/admin", "/product"]
 *                       description: 用户的路由权限
 *                     userId:
 *                       type: string
 *                       example: "u123456"
 *                       description: 用户 ID
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                   description: 是否成功
 *       401:
 *         description: 用户已注销或 TOKEN 已过期
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: 用户已注销或TOKEN无效
 */
router.get("/getUserinfo", userHandler.getUserinfo_handler);

// 权限管理
/**
 * @openapi
 * /myApi/getAclUserData:
 *   get:
 *     summary: 获取用户列表接口
 *     description: 获取用户管理相关的用户列表，支持分页
 *     tags:
 *       - 用户管理
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: 用户的 token
 *       - in: query
 *         name: pageNum
 *         schema:
 *           type: integer
 *           default: 1
 *         required: false
 *         description: 当前页码（从 1 开始）
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         required: false
 *         description: 每页条数
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                   description: 状态码，200 表示成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 23
 *                       description: 用户总数
 *                     pageNum:
 *                       type: integer
 *                       example: 1
 *                       description: 当前页码
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                       description: 每页条数
 *                     list:
 *                       type: array
 *                       description: 当前页的用户列表
 *                       items:
 *                         type: object
 *                         properties:
 *                           userNumber:
 *                             type: string
 *                             example: admin
 *                             description: 用户账号
 *                           passWord:
 *                             type: string
 *                             example: 123456
 *                             description: 用户密码（明文，仅示例用途）
 *                           token:
 *                             type: string
 *                             example: tokenAdmin
 *                             description: 登录凭证 token
 *                           userName:
 *                             type: string
 *                             example: 管理员
 *                             description: 用户昵称
 *                           avatar:
 *                             type: string
 *                             example: /avatar.png
 *                             description: 用户头像地址
 *                           routes:
 *                             type: array
 *                             example: ["Product", "Acl"]
 *                             description: 路由权限
 *                             items:
 *                               type: string
 *                           userId:
 *                             type: string
 *                             example: xxxxxx
 *                             description: 用户唯一 ID
 *                           createTime:
 *                             type: string
 *                             example: 2025-06-13 12:00:00
 *                             description: 账户创建时间
 *                           updateTime:
 *                             type: string
 *                             example: 2025-06-13 12:00:00
 *                             description: 账户修改时间
 */
router.get("/getAclUserData", userHandler.getAclUserData_handler);

/**
 * @openapi
 * /myApi/createUserData:
 *   post:
 *     summary: 创建用户接口
 *     description: 创建新的用户信息
 *     tags:
 *       - 用户管理
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: 用户的 token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userData:
 *                 type: object
 *                 properties:
 *                   userNumber:
 *                     type: string
 *                     description: 用户账号
 *                   userName:
 *                     type: string
 *                     description: 用户姓名
 *                   userSex:
 *                     type: string
 *                     description: 用户性别
 *                   userPhone:
 *                     type: string
 *                     description: 用户电话
 *                   Email:
 *                     type: string
 *                     description: 用户邮箱
 *                   brief:
 *                     type: string
 *                     description: 用户简介
 *                   passWord:
 *                     type: string
 *                     description: 用户密码
 *     responses:
 *       200:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   description: 状态码，200 表示成功
 *                 message:
 *                   type: string
 *                   description: 响应信息
 *       400:
 *         description: 用户账号不能相同
 */
router.post("/createUserData", userHandler.createOrUpdateUserData_handler);

/**
 * @openapi
 * /myApi/deleteUser:
 *   post:
 *     summary: 删除用户（支持单个或批量）
 *     description: 根据用户 ID 列表删除用户，可删除一个或多个用户
 *     tags:
 *       - 用户管理
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["user123", "user456"]
 *                 description: 要删除的用户 ID 列表
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 成功删除 2 个用户
 *                 deletedCount:
 *                   type: integer
 *                   example: 2
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: 请求参数不合法
 *       404:
 *         description: 未找到要删除的用户
 */
router.post("/deleteUser", userHandler.deleteUser_handler);

/**
 * @openapi
 * /myApi/assignUserRoles:
 *   post:
 *     summary: 给用户分配角色
 *     description: 接收用户ID和角色数组，为用户设置角色列表
 *     tags:
 *       - 用户管理
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - roles
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "123"
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["前端", "产品"]
 *     responses:
 *       200:
 *         description: 角色分配成功
 */
router.post("/assignUserRoles", userHandler.assignUserRoles_handler);

/**
 * @swagger
 * /myApi/roles:
 *   get:
 *     summary: 获取角色列表
 *     description: 支持分页，不传分页参数时返回全部数据
 *     tags:
 *       - 角色管理
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: 页码（从 1 开始）
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *         required: false
 *         description: 每页条数
 *     responses:
 *       200:
 *         description: 成功获取角色列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 角色列表获取成功
 *                 total:
 *                   type: integer
 *                   example: 11
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       角色名称:
 *                         type: string
 *                         example: 超级管理员
 *                       创建时间:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-07-20 10:00:00
 *                       更新时间:
 *                         type: string
 *                         format: date-time
 *                         example: 2025-07-20 10:00:00
 */
router.get("/getRoleList", userHandler.getRoleList_handler);

/**
 * @swagger
 * /myApi/roles/{id}:
 *   delete:
 *     summary: 删除指定角色
 *     tags:
 *       - 角色管理
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 要删除的角色 ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 角色不存在
 */
router.delete('/roles/:id', userHandler.deleteRole_handler);

/**
 * @swagger
 * /myApi/roles:
 *   post:
 *     summary: 添加或修改角色
 *     description: 如果传入 id 则为修改角色，否则为添加角色
 *     tags:
 *       - 角色管理
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 3
 *               roleName:
 *                 type: string
 *                 example: 运维
 *     responses:
 *       200:
 *         description: 成功添加或修改角色
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 要修改的角色不存在
 */
router.post('/roles', userHandler.saveOrUpdateRole_handler);

/**
 * @swagger
 * /myApi/roles/{roleId}/permissions:
 *   get:
 *     summary: 获取角色的权限树（按名称标记 select）
 *     description: 根据角色 ID 返回完整菜单权限树，并标记角色已选中的权限（通过名称匹配）
 *     tags:
 *       - 角色管理
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色 ID
 *     responses:
 *       200:
 *         description: 成功返回权限树
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: array
 *                   description: 权限树结构
 *                   items:
 *                     $ref: '#/components/schemas/MenuData'
 *       400:
 *         description: 非法角色 ID
 *
 * components:
 *   schemas:
 *     MenuData:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: 权限管理
 *         createTime:
 *           type: string
 *           example: 2025-07-20 10:00:00
 *         updateTime:
 *           type: string
 *           example: 2025-07-20 10:00:00
 *         pid:
 *           type: integer
 *           example: 0
 *         code:
 *           type: string
 *           example: ""
 *         toCode:
 *           type: string
 *           example: ""
 *         type:
 *           type: integer
 *           example: 1
 *         status:
 *           type: string
 *           nullable: true
 *         level:
 *           type: integer
 *           example: 1
 *         select:
 *           type: boolean
 *           example: true
 *         children:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MenuData'
 */
router.get('/roles/:roleId/permissions', userHandler.getSelectedPermissionNamesByRoleId);

/**
 * @swagger
 * /myApi/role/{roleId}/permissions:
 *   post:
 *     tags:
 *       - 角色管理
 *     summary: 更新角色权限
 *     description: 根据角色 ID 更新其拥有的权限名称列表
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         description: 要更新的角色 ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - selected
 *             properties:
 *               selected:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 权限名称数组
 *             example:
 *               selected: ["权限管理", "用户管理", "添加", "删除"]
 *     responses:
 *       200:
 *         description: 权限更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 权限更新成功
 *       400:
 *         description: 参数错误
 *       404:
 *         description: 角色未找到
 */
router.post("/role/:roleId/permissions", userHandler.updateRolePermissions);

/**
 * @swagger
 * /myApi/permissions:
 *   get:
 *     summary: 获取全部权限列表
 *     tags:
 *       - 菜单管理
 *     description: 返回完整的权限菜单树结构，不含 selected 状态。
 *     responses:
 *       200:
 *         description: 成功返回权限列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取权限列表成功
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MenuItem'
 *       500:
 *         description: 服务器错误
 */
router.get("/permissions", userHandler.getAllPermissionList);



// /**
//  * @openapi
//  * /myApi/editUserData:
//  *   post:
//  *     summary: 编辑用户接口
//  *     description: 根据用户 ID 编辑用户信息
//  *     tags:
//  *       - 用户管理
//  *     parameters:
//  *       - in: header
//  *         name: token
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: 用户的 token
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               userData:
//  *                 type: object
//  *                 properties:
//  *                   id:
//  *                     type: string
//  *                     description: 用户 ID
//  *                   # 其他用户信息字段
//  *     responses:
//  *       200:
//  *         description: 编辑成功
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 code:
//  *                   type: number
//  *                   description: 状态码，200 表示成功
//  *                 message:
//  *                   type: string
//  *                   description: 响应信息
//  *       404:
//  *         description: 用户不存在
//  */
// router.post("/editUserData", userHandler.editUserData_handler);

// /**
//  * @openapi
//  * /myApi/delUserData:
//  *   post:
//  *     summary: 删除用户接口
//  *     description: 根据用户 ID 数组批量删除用户信息
//  *     tags:
//  *       - 用户管理
//  *     parameters:
//  *       - in: header
//  *         name: token
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: 用户的 token
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               idArr:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                 description: 需要删除的用户 ID 数组
//  *     responses:
//  *       200:
//  *         description: 删除成功
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 code:
//  *                   type: number
//  *                   description: 状态码，200 表示成功
//  *                 message:
//  *                   type: string
//  *                   description: 响应信息
//  */
// router.post("/delUserData", userHandler.delUserData_handler);

// /**
//  * @openapi
//  * /myApi/changeState:
//  *   post:
//  *     summary: 更改用户状态接口
//  *     description: 根据用户的 token 更改用户的状态
//  *     tags:
//  *       - 用户管理
//  *     parameters:
//  *       - in: header
//  *         name: token
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: 用户的 token
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               state:
//  *                 type: boolean
//  *                 description: 用户的新状态
//  *     responses:
//  *       200:
//  *         description: 状态更新成功
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 code:
//  *                   type: number
//  *                   description: 状态码，200 表示成功
//  *                 message:
//  *                   type: string
//  *                   description: 响应信息
//  *       404:
//  *         description: 用户不存在
//  */
// router.post("/changeState", userHandler.changeState_handler);

// /**
//  * @openapi
//  * /myApi/getAsyncRoute:
//  *   get:
//  *     summary: 获取异步路由配置接口
//  *     description: 根据用户的 token 获取异步路由配置
//  *     tags:
//  *       - 权限管理
//  *     parameters:
//  *       - in: header
//  *         name: token
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: 用户的 token
//  *     responses:
//  *       200:
//  *         description: 获取成功
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 code:
//  *                   type: number
//  *                   description: 状态码，200 表示成功
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     asyncRoutes:
//  *                       type: array
//  *                       items:
//  *                         type: object
//  *                       description: 异步路由配置列表
//  */
// router.get("/getAsyncRoute", userHandler.getAsyncRoute_handler);

// /**
//  * @openapi
//  * /myApi/distribute:
//  *   post:
//  *     summary: 分配用户权限接口
//  *     description: 根据用户的 token 分配新的路由权限
//  *     tags:
//  *       - 权限管理
//  *     parameters:
//  *       - in: header
//  *         name: token
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: 用户的 token
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               userToken:
//  *                 type: string
//  *                 description: 用户的 token
//  *               routes:
//  *                 type: array
//  *                 items:
//  *                   type: string
//  *                 description: 用户的新路由权限
//  *     responses:
//  *       200:
//  *         description: 权限分配成功
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 code:
//  *                   type: number
//  *                   description: 状态码，200 表示成功
//  *                 message:
//  *                   type: string
//  *                   description: 响应信息
//  */
// router.post("/distribute", userHandler.distribute_handler);

// /**
//  * @openapi
//  * /myApi/getMessage:
//  *   get:
//  *     summary: 获取系统消息接口
//  *     description: 根据用户的 token 获取系统消息列表
//  *     tags:
//  *       - 消息看板
//  *     parameters:
//  *       - in: header
//  *         name: token
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: 用户的 token
//  *     responses:
//  *       200:
//  *         description: 获取成功
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 code:
//  *                   type: number
//  *                   description: 状态码，200 表示成功
//  *                 data:
//  *                   type: object
//  *                   properties:
//  *                     messageData:
//  *                       type: array
//  *                       items:
//  *                         type: object
//  *                       description: 系统消息列表
//  */
// router.get("/getMessage", userHandler.getMessage_handler);

// /**
//  * @openapi
//  * /myApi/addMessage:
//  *   post:
//  *     summary: 添加系统消息接口
//  *     description: 添加新的系统消息
//  *     tags:
//  *       - 消息看板
//  *     parameters:
//  *       - in: header
//  *         name: token
//  *         schema:
//  *           type: string
//  *         required: true
//  *         description: 用户的 token
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               // 系统消息内容字段
//  *     responses:
//  *       200:
//  *         description: 留言成功
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 code:
//  *                   type: number
//  *                   description: 状态码，200 表示成功
//  *                 message:
//  *                   type: string
//  *                   description: 响应信息
//  */
// router.post("/addMessage", userHandler.addMessage_handler);





// 商品管理
/**
 * @openapi
 * /myApi/getBrandData/{currentPage}/{pageSize}:
 *   get:
 *     summary: 获取品牌数据接口
 *     description: 根据分页信息获取品牌数据
 *     tags:
 *       - 品牌管理
 *     parameters:
 *       - in: path
 *         name: currentPage
 *         schema:
 *           type: number
 *         required: true
 *         description: 当前页码
 *       - in: path
 *         name: pageSize
 *         schema:
 *           type: number
 *         required: true
 *         description: 每页显示的记录数
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   description: 状态码，200 表示成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     tableData:
 *                       type: array
 *                       items:
 *                         type: object
 *                       description: 分页后的品牌数据
 *                     total:
 *                       type: number
 *                       description: 品牌数据的总数
 */
router.get("/getBrandData/:currentPage/:pageSize", userHandler.getBrandData_handler);

/**
 * @openapi
 * /myApi/uploadImg:
 *   post:
 *     summary: 上传品牌图片接口
 *     description: 上传品牌图片并可关联品牌信息
 *     tags:
 *       - 品牌管理
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: 用户的 token
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               brandId:
 *                 type: string
 *                 description: 品牌 ID（可选）
 *               brandName:
 *                 type: string
 *                 description: 品牌名称
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 品牌图片文件
 *     responses:
 *       200:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   description: 状态码，200 表示成功
 *                 message:
 *                   type: string
 *                   description: 响应信息
 *       500:
 *         description: 上传失败
 */
router.post("/uploadImg", userHandler.uploadImg_handler);

/**
 * @openapi
 * /myApi/addBrandData:
 *   post:
 *     summary: 添加品牌数据接口
 *     description: 用于添加新的品牌数据
 *     tags:
 *       - 品牌管理
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: 用户的 token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tmName:
 *                 type: string
 *                 description: 品牌名称
 *               logoUrl:
 *                 type: string
 *                 description: 品牌logo地址
 *               # 可以根据实际需求添加更多品牌相关的字段
 *     responses:
 *       200:
 *         description: 添加成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   description: 状态码，200 表示成功
 *                 message:
 *                   type: string
 *                   description: 响应信息
 *       400:
 *         description: 输入参数有误
 *       401:
 *         description: 用户认证失败
 */
router.post("/addBrandData", userHandler.addBrandData_handler);

/**
 * @openapi
 * /myApi/updateBrandData:
 *   post:
 *     summary: 修改品牌数据接口
 *     description: 根据品牌 ID 修改品牌的名称和 logo 地址
 *     tags:
 *       - 品牌管理
 *     parameters:
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: 用户的 token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: 品牌 ID
 *               tmName:
 *                 type: string
 *                 description: 品牌名称
 *               logoUrl:
 *                 type: string
 *                 description: 品牌 logo 地址
 *     responses:
 *       200:
 *         description: 修改成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   description: 状态码，200 表示成功
 *                 message:
 *                   type: string
 *                   description: 响应信息
 *                 updatedBrand:
 *                   type: object
 *                   description: 更新后的品牌数据
 *       404:
 *         description: 未找到该品牌数据
 *       500:
 *         description: 修改品牌数据失败
 */
router.post("/updateBrandData", userHandler.updateBrandData_handler);

/**
 * @openapi
 * /myApi/deleteBrand/{id}:
 *   delete:
 *     summary: 删除品牌接口
 *     description: 根据品牌 ID 删除品牌数据
 *     tags:
 *       - 品牌管理
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: 要删除的品牌 ID
 *       - in: header
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: 用户的 token
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   description: 状态码，200 表示成功
 *                 message:
 *                   type: string
 *                   description: 响应信息
 *                 deletedBrand:
 *                   type: object
 *                   description: 被删除的品牌数据
 *       404:
 *         description: 未找到该品牌数据
 *       500:
 *         description: 删除品牌数据失败
 */
router.delete("/deleteBrand/:id", userHandler.deleteBrandData_handler);

/**
 * @openapi
 * /myApi/product/get/category1:
 *   get:
 *     summary: 获取一级分类
 *     description: 获取所有的一级分类列表
 *     tags:
 *       - 分类管理
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户认证的 token
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取一级分类成功
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       name:
 *                         type: string
 *                         example: 电子产品
 *       401:
 *         description: 用户认证失败
 */
router.get("/product/get/category1", userHandler.getCategory1_handler);

/**
 * @openapi
 * /myApi/product/get/category2/{category1Id}:
 *   get:
 *     summary: 获取二级分类
 *     description: 根据一级分类 ID 获取对应的二级分类列表
 *     tags:
 *       - 分类管理
 *     parameters:
 *       - in: header
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户认证的 token
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 一级分类 ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取二级分类成功
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "101"
 *                       parentId:
 *                         type: string
 *                         example: "1"
 *                       name:
 *                         type: string
 *                         example: 手机
 *       400:
 *         description: 缺少分类 ID 参数
 *       401:
 *         description: 用户认证失败
 *       404:
 *         description: 分类不存在
 */
router.get("/product/get/category2/:category1Id", userHandler.getCategory2_handler);

/**
 * @openapi
 * /myApi/product/get/category3/{category2Id}:
 *   get:
 *     summary: 获取三级分类列表
 *     description: 根据二级分类 ID 获取对应的三级分类
 *     tags:
 *       - 分类管理
 *     parameters:
 *       - in: path
 *         name: category2Id
 *         required: true
 *         schema:
 *           type: string
 *         description: 二级分类 ID
 *       - in: header
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户认证 token
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取三级分类成功
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1"
 *                       parentId:
 *                         type: string
 *                         example: "1"
 *                       name:
 *                         type: string
 *                         example: 智能手机
 *                       createTime:
 *                         type: string
 *                         example: 2025-07-05 20:45:23
 *                       updateTime:
 *                         type: string
 *                         example: 2025-07-05 20:45:23
 *       400:
 *         description: 缺少参数
 *       500:
 *         description: 服务器错误
 */
router.get("/product/get/category3/:category2Id", userHandler.getCategory3_handler);

/**
 * @openapi
 * /myApi/product/attrInfoList/{category3Id}:
 *   get:
 *     summary: 获取三级分类下的平台属性列表
 *     description: 根据分类 ID 获取该三级分类下的平台属性和属性值
 *     tags:
 *       - 属性管理
 *     parameters:
 *       - in: path
 *         name: category3Id
 *         required: true
 *         schema:
 *           type: string
 *         description: 三级分类 ID
 *       - in: header
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户认证的 token
 *     responses:
 *       200:
 *         description: 查询成功，返回属性数组
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 成功
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "101"
 *                       attrName:
 *                         type: string
 *                         example: 手机系统
 *                       categoryId:
 *                         type: string
 *                         example: "1"
 *                       categoryLevel:
 *                         type: number
 *                         example: 3
 *                       attrValueList:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "201"
 *                             valueName:
 *                               type: string
 *                               example: 安卓
 *                             attrId:
 *                               type: string
 *                               example: "101"
 *       400:
 *         description: 缺少分类参数
 *       500:
 *         description: 服务器内部错误
 */
router.get("/product/attrInfoList/:category3Id", userHandler.getAttrInfoList_handler);

/**
 * @openapi
 * /myApi/product/saveOrUpdateAttr:
 *   post:
 *     summary: 新增或更新三级分类属性
 *     description: 根据是否携带属性ID判断是新增还是修改属性
 *     tags:
 *       - 属性管理
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             oneOf:
 *               - $ref: '#/components/schemas/NewAttr'
 *               - $ref: '#/components/schemas/UpdateAttr'
 *     responses:
 *       200:
 *         description: 操作成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/UpdateAttr'
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     AttrValue:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         attrId:
 *           type: string
 *         valueName:
 *           type: string
 *     NewAttr:
 *       type: object
 *       properties:
 *         attrName:
 *           type: string
 *         attrValueList:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               valueName:
 *                 type: string
 *         categoryId:
 *           type: string
 *         categoryLevel:
 *           type: number
 *     UpdateAttr:
 *       allOf:
 *         - $ref: '#/components/schemas/NewAttr'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *             attrValueList:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AttrValue'
 */
router.post("/product/saveOrUpdateAttr", userHandler.saveOrUpdateAttr_handler);

/**
 * @openapi
 * /myApi/product/attr/{id}:
 *   delete:
 *     summary: 删除指定属性
 *     description: 根据属性 ID 删除某个三级分类下的属性信息
 *     tags:
 *       - 属性管理
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 属性的唯一 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                 message:
 *                   type: string
 *                 deletedAttr:
 *                   type: object
 *       400:
 *         description: 缺少 ID 参数
 *       404:
 *         description: 未找到属性
 *       500:
 *         description: 服务器内部错误
 */
router.delete("/product/attr/:id", userHandler.deleteAttr_handler);

/**
 * @openapi
 * /myApi/product/spu/list/{category3Id}:
 *   get:
 *     summary: 获取指定三级分类下的 SPU 列表（分页）
 *     description: 根据传入的 category3Id 获取该分类下的所有 SPU 数据，支持分页。
 *     tags:
 *       - SPU管理
 *     parameters:
 *       - in: path
 *         name: category3Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 三级分类ID
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *         description: 当前页码，默认 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *         description: 每页数量，默认 3
 *       - in: header
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 用户认证 Token
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     records:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           createTime:
 *                             type: string
 *                             format: date-time
 *                           updateTime:
 *                             type: string
 *                             format: date-time
 *                           spuName:
 *                             type: string
 *                           description:
 *                             type: string
 *                           category3Id:
 *                             type: integer
 *                           tmId:
 *                             type: integer
 *                           spuSaleAttrList:
 *                             type: string
 *                             nullable: true
 *                           spuImageList:
 *                             type: string
 *                             nullable: true
 *                           spuPosterList:
 *                             type: string
 *                             nullable: true
 *                     total:
 *                       type: integer
 *                     size:
 *                       type: integer
 *                     current:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器内部错误
 */
router.get('/product/spu/list/:page/:limit', userHandler.getSpuListByCategory3_handler);
/**
 * @openapi
 * /myApi/product/brand/category3/{category3Id}:
 *   get:
 *     summary: 获取某三级分类下的品牌列表
 *     tags:
 *       - 品牌管理
 *     parameters:
 *       - in: path
 *         name: category3Id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 三级分类 ID
 *     responses:
 *       200:
 *         description: 成功获取品牌列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       tmName:
 *                         type: string
 *                         example: 小米
 *                       category3Id:
 *                         type: integer
 *                         example: 2
 */
router.get('/product/brand/category3/:category3Id', userHandler.getBrandsByCategory3_handler);

/**
 * @openapi
 * /myApi/product/spu/uploadImage:
 *   post:
 *     summary: 上传 SPU 图片（支持多图）
 *     tags:
 *       - SPU管理
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 要上传的图片文件
 *     responses:
 *       200:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 上传成功
 *                 filePaths:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - http://127.0.0.1:3000/images/spu/abc1.png
 *                     - http://127.0.0.1:3000/images/spu/abc2.png
 */
router.post('/product/spu/uploadImage', userHandler.uploadSpuImage_handler)

/**
 * @openapi
 * /myApi/product/spu/saveOrUpdate:
 *   post:
 *     summary: 新增或更新 SPU
 *     description: 通过是否传入 id 来决定是新增还是更新 SPU，createTime 和 updateTime 由后端自动处理
 *     tags:
 *       - SPU管理
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - spuName
 *               - tmId
 *               - description
 *               - category3Id
 *             properties:
 *               id:
 *                 type: number
 *                 description: 传则为更新，不传为新增
 *               spuName:
 *                 type: string
 *               description:
 *                 type: string
 *               category3Id:
 *                 type: number
 *               tmId:
 *                 type: number
 *               spuImageList:
 *                 type: array
 *                 items:
 *                   type: string
 *                   description: 图片 URL
 *               spuSaleAttrList:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     attrName:
 *                       type: string
 *                     flag:
 *                       type: number
 *               spuPosterList:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     attrName:
 *                       type: string
 *                     attrValues:
 *                       type: array
 *                       items:
 *                         type: string
 *     responses:
 *       200:
 *         description: 保存成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 */
router.post('/product/spu/saveOrUpdate', userHandler.addOrUpdateSpu_handler);

/**
 * @openapi
 * /myApi/product/spu/{id}:
 *   delete:
 *     tags:
 *       - SPU管理
 *     summary: 删除指定的 SPU
 *     description: 根据传入的 SPU ID 删除对应的商品信息，操作不可恢复。
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 要删除的 SPU ID
 *         schema:
 *           type: integer
 *           example: 487
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 删除成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 487
 *       404:
 *         description: SPU 不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: SPU 不存在
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: 参数 id 非法
 */
router.delete('/product/spu/:id', userHandler.deleteSpu_handler);

/**
 * @openapi
 * /myApi/product/sku/add:
 *   post:
 *     tags:
 *       - SKU管理
 *     summary: 新增 SKU
 *     description: 为指定 SPU 添加一个新的 SKU，包括平台属性、销售属性与图片。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - spuId
 *               - skuName
 *               - price
 *             properties:
 *               spuId:
 *                 type: integer
 *                 description: 所属的 SPU ID
 *                 example: 487
 *               skuName:
 *                 type: string
 *                 description: SKU 名称
 *                 example: "海尔 Ultra 黑色Air版"
 *               price:
 *                 type: number
 *                 description: 价格（元）
 *                 example: 3999
 *               weight:
 *                 type: number
 *                 description: 重量（克）
 *                 example: 500
 *               description:
 *                 type: string
 *                 description: SKU 描述信息
 *                 example: "旗舰配置，轻薄机身"
 *               platformAttr:
 *                 type: array
 *                 description: 平台属性列表（来自属性管理）
 *                 items:
 *                   type: object
 *                   required:
 *                     - attrId
 *                     - valueId
 *                   properties:
 *                     attrId:
 *                       type: integer
 *                       description: 属性 ID
 *                       example: 1
 *                     valueId:
 *                       type: integer
 *                       description: 属性值 ID
 *                       example: 1001
 *               saleAttr:
 *                 type: array
 *                 description: 销售属性（从 SPU 设置的销售属性中选择）
 *                 items:
 *                   type: object
 *                   required:
 *                     - attrName
 *                     - valueName
 *                   properties:
 *                     attrName:
 *                       type: string
 *                       example: "颜色"
 *                     valueName:
 *                       type: string
 *                       example: "黑色"
 *               images:
 *                 type: array
 *                 description: 图片信息（可选）
 *                 items:
 *                   type: object
 *                   properties:
 *                     imgName:
 *                       type: string
 *                       example: "主图"
 *                     imgUrl:
 *                       type: string
 *                       format: uri
 *                       example: "http://localhost:3000/images/spu/example.jpg"
 *     responses:
 *       200:
 *         description: 新增成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 新增成功
 *                 data:
 *                   type: object
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: 缺少必要字段
 */
router.post('/product/sku/add', userHandler.addSku_handler);

/**
 * @openapi
 * /myApi/product/sku/list/{spuId}:
 *   get:
 *     tags:
 *       - SKU管理
 *     summary: 获取指定 SPU 下的所有 SKU
 *     description: 根据 spuId 查询该 SPU 下所有 SKU 的简要信息，包括 skuName、price、weight、图片、平台属性、销售属性等。
 *     parameters:
 *       - name: spuId
 *         in: path
 *         required: true
 *         description: 所属的 SPU ID
 *         schema:
 *           type: integer
 *           example: 1752044176422
 *     responses:
 *       200:
 *         description: 查询成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 2
 *                       skuName:
 *                         type: string
 *                         example: "vivoy8"
 *                       price:
 *                         type: string
 *                         example: "1800"
 *                       weight:
 *                         type: string
 *                         example: "200"
 *                       images:
 *                         type: array
 *                         description: SKU 图片列表（已扁平化）
 *                         items:
 *                           type: object
 *                           properties:
 *                             imgName:
 *                               type: string
 *                               example: "主图"
 *                             imgUrl:
 *                               type: string
 *                               format: uri
 *                               example: "http://127.0.0.1:3000/images/spu/example.jpg"
 *                       platformAttr:
 *                         type: array
 *                         description: 平台属性原始值（含 attrId 和 valueId）
 *                         items:
 *                           type: object
 *                           properties:
 *                             attrId:
 *                               type: string
 *                               example: "1752137933942"
 *                             valueId:
 *                               type: string
 *                               example: "17521379339420"
 *                       readableAttr:
 *                         type: array
 *                         description: 平台属性的可读格式（带 attrName 和 valueName）
 *                         items:
 *                           type: object
 *                           properties:
 *                             attrId:
 *                               type: string
 *                               example: "1752137933942"
 *                             attrName:
 *                               type: string
 *                               example: "电池容量"
 *                             valueId:
 *                               type: string
 *                               example: "17521379339420"
 *                             valueName:
 *                               type: string
 *                               example: "2000ma"
 *                       saleAttr:
 *                         type: array
 *                         description: 销售属性原始值
 *                         items:
 *                           type: object
 *                           properties:
 *                             attrName:
 *                               type: string
 *                               example: "颜色"
 *                             valueName:
 *                               type: string
 *                               example: "黑色"
 *       400:
 *         description: 参数错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *                   example: 缺少 spuId 参数
 */
router.get('/product/sku/list/:spuId', userHandler.getSkuListBySpuId);

/**
 * @openapi
 * /myApi/product/sku/list:
 *   get:
 *     tags:
 *       - SKU管理
 *     summary: 获取所有 SKU 列表（分页）
 *     description: 获取数据库中所有 SKU 信息，支持分页。
 *     parameters:
 *       - name: currentPage
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 当前页码（默认第 1 页）
 *       - name: pageSize
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量（默认 10 条）
 *     responses:
 *       200:
 *         description: 查询成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 2
 *                           spuId:
 *                             type: integer
 *                             example: 2
 *                           skuName:
 *                             type: string
 *                             example: "vivoy8"
 *                           price:
 *                             type: string
 *                             example: "1800"
 *                           weight:
 *                             type: string
 *                             example: "200"
 *                           description:
 *                             type: string
 *                             example: "很好用"
 *                           images:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 imgName:
 *                                   type: string
 *                                   example: "主图"
 *                                 imgUrl:
 *                                   type: string
 *                                   format: uri
 *                                   example: "http://127.0.0.1:3000/images/spu/example.jpg"
 *                           platformAttr:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 attrId:
 *                                   type: string
 *                                   example: "1752137933942"
 *                                 valueId:
 *                                   type: string
 *                                   example: "17521379339420"
 *                           readableAttr:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 attrId:
 *                                   type: string
 *                                   example: "1752137933942"
 *                                 attrName:
 *                                   type: string
 *                                   example: "电池容量"
 *                                 valueId:
 *                                   type: string
 *                                   example: "17521379339420"
 *                                 valueName:
 *                                   type: string
 *                                   example: "2000ma"
 *                           saleAttr:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 attrId:
 *                                   type: string
 *                                   example: "1752144829749"
 *                                 valueId:
 *                                   type: string
 *                                   example: "17521448297490"
 */
router.get('/product/sku/list', userHandler.getAllSkuList);

/**
 * @openapi
 * /myApi/product/sku/{id}:
 *   delete:
 *     tags:
 *       - SKU管理
 *     summary: 删除指定 ID 的 SKU
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: SKU ID
 *         schema:
 *           type: integer
 *           example: 101
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 删除成功
 *                 data:
 *                   $ref: '#/components/schemas/Sku'   # 如果你已在组件里定义 Sku
 *       400:
 *         description: 参数缺失
 *       404:
 *         description: SKU 不存在
 */
router.delete('/product/sku/:id', userHandler.deleteSkuById);

/**
 * @openapi
 * /myApi/product/sku/{id}:
 *   put:
 *     tags:
 *       - SKU管理
 *     summary: 修改指定 SKU 信息
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: SKU ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               skuName: "新名称"
 *               price: "1999"
 *               weight: "300g"
 *               images:
 *                 - imgName: 主图
 *                   imgUrl: "http://localhost/images/new.jpg"
 *     responses:
 *       200:
 *         description: 修改成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 修改成功
 *                 data:
 *                   type: object
 *       400:
 *         description: 参数错误
 *       404:
 *         description: SKU 不存在
 */
router.put('/product/sku/:id', userHandler.updateSkuById);

/**
 * @openapi
 * /myApi/product/spu/posterAndimage/{spuId}:
 *   get:
 *     tags:
 *       - SKU管理
 *     summary: 获取指定 SKU 所在 SPU 的销售海报图和图片列表（spuPosterList/spuImageList）
 *     parameters:
 *       - name: spuId
 *         in: path
 *         required: true
 *         description: SPU 的 ID
 *         schema:
 *           type: string
 *           example: "1752044176422"
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     spuPosterList:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [
 *                         "http://127.0.0.1:3000/images/spu/poster1.png",
 *                         "http://127.0.0.1:3000/images/spu/poster2.jpg"
 *                       ]
 *                     spuImageList:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: [
 *                         "http://127.0.0.1:3000/images/spu/dynIsho3ZiWPOQEcsqDEr-98.png",
 *                         "http://127.0.0.1:3000/images/spu/4jt3tugUZQveOMeWkzliQ-j.jpg"
 *                       ]
 *       404:
 *         description: SPU 不存在
 *       400:
 *         description: 缺少 spuId 参数
 */
router.get('/product/spu/posterAndimage/:spuId', userHandler.getSpuPosterandImageListBySpuId);

/**
 * @openapi
 * /myApi/product/spu/category3/{spuId}:
 *   get:
 *     tags:
 *       - SKU管理
 *     summary: 获取指定 SKU所在SPU的 category3Id
 *     parameters:
 *       - name: spuId
 *         in: path
 *         required: true
 *         description: SPU 的 ID
 *         schema:
 *           type: string
 *           example: "1752044176422"
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取成功
 *                 data:
 *                   type: string
 *                   example: "61"
 *       404:
 *         description: SPU 不存在
 *       400:
 *         description: 参数缺失
 */
router.get('/product/spu/category3/:spuId', userHandler.getCategory3IdBySpuId);
module.exports = router;
