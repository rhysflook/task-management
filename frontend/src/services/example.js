import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// Define a service using a base URL and expected endpoints
export const exampleApi = createApi({
	reducerPath: 'exampleApi',
	baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL + 'api/' || 'http://localhost:8000/api/' }),
	endpoints: (builder) => ({
	  getExample: builder.query({
		query: (id) => `examples/${id}`,
	  }),
	  getGroups: builder.query({
		query: () => `examples/getGroups`,
	  })
	})
  })

  // Export hooks for usage in functional components, which are
  // auto-generated based on the defined endpoints
  export const { useGetExampleQuery } = exampleApi