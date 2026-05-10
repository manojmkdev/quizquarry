import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchBanks = createAsyncThunk('questionBank/fetchAll', async (_, thunkAPI) => {
  try {
    const res = await api.get('/banks');
    return res.data;
  } catch (err) { return thunkAPI.rejectWithValue(err.response?.data?.message); }
});

const questionBankSlice = createSlice({
  name: 'questionBank',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchBanks.pending, (state) => { state.loading = true; })
           .addCase(fetchBanks.fulfilled, (state, action) => { state.loading = false; state.items = action.payload; })
           .addCase(fetchBanks.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  }
});
export default questionBankSlice.reducer;
