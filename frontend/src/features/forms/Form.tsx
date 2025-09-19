import { sliceKey } from "../../stores/store";
import Actions from "./actions/Actions";

interface FormProps {
	feature: sliceKey;
	mode: "edit" | "create";
	children: React.ReactNode;
}

const Form: React.FC<FormProps> = ({ feature, mode, children }) => {


	return <form id="input-form">
		{children}
		<Actions feature={feature} mode={mode} />
	</form>;
};

export default Form;
