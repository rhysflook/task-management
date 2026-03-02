import { Box, Button, Typography } from "@mui/joy";
import Form from "../../features/forms/Form";
import { getFieldComponent } from "../../helpers/formFieldMap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { FeatureContext } from "../../context/FeatureContext";
import { useGetFormDataQuery } from "../../services/form"
import Fields from "../../features/forms/inputs/Fields";
import { fieldShell } from "../../helpers/display/fields";
import { clearPrefillData, setField, setOptions } from "../../stores/reducers/patientSlice";
import useCustomNavigate from "../../hooks/useCustomNavigate";

const CreatePatient = () => {
  const { fields, prefillData, redirectAfterSave } = useSelector((state) => state.patients.form);
  const { feature } = useContext(FeatureContext);
  const { units, isLoading } = useGetFormDataQuery(`${feature}/formData?relationships=unit_id,room_id,bed_id:bed_no`);
  const navigate = useNavigate();
  const customNavigate = useCustomNavigate();
  const dispatch = useDispatch();

  const handleRedirect = () => {
    const { targetPage, contextData } = redirectAfterSave;
    customNavigate(`/${targetPage}`, { state: contextData });
  }

  // Handle back button
  const handleBack = () => {
    if (redirectAfterSave?.shouldRedirect) {
      handleRedirect()
    } else {
      // Default behavior if no redirect configured
      customNavigate(`/${feature}/list`);
    }
  };
  
  // Initialize form with prefill data
  useEffect(() => {
    if (prefillData && !isLoading) {
      // Fill form fields with prefillData
      Object.entries(prefillData.options).forEach(([field, options]) => {
        if (fields[field]) {
          dispatch(setOptions({ field, options }));
        }
      });
      
      // Clear prefill data after use
      dispatch(clearPrefillData());
    }
  }, [prefillData, isLoading, fields, dispatch]);

  useEffect(() => {
    if (prefillData) {
      Object.entries(prefillData.values).forEach(([field, value]) => {
        if (fields[field]) {
          // We don't want to trigger callback here
          const useCallback = false;
          dispatch(setField({ field, value, useCallback }));
        }
      });      
    }
  }, [prefillData]);

  // shared sx helpers
  const cardSurface = {
    p: { xs: 2, md: 3 },
    borderRadius: "12px",
    bgcolor: "background.surface",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };

  // applies to anything returned by getFieldComponent (Joy Input/Select/Autocomplete, etc.)

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 2, md: 3 }, py: 3 }}>
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography level="h3" sx={{ fontWeight: 800 }}>
            入所者マスタ（新規）
          </Typography>
          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            必須項目を入力し「登録」を押してください
          </Typography>
        </Box>
        <Button
          variant="outlined"
          sx={{
            bgcolor: "#fff",
            color: "#000",
            borderColor: "#000",
            "&:hover": {
              bgcolor: "#f5f5f5",
              borderColor: "#000",
            },
          }}
          onClick={handleBack}
        >
          {redirectAfterSave?.shouldRedirect ? "フロアMAP" : "一覧"}へ
        </Button>
      </Box>

      <Box sx={cardSurface}>
        <Form feature={feature} mode="create">
          {/* First row: ID + (name + kana stacked) */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              columnGap: 6,
              rowGap: 2,
              mb: 2,
              alignItems: "start",
            }}
          >
            <Box sx={fieldShell}>
              {getFieldComponent(fields.patient_no.type, {...fields.patient_no, mode: "create"}, "patients")}
            </Box>

            <Box sx={{ display: "grid", gap: 2 }}>
              <Box sx={fieldShell}>
                {getFieldComponent(fields.name.type, fields.name, "patients")}
              </Box>
              <Box sx={fieldShell}>
                {getFieldComponent(fields.kana.type, fields.kana, "patients")}
              </Box>
            </Box>
          </Box>

          {/* Rest of fields in a responsive two-column grid */}
          <Fields fields={fields} feature={feature} mode={"create"} filtered={["patient_no", "name", "kana"]}/>
          {/* Actions */}
          <Box
            sx={{
              mt: 3,
              pt: 2,
              display: "flex",
              gap: 1,
              justifyContent: "flex-start",
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
           
          </Box>
        </Form>
      </Box>
    </Box>
  );
};

export default CreatePatient;
