const fs = require("fs");
const path = require("path");

const roleDataPath = path.join(__dirname, "../data/roleData.json");

function readRoleData() {
    if (!fs.existsSync(roleDataPath)) return [];
    const data = fs.readFileSync(roleDataPath, "utf-8");
    return JSON.parse(data);
}
function writeRoleData(data) {
    fs.writeFileSync(roleDataPath, JSON.stringify(data, null, 2), 'utf-8');
}
module.exports = { readRoleData, writeRoleData };
