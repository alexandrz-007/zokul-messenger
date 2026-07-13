const webpush = require('web-push');
const fs = require('fs');
const keys = webpush.generateVAPIDKeys();
fs.writeFileSync('vapid.json', JSON.stringify(keys));
console.log('Keys generated');
