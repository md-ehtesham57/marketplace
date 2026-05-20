export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const apiUrl = (endpoint: string) => `${API_URL}${endpoint}`;
