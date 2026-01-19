import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Android Emulator uses 10.0.2.2 to access host localhost
// For physical device, you would need your machine's local IP
const BASE_URL = Platform.select({
    android: 'http://2.56.109.167:3000/api',
    ios: 'http://2.56.109.167:3000/api',
    default: 'http://2.56.109.167:3000/api'
});

console.log('API Service initialized with URL:', BASE_URL);

interface FetchOptions extends RequestInit {
    token?: string;
    isMultipart?: boolean;
}

class ApiService {
    private async getHeaders(token?: string, isMultipart: boolean = false): Promise<HeadersInit> {
        const headers: any = {
            'Accept': 'application/json',
        };

        if (!isMultipart) {
            headers['Content-Type'] = 'application/json';
        }

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        } else {
            const storedUser = await AsyncStorage.getItem('user');
            if (storedUser) {
                const { token: storedToken } = JSON.parse(storedUser);
                if (storedToken) {
                    headers['Authorization'] = `Bearer ${storedToken}`;
                }
            }
        }

        return headers;
    }

    async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
        try {
            const url = `${BASE_URL}${endpoint}`;
            const isMultipart = options.body instanceof FormData;
            const headers = await this.getHeaders(options.token, isMultipart);

            const config: RequestInit = {
                ...options,
                headers: {
                    ...headers,
                    ...options.headers,
                },
            };

            console.log(`API Request: ${options.method || 'GET'} ${url}`);

            const response = await fetch(url, config);

            const responseData = await response.json().catch(() => ({}));

            if (!response.ok) {
                throw new Error(responseData.error || responseData.message || `Request failed with status ${response.status}`);
            }

            return responseData as T;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    get<T>(endpoint: string, token?: string) {
        return this.request<T>(endpoint, { method: 'GET', token });
    }

    post<T>(endpoint: string, body: any, token?: string) {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: body instanceof FormData ? body : JSON.stringify(body),
            token
        });
    }

    put<T>(endpoint: string, body: any, token?: string) {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: body instanceof FormData ? body : JSON.stringify(body),
            token
        });
    }

    delete<T>(endpoint: string, token?: string) {
        return this.request<T>(endpoint, { method: 'DELETE', token });
    }
}

export const api = new ApiService();
