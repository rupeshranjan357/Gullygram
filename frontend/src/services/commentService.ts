import { api } from './api';
import { ApiResponse } from '@/types';

export interface Comment {
    id: string;
    text: string;
    postId: string;
    author: {
        userId: string;
        alias: string;
        avatarUrl?: string;
    };
    createdAt: string;
}

export interface AddCommentRequest {
    text: string;
}

export const commentService = {
    async getComments(postId: string, page: number = 0, size: number = 20): Promise<Comment[]> {
        const response = await api.get<ApiResponse<Comment[]>>(`/posts/${postId}/comments`, {
            params: { page, size }
        });
        return response.data.data;
    },

    async addComment(postId: string, data: AddCommentRequest): Promise<Comment> {
        const response = await api.post<ApiResponse<Comment>>(`/posts/${postId}/comment`, data);
        return response.data.data;
    },
};
