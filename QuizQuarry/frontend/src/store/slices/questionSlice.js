import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchQuestions = createAsyncThunk('question/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await api.get('/questions');
    return res.data;
  } catch (err) { return thunkAPI.rejectWithValue(err.response?.data?.message); }
});

const questionSlice = createSlice({
  name: 'question',
  initialState: { items: [], loading: false, error: null, filterByDifficulty: '' },
  reducers: {
    setDifficultyFilter: (state, action) => { state.filterByDifficulty = action.payload; }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchQuestions.pending, (state) => { state.loading = true; })
           .addCase(fetchQuestions.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
           .addCase(fetchQuestions.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});
export const { setDifficultyFilter } = questionSlice.actions;
export default questionSlice.reducer;
