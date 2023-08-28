import BCCircularLoader from '../bc-circular-loader/bc-circular-loader';
import BCTableContent from './bc-table-content';
import BCTableSearchContainer from '../bc-table-search-container/bc-table-search-container';
import TableSearchUtils from 'utils/table-search';
import Typography from '@material-ui/core/Typography';
import styles from './bc-table.styles';
import { Grid, Paper, withStyles } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import '../../../scss/index.scss';
import styled from 'styled-components';
import debounce from 'lodash.debounce';


function BCTableContainer({
  tableData,
  columns,
  onRowClick,
  isLoading = false,
  classes,
  className,
  search,
  searchPlaceholder = 'Search Customers...',
  pagination = true,
  initialMsg = 'Nothing Here Yet',
  isPageSaveEnabled,
  setPage,
  currentPage,
  isDefault = false,
  pageSize = 10,
  stickyHeader = false,
  noHeader = false,
  cellSize,
  toolbar,
  noPadding = false,
  toolbarPositionLeft = false,
  toolbarPositionSpaceBetween=false,
  manualPagination = false,
  lastPageCursorImplemented = false,
  fetchFunction = () => { },
  total,
  currentPageIndex,
  setCurrentPageIndexFunction = () => { },
  currentPageSize,
  setCurrentPageSizeFunction = () => { },
  setKeywordFunction = () => { },
  disableInitialSearch = false,
  rowTooltip
}: any) {
  const location = useLocation<any>();
  const history = useHistory();
  const locationState = location.state;

  const initialSearch = locationState &&
    locationState.prevPage &&
    locationState.prevPage.search ? locationState.prevPage.search : '';

  const initialServerPaginatedSearch = manualPagination &&
    locationState && locationState.option &&
    locationState.option.search ? locationState.option.search : '';


  const onPageSearch = locationState &&
    locationState.onUpdatePage &&
    locationState.onUpdatePage.search ? locationState.onUpdatePage.search : null;

  const [searchText, setSearchText] = useState(''); // eslint-disable-line

  const [filteredData, setFilteredData] = useState([]);

  // Indicate if the search input shoul be autofocused
  const [autoFocusSearch, setFocusSearch] = useState(false);

  const handleSearchReset = () => {
    setSearchText('');
    setKeywordFunction('');
    handleSearchTextChanged('');
    setFocusSearch(false);
    setFocusSearch(true);
  };

  const handleSearchChange = (event: any) => {
    setSearchText(event.target.value);
  };

  /**
   * Receive the event when the user key down on the searcher
   * @param event
   */
  const handleKeyDown = (event: any) => {
    if (event.key === 'Enter') {
      const { value } = event.target;
      handleSearchTextChanged(value);
    }
  };

  /**
   * Receive the event when the user clicks on the search button
   */
  const handleSearchButton = (event: any) => {
    handleSearchTextChanged(searchText);
    setFocusSearch(false);
    setFocusSearch(true);
  };

  /**
   * Start the searching when the search text changing, it is activated
   * by enter key or by click on search button
   * @param value the new search text
   * @returns
   */
  const handleSearchTextChanged = (value: string) => {
    if (manualPagination) {
      fetchFunction(currentPageSize, undefined, undefined, value);
      setKeywordFunction(value);
      setCurrentPageIndexFunction(0);
    } else {
      if (setPage !== undefined) {
        setPage({
          ...currentPage,
          'search': value
        });
      }
      if (locationState && locationState.prevPage) {
        history.replace({
          ...history.location,
          'state': {
            ...currentPage,
            'search': value
          }
        });
      }
    }
  };

  const getFilteredArray = (entities: any, text: any) => {
    const arr = Object.keys(entities).map(id => entities[id]);
    if (text.length === 0) {
      return arr;
    }
    return TableSearchUtils.filterArrayByString(arr, text);
  };

  useEffect(() => {
    if (tableData) {
      if (initialSearch !== '') {
        setSearchText(initialSearch);
      }
      if (initialServerPaginatedSearch !== '' && !disableInitialSearch) {
        setSearchText(initialServerPaginatedSearch);
      }
    }
  }, [initialSearch, initialServerPaginatedSearch]);

  useEffect(() => {
    if (tableData && !manualPagination) {
      setFilteredData(getFilteredArray(tableData, searchText));
    } else if (tableData) {
      setFilteredData(tableData);
    }
  }, [tableData, searchText]);


  return (
    <TableContainer $noPadding={noPadding} container>
      <Grid
        className={'actions-container'}
        item
        md={toolbar
          ? 12
          : 6}
        xs={12}>
        {search
          ? <BCTableSearchContainer
            handleSearchChange={handleSearchChange}
            handleSearchReset={handleSearchReset}
            searchPlaceholder={searchPlaceholder}
            searchText={searchText}
            handleKeyDown={handleKeyDown}
            handleSearchButton={handleSearchButton}
            autoFocus={autoFocusSearch}
          />
          : null}
        {toolbar && <BCTableToolBarContainer left={toolbarPositionLeft} spaceBetween={toolbarPositionSpaceBetween}>
          {toolbar}
        </BCTableToolBarContainer>}
      </Grid>
      <Grid
        item
        md={12}
        xs={12}>
        {isLoading
          ? <Paper classes={{ 'root': classes.noDataPaper }}>
            <BCCircularLoader heightValue={'200px'} />
          </Paper>
          : filteredData && filteredData.length === 0
            ? <Paper classes={{ 'root': classes.noDataPaper }}>
              <Typography
                color={'textSecondary'}
                variant={'h5'}>
                {initialMsg}
              </Typography>
            </Paper>
            : <BCTableContent
              cellSize={cellSize}
              className={className ? className : ''}
              columns={columns}
              currentPage={currentPage}
              data={filteredData}
              defaultPageSize={pageSize}
              invoiceTable
              isDefault={isDefault}
              isLoading={isLoading}
              isPageSaveEnabled={isPageSaveEnabled || false}
              noHeader={noHeader}
              onRowClick={(ev: any, row: any) => {
                onRowClick && onRowClick(ev, row);
              }}
              pagination={pagination}
              setPage={setPage}
              stickyHeader={stickyHeader}
              manualPagination={manualPagination}
              lastPageCursorImplemented={lastPageCursorImplemented}
              fetchFunction={fetchFunction}
              total={total}
              currentPageIndex={currentPageIndex}
              setCurrentPageIndexFunction={setCurrentPageIndexFunction}
              currentPageSize={currentPageSize}
              setCurrentPageSizeFunction={setCurrentPageSizeFunction}
              rowTooltip={rowTooltip}
            />
        }
      </Grid>
    </TableContainer>
  );
}

const TableContainer = styled(Grid) <{ $noPadding: boolean }>`
padding: ${props => props.$noPadding ? '0' : '5px'};
.actions-container {
  display:flex;
  > .MuiPaper-root {
    flex: 1;
    margin-right: 20px;
  }
}
`;


const BCTableToolBarContainer = styled.div<{ left: boolean ,spaceBetween:boolean}>`
    margin-bottom: 10px;
    display: flex;
    flex: 1.66;
    justify-content: ${props => props.left ? 'flex-start' : props.spaceBetween ?'space-between':'flex-end'};
    button {
      margin-left: 20px;
    }
`;

export default withStyles(
  styles,
  { 'withTheme': true }
)(BCTableContainer);
