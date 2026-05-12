const https = require('https');

function triggerReconcile() {
    console.log('Triggering reconciliation on Vercel...');
    https.get('https://stay-uni-kl-fyp.vercel.app/api/reconcile-beds', (res) => {
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        res.on('end', () => {
            try {
                const json = JSON.parse(data);
                console.log(JSON.stringify(json, null, 2));
                if (res.statusCode === 404) {
                    console.log('API not found yet, retrying in 10s...');
                    setTimeout(triggerReconcile, 10000);
                }
            } catch (e) {
                console.log('Error parsing JSON:', data);
                if (res.statusCode === 404) {
                    console.log('API not found yet, retrying in 10s...');
                    setTimeout(triggerReconcile, 10000);
                }
            }
        });
    }).on('error', (err) => {
        console.log('Error:', err.message);
    });
}

triggerReconcile();
