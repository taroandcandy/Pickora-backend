// 使用json存储品牌属性本地数据
const fs = require('fs');
const path = require("path");
const categoryDataPath = path.join(__dirname, "../data/categories.json");
const attrDataPath = path.join(__dirname, "../data/platformAttributes.json");


function readCategoryData() {
    return JSON.parse(fs.readFileSync(categoryDataPath, 'utf-8'));
}

function readAttributes() {
    return JSON.parse(fs.readFileSync(attrDataPath, 'utf-8'));
}
// 保存数据
function saveAttrData(data) {
    try {
        fs.writeFileSync(attrDataPath, JSON.stringify(data, null, 2), "utf-8");
        console.log("数据保存成功");
    } catch (err) {
        console.error("保存 category.json 出错:", err);
        throw err; // 抛出异常给上层处理
    }
  }
module.exports = {
    readCategoryData,
    readAttributes,
    saveAttrData
};