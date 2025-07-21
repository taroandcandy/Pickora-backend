const formidable = require("formidable");
const path = require("path");
const nanoid = require("nanoid");
const fs = require("fs");

// 模拟用户数据
// const userData = [
//     {
//         userNumber: "admin",
//         passWord: "111111",
//         token: "tokenAdmin",
//         userName: "admin管理员",
//         // avatar: "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
//         avatar: "/dudu1.gif",
//         routes: ["Product", "Acl", "aclUser", "aclRole", "aclMenus"],
//         userId: "xxxxxx",
//     },
//     {
//         userNumber: "test",
//         passWord: "111111",
//         token: "tokenTest",
//         userName: "测试用户",
//         avatar: "https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif",
//         routes: ["Product"],
//         userId: "yyyyyy",
//     },
// ];
const { readUserData, saveUserData } = require("../utils/userDataStore");
/**
 * 用户退出登录处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.logout_handler = async (req, res) => {
    const rawToken = req.headers.token;

    if (!rawToken || typeof rawToken !== 'string' || !rawToken.trim()) {
        return res.status(400).json({ code: 400, message: "缺少 token" });
    }
    // 读取用户数据
    const userData = readUserData();

    const token = rawToken.trim();
    const user = userData.find((u) => u.token === token);

    if (!user) {
        return res.status(401).json({ code: 401, message: "用户已注销或TOKEN无效" });
    }

    // 模拟让 token “失效” —— 其实只是前端清除
    res.status(200).json({ code: 200, message: "退出成功", ok: true });
};


/**
 * 用户登录处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const { v4: uuidv4 } = require("uuid");
exports.login_handler = (req, res) => {
    const { userNumber, passWord } = req.body;
    const userList = readUserData();
    const userIndex = userList.findIndex((u) => u.userNumber === userNumber);

    if (userIndex === -1) {
        return res.status(404).json({ code: 404, message: "账号不存在" });
    }

    const user = userList[userIndex];

    if (user.passWord !== passWord) {
        return res.status(401).json({ code: 401, message: "密码错误" });
    }

    // 动态生成 token
    const newToken = uuidv4();
    userList[userIndex].token = newToken;

    // 保存新 token 回 JSON 文件（模拟登录状态）
    saveUserData(userList);

    res.json({
        code: 200,
        token: newToken,
        message: "登录成功",
        ok: true
    });
};

/**
 * 获取用户信息处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getUserinfo_handler = async (req, res) => {
    const token = req.headers.token;
    const userData = readUserData();
    const user = userData.find((u) => u.token === token);
    if (!user) return res.status(401).json({ code: 401, message: "用户已注销或TOKEN已过期" });

    res.json({
        code: 200,
        data: {
            userName: user.userName,
            avatar: user.avatar,
            routes: user.routes,
            userId: user.userId,
        },
        ok: true,
        message: '请求成功'
    });
};

// 从原有的 getBrandData_handler 函数中提取品牌数据，作为全局变量--不需要
// const brandData = [];
const { readBrandData, saveBrandData } = require("../utils/jsonStorage");
/**
 * 获取品牌数据处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getBrandData_handler = async (req, res) => {
    const { currentPage = 1, pageSize = 10 } = req.params;
    console.log(req.headers + "@@获取品牌数据@@");
    let brandData = readBrandData();
    const startIndex = (parseInt(currentPage) - 1) * parseInt(pageSize);
    const endIndex = startIndex + parseInt(pageSize);
    const tableData = brandData.slice(startIndex, endIndex);
    const total = brandData.length;

    res.json({
        code: 200,
        data: {
            tableData,
            total,
        },
    });
};
/**
 * 添加品牌数据处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
// 添加品牌数据
// post请求,会携带品牌名称tmName和图片logoURL过来
exports.addBrandData_handler = async (req, res) => {
    try {
        const { tmName, logoUrl } = req.body;
        // 如果品牌名为空或空格，直接返回失败，不添加
        if (!tmName || typeof tmName !== 'string' || !tmName.trim()) {
            return res.json({ code: 400, message: "添加失败：品牌名称不能为空", ok: false });
        }
        let brandData = readBrandData();
        const newId = (brandData.length > 0 ? parseInt(brandData[brandData.length - 1].id) + 1 : 1).toString();
        const newBrand = {
            id: newId,
            tmName: tmName.trim(),
            logoUrl,
            createTime: new Date().toLocaleString(),
            updateTime: new Date().toLocaleString()
        };

        brandData.push(newBrand);
        saveBrandData(brandData);
        console.log('@@添加品牌@@');
        res.json({ code: 200, message: "品牌数据添加成功", newBrand, ok: true });
    } catch (error) {
        console.error('添加品牌数据时出错:', error);
        res.status(500).json({ code: 500, message: `添加品牌失败: ${error.message}`, ok: false });
    }
};

/**
 * 修改品牌数据处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.updateBrandData_handler = async (req, res) => {
    try {
        const { id, tmName, logoUrl } = req.body;
        // 读取当前文件中已有的品牌数据
        let brandData = readBrandData();
        // 找到要修改的品牌索引
        const brandIndex = brandData.findIndex((brand) => brand.id === id);
        if (brandIndex === -1) {
            return res.status(404).json({ code: 404, message: "未找到该品牌数据" });
        }
        // 构建新的品牌对象
        const updatedBrand = {
            ...brandData[brandIndex],
            tmName,
            logoUrl,
            updateTime: new Date().toLocaleString()
        };
        // 更新数据
        brandData[brandIndex] = updatedBrand;
        // 写入文件
        saveBrandData(brandData);
        res.json({ code: 200, message: "品牌数据修改成功", updatedBrand });
    } catch (error) {
        console.error("修改品牌数据时出错:", error);
        return res.status(500).json({ code: 500, message: `修改品牌失败: ${error.message}` });
    }
};

/**
 * 上传品牌图片处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.uploadImg_handler = async (req, res) => {
    const form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, "../public/images");
    form.keepExtensions = true;
    console.log("@@上传图片@@")

    form.parse(req, (err, fields, files) => {
        // console.log(fields) 
        // console.log(files)
        if (err) {
            console.error('文件解析错误:', err);
            return res.status(500).json({ code: 500, message: `文件解析失败: ${err.message}` });
        }

        const { brandId, brandName } = fields;
        const { file } = files;

        if (!file) {
            return res.status(400).json({ code: 400, message: "未找到上传的文件" });
        }

        try {
            // 从 files.file 数组中取出第一个元素
            const fileObj = files.file[0];

            // 检查 fileObj.filepath 是否有效
            if (!fileObj.filepath) {
                return res.status(500).json({ code: 500, message: "文件路径无效" });
            }

            // 可以在这里添加更多的文件处理逻辑，例如重命名文件
            const newFileName = `${nanoid()}-${fileObj.originalFilename}`;
            const newFilePath = path.join(form.uploadDir, newFileName);

            // 检查目标目录是否存在，如果不存在则创建
            const targetDir = path.dirname(newFilePath);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }

            // 重命名文件
            fs.renameSync(fileObj.filepath, newFilePath);

            // 修改返回的 filePath 为客户端可访问的 URL
            const baseUrl = 'http://127.0.0.1:3000';
            const imageUrl = `${baseUrl}/images/${newFileName}`;

            res.json({ code: 200, message: "上传成功", filePath: imageUrl });
        } catch (error) {
            console.error('文件处理错误:', error);
            return res.status(500).json({ code: 500, message: `文件处理失败: ${error.message}` });
        }
    });
};


/**
 * 删除品牌数据处理函数（使用 JSON 存储）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.deleteBrandData_handler = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ code: 400, message: "缺少品牌 ID 参数" });
        }
        // 读取品牌数据
        let brandData = readBrandData();
        // 查找要删除的品牌索引
        const brandIndex = brandData.findIndex((brand) => brand.id === id);
        if (brandIndex === -1) {
            return res.status(404).json({ code: 404, message: "未找到该品牌数据" });
        }
        // 删除品牌数据
        const deletedBrand = brandData.splice(brandIndex, 1)[0];
        // 保存修改后的品牌数据到 JSON 文件
        saveBrandData(brandData);
        // 返回成功响应
        res.json({ code: 200, message: "品牌数据删除成功", deletedBrand });
    } catch (error) {
        console.error("删除品牌数据时出错:", error);
        res.status(500).json({ code: 500, message: `删除品牌失败: ${error.message}` });
    }
};

const { readCategoryData, readAttributes, saveAttrData } = require("../utils/jsonStorageAttr");
/**
 * 获取一级分类数据处理函数（使用 JSON 存储）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getCategory1_handler = async (req, res) => {
    try {
        const data = readCategoryData();
        // console.log("读取的分类数据：", data);  // 调试
        res.json({
            code: 200,
            message: "获取一级分类成功",
            data: data.category1
        });
    } catch (error) {
        console.error("获取一级分类出错:", error);
        res.status(500).json({ code: 500, message: `获取失败: ${error.message}` });
    }
};
/**
 * 获取指定一级分类下的二级分类数据处理函数（使用 JSON 存储）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getCategory2_handler = async (req, res) => {
    try {
        const { category1Id } = req.params;
        if (!category1Id) {
            return res.status(400).json({ code: 400, message: "缺少一级分类 ID 参数" });
        }

        const data = readCategoryData();
        const category2List = data.category2.filter(item => item.parentId === category1Id);

        res.json({
            code: 200,
            message: "获取二级分类成功",
            data: category2List
        });
    } catch (error) {
        console.error("获取二级分类出错:", error);
        res.status(500).json({ code: 500, message: `获取失败: ${error.message}` });
    }
};
/**
 * 获取指定二级分类下的三级分类数据处理函数（使用 JSON 存储）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getCategory3_handler = (req, res) => {
    try {
        const { category2Id } = req.params;
        if (!category2Id) {
            return res.status(400).json({ code: 400, message: '缺少 category2Id 参数' });
        }

        const data = readCategoryData();
        const result = data.category3.filter(item => item.parentId === category2Id);

        res.json({
            code: 200,
            message: '获取三级分类成功',
            data: result
        });
    } catch (err) {
        console.error('获取三级分类失败：', err);
        res.status(500).json({ code: 500, message: `服务器错误：${err.message}` });
    }
};

/**
 * 获取指定一级分类下的二级分类下的三级分类数据的属性的处理函数（使用 JSON 存储）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getAttrInfoList_handler = (req, res) => {
    const { category3Id } = req.params;

    if (!category3Id) {
        return res.status(400).json({ code: 400, message: '缺少分类参数' });
    }
    const allAttrs = readAttributes();
    console.log(allAttrs);
    const result = allAttrs.attributes.filter(item => item.categoryId === category3Id);

    res.json({
        code: 200,
        message: '成功',
        data: result
    });
};
/**
 * 新增或修改三级分类数据的属性的处理函数（使用 JSON 存储）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.saveOrUpdateAttr_handler = async (req, res) => {
    try {
        const attr = req.body;

        if (!attr || !attr.attrName || !attr.attrValueList || !attr.categoryId || !attr.categoryLevel) {
            return res.status(400).json({ code: 400, message: "缺少必填参数" });
        }

        // 读取原始属性数据
        const data = readAttributes(); // 假设你从 JSON 文件读取数据
        let attrList = data.attributes || [];

        if (attr.id) {
            // 修改属性
            const index = attrList.findIndex(item => item.id === attr.id);
            if (index !== -1) {
                attrList[index] = attr;
            } else {
                return res.status(404).json({ code: 404, message: "未找到要修改的属性" });
            }
        } else {
            // 新增属性，生成 id
            attr.id = Date.now().toString();
            attr.attrValueList = attr.attrValueList.map((v, i) => ({
                ...v,
                id: Date.now().toString() + i,
                attrId: attr.id
            }));
            attrList.push(attr);
        }

        data.attributes = attrList;
        saveAttrData(data);

        res.json({ code: 200, message: attr.id ? "修改成功" : "新增成功", data: attr });
    } catch (error) {
        console.error("保存属性失败:", error);
        res.status(500).json({ code: 500, message: `操作失败: ${error.message}` });
    }
};
/**
 * 删除指定属性的处理函数
 * @param {*} req 
 * @param {*} res 
 */
