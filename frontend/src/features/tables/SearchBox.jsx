import { useDispatch, useSelector } from 'react-redux';
import { useMemo, useState, useEffect, useCallback, useContext } from 'react';
import Stack from '@mui/joy/Stack';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Button from '@mui/joy/Button';
import { FeatureContext } from '../../context/FeatureContext';
import { useGetFormDataQuery } from '../../services/form';

const EMPTY_ARR = Object.freeze([]);
const EMPTY_OBJ = Object.freeze({});

/**
 * Extract field keys that need dynamic options from the backend
 * Example: unit_id, room_id, bed_id need to load their options from API
 */
const extractDynamicRelationships = (fields) => {
	return Object.entries(fields)
		.filter(([_, field]) => field.type === 'select' && !field.options)
		.map(([key]) => key)
		.join(',');
};

/**
 * Get options for a select field from either:
 * 1. Static options defined in field config (e.g., gender: [{ id: "1", name: "男性" }])
 * 2. Dynamic options fetched from API (e.g., units loaded from backend)
 * 
 * Returns normalized array: [{ value: "1", label: "男性" }, ...]
 */
const resolveFieldOptions = (field, formData, columnKey, table) => {
	// Static options from field definition
	console.log("Resolving options for column:", columnKey, "field:", field);

	if (table.searchOptions?.[columnKey]) {
		return Object.entries(table.searchOptions[columnKey]).map(([value, label]) => ({
			value,
			label,
		}));
	}

	if (field?.options && Array.isArray(field.options)) {
		return field.options.map(opt => ({
			value: opt.id ?? opt.value,
			label: opt.name ?? opt.label
		}));
	}
	
	// Dynamic options from API response
	if (formData?.data?.options?.[columnKey]) {
		return formData.data.options[columnKey].map(opt => ({
			value: opt.id,
			label: opt.name
		}));
	}
	
	return null;
};

/**
 * Initialize filter values from active filters in Redux
 * Handles both regular fields and date range fields (fromTo)
 */
const initializeFilterValues = (searchableColumns, activeFilters) => {
	const values = {};
	searchableColumns.forEach((col) => {
		if (col.fromTo) {
			values[`${col.key}_from`] = activeFilters?.[`${col.key}_from`] ?? '';
			values[`${col.key}_to`] = activeFilters?.[`${col.key}_to`] ?? '';
		} else {
			values[col.key] = activeFilters?.[col.key] ?? '';
		}
	});
	return values;
};

/**
 * SearchBox component - Renders dynamic filter inputs based on column configuration
 * 
 * Supports:
 * - Text/number inputs
 * - Select dropdowns (static and dynamic options)
 * - Date/datetime inputs with optional range (fromTo)
 * 
 * Workflow:
 * 1. User changes filter values (local state)
 * 2. User clicks "検索" or presses Enter
 * 3. Dispatches setFilters action to rebuild table queryString
 * 4. Table automatically refetches with new filters
 */
