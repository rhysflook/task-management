import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Define a service using a base URL and expected endpoints
export const tablesApi = createApi({
	reducerPath: 'tablesApi',
	baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api/' }),
	endpoints: (builder) => ({
		getRecords: builder.query({
			query: (queryString) => queryString,
		}),
	}),
})

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const { useGetRecordsQuery } = tablesApi
