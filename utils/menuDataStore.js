const fs = require("fs");
const path = require("path");

const menuDataPath = path.join(__dirname, "../data/menuData.json");

/**
 * 读取用户数据 JSON 文件
 * @returns {Array} 用户数据数组，如果文件不存在则返回空数组
 */
function readMenuData() {
    if (!fs.existsSync(menuDataPath)) return [];
    const data = fs.readFileSync(menuDataPath, "utf-8");
    return JSON.parse(data);
}

/**
 * 保存用户数据到 JSON 文件
 * @param {Array} data - 要写入的用户数据数组
 */
function saveMenuData(data) {
    fs.writeFileSync(menuDataPath, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = {
    readMenuData,
    saveMenuData,
};
