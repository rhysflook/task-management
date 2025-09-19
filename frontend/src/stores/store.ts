import { configureStore } from '@reduxjs/toolkit'
import projectsReducer from './reducers/projectSlice'
import authReducer from './reducers/authSlice'
import { tablesApi } from '../services/tables'
import { projectApi } from '../services/project';
import { formApi } from '../services/form';
import { authApi } from '../services/auth';
// ...

export type sliceKey = 'projects';

export const store = configureStore({
  reducer: {
    [formApi.reducerPath]: formApi.reducer,
    [tablesApi.reducerPath]: tablesApi.reducer,
    [projectApi.reducerPath]: projectApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    auth: authReducer,
    projects: projectsReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(tablesApi.middleware, projectApi.middleware, formApi.middleware, authApi.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch