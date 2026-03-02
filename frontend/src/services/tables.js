import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

function getCookieValue(name) {
	const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
	return match ? decodeURIComponent(match[2]) : null;
}
// Define a service using a base URL and expected endpoints
export const tablesApi = createApi({
	reducerPath: 'tablesApi',
	baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL + 'api/' || 'http://localhost:8000/api/',
		credentials: 'include', // 👈 Send cookies (e.g. for Laravel Sanctum)
		prepareHeaders: (headers) => {
			const xsrfToken = getCookieValue('XSRF-TOKEN');
			if (xsrfToken) {
				headers.set('X-XSRF-TOKEN', xsrfToken);
			}
			return headers;
		},
	 }),
	endpoints: (builder) => ({
		getRecords: builder.query({
			query: (queryString) => queryString,
		}),
		deleteRecord: builder.mutation({
			query: ({ url, data }) => ({
				url: url,
				method: 'DELETE',
				body: data,
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
			}),
		}),
		checkIfCanDelete: builder.mutation({
			query: ({ url }) => ({
				url: url,
			}),
		}),
	}),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetRecordsQuery, useDeleteRecordMutation, useCheckIfCanDeleteMutation } = tablesApi
