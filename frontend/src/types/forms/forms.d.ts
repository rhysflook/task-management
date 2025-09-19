export interface FormConfig {
	fields: {
		[key: string]: FormField;
	}
	actions?: {
		[key: string]: string[];
	}
}

export interface FormField {
	id: string;
	label: string;
	type: 'text' | 'number' | 'email' | 'password' | 'select' | 'checkbox' | 'radio' | 'textarea';
	value: any;
	placeholder?: string;
	options?: { name: string; value: string }[];
	required?: boolean;
	validation?: (value: any) => boolean;
	sx?: React.CSSProperties;
	helper?: string;
	relationship?: string,
	errors?: string[];
}