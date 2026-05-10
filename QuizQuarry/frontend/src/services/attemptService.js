import api from './api';

const attemptService = {
  startAttempt: async (id, code) => {
    const url = code ? `/attempts/start/${id}?code=${code}` : `/attempts/start/${id}`;
    const response = await api.post(url);
    return response.data;
  },
  submitAnswer: async (attemptId, answer) => {
    const response = await api.post(`/attempts/${attemptId}/answer`, { answer });
    return response.data;
  },
  getCurrentQuestion: async (attemptId) => {
    const response = await api.get(`/attempts/${attemptId}/current-question`);
    return response.data;
  },
  recordTabSwitch: async (attemptId) => {
    const response = await api.post(`/attempts/${attemptId}/tab-switch`);
    return response.data;
  },
  submitAttempt: async (id) => {
    const response = await api.post(`/attempts/${id}/submit`);
    return response.data;
  },
  getResults: async (id) => {
    const response = await api.get(`/attempts/results/${id}`);
    return response.data;
  },
  getInstructorReport: async () => {
    const response = await api.get('/attempts/instructor-report');
    return response.data;
  },
  getInstructorResult: async (id) => {
    const response = await api.get(`/attempts/instructor-results/${id}`);
    return response.data;
  },
  getLeaderboard: async () => {
    const response = await api.get('/attempts/leaderboard');
    return response.data;
  },
  getQuizStats: async () => {
    const response = await api.get('/attempts/submission-stats');
    return response.data;
  },
  getMyHistory: async () => {
    const response = await api.get('/attempts/my-history');
    return response.data;
  }
};
export default attemptService;
