import { useDispatch, useSelector } from "react-redux";
import Actions from "./actions/Actions";
import { actions } from "../../stores/store";
import { useEffect, useRef } from "react";
import { getFocusable, setFocusToFirst } from "../../helpers/focusHelper";

const Form = ({ feature, mode, children, subFeature = null  }) => {
	const dispatch = useDispatch();
	const formRef = useRef(null);
	const { form } = useSelector((state) => state[feature]);
	useEffect(() => {
		if (mode === "create") {
			dispatch(actions[feature].clearAllFields());
		}
		if (actions[feature].clearErrors) {
			dispatch(actions[feature].clearErrors());
		  }
	}, [mode, feature, dispatch]);

	useEffect(() => {
		const form = formRef.current;
		if (!form) return;

		setFocusToFirst(form);

		const handler = (e) => {
			// only trigger when keypress inside the form
			if (e.key === "Enter" && form.contains(e.target)) {
				e.preventDefault();

				const focusable = getFocusable(form);
				const index = focusable.indexOf(document.activeElement);

				if (index > -1 && index < focusable.length - 1) {
					focusable[index + 1].focus();
				} else {
					const button = form.querySelector("#submitBtn");
					if (button) button.click();
				}
			}
		};

		document.addEventListener("keydown", handler);
		return () => document.removeEventListener("keydown", handler);
	}, [form.loaded]);

	return (
		<form ref={formRef} id="input-form">
			{children}
			<Actions feature={feature} mode={mode} form={formRef} subFeature={subFeature} />
		</form>
	);
};

export default Form;
