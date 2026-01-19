require('dotenv').config();
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
    { name: 'Kişisel Bakım', icon: 'https://cdn-icons-png.flaticon.com/512/3050/3050239.png', image: 'https://images.unsplash.com/photo-1556228578-8c89b535b738?w=500&q=80' },
    { name: 'Bebek Bakım', icon: 'https://cdn-icons-png.flaticon.com/512/2916/2916315.png', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&q=80' },
    { name: 'Ev & Yaşam', icon: 'https://cdn-icons-png.flaticon.com/512/2553/2553642.png', image: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=500&q=80' },
    { name: 'Teknoloji', icon: 'https://cdn-icons-png.flaticon.com/512/2916/2916315.png', image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=500&q=80' }
];

const products = [
    // Meyve & Sebze (9 items)
    { name: 'Ejder Meyvesi', price: 85.00, category: 'Meyve & Sebze', unit: 'adet', image: 'https://images.unsplash.com/photo-1527325678964-54921661f888?w=500&q=80' },
    { name: 'Domates', price: 24.90, category: 'Meyve & Sebze', unit: 'kg', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&q=80' },
    { name: 'Salatalık', price: 18.50, category: 'Meyve & Sebze', unit: 'kg', image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=500&q=80' },
    { name: 'Muz', price: 32.90, category: 'Meyve & Sebze', unit: 'kg', image: 'https://images.unsplash.com/photo-1603833665858-e61d17a8622e?w=500&q=80' },
    { name: 'Elma (Amasya)', price: 22.00, category: 'Meyve & Sebze', unit: 'kg', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&q=80' },
    { name: 'Portakal', price: 15.00, category: 'Meyve & Sebze', unit: 'kg', image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=500&q=80' },
    { name: 'Avokado', price: 45.00, category: 'Meyve & Sebze', unit: 'adet', image: 'https://images.unsplash.com/photo-1523049673856-428631a9b52c?w=500&q=80' },
    { name: 'Patates', price: 14.50, category: 'Meyve & Sebze', unit: 'kg', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=500&q=80' },
    { name: 'Soğan', price: 12.00, category: 'Meyve & Sebze', unit: 'kg', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa829?w=500&q=80' },

    // Süt & Kahvaltılık (9 items)
    { name: 'Süt (1L)', price: 22.50, category: 'Süt & Kahvaltılık', unit: 'adet', image: 'https://images.unsplash.com/photo-1635425730507-ecd1e8856c8e?w=500&q=80' },
    { name: 'Yumurta (30lu)', price: 95.00, category: 'Süt & Kahvaltılık', unit: 'koli', image: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?w=500&q=80' },
    { name: 'Beyaz Peynir', price: 145.00, category: 'Süt & Kahvaltılık', unit: 'kg', image: 'https://images.unsplash.com/photo-1625937746413-b56570659a85?w=500&q=80' },
    { name: 'Kaşar Peyniri', price: 210.00, category: 'Süt & Kahvaltılık', unit: 'kg', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&q=80' },
    { name: 'Zeytin (Siyah)', price: 120.00, category: 'Süt & Kahvaltılık', unit: 'kg', image: 'https://images.unsplash.com/photo-1563630423918-b58f07336ac9?w=500&q=80' },
    { name: 'Bal', price: 180.00, category: 'Süt & Kahvaltılık', unit: 'kavanoz', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&q=80' },
    { name: 'Tereyağı', price: 250.00, category: 'Süt & Kahvaltılık', unit: 'kg', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=500&q=80' },
    { name: 'Reçel (Çilek)', price: 65.00, category: 'Süt & Kahvaltılık', unit: 'kavanoz', image: 'https://images.unsplash.com/photo-1598155523122-3842334d6c10?w=500&q=80' },
    { name: 'Labne', price: 45.00, category: 'Süt & Kahvaltılık', unit: 'adet', image: 'https://images.unsplash.com/photo-1517436039564-9f26834b6e56?w=500&q=80' },

    // Temel Gıda (9 items)
    { name: 'Ayçiçek Yağı (2L)', price: 85.00, category: 'Temel Gıda', unit: 'adet', image: 'https://images.unsplash.com/photo-1620706857370-e1b9fb92cee9?w=500&q=80' },
    { name: 'Pirinç (1kg)', price: 45.00, category: 'Temel Gıda', unit: 'paket', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80' },
    { name: 'Makarna', price: 12.50, category: 'Temel Gıda', unit: 'paket', image: 'https://images.unsplash.com/photo-1616035212351-1cb34c449192?w=500&q=80' },
    { name: 'Bulgur', price: 22.00, category: 'Temel Gıda', unit: 'paket', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&q=80' },
    { name: 'Mercimek (Kırmızı)', price: 35.00, category: 'Temel Gıda', unit: 'paket', image: 'https://images.unsplash.com/photo-1515543904379-3d757afe9c6c?w=500&q=80' },
    { name: 'Un (5kg)', price: 75.00, category: 'Temel Gıda', unit: 'paket', image: 'https://images.unsplash.com/photo-1501198906969-9daea1d33c56?w=500&q=80' },
    { name: 'Toz Şeker (3kg)', price: 85.00, category: 'Temel Gıda', unit: 'paket', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80' },
    { name: 'Salça', price: 45.00, category: 'Temel Gıda', unit: 'kavanoz', image: 'https://images.unsplash.com/photo-1596483584992-563b01e3097f?w=500&q=80' },
    { name: 'Kuru Fasulye', price: 40.00, category: 'Temel Gıda', unit: 'paket', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=500&q=80' },

    // Atıştırmalık (9 items)
    { name: 'Cips (Klasik)', price: 25.00, category: 'Atıştırmalık', unit: 'paket', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&q=80' },
    { name: 'Cips (Baharatlı)', price: 25.00, category: 'Atıştırmalık', unit: 'paket', image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=500&q=80' },
    { name: 'Çikolata', price: 15.00, category: 'Atıştırmalık', unit: 'adet', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&q=80' },
    { name: 'Popcorn', price: 20.00, category: 'Atıştırmalık', unit: 'paket', image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=500&q=80' },
    { name: 'Bisküvi', price: 12.00, category: 'Atıştırmalık', unit: 'paket', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=500&q=80' },
    { name: 'Kraker', price: 10.00, category: 'Atıştırmalık', unit: 'paket', image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=500&q=80' },
    { name: 'Sakız', price: 5.00, category: 'Atıştırmalık', unit: 'paket', image: 'https://images.unsplash.com/photo-1608681288424-6f91723f536c?w=500&q=80' },
    { name: 'Kuruyemiş (Karışık)', price: 65.00, category: 'Atıştırmalık', unit: 'paket', image: 'https://images.unsplash.com/photo-1604543167191-236717462e7d?w=500&q=80' },
    { name: 'Gofret', price: 8.00, category: 'Atıştırmalık', unit: 'adet', image: 'https://images.unsplash.com/photo-1594917573678-842245b73489?w=500&q=80' },

    // İçecek (9 items)
    { name: 'Kola (2.5L)', price: 40.00, category: 'İçecek', unit: 'adet', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500&q=80' },
    { name: 'Su (5L)', price: 15.00, category: 'İçecek', unit: 'adet', image: 'https://images.unsplash.com/photo-1616118132534-381148898bb4?w=500&q=80' },
    { name: 'Maden Suyu (6lı)', price: 30.00, category: 'İçecek', unit: 'paket', image: 'https://images.unsplash.com/photo-1632734181373-35607073b981?w=500&q=80' },
    { name: 'Meyve Suyu (1L)', price: 28.00, category: 'İçecek', unit: 'adet', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500&q=80' },
    { name: 'Soğuk Çay', price: 20.00, category: 'İçecek', unit: 'adet', image: 'https://images.unsplash.com/photo-1597818919669-e70a311b70d4?w=500&q=80' },
    { name: 'Enerji İçeceği', price: 35.00, category: 'İçecek', unit: 'adet', image: 'https://images.unsplash.com/photo-1622543925251-d96bdd9116db?w=500&q=80' },
    { name: 'Türk Kahvesi', price: 45.00, category: 'İçecek', unit: 'paket', image: 'https://images.unsplash.com/photo-1587080413959-06b859fb107d?w=500&q=80' },
    { name: 'Ççay (1kg)', price: 135.00, category: 'İçecek', unit: 'paket', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&q=80' },
    { name: 'Limonata', price: 25.00, category: 'İçecek', unit: 'adet', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&q=80' },

    // Temizlik (9 items)
    { name: 'Bulaşık Deterjanı', price: 55.00, category: 'Temizlik', unit: 'adet', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=500&q=80' },
    { name: 'Çamaşır Suyu', price: 45.00, category: 'Temizlik', unit: 'adet', image: 'https://images.unsplash.com/photo-1585834854930-b3017a0a6598?w=500&q=80' },
    { name: 'Yüzey Temizleyici', price: 35.00, category: 'Temizlik', unit: 'adet', image: 'https://images.unsplash.com/photo-1584620022718-472d49925264?w=500&q=80' },
    { name: 'Kağıt Havlu (6lı)', price: 65.00, category: 'Temizlik', unit: 'paket', image: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=500&q=80' },
    { name: 'Tuvalet Kağıdı (12li)', price: 95.00, category: 'Temizlik', unit: 'paket', image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=500&q=80' },
    { name: 'Bulaşık Süngeri', price: 15.00, category: 'Temizlik', unit: 'paket', image: 'https://images.unsplash.com/photo-1585670146937-be41838637e6?w=500&q=80' },
    { name: 'Çöp Torbası', price: 18.00, category: 'Temizlik', unit: 'rulo', image: 'https://images.unsplash.com/photo-1605634628286-9dcdd0d5006e?w=500&q=80' },
    { name: 'Oda Spreyi', price: 45.00, category: 'Temizlik', unit: 'adet', image: 'https://images.unsplash.com/photo-1601618213601-5262740bc1c7?w=500&q=80' },
    { name: 'Sıvı Sabun', price: 30.00, category: 'Temizlik', unit: 'adet', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&q=80' },

    // Kişisel Bakım (9 items)
    { name: 'Şampuan', price: 85.00, category: 'Kişisel Bakım', unit: 'adet', image: 'https://images.unsplash.com/photo-1585232561307-d9f300d41334?w=500&q=80' },
    { name: 'Diş Macunu', price: 45.00, category: 'Kişisel Bakım', unit: 'adet', image: 'https://images.unsplash.com/photo-1559599189-fe84fea4eb8b?w=500&q=80' },
    { name: 'Diş Fırçası', price: 25.00, category: 'Kişisel Bakım', unit: 'adet', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=500&q=80' },
    { name: 'Duş Jeli', price: 65.00, category: 'Kişisel Bakım', unit: 'adet', image: 'https://images.unsplash.com/photo-1556228720-1987bad52b36?w=500&q=80' },
    { name: 'El Kremi', price: 40.00, category: 'Kişisel Bakım', unit: 'adet', image: 'https://images.unsplash.com/photo-1616400669865-b1c4e9702ba0?w=500&q=80' },
    { name: 'Deodorant', price: 80.00, category: 'Kişisel Bakım', unit: 'adet', image: 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=500&q=80' },
    { name: 'Pamuk', price: 15.00, category: 'Kişisel Bakım', unit: 'paket', image: 'https://images.unsplash.com/photo-1584984187010-8b0124e4d41e?w=500&q=80' },
    { name: 'Tıraş Köpüğü', price: 55.00, category: 'Kişisel Bakım', unit: 'adet', image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500&q=80' },
    { name: 'Saç Kremi', price: 90.00, category: 'Kişisel Bakım', unit: 'adet', image: 'https://images.unsplash.com/photo-1571781564998-d14d13c9e64e?w=500&q=80' },

    // Bebek Bakım (9 items)
    { name: 'Bebek Bezi (40lı)', price: 250.00, category: 'Bebek Bakım', unit: 'paket', image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=500&q=80' },
    { name: 'Islak Mendil', price: 25.00, category: 'Bebek Bakım', unit: 'paket', image: 'https://images.unsplash.com/photo-1621317757321-482bc6a3f486?w=500&q=80' },
    { name: 'Bebek Şampuanı', price: 75.00, category: 'Bebek Bakım', unit: 'adet', image: 'https://images.unsplash.com/photo-1556228852-6d35a585d566?w=500&q=80' },
    { name: 'Bebek Maması', price: 120.00, category: 'Bebek Bakım', unit: 'kavanoz', image: 'https://images.unsplash.com/photo-1594917573678-842245b73489?w=500&q=80' }, // fallback image
    { name: 'Biberon', price: 110.00, category: 'Bebek Bakım', unit: 'adet', image: 'https://images.unsplash.com/photo-1595166664921-6831d683785d?w=500&q=80' },
    { name: 'Emzik', price: 45.00, category: 'Bebek Bakım', unit: 'adet', image: 'https://images.unsplash.com/photo-1584984187010-8b0124e4d41e?w=500&q=80' }, // fallback
    { name: 'Pişik Kremi', price: 55.00, category: 'Bebek Bakım', unit: 'adet', image: 'https://images.unsplash.com/photo-1556228578-8c89b535b738?w=500&q=80' },
    { name: 'Bebek Yağı', price: 65.00, category: 'Bebek Bakım', unit: 'adet', image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfbc8?w=500&q=80' },
    { name: 'Bebek Pudrası', price: 40.00, category: 'Bebek Bakım', unit: 'adet', image: 'https://images.unsplash.com/photo-1515488042361-25f4682ae2c9?w=500&q=80' },

    // Teknoloji (9 items)
    { name: 'USB Kablo', price: 120.00, category: 'Teknoloji', unit: 'adet', image: 'https://images.unsplash.com/photo-1610484826967-09c5720778c7?w=500&q=80' },
    { name: 'Kulaklık', price: 450.00, category: 'Teknoloji', unit: 'adet', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' },
    { name: 'Powerbank', price: 350.00, category: 'Teknoloji', unit: 'adet', image: 'https://images.unsplash.com/photo-1609091839311-d5365525044c?w=500&q=80' },
    { name: 'Şarj Adaptörü', price: 180.00, category: 'Teknoloji', unit: 'adet', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=500&q=80' },
    { name: 'Mouse', price: 250.00, category: 'Teknoloji', unit: 'adet', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80' },
    { name: 'Klavye', price: 400.00, category: 'Teknoloji', unit: 'adet', image: 'https://images.unsplash.com/photo-1587829741301-dc798b91add1?w=500&q=80' },
    { name: 'HDMI Kablo', price: 90.00, category: 'Teknoloji', unit: 'adet', image: 'https://images.unsplash.com/photo-1558230635-c60317e08215?w=500&q=80' }, // similar to cables
    { name: 'Telefon Kılıfı', price: 100.00, category: 'Teknoloji', unit: 'adet', image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=500&q=80' },
    { name: 'Ekran Koruyucu', price: 75.00, category: 'Teknoloji', unit: 'adet', image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=500&q=80' }
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
