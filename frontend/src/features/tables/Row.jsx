import { useSelector } from "react-redux";
import { actionManager } from "./actionButtons";
import { useContext } from "react";
import { FeatureContext } from "../../context/FeatureContext";
import { resolveDisplayValue } from "../../helpers/displayValue";
import { styleCallbacks } from "./styleCallbacks";

const Row = ({ row, columns, formData }) => {
	const { feature } = useContext(FeatureContext);

	const actions = useSelector((state) => state[feature]?.actions);

    function formatWithPattern(value, pattern) {
        if (!value) return '';

        const date = new Date(value);
        if (isNaN(date.getTime())) return value;

        const map = {
            y: date.getFullYear(),
            m: String(date.getMonth() + 1).padStart(2, '0'),
            d: String(date.getDate()).padStart(2, '0'),
            h: String(date.getHours()).padStart(2, '0'),
            i: String(date.getMinutes()).padStart(2, '0'), // 'i' for minutes to avoid clash with month
            s: String(date.getSeconds()).padStart(2, '0')
        };

        // Replace tokens (longer keys first)
        return pattern
            .replace(/y/g, map.y)
            .replace(/m/g, map.m)
            .replace(/d/g, map.d)
            .replace(/h/g, map.h)
            .replace(/i/g, map.i)
            .replace(/s/g, map.s);
    }

	return (
        <tr>
            {columns.map((column, index) => {
                let displayValue;
                
                if (column.render) {
                    // Custom render (editAndDelete, etc.)
                    displayValue = actionManager[column.render](row);
                } else {
                    // Resolve display value (static or dynamic)
                    displayValue = resolveDisplayValue(
                        row[column.key], 
                        column, 
                        formData
                    );
                }
                
                return (
                    <td
                        key={index}
                        style={{
                            width: column.width,
                            textAlign: column.align,
                            overflow: column.overflow ? 'hidden' : 'visible',
                            textOverflow: column.overflow ? 'ellipsis' : 'clip',
                            whiteSpace: column.overflow ? 'nowrap' : 'normal',
                            ...(column.styleCallback ? styleCallbacks[column.styleCallback](row) : {})
                        }}
                    >
                        {column.format
                            ? formatWithPattern(displayValue, column.format)
                            : displayValue}
                    </td>
                );
            })}
        </tr>
    );
};

export default Row;
