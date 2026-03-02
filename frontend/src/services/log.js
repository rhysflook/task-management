import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


// Define a service using a base URL and expected endpoints
export const logApi = createApi({
	reducerPath: 'logApi',
	baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL + 'api/' || 'http://localhost:8000/api/' }),
	endpoints: (builder) => ({
	  getLog: builder.query({
		query: (id) => `logs/${id}`,
	  }),
	}),
  })

  // Export hooks for usage in functional components, which are
  // auto-generated based on the defined endpoints
  export const { useGetLogQuery } = logApi