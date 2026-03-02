import { Box, Typography, Button } from "@mui/joy";
import Form from "../../features/forms/Form";
import { getFieldComponent } from "../../helpers/formFieldMap";
import { useGetRecordQuery } from "../../services/form";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useContext } from "react";
import { FeatureContext } from "../../context/FeatureContext";

const EditBed = () => {
  const { feature } = useContext(FeatureContext);
  const { id } = useParams();
  const navigate = useNavigate();

  const { isLoading } = useGetRecordQuery(`${feature}/${id}/edit`);
  const { fields } = useSelector((state) => state.beds.form);

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
    mb: 2,
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

  if (isLoading) return <div>Loading...</div>;

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 2, md: 3 }, py: 3 }}>
      {/* Page title */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ mb: 2, display: "flex", alignItems: "baseline", gap: 1 }}>
          <Typography level="h3" sx={{ fontWeight: 800 }}>
            ベッドマスタ（編集）
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
          onClick={() => navigate(`/${feature}/list`)}
        >
          一覧へ
        </Button>
      </Box>

      {/* Form card */}
      <Box sx={cardSurface}>
        <Form feature={feature} mode="edit">
          <Box sx={{ display: "flex", flexDirection: "column" }}>
            {Object.entries(fields).map(([key, field]) => (
              <Box key={key} sx={fieldShell}>
                {getFieldComponent(field.type, { ...field, id: field.id || key }, "beds")}
              </Box>
            ))}
          </Box>

          {/* Bottom actions area */}
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
          ></Box>
        </Form>
      </Box>
    </Box>
  );
};

export default EditBed;