exports.deleteAttr_handler = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ code: 400, message: "缺少属性 ID" });
        }

        const data = readAttributes();
        const attrList = data.attributes || [];

        const index = attrList.findIndex(attr => attr.id === id);
        if (index === -1) {
            return res.status(404).json({ code: 404, message: "未找到该属性" });
        }

        const deleted = attrList.splice(index, 1)[0];
        data.attributes = attrList;

        saveAttrData(data);

        res.json({ code: 200, message: "删除成功", deletedAttr: deleted });
    } catch (err) {
        console.error("删除属性失败:", err);
        res.status(500).json({ code: 500, message: "服务器错误" });
    }
};
/**
 * 根据 category3Id 获取 spu 列表（分页）
 * @param {*} req 
 * @param {*} res 
 */
const { readSpuData, readBrandList, writeSpuData } = require("../utils/jsonStorageSpu");
exports.getSpuListByCategory3_handler = async (req, res) => {
    try {
        const { page, limit } = req.params;
        const { category3Id } = req.query;

        if (!category3Id) {
            return res.status(400).json({ code: 400, message: "缺少 category3Id 参数" });
        }

        const data = readSpuData();
        const allRecords = data.spuList.filter(
            (item) => item.category3Id == category3Id
        );

        const total = allRecords.length;
        const pages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const records = allRecords.slice(offset, offset + limit);

        res.json({
            code: 200,
            message: "成功",
            data: {
                records,
                total,
                size: Number(limit),
                current: Number(page),
                orders: [],
                optimizeCountSql: true,
                hitCount: false,
                countId: null,
                maxLimit: null,
                searchCount: true,
                pages,
            },
            ok: true,
        });
    } catch (error) {
        console.error("获取SPU数据失败:", error);
        res.status(500).json({ code: 500, message: "服务器错误", ok: false });
    }
};
/**
 * 获取当前三级分类下的品牌列表
 * 获取某个三级分类下的所有品牌
 * @param {*} req 
 * @param {*} res 
 */
