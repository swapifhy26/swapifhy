const fetch = require('node-fetch');

async function testRenderAPI() {
    try {
        const loginRes = await fetch('https://swapifhy-backend-iu0x.onrender.com/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'adityasantosh2026@gmail.com', password: 'password' }) // Assuming generic pass? I don't know the pass.
        });
        const loginData = await loginRes.json();
        console.log("Login:", loginData);
    } catch(e) {
        console.error(e);
    }
}
testRenderAPI();
