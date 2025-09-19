import { createSlice } from '@reduxjs/toolkit';
import { AuthUser } from '../../types/auth/auth';
import { authApi } from '../../services/auth';
// Define a type for the slice state


interface AuthState  {
  user: AuthUser | null;
  initialized: boolean;
}


// Define the initial state using that type
const initialState: AuthState = {
  user: null,
  initialized: false
}

const authSlice = createSlice({
	name: 'auth',
	initialState,
	reducers: {
		setUser: (state, action) => {
			state.user = action.payload;
			state.initialized = true;
		},
		clearUser: (state) => {
			state.user = null;
			state.initialized = true;
		},
	},
	extraReducers: (builder) => {
		builder.addMatcher(authApi.endpoints.fetchUser.matchFulfilled, (state, action) => {
			state.user = action.payload;
			state.initialized = true;
		}
		).addMatcher(authApi.endpoints.fetchUser.matchRejected, (state) => {
			state.user = null;
			state.initialized = true;
			});
		}
});



export const { setUser, clearUser } = authSlice.actions;

export default authSlice.reducer