exports.getBrandsByCategory3_handler = (req, res) => {
    const { category3Id } = req.params;

    // 参数校验
    if (!category3Id) {
        return res.status(400).json({
            code: 400,
            message: "缺少参数：category3Id",
        });
    }

    const brandList = readBrandList();

    // 文件读取失败
    if (!brandList) {
        return res.status(500).json({
            code: 500,
            message: "服务器读取品牌数据失败",
        });
    }

    // 筛选符合分类 ID 的品牌数据
    const filtered = brandList.filter(
        (brand) => String(brand.category3Id) === String(category3Id)
    );

    console.log(`[GET] 获取品牌 category3Id=${category3Id}, 返回 ${filtered.length} 条`);
    console.log(filtered);
    res.status(200).json({
        code: 200,
        message: filtered.length > 0 ? "获取成功" : "暂无对应品牌",
        data: filtered,
    });
};
/**
 * 上传spu图片处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.uploadSpuImage_handler = async (req, res) => {
    const form = new formidable.IncomingForm()
    form.uploadDir = path.join(__dirname, '../public/images/spu') // 放在 spu 子目录
    form.keepExtensions = true

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('文件解析失败:', err)
            return res.status(500).json({ code: 500, message: '上传失败' })
        }

        const fileField = files.file
        if (!fileField) {
            return res.status(400).json({ code: 400, message: '未上传文件' })
        }

        const fileList = Array.isArray(fileField) ? fileField : [fileField]
        const baseUrl = 'http://127.0.0.1:3000'
        const uploadedUrls = []

        try {
            for (const fileObj of fileList) {
                const newFileName = `${nanoid()}-${fileObj.originalFilename}`
                const newFilePath = path.join(form.uploadDir, newFileName)

                fs.mkdirSync(path.dirname(newFilePath), { recursive: true })
                fs.renameSync(fileObj.filepath, newFilePath)

                const imageUrl = `${baseUrl}/images/spu/${newFileName}`
                uploadedUrls.push(imageUrl)
            }

            res.json({
                code: 200,
                message: '上传成功',
                filePaths: uploadedUrls
            })
        } catch (error) {
            console.error('文件处理错误:', error)
            return res.status(500).json({ code: 500, message: '保存文件失败' })
        }
    })
}
/**
 * 修改/新增spu
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const dayjs = require('dayjs'); // 用于格式化时间
exports.addOrUpdateSpu_handler = async (req, res) => {
    // console.log('收到 SPU 数据:', req.body);
    try {
        const data = readSpuData(); // 读取当前 SPU 数据
        let newSpu = req.body;
        // console.log("得到的数据",newSpu);
        const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

        if (newSpu.id) {
            // 更新逻辑
            const index = data.spuList.findIndex(item => item.id === newSpu.id);
            if (index === -1) {
                return res.status(404).json({ code: 404, message: 'SPU不存在' });
            }

            // 保留原来的创建时间，更新内容和时间
            newSpu.createTime = data.spuList[index].createTime;
            newSpu.updateTime = now;
            data.spuList[index] = newSpu;
        } else {
            // 新增逻辑
            newSpu.id = Date.now();
            newSpu.createTime = now;
            newSpu.updateTime = now;
            data.spuList.push(newSpu);
        }

        writeSpuData(data);

        res.json({ code: 200, message: '保存成功', data: newSpu });
    } catch (error) {
        console.error('保存SPU失败:', error);
        res.status(500).json({ code: 500, message: '服务器错误' });
    }
};
/**
 * 删除 SPU —— 根据 id
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.deleteSpu_handler = async (req, res) => {
    try {
        // 1. 拿到前端传来的 id（通常放在 URL 参数里）
        // 例如前端 DELETE /api/spu/487，会进入 req.params.id
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ code: 400, message: '参数 id 非法' });
        }

        // 2. 读出当前本地 JSON（或其他存储）里的 SPU 列表
        const data = readSpuData();         // { spuList: [...] }

        // 3. 查找目标 SPU
        const index = data.spuList.findIndex(item => item.id === id);

        if (index === -1) {
            return res.status(404).json({ code: 404, message: 'SPU 不存在' });
        }

        // 4. 删除并写回
        const [removedSpu] = data.spuList.splice(index, 1); // splice 返回被删除元素数组
        writeSpuData(data);

        // 5. 响应
        return res.json({
            code: 200,
            message: '删除成功',
            data: { id: removedSpu.id }
        });
    } catch (error) {
        console.error('删除 SPU 失败:', error);
        return res.status(500).json({ code: 500, message: '服务器错误' });
    }
};

/**
 * 新增sku
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
const { readSkuData, saveSkuData } = require('../utils/jsonStorageSku');
exports.addSku_handler = (req, res) => {
    const sku = req.body;
    // 校验必填
    if (!sku.spuId || !sku.skuName || !sku.price) {
        return res.status(400).json({ code: 400, message: '缺少必填字段' });
    }

    const db = readSkuData();
    const maxId = Math.max(...db.skuList.map(s => s.id), 0);
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    const newSku = {
        ...sku,
        id: maxId + 1,
        createTime: now,
        updateTime: now
    };

    db.skuList.push(newSku);
    saveSkuData(db);

    res.json({ code: 200, message: '新增成功', data: newSku });
};
/**
 * 查询sku--通过spuId
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getSkuListBySpuId = (req, res) => {
    const { spuId } = req.params;
    if (!spuId) {
        return res.status(400).json({ code: 400, message: '缺少 spuId 参数' });
    }
    // platformAttr中的 attrId:平台属性的id valueId:该属性选中的属性值id

    // 1. 读库
    const db1 = readAttributes();
    const { attributes = [] } = db1;
    // 2. 建立 attributes 索引
    //    attrIndex: { [attrId]: { attrName, valueMap: { [valueId]: valueName } } }
    const attrIndex = attributes.reduce((acc, attr) => {
        acc[attr.id] = {
            attrName: attr.attrName,
            valueMap: Object.fromEntries(
                (attr.attrValueList || []).map(v => [v.id, v.valueName])
            ),
        };
        return acc;
    }, {});


    const db = readSkuData();
    const { skuList = [] } = db;
    // 3. 过滤、格式化 SKU 列表
    const filteredSkuList = skuList
        .filter(sku => String(sku.spuId) === String(spuId))
        .map(sku => {
            // 把 platformAttr 转成可读形式
            const readableAttr = (sku.platformAttr || []).flat().map(({ attrId, valueId }) => {
                const attrInfo = attrIndex[attrId];
                if (!attrInfo) return null; // attrId 不存在
                return {
                    attrId,
                    attrName: attrInfo.attrName,
                    valueId,
                    valueName: attrInfo.valueMap[valueId] || undefined, // valueId 可能找不到
                };
            }).filter(Boolean); // 去掉 null

            return {
                id: sku.id,
                skuName: sku.skuName,
                price: sku.price,
                weight: sku.weight,
                // images: (sku.images || []).flat(),
                images: Array.isArray(sku.images) ? sku.images.flat() : [],
                platformAttr: (sku.platformAttr || []).flat(),
                saleAttr: (sku.saleAttr || []).flat(),
                readableAttr, // 获取销售属性值
            };
        });

    res.json({
        code: 200,
        message: '获取成功',
        data: filteredSkuList
    });
};
/**
 * 查询所有sku
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getAllSkuList = (req, res) => {
    const db = readSkuData();
    const db1 = readAttributes();

    const { skuList = [] } = db;
    const { attributes = [] } = db1;
    const currentPage = parseInt(req.query.currentPage) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // 建属性索引
    const attrIndex = attributes.reduce((acc, attr) => {
        acc[attr.id] = {
            attrName: attr.attrName,
            valueMap: Object.fromEntries(
                (attr.attrValueList || []).map(v => [v.id, v.valueName])
            ),
        };
        return acc;
    }, {});

    // 格式化所有 SKU
    const allFormattedSku = skuList.map(sku => {
        const readableAttr = (sku.platformAttr || []).flat().map(({ attrId, valueId }) => {
            const attrInfo = attrIndex[attrId];
            if (!attrInfo) return null;
            return {
                attrId,
                attrName: attrInfo.attrName,
                valueId,
                valueName: attrInfo.valueMap[valueId] || undefined,
            };
        }).filter(Boolean);

        return {
            id: sku.id,
            spuId: sku.spuId,
            skuName: sku.skuName,
            price: sku.price,
            weight: sku.weight,
            description: sku.description,
            images: Array.isArray(sku.images) ? sku.images.flat() : [],
            platformAttr: Array.isArray(sku.platformAttr) ? sku.platformAttr.flat() : [],
            saleAttr: Array.isArray(sku.saleAttr) ? sku.saleAttr.flat() : [],
            readableAttr,
        };
    });

    // 做分页
    const total = allFormattedSku.length;
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedSkuList = allFormattedSku.slice(start, end);

    res.json({
        code: 200,
        message: '获取成功',
        data: {
            total,
            currentPage,
            pageSize,
            list: paginatedSkuList
        }
    });
};
/**
 * 按 id 删除单条 SKU
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.deleteSkuById = (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ code: 400, message: '缺少 id 参数' });
    }

    // 1. 读库
    const db = readSkuData();
    const { skuList = [] } = db;

    // 2. 查找并过滤
    const index = skuList.findIndex(sku => String(sku.id) === String(id));
    if (index === -1) {
        return res.status(404).json({ code: 404, message: 'SKU 不存在' });
    }

    const deletedSku = skuList.splice(index, 1)[0]; // 删除并拿到被删数据

    // 3. 写库
    saveSkuData({ ...db, skuList });

    // 4. 返回
    res.json({
        code: 200,
        message: '删除成功',
        data: deletedSku,
    });
};
/**
 * GET /product/spu/poster/:spuId
 * 获取指定 spuId 的 spuPosterList 数组
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getSpuPosterandImageListBySpuId = (req, res) => {
    const { spuId } = req.params;

    if (!spuId) {
        return res.status(400).json({ code: 400, message: '缺少 spuId 参数' });
    }

    const db = readSpuData();
    const { spuList = [] } = db; // 假设你的 SPU 数据在 spuList 中

    const spu = spuList.find(item => String(item.id) === String(spuId));
    if (!spu) {
        return res.status(404).json({ code: 404, message: '未找到对应的 SPU' });
    }

    res.json({
        code: 200,
        message: '获取成功',
        data: {
            spuPosterList: spu.spuPosterList || [],
            spuImageList: spu.spuImageList || [],
        },
    });
};
/**
 * GET /product/spu/category3/:spuId
 * 根据 spuId 获取对应的 category3Id
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getCategory3IdBySpuId = (req, res) => {
    const { spuId } = req.params;

    if (!spuId) {
        return res.status(400).json({ code: 400, message: '缺少 spuId 参数' });
    }

    const db = readSpuData();
    const { spuList = [] } = db;

    const spu = spuList.find(item => String(item.id) === String(spuId));

    if (!spu) {
        return res.status(404).json({ code: 404, message: '未找到对应的 SPU' });
    }

    res.json({
        code: 200,
        message: '获取成功',
        data: spu.category3Id || null
    });
};

/**
 * 根据 SKU ID 修改一条 SKU 信息-----前端待实现
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.updateSkuById = (req, res) => {
    const { id } = req.params;
    const updatedData = req.body;

    if (!id) {
        return res.status(400).json({ code: 400, message: '缺少 id 参数' });
    }

    if (!updatedData || typeof updatedData !== 'object') {
        return res.status(400).json({ code: 400, message: '缺少修改数据' });
    }

    // 读取数据库
    const db = readSkuData();
    const skuList = db.skuList || [];

    // 找目标 SKU
    const index = skuList.findIndex(sku => String(sku.id) === String(id));
    if (index === -1) {
        return res.status(404).json({ code: 404, message: '未找到对应 SKU' });
    }

    // 更新目标字段（浅合并）
    skuList[index] = {
        ...skuList[index],
        ...updatedData,
        id: skuList[index].id // 防止 ID 被覆盖
    };

    // 写回数据库
    saveSkuData({ ...db, skuList });

    res.json({
        code: 200,
        message: '修改成功',
        data: skuList[index],
    });
};

/**
 * 获取用户列表处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getAclUserData_handler = (req, res) => {
    const { pageNum = 1, pageSize = 10 } = req.query; // 获取分页参数，默认第1页，每页10条
    const userData = readUserData();

    const page = parseInt(pageNum);
    const size = parseInt(pageSize);

    // 计算分页范围
    const startIndex = (page - 1) * size;
    const endIndex = startIndex + size;

    const pagedData = userData.slice(startIndex, endIndex);

    res.json({
        code: 200,
        data: {
            total: userData.length,   // 总条数
            pageNum: page,            // 当前页码
            pageSize: size,           // 每页条数
            list: pagedData           // 当前页数据
        },
    });
};

/**
 * 创建/修改用户处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.createOrUpdateUserData_handler = (req, res) => {
    const newUser = req.body.userData;

    if (!newUser || !newUser.userNumber) {
        return res.status(400).json({ code: 400, message: "缺少必要的用户信息" });
    }
    const userList = readUserData();
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');

    if (newUser.userId) {
        const index = userList.findIndex((u) => u.userId === newUser.userId);

        if (index !== -1) {
            newUser.updateTime = now;
            userList[index] = { ...userList[index], ...newUser }; // 合并更新
            saveUserData(userList);
            return res.status(200).json({ code: 200, message: "修改成功" });
        } else {
            return res.status(404).json({ code: 404, message: "要修改的用户不存在" });
        }
    } else {
        const existingUser = userList.find((u) => u.userNumber === newUser.userNumber);

        if (existingUser) {
            return res.status(400).json({ code: 400, message: "用户账号不能相同" });
        }
        newUser.createTime = now
        newUser.updateTime = now
        newUser.userId = Date.now()
        userList.push(newUser);
        saveUserData(userList);
        res.status(200).json({ code: 200, message: "创建成功" });
    }
};

/**
 * 删除用户（支持单个或批量）
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.deleteUser_handler = (req, res) => {
    const { userIds } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
        return res.status(400).json({ code: 400, message: "请传入要删除的用户ID数组" });
    }

    const userList = readUserData();
    const beforeCount = userList.length;

    // 过滤掉要删除的用户
    const updatedList = userList.filter(user => !userIds.includes(user.userNumber));
    const deletedCount = beforeCount - updatedList.length;

    if (deletedCount === 0) {
        return res.status(404).json({ code: 404, message: "未找到对应的用户ID" });
    }

    saveUserData(updatedList);

    res.status(200).json({
        code: 200,
        message: `成功删除 ${deletedCount} 个用户`,
        deletedCount,
        ok: true
    });
};

const { readRoleData, writeRoleData } = require("../utils/roleDataStore");
/**
 * 获取所有角色列表
 * @param {Object} req 
 * @param {Object} res 
 */
exports.getRoleList_handler = (req, res) => {
    const roles = readRoleData(); // 假设这是完整的角色数组

    console.log("@@获取角色@@");

    // 从查询参数中获取分页参数
    const page = parseInt(req.query.page, 10);
    const pageSize = parseInt(req.query.pageSize, 10);

    let pagedRoles = roles;

    // 如果 page 和 pageSize 都存在并且有效，就分页
    if (!isNaN(page) && !isNaN(pageSize) && page > 0 && pageSize > 0) {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        pagedRoles = roles.slice(startIndex, endIndex);
    }

    res.json({
        code: 200,
        data: pagedRoles,
        total: roles.length,
        message: "角色列表获取成功"
    });
};
/**
 * 根据id删除角色
 * @param {Object} req 
 * @param {Object} res 
 */
exports.deleteRole_handler = (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ code: 400, message: '无效的角色 ID' });
    }

    const roles = readRoleData();
    const index = roles.findIndex(role => role.id === id);

    if (index === -1) {
        return res.status(404).json({ code: 404, message: '角色不存在' });
    }

    roles.splice(index, 1); // 删除该角色
    writeRoleData(roles);

    res.json({
        code: 200,
        message: `角色 ID ${id} 删除成功`
    });
};
/**
 * 添加/修改角色
 * @param {Object} req 
 * @param {Object} res 
 */
