import { api } from './api';
import { ApiResponse } from '@/types';

export interface LikeResponse {
    liked: boolean;
    likeCount: number;
}

export const likeService = {
    async toggleLike(postId: string): Promise<LikeResponse> {
        const response = await api.post<ApiResponse<LikeResponse>>(`/posts/${postId}/like`);
        return response.data.data;
    },
};
