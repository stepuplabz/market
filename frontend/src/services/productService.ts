import { api } from './api';
import { Product } from '../types';

export const subscribeToProducts = (callback: (products: Product[]) => void) => {
    // Initial fetch
    api.get<Product[]>('/products')
        .then(products => {
            callback(products);
        })
        .catch(err => {
            console.error('Failed to fetch products:', err);
            callback([]);
        });

    return () => { };
};

export const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
        const response: any = await api.post('/products', product);
        return response.id;
    } catch (error) {
        console.error("Error adding product: ", error);
        throw error;
    }
};

export const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
        await api.put(`/products/${id}`, updates);
    } catch (error) {
        console.error("Error updating product: ", error);
        throw error;
    }
};

export const deleteProduct = async (id: string) => {
    try {
        await api.delete(`/products/${id}`);
    } catch (error) {
        console.error("Error deleting product: ", error);
        throw error;
    }
};

export const uploadProductImage = async (uri: string): Promise<string> => {
    try {
        const formData = new FormData();
        const filename = uri.split('/').pop() || 'image.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        // NOTE: In React Native, FormData parts must have { uri, name, type }
        formData.append('image', { uri, name: filename, type } as any);

        console.log('Uploading image...', filename);
        // Explicitly set header to undefined to let browser/engine set multipart boundary
        const response: any = await api.post('/products/upload', formData);
        console.log('Upload success:', response.imageUrl);
        return response.imageUrl;
    } catch (error) {
        console.error("Error uploading image: ", error);
        throw error;
    }
};
