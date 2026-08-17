const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n=== VAPID Keys Generated ===\n');
console.log('Add these to your .env file:\n');
console.log('REACT_APP_VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PUBLIC_KEY=' + vapidKeys.publicKey);
console.log('VAPID_PRIVATE_KEY=' + vapidKeys.privateKey);
console.log('VAPID_EMAIL=your-email@example.com\n');
console.log('Public Key (for frontend): ' + vapidKeys.publicKey + '\n');
console.log('Private Key (keep secure!): ' + vapidKeys.privateKey + '\n');
