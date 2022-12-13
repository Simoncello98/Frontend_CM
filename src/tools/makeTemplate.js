const input = [
    'CampusName',
    'MacAddress',
    'FloorID',
    'DeviceName',
    'ISTimestamp',
    'ActionCRUD',
    'Admin',
    'DeviceAction',
]

const fs = require('fs');

fs.readFile('./template.html', 'utf8', (err, data) => {
    let output = '';
    if (err) {
        console.error(err);
        return
    }
    console.log(data);
    for (const key of input) {       
        output += data.replace(/REPLACE_ME/g, key) + '\n';
    }
    fs.writeFileSync('./output.html', output, { encoding: 'utf8', flag: 'w' })
});