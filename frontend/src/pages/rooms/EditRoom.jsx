import { Box, Button, Typography } from "@mui/joy";
import Form from "../../features/forms/Form";
import { getFieldComponent } from "../../helpers/formFieldMap";
import { useGetFormDataQuery, useGetRecordQuery } from "../../services/form";
import { useSelector, useDispatch } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useContext, useEffect, useRef } from "react";
import { FeatureContext } from "../../context/FeatureContext";
import FieldRepeater from "../../components/common/Repeater";
import { clearAll, loadRepeaterItems, setField } from "../../stores/reducers/roomSlice";

const EditRoom = () => {
  const { id } = useParams();

  const isFirstLoad = useRef(true);

  const { feature } = useContext(FeatureContext);

  const { data: recordData, isLoading, refetch } = useGetRecordQuery(`${feature}/${id}/edit`);
  const bedsData = recordData?.data?.beds || [];

  const { isLoading: isLoadingFormData } = useGetFormDataQuery(`${feature}/formData?relationships=unit_id,client:device_id:beds.client_id&client_bed_null=1&record=${id}`);

  const { fields } = useSelector((state) => state.rooms.form);
  const bedFields = useSelector((state) => state.beds.form?.fields);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Clear form and refetch record data on ID change
  useEffect(() => {
    dispatch(clearAll());
    refetch();
    isFirstLoad.current = false;
  }, [id]);

  // Load record data into form state
  useEffect(() => {
    if (!recordData) return;

    // Avoid overwriting user edits after the first load
    if (!isFirstLoad.current) {
      const record = recordData.data.record ?? {};
      Object.entries(record).forEach(([field, value]) => {
        dispatch(setField({ field, value }));
      });
      if (bedsData.length > 0) {
        dispatch(loadRepeaterItems({
          repeater: 'beds',
          items: bedsData
        }));
      }
    } else {
      // Initial load
      const record = recordData.data.record ?? {};
      Object.entries(record).forEach(([field, value]) => {
        dispatch(setField({ field, value }));
      });

      if (bedsData.length > 0) {
        dispatch(loadRepeaterItems({
          repeater: 'beds',
          items: bedsData
        }));
      }
      isFirstLoad.current = false;
    }

  }, [recordData]);

  // Clear form state on unmount to prevent stale data
  useEffect(() => {
    return () => {
      dispatch(clearAll());
    };
  }, [dispatch]);

  // Shared style definitions (as in CreateRoom)
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
            居室マスタ（編集）
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

      {/* Main form card */}
      <Box sx={cardSurface}>
        <Form feature={feature} mode="edit" subFeature="beds" recordId={id}>
          {!isLoading && !isLoadingFormData && (
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
                  {getFieldComponent(fields.number.type, {...fields.number, mode: "edit"}, "rooms")}
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

              {/* Divider before beds section
              <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 3 }}>
                <FieldRepeater
                  fields={bedFields}
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

export default EditRoom;