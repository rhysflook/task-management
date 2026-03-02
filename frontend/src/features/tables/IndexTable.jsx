import * as React from 'react';
import Sheet from '@mui/joy/Sheet';
import Table from '@mui/joy/Table';
import Skeleton from '@mui/joy/Skeleton';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import { useMemo } from 'react';

import Row from './Row';
import Navigation from './Navigation';
import SearchBox from './SearchBox';

import { useGetRecordsQuery } from '../../services/tables';
import { useGetFormDataQuery } from '../../services/form';
import { useSelector } from 'react-redux';
import { useContext } from 'react';
import { FeatureContext } from '../../context/FeatureContext';

const IndexTable = ({ containerStyles, tableOverwrites = {} }) => {
  const { feature } = useContext(FeatureContext);

  let { columns, queryString, records } = useSelector((state) => {
    if (!state[feature]?.table) {
      return { columns: [], queryString: '', records: [] };
    }
    return state[feature].table;
  });

  const hasSearch = columns.some(col => col.searchable);
  // const fields = useSelector((state) => state[feature]?.fields ?? {});

  const { isLoading } = useGetRecordsQuery(queryString, {
    refetchOnMountOrArgChange: true,
  });

  // Load dynamic options for table display
  const relationshipsToLoad = useMemo(() => {
    return columns
      .filter(col => col.type === 'select' && !col.valueMap)
      .map(col => col.key)
      .join(',');
  }, [columns]);

  const { data: formData } = useGetFormDataQuery(
    `${feature}/formData?relationships=${relationshipsToLoad}`,
    { skip: !relationshipsToLoad }
  );

  const cardSurface = {
    borderRadius: '12px',
    bgcolor: 'background.surface',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  };

  const toolbar = {
    p: 1.5,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 1,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.level1',
  };

  const tableBase = {
    width: '100%',
    borderRadius: '0 0 0 0',
    tableLayout: 'fixed',
    '--TableCell-paddingX': '12px',
    '--TableCell-paddingY': '3px',

    '& thead th': {
      position: 'sticky',
      top: 0,
      zIndex: 5,
      bgcolor: 'background.level2',
      fontWeight: 700,
      borderBottom: '1px solid',
      borderColor: 'divider',
    },

    '& tbody tr': {
      transition: 'background-color .12s ease',
      '&:hover': { bgcolor: 'background.level1' },
    },

    '& td, & th': {
      borderBottom: '1px solid',
      borderColor: 'divider',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  };

  return (
    <Sheet
      sx={{
        ...cardSurface,
        ...containerStyles,
        p: 0,
        overflow: 'auto',
      }}
    >
      {/* Toolbar / search row */}
      <Box sx={toolbar}>
        <Typography level="title-md" fontWeight={700}>
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, minWidth: 320 }}>
          <SearchBox />
        </Box>
      </Box>

      {/* Scroll container (keeps sticky header working) */}
      <Box sx={{ overflowX: 'auto' }}>
        <Table
          color="neutral"
          size="md"
          stripe="even"
          variant="plain"
          hoverRow
          sx={{
            ...tableBase,
            display: "block",       // allow custom scroll container
            width: "100%",
          }}
        >
          <thead
            style={{
              display: "table",
              width: "100%",
              tableLayout: "fixed",
            }}
          >
            <tr>
              {columns.map((column, idx) => (
                <th
                  key={idx}
                  style={{
                    width: column.width,
                    textAlign: column.align,
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody
            style={{
              display: "block",
              maxHeight: hasSearch ? "54vh" : "64.5vh",   // adjust to 70vh if you like
              overflowY: "auto",
              width: "100%",
              tableLayout: "fixed",
              ...tableOverwrites
            }}
          >
            {(isLoading ? Array.from({ length: 5 }) : records).map((row, r) => (
              <tr
                key={r}
                style={{
                  display: "table",
                  width: "100%",
                  tableLayout: "fixed",
                }}
              >
                {isLoading
                  ? columns.map((_, c) => (
                      <td key={`sk-${r}-${c}`}>
                        <Skeleton level="body-sm" variant="text" />
                      </td>
                    ))
                  : <Row row={row} columns={columns} formData={formData} />
                }
              </tr>
            ))}

            {!isLoading && records.length === 0 && (
              <tr
                style={{
                  display: "table",
                  width: "100%",
                  tableLayout: "fixed",
                }}
              >
                <td colSpan={columns.length}>
                  <Box sx={{ py: 4, textAlign: "center", color: "text.tertiary" }}>
                    データがありません
                  </Box>
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Box>

      {/* Pagination / footer */}
      <Box
        sx={{
          p: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.level1',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Navigation position="center" />
      </Box>
    </Sheet>
  );
};

export default IndexTable;