import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'


// Define a service using a base URL and expected endpoints
export const clientApi = createApi({
	reducerPath: 'clientApi',
	baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL + 'api/' || 'http://localhost:8000/api/' }),
	endpoints: (builder) => ({
	  getClient: builder.query({
		query: (id) => `clients/${id}`,
	  }),
	  getAllClientsIsAlive: builder.query({
		query: () => '/clients/check/allIsAlive',
	  }),
	}),
  })

  // Export hooks for usage in functional components, which are
  // auto-generated based on the defined endpoints
  export const { useGetClientQuery, useGetAllClientsIsAliveQuery } = clientApi