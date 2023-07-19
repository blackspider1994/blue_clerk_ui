import BCTablePagination from './bc-table-pagination';
import MaUTable from '@material-ui/core/Table';
import Paper from '@material-ui/core/Paper';
import React, {useEffect} from 'react';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableFooter from '@material-ui/core/TableFooter';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import {useHistory, useLocation} from 'react-router-dom';
import clsx from 'clsx';
import styles from './bc-table.styles';
import {Tooltip, createStyles, makeStyles, withStyles} from "@material-ui/core";
import {
  useGlobalFilter,
  usePagination,
  useRowSelect,
  useSortBy,
  useTable
} from 'react-table';
import styled from "styled-components";
import * as CONSTANTS from "../../../constants";
import scrollTop from 'utils/scroll-top';

const useTableStyles = makeStyles(() =>
  createStyles({
    // items table
    tableHeader: {
      '& > .MuiTableCell-sizeSmall': {
        padding: '0 16px'
      }
    },
    tableRow: {
      '& > .MuiTableCell-root': {
        lineHeight: '30px',
      },
      '&:hover': {
        backgroundColor: `${CONSTANTS.TABLE_HOVER}!important`,
        cursor: 'pointer'
      }
    },
    /*    tableCell: {
          lineHeight: '30px',
        }*/
    highlighted: {
      backgroundColor: '#E5F7FF',
    }
  }),
);

