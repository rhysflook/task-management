import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { TableRow } from '../types/tables/table'

export interface IRecords {
	'data': TableRow[],
	'links': {
		'self': string,
		'next': string,
		'prev': string,
	}
	'meta': {
		'total': number,
		'current_page': number,
		'last_page': number,
		'per_page': number,
	}
}
// Define a service using a base URL and expected endpoints
export const tablesApi = createApi({
	reducerPath: 'tablesApi',
	baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api/' }),
	endpoints: (builder) => ({
	  getRecords: builder.query<IRecords, string>({
		query: (queryString: string) => queryString,
	  }),
	}),
  })

  // Export hooks for usage in functional components, which are
  // auto-generated based on the defined endpoints
  export const { useGetRecordsQuery } = tablesApi