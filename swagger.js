const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// 定义 Swagger 选项
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'User API 文档',
            version: '1.0.0',
            description: '这是一个用户管理系统的 API 文档，包含用户认证、品牌管理、用户管理、权限管理和消息看板等相关接口。',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    // 指定包含路由定义和处理函数的文件路径
    apis: ['./app.js', './router/user.js', './router_handler/user_handler.js'], 
};

// 初始化 Swagger JSDoc
const specs = swaggerJsdoc(options);

module.exports = {
    swaggerUi,
    specs,
};