/**
 * @description This file contains the mapping of form field names to their corresponding React components.
 */

import FormSelect from "../features/forms/inputs/FormSelect";
import FormTextArea from "../features/forms/inputs/FormTextArea";
import FormTextInput from "../features/forms/inputs/FormTextInput";
import MultiSelect from "../features/forms/inputs/MultiSelect";
import FormDateTimePicker from "../features/forms/inputs/FormDateTimePicker";
import { Box } from "@mui/joy";
import FormCheckbox from "../features/forms/inputs/FormCheckbox";
import FieldRepeater from "../components/common/Repeater";

export const fieldMap = {
	"text": ({ id, ...props }) => <FormTextInput  {...props} key={id} id={id} />,
	"textarea": ({ id, ...props }) => <FormTextArea {...props} key={id} id={id} />,
	"multiselect": ({ id, ...props }) => <MultiSelect {...props} options={props.options || []} key={id} id={id} />,
	"select": ({ id, ...props }) => <FormSelect {...props} options={props.options || []} key={id} id={id} />,
	"datetime-picker": ({ id, feature, ...props }) => <FormDateTimePicker {...props} key={id} id={id}  />,
	"password": ({ id, ...props }) => <FormTextInput  {...props} key={id} id={id} type="password" />,
	"blank": (id, ...props) => (<Box sx={props.sx}>
			<Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}></Box>
			</Box>
		</Box>), 
	"checkbox": ({ id, ...props }) => <FormCheckbox {...props} key={id} id={id} />,
	"repeater": ({ id, ...props }) => <FieldRepeater {...props} key={id} id={id} />,
};

export const getFieldComponent = (fieldType, params) => {
	const FieldComponent = fieldMap[fieldType];

	if (FieldComponent) {
		return FieldComponent({ ...params });
	} else {
		return null;
	}
};
