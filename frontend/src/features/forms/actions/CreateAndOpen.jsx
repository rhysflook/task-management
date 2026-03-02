import { Button } from "@mui/joy";
import { useCreateRecordMutation } from "../../../services/form";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { store, slices } from "../../../stores/store";
import { useSelector } from "react-redux";

const CreateAndOpen = ({ feature, transformData = null }) => {
	const [createRecord, result] = useCreateRecordMutation();
	const selector = slices[feature]['selectFormInputs'];

	const data = useSelector((state) =>
		selector ? selector(state) : undefined
	);

	const redirectAfterSave = useSelector((state) => 
        state[feature]?.form?.redirectAfterSave
    );

	const navigate = useNavigate();
	useEffect(() => {
		if (result.isSuccess) {
			// Check if there's a custom redirect configured
			if (redirectAfterSave?.shouldRedirect) {
				const { targetPage, contextData } = redirectAfterSave;
				navigate(`/${targetPage}`, { state: contextData });
			} else {
				navigate(`/${feature}/${result.data.data.id}/edit`);
			}
		}
	}, [result, redirectAfterSave]);

	const handleCreateRecord = () => {
        if (slices[feature]) {
            const payload = transformData ? transformData(feature, data) : data;
            createRecord({ url: feature, data: payload });
        }
    };

	// Use debounce hook to prevent multiple clicks (1 second delay)
    const { handleClick: debouncedCreate, isProcessing } = useDebounceClick(
        handleCreateRecord,
        1000
    );

	return (
		<Button
			disabled={isProcessing}
			onKeyDown={(e) => {
				if (e.key === "Enter" && e.target == document.activeElement) {
					debouncedCreate();
				}
			}}
			onClick={() => { debouncedCreate(); }}
			sx={{ marginTop: "2rem" }}
		>
			作成
		</Button>
	);
};

export default CreateAndOpen;
