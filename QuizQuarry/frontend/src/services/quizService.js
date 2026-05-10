import api from './api';

const quizService = {
  getAll: async () => {
    const response = await api.get('/quizzes');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/quizzes', data);
    return response.data;
  },
  getQuestions: async (id) => {
    const response = await api.get(`/quizzes/${id}/questions`);
    return response.data;
  },
  getSettings: async (id) => {
    const response = await api.get(`/quizzes/${id}/settings`);
    return response.data;
  },
  updateSettings: async (id, data) => {
    const response = await api.put(`/quizzes/${id}/settings`, data);
    return response.data;
  },
  publish: async (id) => {
    const response = await api.put(`/quizzes/${id}/publish`);
    return response.data;
  },
  addAiQuestion: async (id) => {
    const response = await api.post(`/quizzes/${id}/add-ai-question`);
    return response.data;
  },
  updateQuestion: async (id, data) => {
    const response = await api.put(`/quizzes/questions/${id}`, data);
    return response.data;
  },
  deleteQuestion: async (id) => {
    const response = await api.delete(`/quizzes/questions/${id}`);
    return response.data;
  },
  deleteQuiz: async (id) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
  }
};
export default quizService;
