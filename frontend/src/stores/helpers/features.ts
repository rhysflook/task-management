import { FeatureConfig } from "../../types/features/features";

export const getFeatureInitialState = (features: string[]) => {
	const state: FeatureConfig = {
		...features.reduce((acc, feature) => {
			switch (feature) {
				case 'table':
					acc.table = {
						records: [],
						links: {
							self: "",
							next: "",
							prev: "",
						},
						meta: {
							total: 0,
							current_page: 1,
							last_page: 0,
							per_page: 5,
						},
					};
					break;
				case 'form':
					acc.form = {};
					break;
				default:
					break;
			}
			return acc;
		}, {} as any),
	};
	return state;
}