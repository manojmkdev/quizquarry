import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchQuizzes = createAsyncThunk('quiz/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await api.get('/quizzes');
    return res.data;
  } catch (err) { return thunkAPI.rejectWithValue(err.response?.data?.message); }
});

const quizSlice = createSlice({
  name: 'quiz',
  initialState: { items: [], loading: false, error: null, searchQuery: '' },
  reducers: {
    setSearchQuery: (state, action) => { state.searchQuery = action.payload; }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchQuizzes.pending, (state) => { state.loading = true; })
           .addCase(fetchQuizzes.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
           .addCase(fetchQuizzes.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});
export const { setSearchQuery } = quizSlice.actions;
export default quizSlice.reducer;
