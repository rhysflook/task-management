import { Box, Button, Typography } from "@mui/joy";
import Form from "../../features/forms/Form";
import { getFieldComponent } from "../../helpers/formFieldMap";
import { useGetRecordQuery, useGetFormDataQuery } from "../../services/form";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FeatureContext } from "../../context/FeatureContext";

const EditStaff = () => {
	const { id } = useParams();
	const { feature } = useContext(FeatureContext);
	const { isLoading } = useGetRecordQuery(`${feature}/${id}/edit?`);
	const { db_data } = useGetFormDataQuery(`${feature}/formData?relationships=unit_id`);
	const { fields } = useSelector((state) => state.staff.form);
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
						スタッフマスタ（編集）
					</Typography>
					<Typography level="body-sm" sx={{ color: "text.tertiary" }}>
						編集したい項目を更新してください
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
						<Box sx={{ display: "grid", flexDirection: "column", gap: 2, gridTemplateColumns: "1fr 1fr"}}>
							{/* Name & Staff ID: нэг мөрөнд хоёр багана */}
							{/* <Box
								sx={{
									display: "grid",
									gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
									gap: 2,
								}}
							> */}
								<Box sx={fieldShell}>
									{getFieldComponent(fields.staff_id.type, {...fields.staff_id, mode: 'edit'}, "staff")}
								</Box>
								<Box sx={fieldShell}>
									{getFieldComponent(fields.name.type, {...fields.name, mode: 'edit'}, "staff")}
								</Box>
							{/* </Box> */}

							{/* Бусад талбарууд: column */}
							{Object.entries(fields)
								.filter(([key]) => !["name", "staff_id"].includes(key))
								.map(([key, field]) => (
									<Box key={key} sx={fieldShell}>
										{getFieldComponent(field.type, {...field, mode: 'edit'}, "staff")}
									</Box>
								))}
						</Box>
					)}
				</Form>
			</Box>
		</Box>
	);
};

export default EditStaff;
