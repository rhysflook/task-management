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
export const formApi = createApi({
	reducerPath: 'formApi',
	baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api/',
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
	  getFormSelectOptions: builder.query<IOptions, string>({
		query: (url: string) => url,
	  }),
	  getFormData: builder.query<IFormData, string>({
		query: (url: string) => url,
	  }),
	  getRecord: builder.query<IFormData, string>({
		query: (url) => ({
		  url: url,
		  method: 'GET',
		  headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		  },
		}),
	  }),
	  createRecord: builder.mutation<
		any,
		{ url: string; data: any }
	  >({
		query: ({ url, data }) => ({
		  url: url + "/create",
		  method: 'POST',
		  body: {...data},
		  headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		  },
		}),
		transformErrorResponse: (response: ICreateErrorResponse) => {
		  if (response.status === 422) {
			return response.data.errors;
		  }
		  return { general: ['An unexpected error occurred.'] };
		},
	  }),
	  editRecord: builder.mutation<
		any,
		{ url: string; data: any }
	  >({
		query: ({ url, data }) => ({
		  url: url + "/save",
		  method: 'PUT',
		  body: data,
		  headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
		  },
		}),
			transformErrorResponse: (response: ICreateErrorResponse) => {
			if (response.status === 422) {
				return response.data.errors;
			}
			return { general: ['An unexpected error occurred.'] };
			},
		}),

		deleteRecord: builder.mutation<
			any,
			{ url: string; data: any }
		>({
			query: ({ url, data }) => ({
				url: url,
				method: 'DELETE',
				body: data,
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
				},
			})
	}),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
	useGetFormSelectOptionsQuery,
	useGetFormDataQuery,
	useGetRecordQuery,
	useCreateRecordMutation,
	useEditRecordMutation,
	useDeleteRecordMutation,
} = formApi