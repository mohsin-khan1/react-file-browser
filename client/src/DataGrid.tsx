import React from "react";

import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Chip from "@material-ui/core/Chip";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TablePagination from "@material-ui/core/TablePagination";
import TableRow from "@material-ui/core/TableRow";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import MoreHorizIcon from "@material-ui/icons/MoreHoriz";
import SubdirectoryArrowRightIcon from "@material-ui/icons/SubdirectoryArrowRight";

import { useListEntriesQuery } from "./generated-api";
import { FilterChip } from "./FilterChip";

const useStyles = makeStyles({
  table: {
    minWidth: 650
  }
});

function DataGrid() {
  const classes = useStyles();

  // filter hooks
  const [sizeGt, setSizeGt] = React.useState(200);
  const [sizeLt, setSizeLt] = React.useState(2000);
  const [typeEq, setTypeEq] = React.useState("File");
  const [nameContains, setNameContains] = React.useState("");

  const [page, setPage] = React.useState(1);
  const [currentPath, setCurrentPath] = React.useState("/");
  const [history, updateHistory] = React.useState<
    { id: string; path: string }[]
  >([
    {
      id: "/",
      path: "/"
    }
  ]);

  // currentPath is given in backticks in order to add path to it later
  const { data, loading, error } = useListEntriesQuery({
    variables: {
      path: `${currentPath}`,
      page,
      where: {
        size_gt: sizeGt,
        size_lt: sizeLt,
        name_contains: nameContains,
        type_eq: typeEq
        /**
         * File Size
         * @name size_gt mm mma number value that file size should be greater than
         * @name size_lt a number value that file size should be less than
         */
        // size_gt: sizeGt, // Int
        // size_lt: Int,

        /**
         * Entry Name Contains
         * @name name_contains an entry "name" text value to search on
         */
        // name_contains: String,

        /**
         * Type Equals
         * @name type_eq Exact match for Entry type
         */
        // type_eq: "Directory" | "File",
      }
    }
  });

  React.useEffect(() => {
    setCurrentPath(history[history.length - 1].path);
  }, [history]);

  const rows = React.useMemo(() => {
    const dataRows = data?.listEntries?.entries ?? ([] as any);

    return [
      ...(history.length > 1
        ? [
            {
              id: history[history.length - 2].id,
              path: history[history.length - 2].path,
              name: "UP_DIR",
              __typename: "UP_DIR"
            }
          ]
        : []),
      ...dataRows
    ];
  }, [history.length, data?.listEntries?.entries]);

  const rowCount = React.useMemo(() => {
    const totalUpDirRows =
      currentPath === "/"
        ? 0
        : (data?.listEntries?.pagination.pageCount ?? 0) * 1;
    const totalRowsFromServer = data?.listEntries?.pagination.totalRows ?? 0;
    return totalRowsFromServer + totalUpDirRows;
  }, [
    data?.listEntries?.pagination.pageCount,
    data?.listEntries?.pagination.totalRows
  ]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  return (
    <Box display="flex" height="100%">
      <Box flexGrow={1}>
        <Paper>
          <Toolbar>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              width="100%"
            >
              <Typography variant="h6" style={{ width: "33em" }}>
                File Browser
              </Typography>
              {/* FilterChip is reused for all filters */}
                {/* handleDelete and onChange are inline to avoid complexity */}
              <Box>
                <FilterChip
                  handleDelete={() => setSizeGt(0)}
                  title="File Size Min"
                  value={sizeGt}
                  type="Number"
                  onChange={(e: { currentTarget: { value: any } }) =>
                    setSizeGt(Number(e.currentTarget.value))
                  }
                />
                <FilterChip
                  handleDelete={() => setSizeLt(0)}
                  title="File Size Max"
                  value={sizeLt}
                  type="Number"
                  onChange={(e: { currentTarget: { value: any } }) =>
                    setSizeLt(Number(e.currentTarget.value))
                  }
                />
                <FilterChip
                  handleDelete={() => setNameContains("")}
                  title="Name Contains"
                  value={nameContains}
                  type="string"
                  onChange={(e: { currentTarget: { value: any } }) =>
                    setNameContains(e.currentTarget.value)
                  }
                />
                <FilterChip
                  handleDelete={() => setTypeEq("")}
                  title="Type(File | Directory)"
                  value={typeEq}
                  type="string"
                  onChange={(e: { currentTarget: { value: any } }) =>
                    setTypeEq(e.currentTarget.value)
                  }
                />
              </Box>
            </Box>
          </Toolbar>
          <TableContainer>
            <Table
              className={classes.table}
              size="small"
              aria-label="a dense table"
            >
              <TableHead>
                <TableRow>
                  <TableCell>Path</TableCell>
                  <TableCell align="right">Name</TableCell>
                  <TableCell align="right">Type</TableCell>
                  <TableCell align="right">Size</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(({ path, __typename, name, size, id }) => {
                  const isUpDir = __typename === "UP_DIR";
                  return (
                    <TableRow key={id}>
                      <TableCell component="th" scope="row">
                        <Button
                          color="primary"
                          disabled={__typename === "File"}
                          startIcon={
                            isUpDir ? (
                              <MoreHorizIcon />
                            ) : __typename === "File" ? null : (
                              <SubdirectoryArrowRightIcon />
                            )
                          }
                          onClick={() => {
                            updateHistory(h => {
                              if (isUpDir && h.length > 1) {
                                setPage(1);
                                return [...h.splice(0, h.length - 1)];
                              } else {
                                return [...h, { id: path, path }];
                              }
                            });
                          }}
                        >
                          {!isUpDir ? path : ""}
                        </Button>
                      </TableCell>
                      <TableCell align="right">
                        {isUpDir ? "_" : name}
                      </TableCell>
                      <TableCell align="right">
                        {isUpDir ? "_" : __typename}
                      </TableCell>
                      <TableCell align="right">
                        {isUpDir ? "_" : size}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[]}
            component="div"
            count={rowCount}
            rowsPerPage={25}
            page={page - 1}
            onChangePage={handleChangePage}
          />
        </Paper>
      </Box>
    </Box>
  );
}

export default DataGrid;
