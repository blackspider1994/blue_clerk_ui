import React, { useEffect, useRef, useState } from 'react';
import SearchIcon from '@material-ui/icons/Search';
import ClearIcon from '@material-ui/icons/Clear';
import styles from './bc-table-search-container.styles';
import { IconButton, InputBase, Paper, withStyles } from '@material-ui/core';
import { useLocation } from 'react-router-dom';


interface BCTableSearchInputProps {
  classes: any;
  searchText: string,
  handleSearchChange: any
  handleSearchReset: any
  searchPlaceholder: string
  handleKeyDown: (event: any) => void,
  handleSearchButton: (event: any) => void,
  autoFocus: boolean
}

function BCTableSearchContainer({
  classes,
  searchText,
  handleSearchChange,
  handleSearchReset,
  searchPlaceholder,
  handleKeyDown,
  handleSearchButton,
  autoFocus
}: BCTableSearchInputProps): JSX.Element {

  const location = useLocation<any>();
  const [currentLocation, setCurrentLocation] = useState(location)
  const inputReference = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Checking if is autofocus and if the current input belong to the active tab if it exists
    if (autoFocus && inputReference.current && (currentLocation.state?.tab === undefined || currentLocation.state.tab === location.state.tab)) {
      (inputReference.current.firstChild as HTMLInputElement).focus();
    }
  });
  return (
    <Paper classes={{ 'root': classes.searchContainer }}>
      <InputBase
        className={classes.input}
        inputProps={{ 'aria-label': 'search google maps' }}
        name={'searchText'}
        onChange={(event: any) => {
          handleSearchChange(event);
        }}
        placeholder={searchPlaceholder}
        value={searchText}
        onKeyDown={handleKeyDown}
        ref={inputReference}
      />
      {searchText && (
        <>
          <IconButton
            aria-label={'clear'}
            className={classes.iconButton}
            onClick={handleSearchReset}
          >
            <ClearIcon />
          </IconButton>
          <div className={classes.iconButtonBorder} />
        </>
      )}
      <IconButton
        aria-label={'search'}
        className={classes.iconButton}
        type={'submit'}
        onClick={handleSearchButton}
      >
        <SearchIcon />
      </IconButton>
    </Paper>
  );
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(BCTableSearchContainer);
