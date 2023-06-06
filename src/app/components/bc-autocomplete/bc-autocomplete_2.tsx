/* eslint-disable no-use-before-define */
import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { makeStyles } from "@material-ui/core/styles";
import { TextField, Typography, FormControl } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  fullWidth: {
    "margin-bottom": "5px",
    width: "100%",
  },
  inputBox: {
    marginTop: "0px"
  }
}));

export default function AutoComplete({
  handleChange,
  value,
  filterOptions,
  data = [],
  name = "",
  multiline = false,
  label = "",
  rows = 4,
  placeholder = "",
  variant = "outlined",
  className = "",
  margin = "normal",
  type = "text"
}: any) {
  const classes = useStyles();
  return (
    <FormControl className={classes.fullWidth}>
    {
      label !== "" &&
      <Typography className={className} variant={"subtitle1"}>
        {label}
      </Typography>
    }
    <Autocomplete
      id={name}
      options={data}
      value={value}
      onChange={(event: any, newValue: string | null) => {
        let virtualEvent = {
          target: {
            value: newValue ? newValue : "",
            id: name,
            name,
          }
        }
        handleChange(virtualEvent);
      }}
      filterOptions={filterOptions}
      // inputValue={value}
      // onInputChange={(event, newInputValue) => {
      //   let virtualEvent = {
      //     target: {
      //       id: name,
      //       name: name,
      //       value: newInputValue ? newInputValue : ''
      //     }
      //   }
      //   handleChange(virtualEvent);
      // }}
      getOptionLabel={(option:any) => typeof option === 'string' ? option : option.name}
      renderInput={(params) => <TextField
        {...params}
        label=""
        //value={value}
        className={classes.inputBox}
        placeholder={placeholder}
        //onChange={handleChange}
        type={type}
        variant={variant}
        id={"outlined-textarea"}
        margin={margin}
      />}
    />
  </FormControl>
  );
}