function formatDate() {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
}
exports.saveOrUpdateRole_handler = (req, res) => {
    const { id, roleName } = req.body;

    if (!roleName || typeof roleName !== 'string') {
        return res.status(400).json({ code: 400, message: '角色名称不能为空或格式错误' });
    }

    const roles = readRoleData();

    if (id != null) {
        // 修改角色
        const index = roles.findIndex(role => role.id === Number(id));
        if (index === -1) {
            return res.status(404).json({ code: 404, message: '要修改的角色不存在' });
        }

        roles[index]["roleName"] = roleName;
        roles[index]["updateTime"] = formatDate();

        writeRoleData(roles);

        return res.json({
            code: 200,
            message: '角色修改成功',
            // data: roles[index]
        });
    } else {
        // 添加角色
        const newRole = {
            id: roles.length ? Math.max(...roles.map(r => r.id)) + 1 : 1,
            roleName,
            createTime: formatDate(),
            updateTime: formatDate()
        };

        roles.push(newRole);
        writeRoleData(roles);

        return res.json({
            code: 200,
            message: '角色添加成功',
            data: newRole
        });
    }
};


/**
 * 递归标记选中节点
 */
const markSelectedByName = (menuList, selectedNames) => {
    return menuList.map(item => {
        const isSelected = selectedNames.includes(item.name);
        item.select = isSelected;

        if (item.children && item.children.length > 0) {
            // 如果当前节点被选中，所有子节点也都选中
            item.children = markSelectedByName(
                item.children,
                isSelected
                    ? [...selectedNames, ...item.children.map(child => child.name)]
                    : selectedNames
            );
        }

        return item;
    });
};
/**
 * 根据 roleId 获取菜单树（带 select 状态）
 * @param {Object} req 
 * @param {Object} res 
 */
