/**
 * @description This file contains the mapping of form field names to their corresponding React components.
 */

import FormTextArea from "../features/forms/inputs/FormTextArea";
import FormTextInput from "../features/forms/inputs/FormTextInput";
import MultiSelect from "../features/forms/inputs/MultiSelect";
import { FormField } from "../types/forms/forms";

export const fieldMap: Record<string, React.FC<FormField>> = {
	"text": ({ id, ...props }) => <FormTextInput  {...props} key={id} id={id}/>,
	"textarea": ({ id, ...props }) => <FormTextArea {...props} key={id} id={id} />,
	"select": ({ id, ...props }) => <MultiSelect {...props} options={props.options || []} key={id} id={id} />,
};

export const getFieldComponent = (fieldType: keyof typeof fieldMap, params: FormField) => {
	const FieldComponent = fieldMap[fieldType];
	if (FieldComponent) {
		return FieldComponent(params);
	} else {
		console.error(`No component found for field type: ${fieldType}`);
		return null;
	}
};
