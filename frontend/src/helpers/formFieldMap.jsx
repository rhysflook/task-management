/**
 * @description This file contains the mapping of form field names to their corresponding React components.
 */

import FormTextArea from "../features/forms/inputs/FormTextArea";
import FormTextInput from "../features/forms/inputs/FormTextInput";
import MultiSelect from "../features/forms/inputs/MultiSelect";

export const fieldMap = {
	"text": ({ id, feature, ...props }) => <FormTextInput  {...props} key={id} id={id} feature={feature} />,
	"textarea": ({ id, feature, ...props }) => <FormTextArea {...props} key={id} id={id} feature={feature} />,
	"select": ({ id, feature, ...props }) => <MultiSelect {...props} options={props.options || []} key={id} id={id} feature={feature} />,
};

export const getFieldComponent = (fieldType, params, feature) => {
	const FieldComponent = fieldMap[fieldType];
	if (FieldComponent) {
		return FieldComponent({ ...params, feature });
	} else {
		console.error(`No component found for field type: ${fieldType}`);
		return null;
	}
};
