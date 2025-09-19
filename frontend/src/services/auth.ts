import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface SelectOption {
	name: string;
	value: string;
}

export interface IOptions {
	data: SelectOption[];
}

export interface IFormData {
	data: {
		options?: IOptions[];
		record?: any;
	}
}

export interface ICreateErrorResponse {
	status: number;
	data: {
		errors: Record<string, string[]>
	}
}

function getCookieValue(name: string): string | null {
	const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
	return match ? decodeURIComponent(match[2]) : null;
  }
// Define a service using a base URL and expected endpoints
export const authApi = createApi({
	reducerPath: 'authApi',
	baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/',
	credentials: 'include',
	prepareHeaders: (headers) => {
      const xsrfToken = getCookieValue('XSRF-TOKEN');
      if (xsrfToken) {
        headers.set('X-XSRF-TOKEN', xsrfToken);
      }
	  headers.set('Accept', 'application/json');
	  headers.set('Content-Type', 'application/json');
	  headers.set('X-Requested-With', 'XMLHttpRequest');
      return headers;
	},
	 }),
	 endpoints: (builder) => ({
		getCsrfToken: builder.query<void, void>({
		  query: () => 'sanctum/csrf-cookie',
		}),
		login: builder.mutation<void, { email: string; password: string }>({
		  query: (credentials) => ({
			url: '/login',
			method: 'POST',
			credentials: 'include',
			headers: {
			  'Content-Type': 'application/json',
			  'Accept': 'application/json',
			},
			body: credentials,
		  }),
		}),
		register: builder.mutation<void, { name: string; email: string; password: string; password_confirmation: string }>({
		  query: (credentials) => ({
			url: '/register',
			method: 'POST',
			body: credentials,
			credentials: 'include'
		  }),
		}),
		logout: builder.mutation<void, void>({
		  query: () => ({
			url: '/logout',
			method: 'POST',
			credentials: 'include'
		  }),
		}),
		fetchUser: builder.query<any, void>({
		  query: () => '/api/user',

		}),
	  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
	useGetCsrfTokenQuery,
	useLazyGetCsrfTokenQuery,
	useLoginMutation,
	useRegisterMutation,
	useLogoutMutation,
	useFetchUserQuery,
	useLazyFetchUserQuery,
} = authApi