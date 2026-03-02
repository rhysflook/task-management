import { Box, Button, Typography } from "@mui/joy";
import Form from "../../features/forms/Form";
import { getFieldComponent } from "../../helpers/formFieldMap";
import { useGetFormDataQuery } from "../../services/form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { FeatureContext } from "../../context/FeatureContext";
import FieldRepeater from "../../components/common/Repeater";
import { clearAll } from "../../stores/reducers/roomSlice";

const CreateRoom = () => {
  const { feature } = useContext(FeatureContext);
  const { isLoading } = useGetFormDataQuery(`${feature}/formData?relationships=unit_id,client:device_id:beds.client_id&client_bed_null=1`);
  const { fields } = useSelector((state) => state.rooms.form);
  const bedFields = useSelector((state) => state.beds.form?.fields);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearAll());
  }, []);

  // Shared style definitions
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

  /**
   * Handles changes in bed count (same as EditRoom, stub for logic)
   * @param {number} count - The new bed count
   */
  const handleBedCountChange = (count) => {
    // TODO check bed count for unit, if == 10 then we stop adding more beds
    console.log(`Bed count changed: ${count}`);
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
            居室マスタ（新規）
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
          onClick={() => navigate(`/${feature}/list`)}
        >
          一覧へ
        </Button>
      </Box>

      {/* Main form card */}
      <Box sx={cardSurface}>
        <Form feature={feature} mode="create" subFeature="beds">
          {!isLoading && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {/* Unit ID field */}
              <Box sx={fieldShell}>
                {getFieldComponent(fields.unit_id.type, fields.unit_id, "rooms")}
              </Box>

              {/* Number and Name fields, grid */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 2,
                }}
              >
                <Box sx={fieldShell}>
                  {getFieldComponent(fields.number.type, {...fields.number, mode: "create"}, "rooms")}
                </Box>
                <Box sx={fieldShell}>
                  {getFieldComponent(fields.name.type, fields.name, "rooms")}
                </Box>
              </Box>

              {/* Remaining room fields */}
              {Object.entries(fields)
                .filter(([key]) => !["unit_id", "number", "name"].includes(key))
                .map(([key, field]) => (
                  <Box key={key} sx={fieldShell}>
                    {getFieldComponent(field.type, field, "rooms")}
                  </Box>
                ))}

              {/* Divider before beds section */}
              
              {/* <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 3 }}> */}
                {/* 
                  Bed Repeater with Grid Layout
                  - Mobile (xs): 1 column (stacked)
                  - Tablet (md): 2 columns
                  - Desktop (lg): 3 columns
                */}
                {/* <FieldRepeater
                  fields={bedFields}
                  feature="beds"
                  title="ベッド"
                  addButtonLabel="ベッドを追加"
                  minItems={1}
                  maxItems={6}
                  fieldShellStyles={fieldShell}
                  onChange={handleBedCountChange}
                  gridColumns={{
                    xs: "1fr",                // Mobile: stack vertically
                    md: "1fr 1fr",            // Tablet: 2 columns
                    lg: "repeat(3, 1fr)",     // Desktop: 3 columns
                  }}
                  gridGap={1}
                /> */}
                {/* <FieldRepeater
                  fields={bedFields}
                  mode="create"
                  feature="rooms"
                  repeaterName="beds"
                  title="ベッド"
                  addButtonLabel="ベッドを追加"
                  minItems={1}
                  maxItems={6}
                  fieldShellStyles={fieldShell}
                  onChange={handleBedCountChange}
                  gridColumns="repeat(3, 1fr)"
                  gridGap={1}
                />
              </Box> */}

              {/* Form actions */}
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
            </Box>
          )}
        </Form>
      </Box>
    </Box>
  );
};

export default CreateRoom;