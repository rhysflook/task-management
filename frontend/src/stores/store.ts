import { configureStore } from '@reduxjs/toolkit'
import projectsReducer from './reducers/projectSlice'
import { tablesApi } from '../services/tables'
// ...

export type sliceKey = 'projects';

export const store = configureStore({
  reducer: {
	  [tablesApi.reducerPath]: tablesApi.reducer,
    projects: projectsReducer,
  },

  middleware: (getDefaultMiddleware) =>
	getDefaultMiddleware().concat(tablesApi.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch