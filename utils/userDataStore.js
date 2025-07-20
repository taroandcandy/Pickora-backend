const fs = require("fs");
const path = require("path");

const userDataPath = path.join(__dirname, "../data/userData.json");

/**
 * 读取用户数据 JSON 文件
 * @returns {Array} 用户数据数组，如果文件不存在则返回空数组
 */
function readUserData() {
    if (!fs.existsSync(userDataPath)) return [];
    const data = fs.readFileSync(userDataPath, "utf-8");
    return JSON.parse(data);
}

/**
 * 保存用户数据到 JSON 文件
 * @param {Array} data - 要写入的用户数据数组
 */
function saveUserData(data) {
    fs.writeFileSync(userDataPath, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = {
    readUserData,
    saveUserData,
};
