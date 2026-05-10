import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchInstructorReports = createAsyncThunk('attempt/reports', async (_, thunkAPI) => {
  try {
    const res = await api.get('/attempts/instructor-report');
    return res.data;
  } catch (err) { return thunkAPI.rejectWithValue(err.response?.data?.message); }
});

const attemptSlice = createSlice({
  name: 'attempt',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchInstructorReports.pending, (state) => { state.loading = true; })
           .addCase(fetchInstructorReports.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
           .addCase(fetchInstructorReports.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});
export default attemptSlice.reducer;
