import { api } from './api';
import { ApiResponse } from '@/types';

export interface Comment {
    id: string;
    text: string;
    postId: string;
    authorId: string;
    authorAlias: string;
    authorAvatarUrl?: string;
    createdAt: string;
}

export interface CommentsResponse {
    content: Comment[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface AddCommentRequest {
    text: string;
}

export const commentService = {
    async getComments(postId: string, page: number = 0, size: number = 20): Promise<CommentsResponse> {
        const response = await api.get<ApiResponse<CommentsResponse>>(`/posts/${postId}/comments`, {
            params: { page, size }
        });
        return response.data.data;
    },

    async addComment(postId: string, data: AddCommentRequest): Promise<Comment> {
        const response = await api.post<ApiResponse<Comment>>(`/posts/${postId}/comment`, data);
        return response.data.data;
    },
};
