import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../../services/auth';

export const UserType = Object.freeze({
	CARE_STAFF: 1,
	NURSE: 2,
	OFFICE_STAFF: 3,
	ADMIN: 9,
	SUPERUSER: 99
});

export const isType = (user, type) => {
	return user && user.user_type === type;
}

export const inTypes = (user, types) => {
	return user && types.includes(user.user_type);
}

// Define the initial state
const initialState = {
	user: null,
	initialized: false
};

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
		builder
			.addMatcher(authApi.endpoints.fetchUser.matchFulfilled, (state, action) => {
				state.user = action.payload;
				console.log('Fetched user:', action.payload);
				state.initialized = true;
			})
			.addMatcher(authApi.endpoints.fetchUser.matchRejected, (state) => {
				state.user = null;
				state.initialized = true;
			});
	}
});

export const { setUser, clearUser } = authSlice.actions;

export default authSlice.reducer;
