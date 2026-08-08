import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import { setAuthToken } from '../utils/authToken';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

store.subscribe(() => {
  setAuthToken(store.getState().auth.accessToken);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;