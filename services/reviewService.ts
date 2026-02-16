import { api } from "./api";

export const reviewService = {
    async createReview(sessionId: string, rating: number, comment?: string) {
        const res = await api.post("/reviews", {
            sessionId,
            rating,
            comment,
        });
        return res.data;
    },

    async getLawyerReviews(lawyerId: string) {
        const res = await api.get(`/reviews/${lawyerId}`);
        return res.data;
    },
};
