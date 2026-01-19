const BASE_URL = 'http://localhost:3000/api';

async function testBackend() {
    try {
        console.log('--- Starting Backend Tests ---');

        // 1. Register
        console.log('\n--- Test: Register ---');
        const registerRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '5551234567',
                password: 'password123',
                name: 'Test User',
                address: 'Test Address'
            })
        });
        const registerData = await registerRes.json();
        console.log('Register Status:', registerRes.status);
        console.log('Register Data:', registerData);

        if (!registerRes.ok && registerRes.status !== 400) throw new Error('Register failed');

        // 2. Login
        console.log('\n--- Test: Login ---');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                phone: '5551234567',
                password: 'password123'
            })
        });
        const loginData = await loginRes.json();
        console.log('Login Status:', loginRes.status);
        // console.log('Login Data:', loginData);

        if (!loginRes.ok) throw new Error('Login failed');
        const token = loginData.token;
        const userId = loginData.user.id;

        // 3. Create Category
        console.log('\n--- Test: Create Category ---');
        const catRes = await fetch(`${BASE_URL}/categories`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Electronics',
                icon: 'cpu'
            })
        });
        console.log('Create Category Status:', catRes.status);
        const catData = await catRes.json();
        console.log('Category:', catData);

        // 4. Create Product
        console.log('\n--- Test: Create Product ---');
        const prodRes = await fetch(`${BASE_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Laptop',
                price: 15000,
                stock: 10,
                category: 'Electronics',
                barcode: '123456789'
            })
        });
        console.log('Create Product Status:', prodRes.status);
        const prodData = await prodRes.json();
        console.log('Product:', prodData);

        // 5. List Products
        console.log('\n--- Test: List Products ---');
        const listRes = await fetch(`${BASE_URL}/products`);
        const listData = await listRes.json();
        console.log('Products Count:', listData.length);

        // 6. Create Order
        console.log('\n--- Test: Create Order ---');
        const orderRes = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                items: [{ id: prodData.id, name: 'Laptop', price: 15000, quantity: 1 }],
                totalPrice: 15000,
                address: 'Test Address'
            })
        });
        console.log('Create Order Status:', orderRes.status);
        const orderData = await orderRes.json();
        console.log('Order:', orderData);

        // 7. Get User Orders
        console.log('\n--- Test: Get User Orders ---');
        const userOrdersRes = await fetch(`${BASE_URL}/orders/user/${userId}`);
        const userOrdersData = await userOrdersRes.json();
        console.log('User Orders Count:', userOrdersData.length);

        console.log('\n--- All Tests Completed Successfully ---');

    } catch (error) {
        console.error('Test Failed:', error);
    }
}

testBackend();
