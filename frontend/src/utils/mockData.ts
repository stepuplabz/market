import { Category, Product } from '../types';

export const CATEGORIES: Category[] = [
    { id: '1', name: 'Manav', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=200' },
    { id: '2', name: 'Süt & Kahvaltılık', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=200' },
    { id: '3', name: 'Atıştırmalık', image: 'https://images.unsplash.com/photo-1621939514649-28edd73f6074?auto=format&fit=crop&q=80&w=200' },
    { id: '4', name: 'İçecekler', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=200' },
    { id: '5', name: 'Temizlik', image: 'https://plus.unsplash.com/premium_photo-1677685608754-0016e78fc725?q=80&w=200&auto=format&fit=crop' },
];

export const PRODUCTS: Product[] = [
    {
        id: '101',
        name: 'Salkım Domates',
        brand: 'Yerli Üretim',
        description: 'Antalya seralarından taze toplanmış.',
        barcode: '8690001',
        category: '1',
        price: 25.0,
        originalPrice: 35.0,
        isCampaign: true,
        stock: 50,
        unitType: 'kg',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=300'
    },
    {
        id: '102',
        name: 'Çengelköy Salatalık',
        brand: 'Bahçeden',
        description: 'Kıtır kıtır taze salatalık.',
        barcode: '8690002',
        category: '1',
        price: 20.0,
        stock: 30,
        unitType: 'kg',
        imageUrl: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?auto=format&fit=crop&q=80&w=300'
    },
    {
        id: '103',
        name: 'Tam Yağlı Süt (1L)',
        brand: 'İçim',
        description: 'Pastörize günlük süt.',
        barcode: '8690003',
        category: '2',
        price: 22.5,
        stock: 100,
        unitType: 'piece',
        imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=300'
    },
    {
        id: '104',
        name: 'Gezen Tavuk Yumurtası (15li)',
        brand: 'Koru',
        description: 'L Boy, doğal yumurta.',
        barcode: '8690004',
        category: '2',
        price: 65.0,
        stock: 20,
        unitType: 'piece',
        imageUrl: 'https://images.unsplash.com/photo-1506976785307-8d3520fbee8c?auto=format&fit=crop&q=80&w=300'
    },
    {
        id: '105',
        name: 'Patates Cipsi Klasik',
        brand: 'Lays',
        description: 'Büyük boy paket.',
        barcode: '8690005',
        category: '3',
        price: 15.0,
        originalPrice: 20.0,
        isCampaign: true,
        stock: 200,
        unitType: 'piece',
        imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=300'
    },
    {
        id: '106',
        name: 'Cola Zero (1L)',
        brand: 'Coca Cola',
        description: 'Şekersiz lezzet.',
        barcode: '8690006',
        category: '4',
        price: 30.0,
        stock: 0, // Out of stock test
        unitType: 'piece',
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=300'
    },
];