const { readMenuData, saveMenuData } = require("../utils/menuDataStore");
exports.getSelectedPermissionNamesByRoleId = (req, res) => {
    const roleId = parseInt(req.params.roleId);
    if (isNaN(roleId)) {
        return res.status(400).json({ code: 400, message: '非法角色 ID' });
    }

    // 读取菜单和角色数据
    const menuTree = readMenuData(); // 已是标准结构
    const roles = readRoleData();
    const role = roles.find(role => role.id === roleId);

    if (!role) {
        return res.status(404).json({ code: 404, message: '角色未找到' });
    }

    const selectedNames = role.selected || [];

    // 标记 select
    const markedTree = markSelectedByName(menuTree, selectedNames);

    res.json({
        code: 200,
        message: '获取成功',
        data: markedTree
    });
};
/**
 * 根据 roleId 分配权限
 * @param {Object} req 
 * @param {Object} res 
 */
exports.updateRolePermissions = (req, res) => {
    const roleId = parseInt(req.params.roleId);
    const { selected } = req.body;

    if (!Array.isArray(selected)) {
        return res.status(400).json({ code: 400, message: "selected 应为数组" });
    }

    let roles = readRoleData();
    const index = roles.findIndex(role => role.id === roleId);

    if (index === -1) {
        return res.status(404).json({ code: 404, message: "角色不存在" });
    }

    // 更新 selected 字段
    roles[index].selected = selected;
    writeRoleData(roles);

    return res.json({ code: 200, message: "权限更新成功" });
};
/**
 * 获取所有权限
 * @param {Object} req 
 * @param {Object} res 
 */
