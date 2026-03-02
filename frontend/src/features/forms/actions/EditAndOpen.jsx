import { Button } from "@mui/joy";
import { useEditRecordMutation } from "../../../services/form";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { slices } from "../../../stores/store";
import { useSelector } from "react-redux";
import { useDebounceClick } from "../../../hooks/useDebounceClick";

const EditAndOpen = ({ feature, transformData = null }) => {
    const { id } = useParams();
    const [editRecord, result] = useEditRecordMutation();
    const selector = slices[feature]['selectFormInputs'];

    const formData = useSelector((state) =>
        selector ? selector(state) : {}
    );

    const repeaters = useSelector((state) =>
        state[feature]?.repeaters ?? {}
    );

    const redirectAfterSave = useSelector((state) => 
        state[feature]?.form?.redirectAfterSave
    );

    const data = {
        ...formData,
        ...repeaters,
    };

    const navigate = useNavigate();
    useEffect(() => {
        if (result.isSuccess) {
            // Check if there's a custom redirect configured
            if (redirectAfterSave?.shouldRedirect) {
                const { targetPage, contextData } = redirectAfterSave;
                navigate(`/${targetPage}`, { state: contextData });
            } else {
                // Default behavior: go to list
                navigate(`/${feature}/list`);
            }
        }
    }, [result, feature, navigate, redirectAfterSave]);

    const handleEditRecord = () => {
        const payload = transformData ? transformData(feature, data) : data;
        editRecord({ url: `${feature}/${id}`, data: payload });
    };

    // Use debounce hook to prevent multiple clicks (1 second delay)
    const { handleClick: debouncedEdit, isProcessing } = useDebounceClick(
        handleEditRecord,
        1000
    );

    return (
        <Button
            disabled={isProcessing}
            onKeyDown={(e) => {
				if (e.key === "Enter" && e.target == document.activeElement) {
					debouncedEdit();
				}
			}}
            onClick={() => { debouncedEdit(); }}
            sx={{ marginTop: "2rem" }}
        >
            編集
        </Button>
    );
};

export default EditAndOpen;