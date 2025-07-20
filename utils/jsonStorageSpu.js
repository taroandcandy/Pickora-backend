const fs = require("fs");
const path = require("path");



function readSpuData() {
    const dataPath = path.join(__dirname, "../data/spuData.json");
    const data = fs.readFileSync(dataPath, "utf-8");
    return JSON.parse(data);
}

function readBrandList() {
    const filePath = path.join(__dirname, "../data/brandList_spu.json");
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}
const writeSpuData = (data) => {
    const filePath = path.join(__dirname, '../data/spuData.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
};
module.exports = {
    readSpuData,
    readBrandList,
    writeSpuData
};