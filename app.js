const express = require('express');
const path = require('path');
const { swaggerUi, specs } = require('./swagger');

const app = express();

// 解析 JSON 和表单数据（必须放在路由之前）
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置 CORS（允许所有来源，生产环境需限制）
const cors = require('cors');
app.use(cors());

// 静态资源目录
app.use(express.static(path.join(__dirname, 'public')));

// 路由配置
const userRouter = require('./router/user');
app.use('/myApi', userRouter);

// 启用 Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// 启动服务
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});