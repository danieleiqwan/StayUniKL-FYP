const http = require('http');

http.get('http://localhost:3000/api/billing/invoices', (res) => {
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.invoices) {
                console.log('Total Invoices:', json.invoices.length);
            } else {
                console.log('Response:', data);
            }
        } catch (e) {
            console.log('Error parsing JSON:', data);
        }
    });
}).on('error', (err) => {
    console.log('Error:', err.message);
});
