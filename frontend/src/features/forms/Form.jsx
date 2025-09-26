import Actions from "./actions/Actions";

const Form = ({ feature, mode, children }) => {
	return (
		<form id="input-form">
			{children}
			<Actions feature={feature} mode={mode} />
		</form>
	);
};

export default Form;
