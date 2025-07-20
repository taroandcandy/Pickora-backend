// 使用json存储品牌本地数据
const fs = require("fs");
const path = require("path");

const brandDataPath = path.join(__dirname, "../data/brandData.json");

function readBrandData() {
    if (!fs.existsSync(brandDataPath)) return [];
    const data = fs.readFileSync(brandDataPath, "utf-8");
    return JSON.parse(data);
}

function saveBrandData(data) {
    fs.writeFileSync(brandDataPath, JSON.stringify(data, null, 2), "utf-8");
}

module.exports = {
    readBrandData,
    saveBrandData,
};
