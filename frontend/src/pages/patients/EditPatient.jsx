import { Box, Typography, Button } from "@mui/joy";
import Form from "../../features/forms/Form";
import { getFieldComponent } from "../../helpers/formFieldMap";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FeatureContext } from "../../context/FeatureContext";
import { useGetRecordQuery, useGetFormDataQuery } from "../../services/form";
import useCustomNavigate from "../../hooks/useCustomNavigate";

const EditPatient = () => {
  const { feature } = useContext(FeatureContext);
  const customNavigate = useCustomNavigate();
  const { id } = useParams();
  const { isLoading } = useGetRecordQuery(`${feature}/${id}/edit`);
  const { isLoading: isLoadingForm } = useGetFormDataQuery(`${feature}/formData?relationships=unit_id,room_id,bed_id:bed_no&record=${id}`);
  const { fields, redirectAfterSave } = useSelector((state) => state.patients.form);

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

  // same helpers used in CreatePatient
  const cardSurface = {
    p: { xs: 2, md: 3 },
    borderRadius: "12px",
    bgcolor: "background.surface",
    border: "1px solid",
    borderColor: "divider",
    boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
  };

  const fieldShell = {
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
    "& > label, & .field-label": {
      fontSize: "0.875rem",
      color: "text.secondary",
      fontWeight: 600,
    },
    "& .MuiInput-root, & .MuiSelect-root, & .MuiInputBase-root": {
      borderRadius: "10px",
      bgcolor: "background.level1",
      transition: "box-shadow .15s ease, background-color .15s ease",
    },
    "& .MuiInput-root:focus-within, & .MuiInputBase-root:focus-within": {
      boxShadow: "0 0 0 3px var(--joy-palette-primary-softActiveBg)",
      bgcolor: "background.surface",
    },
  };

  if (isLoading || isLoadingForm) return <div>Loading...</div>;

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 2, md: 3 }, py: 3 }}>
      {/* Page title */}
      <Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ mb: 2, display: "flex", alignItems: "baseline", gap: 1 }}>
          <Typography level="h3" sx={{ fontWeight: 800 }}>
            入所者マスタ（編集）
          </Typography>
          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            必要な項目を更新し「編集」を押してください
          </Typography>
        </Box>
        <Button
          variant="outlined"
          sx={{
            alignSelf: "flex-start",
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

      {/* Form card */}
      <Box sx={cardSurface}>
        <Form feature={feature} mode="edit">
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
              {getFieldComponent(fields.patient_no.type, {...fields.patient_no, mode: "edit"}, "patients")}
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

          {/* Remaining fields in a responsive two-column grid */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              columnGap: 6,
              rowGap: 2,
            }}
          >
            {Object.entries(fields)
              .filter(([key]) => !["patient_no", "name", "kana"].includes(key))
              .map(([key, field]) => (
                <Box key={key} sx={fieldShell}>
                  {getFieldComponent(
                    field.type,
                    { ...field, id: field.id || key, mode: "edit" },
                    "patients"
                  )}
                </Box>
              ))}
          </Box>

          {/* Actions (use your Form’s internal buttons if any; left here for parity) */}
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
            {/* Intentionally empty to mirror CreatePatient; 
                place Save/Back buttons inside Form if needed */}
          </Box>
        </Form>
      </Box>
    </Box>
  );
};

export default EditPatient;
