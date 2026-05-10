import api from './api';

const questionService = {
  getAll: async () => {
    const response = await api.get('/questions');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/questions', data);
    return response.data;
  },
  generateAiQuestions: async (data) => {
    const response = await api.post('/questions/ai-generate', data);
    return response.data;
  },
  getExplanation: async (id) => {
    const response = await api.get(`/questions/${id}/explanation`);
    return response.data;
  }
};
export default questionService;
