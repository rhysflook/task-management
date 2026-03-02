import React, { useContext } from "react";
import { actions } from "../../stores/store";
import { Button, Option, Select, Stack } from "@mui/joy";
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { useDispatch, useSelector } from "react-redux";
import { FeatureContext } from "../../context/FeatureContext";

const Navigation = ({ position = 'center' }) => {
	const { feature } = useContext(FeatureContext);

	const { getPage, setPerPage } = actions[feature];
	const { last_page, current_page, per_page } = useSelector((state) => {
		if (!state[feature].table) {
			return {
				last_page: 1,
				current_page: 1,
				per_page: 50
			}
		}
		return state[feature].table.meta
	});
	const dispatch = useDispatch();
	const visibleBtns = () => {
		if (last_page <= 9) {
			return [...Array.from({ length: last_page }, (_, i) => i + 1)];
		} else if (current_page <= 5) {
			return [...Array.from({ length: 9 }, (_, i) => i + 1)];
		} else if (current_page > last_page - 5) {
			return [...Array.from({ length: 9 }, (_, i) => last_page - 8 + i)];
		}
		else {
			return [
				...Array.from({ length: 4 }, (_, i) => current_page - 4 + i),
				...Array.from({ length: 5 }, (_, i) => current_page + i),
			];
		}
	}
	const getButtons = () => {
		const buttons = [];
		visibleBtns().forEach((i) => {
			buttons.push(
				<Button key={i} variant={current_page === i ? "solid" : "plain"} onClick={() => { dispatch(getPage(i)) }}>
					{i}
				</Button>
			);
		});
		return buttons;
	}

	return (
		<Stack direction="row" sx={{ width: "100%", justifyContent: position, alignItems: "center", marginTop: "5px" }}>
			{current_page > 1 && (
				<Button id="prev-btn" onClick={() => { dispatch(getPage(current_page - 1)) }}>
					<ArrowLeftIcon />
				</Button>
			)}
			{getButtons()}
			{current_page < last_page && (
				<Button id="next-btn" onClick={() => { dispatch(getPage(current_page + 1)) }}>
					<ArrowRightIcon />
				</Button>
			)}
			{/* <Select
				sx={{
					width: "100px",
					marginLeft: "20px",
					"& button:focus, & button:focus-visible": { outline: "none" }
				}}
				value={"" + per_page}
				onChange={(_, newValue) => {
					if (newValue) {
						dispatch(setPerPage(newValue));
					}
				}}
			>
				<Option value="30">30</Option>
				<Option value="40">40</Option>
				<Option value="50">50</Option>
			</Select> */}
		</Stack>
	)
}

export default Navigation;