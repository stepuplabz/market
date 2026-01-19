const sequelize = require('../config/database');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Order = require('../models/Order');
const bcrypt = require('bcryptjs');

const categories = [
    { name: 'Meyve & Sebze', icon: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=500&q=80' },
    { name: 'Süt & Kahvaltılık', icon: 'https://cdn-icons-png.flaticon.com/512/2674/2674486.png', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&q=80' },
    { name: 'Temel Gıda', icon: 'https://cdn-icons-png.flaticon.com/512/2276/2276931.png', image: 'https://images.unsplash.com/photo-1584263347416-85a696b4eda7?w=500&q=80' },
    { name: 'Atıştırmalık', icon: 'https://cdn-icons-png.flaticon.com/512/2553/2553691.png', image: 'https://images.unsplash.com/photo-1621939514649-28b12e816751?w=500&q=80' },
    { name: 'İçecek', icon: 'https://cdn-icons-png.flaticon.com/512/3050/3050130.png', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80' },
    { name: 'Temizlik', icon: 'https://cdn-icons-png.flaticon.com/512/2636/2636253.png', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&q=80' },
    { name: 'Kişisel Bakım', icon: 'https://cdn-icons-png.flaticon.com/512/3050/3050239.png', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=500&q=80' },
    { name: 'Bebek Bakım', icon: 'https://cdn-icons-png.flaticon.com/512/2916/2916315.png', image: 'https://images.unsplash.com/photo-1515488042361-25f4682ae2c9?w=500&q=80' },
    { name: 'Ev & Yaşam', icon: 'https://cdn-icons-png.flaticon.com/512/2553/2553642.png', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&q=80' },
    { name: 'Teknoloji', icon: 'https://cdn-icons-png.flaticon.com/512/2916/2916315.png', image: 'https://images.unsplash.com/photo-1468495244123-6c6ef332ad63?w=500&q=80' }
];

const products = [
    { name: 'Domates', price: 24.90, category: 'Meyve & Sebze', unit: 'kg', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80' },
    { name: 'Salatalık', price: 18.50, category: 'Meyve & Sebze', unit: 'kg', image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500&q=80' },
    { name: 'Muz', price: 32.90, category: 'Meyve & Sebze', unit: 'kg', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a8622e?w=500&q=80' },
    { name: 'Süt (1L)', price: 22.50, category: 'Süt & Kahvaltılık', unit: 'adet', image: 'https://images.unsplash.com/photo-1635425730507-ecd1e8856c8e?w=500&q=80' },
    { name: 'Yumurta (30lu)', price: 95.00, category: 'Süt & Kahvaltılık', unit: 'koli', image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&q=80' },
    { name: 'Beyaz Peynir', price: 145.00, category: 'Süt & Kahvaltılık', unit: 'kg', image: 'https://images.unsplash.com/photo-1625937746413-b56570659a85?w=500&q=80' },
    { name: 'Ayçiçek Yağı (2L)', price: 85.00, category: 'Temel Gıda', unit: 'adet', image: 'https://images.unsplash.com/photo-1620706857370-e1b9fb92cee9?w=500&q=80' },
    { name: 'Pirinç (1kg)', price: 45.00, category: 'Temel Gıda', unit: 'adet', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80' },
    { name: 'Makarna', price: 12.50, category: 'Temel Gıda', unit: 'paket', image: 'https://images.unsplash.com/photo-1616035212351-1cb34c449192?w=500&q=80' },
    { name: 'Cips', price: 25.00, category: 'Atıştırmalık', unit: 'paket', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80' },
    { name: 'Çikolata', price: 15.00, category: 'Atıştırmalık', unit: 'adet', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80' },
    { name: 'Kola (2.5L)', price: 40.00, category: 'İçecek', unit: 'adet', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80' },
    { name: 'Su (5L)', price: 15.00, category: 'İçecek', unit: 'adet', image: 'https://images.unsplash.com/photo-1616118132534-381148898bb4?w=500&q=80' },
    { name: 'Bulaşık Deterjanı', price: 55.00, category: 'Temizlik', unit: 'adet', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&q=80' },
    { name: 'Çamaşır Suyu', price: 45.00, category: 'Temizlik', unit: 'adet', image: 'https://images.unsplash.com/photo-1585834854930-b3017a0a6598?w=500&q=80' }
];

const seedData = async () => {
    try {
        await sequelize.sync({ force: true });
        console.log('Veritabanı temizlendi ve senkronize edildi.');

        // Admin oluştur
        const adminPassword = await bcrypt.hash('123456', 10);
        await User.create({
            name: 'Admin User',
            email: 'admin@market.com',
            password: adminPassword,
            role: 'admin',
            phone: '5551112233'
        });
        console.log('Admin kullanıcısı oluşturuldu: admin@market.com / 123456');

        // Normal kullanıcı oluştur
        const userPassword = await bcrypt.hash('123456', 10);
        await User.create({
            name: 'Test User',
            email: 'user@market.com',
            password: userPassword,
            role: 'user',
            phone: '5554445566'
        });
        console.log('Test kullanıcısı oluşturuldu: user@market.com / 123456');

        // Kategorileri ekle
        for (const cat of categories) {
            await Category.create(cat);
        }
        console.log(`${categories.length} kategori eklendi.`);

        // Ürünleri ekle
        for (const prod of products) {
            const category = await Category.findOne({ where: { name: prod.category } });
            if (category) {
                await Product.create({
                    name: prod.name,
                    price: prod.price,
                    description: `${prod.name} açıklaması`,
                    stock: 100,
                    imageUrl: prod.image,
                    categoryId: category.id,
                    unitType: prod.unit,
                    isCampaign: Math.random() < 0.3, // %30 ihtimalle kampanyalı
                    discountPrice: prod.price * 0.8
                });
            }
        }
        console.log(`${products.length} ürün eklendi.`);

        console.log('SEED COMPLETED');
        process.exit(0);

    } catch (error) {
        console.error('Seed hatası:', error);
        process.exit(1);
    }
};

seedData();
