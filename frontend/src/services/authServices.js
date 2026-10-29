import api from "./api";

export const signupUser = async (data) => (await api.post("/auth/signup", data)).data;
export const loginUser = async (data) => (await api.post("/auth/login", data)).data;
export const forgotPassword = async (data) => (await api.post("/auth/forgot-password", data)).data;
export const resetPassword = async (data) => (await api.post("/auth/reset-password", data)).data;
export const changeTemporaryPassword = async (data) =>
  (await api.post("/auth/change-temporary-password", data)).data;
export const createTrainer = async (data) =>
  (await api.post("/admin/trainers", data)).data;
