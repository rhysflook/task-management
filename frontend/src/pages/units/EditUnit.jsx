import { Box, Button, Typography } from "@mui/joy";
import Form from "../../features/forms/Form";
import { getFieldComponent } from "../../helpers/formFieldMap";
import { useGetRecordQuery } from "../../services/form";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useContext } from "react";
import { FeatureContext } from "../../context/FeatureContext";

const EditUnit = () => {
  const { id } = useParams();
  const { feature } = useContext(FeatureContext);
  const { isLoading } = useGetRecordQuery(`${feature}/${id}/edit`);
  const { fields } = useSelector((state) => state.units.form);
  const navigate = useNavigate();

  // shared sx helpers
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

  return (
    <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 2, md: 3 }, py: 3 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Typography level="h3" sx={{ fontWeight: 800 }}>
            ユニットマスタ（編集）
          </Typography>
          <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
            必要な項目を更新し「編集」を押してください
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
          onClick={() => navigate(`/${feature}/list`)}
        >
          一覧へ
        </Button>
      </Box>

      {/* Card Surface */}
      <Box sx={cardSurface}>
        <Form feature={feature} mode="edit">
          {!isLoading && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                rowGap: 2,
                columnGap: 2,
              }}
            >
              {/* スマホ内線 бусад талбарууд */}
              {Object.entries(fields)
                .filter(([_, field]) => !field.label?.includes("スマホ内線"))
                .map(([key, field]) => (
                  <Box key={key} sx={fieldShell}>
                    {getFieldComponent(field.type, {...field, mode: "edit"}, "units")}
                  </Box>
                ))}

              {/* スマホ内線 талбарууд */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  gridColumn: "1 / span 2",
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                  marginLeft: "180px",
                }}
              >
                {Object.entries(fields)
                  .filter(([_, field]) => field.label?.includes("スマホ内線"))
                  .map(([key, field]) => (
                    <Box key={key} sx={fieldShell}>
                      {getFieldComponent(field.type, field, "units")}
                    </Box>
                  ))}
              </Box>
            </Box>
          )}

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
          ></Box>
        </Form>
      </Box>
    </Box>
  );
};

export default EditUnit;
