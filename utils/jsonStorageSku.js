const fs = require('fs');
const path = require('path');

const skuPath = path.join(__dirname, '../data/skuData.json');

exports.readSkuData = () => {
    const raw = fs.readFileSync(skuPath, 'utf-8');
    return JSON.parse(raw);
};

exports.saveSkuData = (data) => {
    fs.writeFileSync(skuPath, JSON.stringify(data, null, 2), 'utf-8');
};
