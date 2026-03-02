import { Button } from "@mui/joy";
import { useCreateRecordMutation } from "../../../services/form";
import { use, useEffect } from "react";
import { slices, actions } from "../../../stores/store";
import { useDispatch, useSelector } from "react-redux";
import { setFocusToFirst } from "../../../helpers/focusHelper";
import { clearAllRepeaters, clearRepeater } from "../../../stores/reducers/roomSlice";
import { sliceConfigs } from "../../../stores/slicesConfigs";
import { useDebounceClick } from "../../../hooks/useDebounceClick";

const Create = ({ feature, form, transformData = null }) => {
    const dispatch = useDispatch();
	const [createRecord, result] = useCreateRecordMutation();
	const selector = slices[feature]['selectFormInputs'];
    const {clearAllFields, setField, resetInitialLoad} = actions[feature];
	const data = useSelector((state) =>
		selector ? selector(state) : undefined
	);

	useEffect(() => {
        return () => {
			// Reset initialLoad store in redux to true when leaveing create page
            if (resetInitialLoad) {
                dispatch(resetInitialLoad());
            }
        };
    }, [dispatch, resetInitialLoad]);

	useEffect(() => {
		// Clear all repeaters when component unmounts
		dispatch(resetInitialLoad());
	}, []);

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

	useEffect(() => {
		if (result.isSuccess) {
			dispatch(clearAllFields());
			dispatch(clearAllRepeaters());
			
			// Updating necessary field given in slice's autoIncrementConfig based on result returned by the record creation
			const sliceConfig = sliceConfigs?.[feature];
			const autoIncrement = sliceConfig?.autoIncrementConfig;
			const resultData = result.data;
			const extraData = resultData?.data?.extra_data;

			if (autoIncrement && extraData) {
				const { fieldName, extraDataKey } = autoIncrement;
				const nextValue = extraData[extraDataKey];
				if (nextValue && typeof setField === 'function') {
					dispatch(setField({ field: fieldName, value: nextValue }));
				}
			}
			
			setFocusToFirst(form?.current);
		}
	}, [result, dispatch, clearAllFields, setField, feature, form]);
    
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
			登録
		</Button>
	);
};

export default Create;
