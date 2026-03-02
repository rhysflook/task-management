import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

function getCookieValue(name) {
	const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
	return match ? decodeURIComponent(match[2]) : null;
}
// Define a service using a base URL and expected endpoints
export const unitMapApi = createApi({
	reducerPath: 'unitMapApi',
	baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_API_URL + 'api/' || 'http://localhost:8000/api/' }),
	endpoints: (builder) => ({
	  getUnitMap: builder.query({
		query: () => `unitMaps`,
		keepUnusedDataFor: 0,  
	  }),
	  saveUnitMap: builder.mutation({
		query: (unitMap) => ({
		  url: 'unitMaps/save',
		  method: 'POST',
		  credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
				'Accept': 'application/json',
				'X-XSRF-TOKEN': getCookieValue('XSRF-TOKEN'),
			},
		  body: unitMap,
		}),
	  }),
	}),
  })

  // Export hooks for usage in functional components, which are
  // auto-generated based on the defined endpoints
  export const { useGetUnitMapQuery, useSaveUnitMapMutation } = unitMapApi