function BCTableContent({
                          noHeader,
                          className,
                          stickyHeader,
                          defaultPageSize,
                          isDefault,
                          columns,
                          data,
                          onRowClick,
                          pagination = true,
                          invoiceTable = false,
                          setPage,
                          cellSize,
                          manualPagination = false,
                          lastPageCursorImplemented = false,
                          fetchFunction = () => {},
                          total,
                          currentPageIndex,
                          setCurrentPageIndexFunction = () => {},
                          currentPageSize,
                          setCurrentPageSizeFunction = () => {},
                          rowTooltip,
                        }: any) {
  const location = useLocation<any>();
  const history = useHistory();
  const locationState = location.state;
  const tableStyles = useTableStyles();

  const curTab = locationState && locationState?.curTab;

  const prevPage = locationState && locationState.prevPage ? locationState.prevPage : null;

  const onUpdatePage = locationState && locationState.onUpdatePage ? locationState.onUpdatePage : null;

  const initialSort = prevPage && prevPage.sortBy ? prevPage.sortBy : [];

  const initialPageIndex = prevPage ? prevPage.page : 0;

  const initialPageSize = prevPage ? prevPage.pageSize : 10;

  const {
    getTableProps,
    headerGroups,
    prepareRow,
    page,
    gotoPage,
    setPageSize,
    'state': {pageIndex, pageSize, sortBy}
  }: any = useTable(
    {
      // 'autoResetHiddenColumns': true,
      columns,
      data,
      'initialState': {
        'sortBy': manualPagination ? [] : isDefault ? [] : onUpdatePage ? onUpdatePage.sortBy : initialSort,
        'pageIndex': manualPagination ? currentPageIndex : isDefault ? 0 : !onUpdatePage ? initialPageIndex : onUpdatePage.page > data.length / onUpdatePage.pageSize ? 0 : onUpdatePage.page,
        'pageSize': manualPagination ? currentPageSize : isDefault && defaultPageSize ? defaultPageSize : onUpdatePage ? onUpdatePage.pageSize : initialPageSize
      },
      pageCount: manualPagination ? Math.ceil(total/currentPageSize) : Math.ceil(total/initialPageSize),
      manualPagination,
      autoResetPage: manualPagination ? false : true,
      'getSubRows': (row: any) => row && row.subRows || []
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks: any) => {
      hooks.allColumns.push((_columns: any) => [..._columns]);
    },
  );

  const handleChangePage = (event: any, newPage: any): any => {
    window.scrollTo(0, 20);

    if(manualPagination){
      if(newPage === 0) {
        fetchFunction(pageSize, undefined, undefined);
      } else if (newPage === Math.max(0, Math.ceil(total / pageSize) - 1) && lastPageCursorImplemented) {
        fetchFunction(pageSize, undefined, undefined, undefined, true);
      } else {
        fetchFunction(pageSize, newPage < pageIndex, newPage > pageIndex);
      }
    }

    if (setPage !== undefined) {
      setPage({
        pageSize,
        sortBy,
        'page': newPage
      });
    }

    if(!manualPagination){
      history.replace({
        ...history.location,
        'state': {
          ...locationState,
          'onUpdatePage': {
            pageSize,
            sortBy,
            'page': newPage
          }
        }
      });
    }

    if (prevPage) {
      history.replace({
        ...history.location,
        'state': {
          ...location.state,

          'prevPage': {
            pageSize,
            sortBy,
            'page': newPage
          }
        }
      });
    }
    gotoPage(newPage);
    if(manualPagination){
      setCurrentPageIndexFunction(newPage, true);
    }
  };

  const handleChangeRowsPerPage = (event: any) => {
    if(manualPagination){
      fetchFunction(Number(event.target.value));
      setCurrentPageSizeFunction(Number(event.target.value))
      setCurrentPageIndexFunction(0, false);
    }

    const delay = 100;
    setTimeout(function () {
      scrollTop();
    }, delay);

    if (setPage !== undefined) {
      setPage({
        ...location.state,
        'page': pageIndex,
        sortBy,
        'pageSize': Number(event.target.value)
      });
    }

    if(!manualPagination){
      history.replace({
        ...history.location,
        'state': {
          ...locationState,
          'onUpdatePage': {
            'page': pageIndex,
            sortBy,
            'pageSize': Number(event.target.value)
          }
        }
      });
    }


    if (prevPage) {
      history.replace({
        ...history.location,
        'state': {
          ...location.state,
          'prevPage': {
            'page': pageIndex,
            sortBy,
            'pageSize': Number(event.target.value)
          }
        }
      });
    }

    setPageSize(Number(event.target.value));
  };

  const handleSortBy = (sortBy: any) => {
    if (setPage !== undefined) {
      setPage({
        'page': 0,
        pageSize,
        sortBy
      });

      handleChangePage(null, 0);
    }

    if(!manualPagination){
      history.replace({
        ...history.location,
        'state': {
          ...locationState,
          'onUpdatePage': {
            'page': 0,
            pageSize,
            sortBy
          }
        }
      });
    }

    if (prevPage) {
      history.replace({
        ...history.location,
        'state': {
          ...location.state,
          'prevPage': {
            'page': 0,
            pageSize,
            sortBy
          }
        }
      });
    }
  };


  useEffect(() => {
    if (sortBy.length !== 0) {
      handleSortBy(sortBy);
    }
  }, [sortBy]);

  useEffect(() => {
    if (!isDefault) {
      setTimeout(() => {
        if (onUpdatePage) {
          const tempLocationState = location.state;

          delete tempLocationState.onUpdatePage;

          history.replace({
            ...history.location,
            'state': {...tempLocationState}
          });
        }
      }, 200);
    }
  }, []);

  useEffect(() => {
    if (!onUpdatePage && !manualPagination) {
      if (curTab !== undefined) {
        setPageSize(10);
        gotoPage(0);
        handleSortBy([]);
      }
    }
  }, [curTab]);


  const useStyles = makeStyles({
    'cellMd': {
      'padding': '6px 16px 6px 8px!important'
    },
    'table': {
      'width': '95%',
      'overflow': 'hidden',
    }
  });


  const tableClass = useStyles();

  // Render the UI for your table
  return (
    <TableContainer
      className={`min-h-full rounded ${invoiceTable
        ? `invoice-paper`
        : ''} ${className} `}
      component={StyledPaperContainer}
      style={{marginBottom: '300px'}}
      >
        
      <MaUTable
        size="small"
        stickyHeader={stickyHeader}
        {...getTableProps()}>
        <TableHead
          style={{'display': noHeader ? 'none' : 'table-header-group'}}>
          {headerGroups.map((headerGroup: any, gindex: number) =>
            <TableRow
              key={`table-${gindex}`}
              className={tableStyles.tableHeader}
              {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: any, hindex: number) =>
                <TableCell
                  className={`whitespace-no-wrap ${column.borderRight
                    ? 'cell-border-right cursor-default'
                    : ''}`}
                  key={`table-cell-${hindex}`}

                  {...(!column.sortable
                      ? column.getHeaderProps()
                      : column.getHeaderProps(
                        // HandleSorting(column)
                        column.getSortByToggleProps())
                  )}>
                  {column.render('Header')}
                  {column.sortable
                    ? <TableSortLabel
                      active={column.isSorted}
                      // React-table has a unsorted state which is not treated here
                      direction={column.isSortedDesc
                        ? 'desc'
                        : 'asc'}
                    />
                    : null}
                </TableCell>)}
            </TableRow>)}
        </TableHead>
        <TableBody>
          {page.map((row: any, i: number) => {
            prepareRow(row);
            return (
              <Tooltip title={rowTooltip ? rowTooltip(row) : ''}>
                <TableRow
                  key={`table-row-${i}`}
                  {...row.getRowProps()}
                  className={`truncate${row.original.readStatus?.isRead
                    ? ''
                    : ' unread'} ${tableStyles.tableRow} ${row.original.checked ? tableStyles.highlighted : ''}`}
                  hover={!invoiceTable}
                  onClick={(ev: any) => onRowClick(ev, row)}>
                  {row.cells.map((cell: any, cindex: number) => {
                    return (
                      <TableCell
                        classes={{'root': cellSize ? tableClass.cellMd : ''}}
                        key={`table-cell-${cindex}`}
                        {...cell.getCellProps()}
                        className={clsx(cell.column.className, `${cell.column.borderRight
                          ? 'cell-border-right cursor-default'
                          : ''}`)
                        }
                        style={{
                          'width': cell.column.width || 'auto'
                        }}>
                        {cell.render('Cell')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </Tooltip>
            );
          })}
        </TableBody>
        {
          pagination
            ? <TableFooter>
              <TableRow>
                <TablePagination
                  ActionsComponent={BCTablePagination}
                  classes={{
                    'root': 'overflow-hidden',
                    'spacer': 'w-0 max-w-0'
                  }}
                  //colSpan={5}
                  count={manualPagination ? total : data.length}
                  onChangePage={handleChangePage}
                  onChangeRowsPerPage={handleChangeRowsPerPage}
                  page={pageIndex}
                  rowsPerPage={pageSize}
                  rowsPerPageOptions={[
                    5, 10, 25, {
                      'label': 'All',
                      'value': manualPagination ? total : data.length + 1
                    }
                  ]}
                  SelectProps={{
                    'inputProps': {'aria-label': 'rows per page'},
                    'native': false
                  }}
                />
              </TableRow>
            </TableFooter>
            : null
        }
      </MaUTable>
    </TableContainer>
  );
}

const StyledPaperContainer = styled(Paper)`
  border-radius: 10px;
  width: 100%;
`;


export default withStyles(
  styles,
  {'withTheme': true}
)(BCTableContent);
