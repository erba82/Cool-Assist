import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

// دمی ریدوسر برای تست
const dummyReducer = (state = {}, action: any) => state;

const rootReducer = combineReducers({
  dummy: dummyReducer,
  // ریدوسرهای واقعی را اینجا اضافه کنید
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;