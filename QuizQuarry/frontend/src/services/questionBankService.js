import api from './api';

const questionBankService = {
  getAll: async () => {
    const response = await api.get('/banks');
    return response.data;
  },
  create: async (data) => {
    const response = await api.post('/banks', data);
    return response.data;
  }
};
export default questionBankService;