const SearchBox = ({ sx }) => {
	const dispatch = useDispatch();
	const { feature } = useContext(FeatureContext);

	// Get table config and current filters from Redux
	const table = useSelector((state) => state[feature]?.table);
	const fields = useSelector((state) => state[feature]?.fields ?? {});
	
	const columns = table?.columns ?? EMPTY_ARR;
	const activeFilters = table?.filters ?? EMPTY_OBJ;
	
	// Build comma-separated list of relationships to load (e.g., "unit_id,room_id")
	const relationshipsToLoad = useMemo(
		() => extractDynamicRelationships(fields),
		[fields]
	);
	
	// Fetch dynamic options from backend (skipped if no relationships needed)
	const { data: formData } = useGetFormDataQuery(
		`${feature}/formData?relationships=${relationshipsToLoad}`,
		{ skip: !relationshipsToLoad }
	);

	// Filter columns that are searchable and backed by database
	const searchableColumns = useMemo(() => {
		return columns
			.filter((c) => !c.notDBVal && (c.searchable ?? false) && c.key)
			.sort((a, b) => (a.searchRenderOrder ?? 999) - (b.searchRenderOrder ?? 999));
	}, [columns]);

	// Local form state for filter inputs
	const [values, setValues] = useState(() => 
		initializeFilterValues(searchableColumns, activeFilters)
	);

	// Sync local state when Redux filters change (e.g., after clear)
	useEffect(() => {
		setValues(initializeFilterValues(searchableColumns, activeFilters));
	}, [activeFilters, searchableColumns]);

	const handleChange = useCallback((key, val) => {
		setValues((prev) => ({ ...prev, [key]: val }));
	}, []);

	// Trigger search: dispatch to Redux to rebuild queryString
	const handleSearch = useCallback(() => {
		const payload = Object.fromEntries(
			Object.entries(values).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
		);
		dispatch({ type: `${feature}/setFilters`, payload });
	}, [dispatch, feature, values]);

	// Clear all filters
	const handleClear = useCallback(() => {
		dispatch({ type: `${feature}/setFilters`, payload: {} });
	}, [dispatch, feature]);

	// Allow Enter key to trigger search
	const handleKeyDown = useCallback((e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSearch();
		}
	}, [handleSearch]);

	// Render a select dropdown field
	const renderSelectField = (col, options, value) => (
		console.log("Rendering select field for column:", col.key, "with options:", options) ||
		<FormControl key={col.key} sx={{ minWidth: 180 }}>
			<FormLabel>{col.label ?? col.key}</FormLabel>
			<Select
				value={value === '' ? null : value}
				onChange={(_, val) => handleChange(col.key, val ?? '')}
				placeholder="全"
				size="sm"
				onKeyDown={handleKeyDown}
			>
				<Option key="" value="">
					全
				</Option>
				{options.map((opt) => (
					<Option key={String(opt.value)} value={opt.value}>
						{opt.label}
					</Option>
				))}
			</Select>
		</FormControl>
	);

	// Render date/datetime range inputs (from/to)
	const renderDateRangeField = (col, inputType) => (
		<Stack key={col.key} direction="row" spacing={1} sx={{ minWidth: 180 }}>
			<FormControl sx={{ flex: 1 }}>
				<FormLabel>{col.label} From</FormLabel>
				<Input
					type={"month"}
					size="sm"
					value={values[`${col.key}_from`] || ''}
					onChange={(e) => handleChange(`${col.key}_from`, e.target.value)}
					placeholder={`From ${col.label}`}
					onKeyDown={handleKeyDown}
				/>
			</FormControl>
			<FormControl sx={{ flex: 1 }}>
				<FormLabel>{col.label} To</FormLabel>
				<Input
					type={"month"}
					size="sm"
					value={values[`${col.key}_to`] || ''}
					onChange={(e) => handleChange(`${col.key}_to`, e.target.value)}
					placeholder={`To ${col.label}`}
					onKeyDown={handleKeyDown}
				/>
			</FormControl>
		</Stack>
	);

	// Render regular input field (text, number, date)
	const renderInputField = (col, inputType, value) => (
		<FormControl key={col.key} sx={{ minWidth: 180 }}>
			<FormLabel>{col.label ?? col.key}</FormLabel>
			<Input
				type={inputType}
				size="sm"
				value={value}
				onChange={(e) => handleChange(col.key, e.target.value)}
				placeholder={col.label ?? col.key}
				onKeyDown={handleKeyDown}
			/>
		</FormControl>
	);

	// Main render logic: determine field type and render appropriate component
	const renderField = (col) => {
		const type = col.type ?? 'string';
		const field = {...fields[col.key], ...col}; // Merge field config from Redux with column config
		const value = values[col.key] ?? '';

		// Resolve options for select fields
		const options = resolveFieldOptions(field, formData, col.key, table);

		if (type === 'select' && options) {
			return renderSelectField(col, options, value);
		}

		// Map column type to HTML input type
		const inputType = {
			number: 'number',
			date: 'date',
			datetime: 'datetime-local',
		}[type] ?? 'text';
		
		// Date range field (from/to)
		if ((type === 'datetime' || type === 'date' || type === "month") && col.fromTo) {
			return renderDateRangeField(col, inputType);
		}

		// Regular input field
		return renderInputField(col, inputType, value);
	};

	// Don't render anything if no searchable columns
	if (searchableColumns.length === 0) {
		return null;
	}
	console.log("Searchable columns:", searchableColumns);
	return (
		<Stack
			direction="row"
			alignItems="flex-end"
			justifyContent="space-between"
			spacing={1.5}
			sx={{ mb: 1.5, flexWrap: 'wrap', ...sx }}
		>
			{/* Filter inputs */}
			<Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
				{searchableColumns.map(renderField)}
			</Stack>
			
			{/* Action buttons */}
			<Stack direction="row" spacing={1}>
				<Button size="sm" variant="outlined" color="neutral" onClick={handleClear}>
					クリア
				</Button>
				<Button size="sm" variant="solid" color="primary" onClick={handleSearch}>
					検索
				</Button>
			</Stack>
		</Stack>
	);
};

export default SearchBox;