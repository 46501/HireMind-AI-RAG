import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/api/v1";

const api = axios.create({
    baseURL: API_BASE,
});

export const uploadKnowledge = async (file: File, category: string = "general") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    const response = await api.post("/upload/knowledge", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const chatWithKB = async (query: string) => {
    const response = await api.post("/chat", { query });
    return response.data;
};

export const analyzeResume = async (resumeFile: File, jdFile?: File) => {
    const formData = new FormData();
    formData.append("resume", resumeFile);
    if (jdFile) formData.append("jd", jdFile);
    
    const response = await api.post("/analyze/resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
};

export const generateRoadmap = async (skills: string, targetRole: string) => {
    const response = await api.post("/roadmap", { skills, target_role: targetRole });
    return response.data;
};

export const getSystemStatus = async () => {
    const response = await api.get("/status");
    return response.data;
};

export const getKnowledgeBase = async () => {
    const response = await api.get("/knowledge");
    return response.data;
};

export const deleteDocument = async (filename: string) => {
    const response = await api.delete(`/knowledge/${filename}`);
    return response.data;
};

export const generateInterview = async (company: string, role: string, difficulty: string) => {
    const response = await api.post("/interview", { company, role, difficulty });
    return response.data;
};
