import { api } from './api';

export interface UploadResponse {
    url: string;
}

const imageService = {
    async uploadImage(file: File, folder: string = 'general'): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', folder);

        const response = await api.post<any>('/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const relativeUrl = response.data.data.url;
        // Ensure we construct a full URL if it's relative
        if (relativeUrl.startsWith('/')) {
            return `${api.defaults.baseURL?.replace('/api', '')}${relativeUrl}`;
        }
        return relativeUrl;
    },
};

export default imageService;
