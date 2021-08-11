import React, { useState } from "react";
import {
  Button,
  createStyles,
  Divider,
  Grid,
  InputAdornment,
  MenuItem,
  Select,
  withStyles
} from "@material-ui/core";
import classNames from "classnames";
import { makeStyles, Theme } from "@material-ui/core/styles";
import * as CONSTANTS from "../../../constants";
import styles from "./bc-invoice.styles";
import { useSelector } from "react-redux";
import { RootState } from "../../../reducers";
import InputBase from '@material-ui/core/InputBase';
import TextField from '@material-ui/core/TextField';
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import CloseIcon from '@material-ui/icons/Close';

import {
  DatePicker,
} from '@material-ui/pickers';

const useTableStyles = makeStyles((theme: Theme) =>
  createStyles({
    // items table
    editableContainer: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      paddingTop: 10,
      paddingBottom: 10
    },
    itemsTableHeaderText: {
      fontSize: 10,
      fontWeight: 200,
      color: CONSTANTS.INVOICE_TABLE_HEADING,
      display: 'block',
      padding: '20px 0',
      borderRight: `1px solid ${CONSTANTS.PRIMARY_WHITE}`
    },
    itemsTableHeaderTextCenter: {
      textAlign: 'center',
    },
    itemsTableHeaderTextRight: {
      textAlign: 'right',
      paddingRight: '10px!important'
    },
    itemsTableBody: {
      paddingLeft: theme.spacing(10),
      paddingRight: theme.spacing(10),
    },
    itemsTableBodyText: {
      fontSize: 14,
      fontWeight: 600,
      color: CONSTANTS.INVOICE_TABLE_HEADING,
      display: 'block',
      padding: '20px 0',
      borderRight: `1px solid ${CONSTANTS.PRIMARY_WHITE}`
    },
    actionsContainer: {
      position: 'absolute',
      right: -50
    },
  }),
);

const TableSelect = withStyles((theme: Theme) =>
  createStyles({
    root: {
      outline: 0
    }
  }),
)(TextField);

interface Props {
  classes: any;
  row: any;
  isEdit?: boolean;
}

function BcInvoiceTableRow({ classes, row, isEdit }: Props) {
  const invoiceTableStyle = useTableStyles();
  const { 'items': invoiceItems } = useSelector(({ invoiceItems }:RootState) => invoiceItems);

  const [item, setItem] = useState(row?.item._id);
  const [quantity, setQuantity] = useState(row?.quantity);
  const [price, setPrice] = useState(row?.price);
  const [unit, setUnit] = useState(0);
  const [tax, setTax] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [amount, setAmount] = useState(0);

  return (
    <div>
      <div className={invoiceTableStyle.editableContainer}>
        <Grid
          container
          direction="row"
          alignItems="center">
          <Grid item xs={12} lg={6}>
            <TableSelect
              fullWidth
              select
              inputProps={{
                disableUnderline: true
              }}
              placeholder="Select Service/Product"
              size="small"
              id={row?.item._id}
              value={item}
              onChange={(e) => {
                setItem(e.target.value);
              }}
            >
              {
                invoiceItems.map((invitem, invindex) => {
                  return (
                    <MenuItem key={invindex} value={invitem?._id}>{invitem?.name}</MenuItem>
                  )
                })
              }
            </TableSelect>
          </Grid>
          <Grid item xs={12} lg={1}>
            <InputBase
              type="number"
              value={quantity}
              inputProps={{ min: "0", max: "99", step: "1" }}
              onChange={(e) => {
                setQuantity(e.target.value);
              }}
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
            />
          </Grid>
          <Grid item xs={12} lg={1}>
            <InputBase
              value={price}
              type="number"
              inputProps={{ min: "0", step: "0.1" }}
              onChange={(e) => {
                setPrice(parseFloat(e.target.value).toFixed(2));
              }}
              startAdornment={<InputAdornment position="start">$</InputAdornment>}
            />
          </Grid>
          <Grid item xs={12} lg={1}>
                <span className={classNames(
                  invoiceTableStyle.itemsTableBodyText,
                  invoiceTableStyle.itemsTableHeaderTextCenter
                )}>{row?.quantity}</span>
          </Grid>
          <Grid item xs={12} lg={1}>
                <span className={classNames(
                  invoiceTableStyle.itemsTableBodyText,
                  invoiceTableStyle.itemsTableHeaderTextCenter
                )}>{row?.tax > 0 ? parseFloat(row?.tax).toFixed(2) : 'N/A'}</span>
          </Grid>
          <Grid item xs={12} lg={1}>
                <span className={classNames(
                  invoiceTableStyle.itemsTableBodyText,
                  invoiceTableStyle.itemsTableHeaderTextCenter
                )}>${parseFloat(row?.taxAmount).toFixed(2)}</span>
          </Grid>
          <Grid item xs={12} lg={1}>
                <span className={classNames(
                  invoiceTableStyle.itemsTableBodyText,
                  invoiceTableStyle.itemsTableHeaderTextRight
                )}>${parseFloat(row?.subTotal).toFixed(2)}</span>
          </Grid>
        </Grid>
        <div className={invoiceTableStyle.actionsContainer}>
          {
            isEdit ?
              <IconButton aria-label="edit" color="primary" size="small">
                <CloseIcon fontSize="inherit" />
              </IconButton> :
              <IconButton aria-label="save" color="primary" size="small">
                <SaveIcon fontSize="inherit" />
              </IconButton>
          }

          <IconButton aria-label="delete" color="secondary" size="small">
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </div>
      </div>
      <Divider/>
    </div>
  )
}

export default withStyles(styles)(BcInvoiceTableRow);