exports.getAllPermissionList = (req, res) => {
    try {
        const menuTree = readMenuData(); // 假设它返回完整的菜单结构（树形）

        res.json({
            code: 200,
            message: '获取权限列表成功',
            data: menuTree
        });
    } catch (error) {
        console.error('读取权限列表失败:', error);
        res.status(500).json({
            code: 500,
            message: '服务器错误，无法读取权限列表'
        });
    }
};


/**
 * 给用户分配角色
 * @param {Object} req 
 * @param {Object} res 
 */
exports.assignUserRoles_handler = (req, res) => {
    const { userId, roles } = req.body;
    console.log("@@分配角色@@");
    if (!userId || !Array.isArray(roles)) {
        return res.status(400).json({ code: 400, message: "参数错误，必须包含 userId 和 roles 数组" });
    }

    const userList = readUserData();

    const index = userList.findIndex(u => String(u.userId) === String(userId));

    if (index === -1) {
        return res.status(404).json({ code: 404, message: "未找到指定用户" });
    }

    // 设置或覆盖 roles 字段
    userList[index].roles = roles;

    saveUserData(userList);

    res.status(200).json({
        code: 200,
        message: "角色分配成功",
        ok: true
    });
};






/**
 * 编辑用户处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.editUserData_handler = async (req, res) => {
    const { userData } = req.body;
    const index = userData.findIndex((u) => u.id === userData.id);
    if (index === -1) return res.status(404).json({ code: 404, message: "用户不存在" });

    // 模拟编辑用户逻辑
    userData[index] = { ...userData[index], ...userData };
    res.json({ code: 200, message: "编辑成功" });
};

/**
 * 删除用户处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.delUserData_handler = async (req, res) => {
    const { idArr } = req.body;
    const newUserData = userData.filter((u) => !idArr.includes(u.id));
    userData.length = 0;
    userData.push(...newUserData);
    res.json({ code: 200, message: "删除成功" });
};

/**
 * 更改用户状态处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.changeState_handler = async (req, res) => {
    const { token, state } = req.body;
    const user = userData.find((u) => u.token === token);
    if (!user) return res.status(404).json({ code: 404, message: "用户不存在" });

    user.state = state;
    res.json({ code: 200, message: "状态更新成功" });
};

/**
 * 获取异步路由配置处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getAsyncRoute_handler = async (req, res) => {
    const token = req.headers.token;
    const user = userData.find((u) => u.token === token);
    if (!user) return res.status(401).json({ code: 401, message: "用户已注销或TOKEN已过期" });

    // 模拟异步路由配置数据
    const asyncRoutes = [
        // 路由配置项
    ];
    res.json({
        code: 200,
        data: {
            asyncRoutes,
        },
    });
};

/**
 * 分配用户权限处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.distribute_handler = async (req, res) => {
    const { userToken, routes } = req.body;
    const user = userData.find((u) => u.token === userToken);
    if (!user) return res.status(404).json({ code: 404, message: "用户不存在" });

    user.routes = routes;
    res.json({ code: 200, message: "权限分配成功" });
};

/**
 * 获取系统消息处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.getMessage_handler = async (req, res) => {
    const token = req.headers.token;
    const user = userData.find((u) => u.token === token);
    if (!user) return res.status(401).json({ code: 401, message: "用户已注销或TOKEN已过期" });

    // 模拟系统消息数据
    const messageData = [
        // 消息数据项
    ];
    res.json({
        code: 200,
        data: {
            messageData,
        },
    });
};

/**
 * 添加系统消息处理函数
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 */
exports.addMessage_handler = async (req, res) => {
    // 模拟添加系统消息逻辑
    res.json({ code: 200, message: "留言成功" });
};





