import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// Define a service using a base URL and expected endpoints
export const exampleApi = createApi({
	reducerPath: 'exampleApi',
	baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api/' }),
	endpoints: (builder) => ({
	  getExample: builder.query({
		query: (id) => `examples/${id}`,
	  }),
	}),
  })

  // Export hooks for usage in functional components, which are
  // auto-generated based on the defined endpoints
  export const { useGetExampleQuery } = exampleApi