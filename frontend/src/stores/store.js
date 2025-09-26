import { configureStore } from '@reduxjs/toolkit'
import authReducer from './reducers/authSlice'
import exampleReducer, { exampleS } from './reducers/exampleSlice'
import { tablesApi } from '../services/tables'
import { formApi } from '../services/form';
import { authApi } from '../services/auth';
import { exampleApi } from '../services/example';

export const store = configureStore({
  reducer: {
    [formApi.reducerPath]: formApi.reducer,
    [tablesApi.reducerPath]: tablesApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [exampleApi.reducerPath]: exampleApi.reducer,
    auth: authReducer,
    examples: exampleReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tablesApi.middleware, formApi.middleware, authApi.middleware, exampleApi.middleware),
})

export const slices = {
  'examples': exampleS.selectors,
};

export const actions = {
  'examples': exampleS.actions,
};


