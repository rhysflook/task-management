import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Project } from '../types/projects/project'

export interface IProject {
	data: Project
}
// Define a service using a base URL and expected endpoints
export const projectApi = createApi({
	reducerPath: 'projectApi',
	baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:8000/api/' }),
	endpoints: (builder) => ({
	  getProject: builder.query<IProject, string>({
		query: (id: string) => `projects/${id}`,
	  }),
	}),
  })

  // Export hooks for usage in functional components, which are
  // auto-generated based on the defined endpoints
  export const { useGetProjectQuery } = projectApi