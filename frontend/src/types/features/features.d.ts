import { FormConfig, FormField } from "../forms/forms";
import { TableColumn, TableConfig } from "../tables/table";

export interface FeatureConfig {
	name : string;
	table? : TableConfig;
	columns?: TableColumn[];
	form?: FormConfig;
	fields?: {[key: string]: FormField};
}

// export type FeatureConfig = Feature & TableConfig;