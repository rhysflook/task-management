import { Box, Button, Typography } from "@mui/joy";
import Form from "../../features/forms/Form";
import { getFieldComponent } from "../../helpers/formFieldMap";
import { useGetFormDataQuery } from "../../services/form";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FeatureContext } from "../../context/FeatureContext";

const CreateBed = () => {
	const { feature } = useContext(FeatureContext);
	const { isLoading } = useGetFormDataQuery(`${feature}/formData?`);
	const { fields } = useSelector((state) => state.beds.form);
	const navigate = useNavigate();

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
			<Box sx={{ mb: 2, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
				<Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
					<Typography level="h3" sx={{ fontWeight: 800 }}>
						ベッドマスタ（新規）
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

			{/* Form card */}
			<Box sx={cardSurface}>
				<Form feature={feature} mode="create">
					{!isLoading && (
						<Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
							{Object.entries(fields).map(([key, field]) => (
								<Box key={key} sx={fieldShell}>
									{getFieldComponent(field.type, field, "beds")}
								</Box>
							))}
						</Box>
					)}
				</Form>
			</Box>
		</Box>
	);
};

export default CreateBed;