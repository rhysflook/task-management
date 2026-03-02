import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

function getCookieValue(name) {
	const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
	return match ? decodeURIComponent(match[2]) : null;
}
// Define a service using a base URL and expected endpoints
export const patientApi = createApi({
	reducerPath: 'patientApi',
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
	  getPatient: builder.query({
		query: (id) => `patients/${id}`,
	  }),
	  getUnits: builder.query({
		query: () => `patients/getUnits`,
	  }),
	  setPatientsBed: builder.mutation({
		query: ({ patientId, bedId }) => ({
			url: `patients/${patientId}/setBed`,
			method: 'POST',
			body: { bed_id: bedId },
		}),
	  }),
	  getStagedPatients: builder.query({
		query: () => `patients/getStaged`,
		keepUnusedDataFor: 0,  
	  }),
	  getInCallPatients: builder.query({
		query: () => `patients/getInCall`,
		keepUnusedDataFor: 0,  
	  }),
	  stagePatient: builder.mutation({
		query: ({ patientId }) => ({
			url: `patients/${patientId}/stage`,
			method: 'POST',
			body: {},
		}),
	  }),
	  unstagePatient: builder.mutation({
		query: ({ patientId, bedId }) => ({
			url: `patients/${patientId}/unstage`,
			method: 'POST',
			body: { bed_id: bedId },
		}),
	  }),
	}),
  });

  // Export hooks for usage in functional components, which are
  // auto-generated based on the defined endpoints
  export const { useGetPatientQuery, useSetPatientsBedMutation, useStagePatientMutation, stagePatient, useGetStagedPatientsQuery, useGetInCallPatientsQuery } = patientApi