import React, { useEffect, useState } from 'react';
import { createMuiTheme, makeStyles, Theme } from "@material-ui/core/styles";
import {
  createStyles,
  Grid,
  InputAdornment,
  MenuItem,
  Select, TextField,
  withStyles
} from "@material-ui/core";
import * as CONSTANTS from "../../../constants";
import styles from "./bc-invoice.styles";
import classNames from "classnames";
import { blue } from "@material-ui/core/colors";
import InputBase from "@material-ui/core/InputBase";
import FormControl from "@material-ui/core/FormControl";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import {Autocomplete} from "@material-ui/lab";
import {useLocation} from "react-router-dom";
import { useSelector } from "react-redux";



const useInvoiceTableStyles = makeStyles((theme: Theme) =>
  createStyles({
    // items table
    itemsTableHeader: {
      padding: '18px 20px',
      backgroundColor: CONSTANTS.INVOICE_TOP,
     /* color: CONSTANTS.INVOICE_TABLE_HEADING,*/
      fontStyle: 'normal',
      fontWeight: 500,
      fontSize: '14px',
      lineHeight: '16px',
      textTransform: 'uppercase',
      color: '#828282',
    },
    itemsTableRoot: {
      padding: '35px 20px',
      borderBottom: '1px solid #D0D3DC',
    },
    textCenter: {
      textAlign: 'center'
    },
    textRight: {
      textAlign: 'right'
    },

    // custom input
    formField: {
      margin: theme.spacing(1),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end'
    },
    formFieldFullWidth: {
      margin: theme.spacing(1),
      width: '100%'
    },
    formFieldRow: {
      margin: theme.spacing(1),
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around'
    },
    bootstrapRoot: {
      'label + &': {
        marginTop: 0,
        display: 'flex',
        minWidth: '50%'
      },
      '&': {
        marginTop: 0,
        display: 'flex',
        minWidth: '50%'
      },
    },
    bootstrapRootError: {
      borderRadius: 8,
      border: `1px solid ${CONSTANTS.PRIMARY_ORANGE}`,
    },
    bootstrapInput: {
      borderRadius: 8,
      position: 'relative',
      backgroundColor: theme.palette.common.white,
      border: '1px solid #E0E0E0',
      fontSize: 14,
      width: '100%',
      padding: '8px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      '&:focus': {
        borderRadius: 8,
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
    bootstrapFormLabel: {
      fontSize: 14,
      textTransform: 'uppercase',
      transform: 'none',
      marginRight: 20,
      color: CONSTANTS.PRIMARY_DARK_GREY
    },
    autocomplete: {
      width: '97%',
    },
    autocompleteInput: {
      padding: '0 5px !important',
      fontSize: 14,
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      '& fieldset': {
        borderRadius: 8,
        border: '1px solid #E0E0E0',
      },
      '&:hover fieldset': {
        borderColor: '#E0E0E0 !important',
      },
      '&.Mui-focused fieldset': {
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#80bdff !important',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
  }),
);

const theme = createMuiTheme({
  palette: {
    primary: {
      main: blue[500],
    },
  },
  overrides: {
    MuiCard: {
      root: {
        margin: 10,
        borderRadius: 5
      },
    },
  },
});

interface Props {
  classes?: any;
  invoiceItems: any;
  values?: any;
  itemTier: any,
  handleChange(items: any[]): any,
  errors?: any;
  taxes: any;
  getItems: (includeDiscountItems?: boolean) => Promise<any>;
}

function BCInvoiceItemsTableRow({ classes, values, invoiceItems=[], handleChange, itemTier, errors, taxes, getItems }: Props) {
  const [serviceItems, setServiceItems] = useState<any>([]);
  const { user } = useSelector(({ auth }: any) => auth);
  const profile = useSelector(({ profile }: any) => profile);
  
  const invoiceTableStyle = useInvoiceTableStyles();
  const { state } = useLocation<any>();

  const handleServiceChange = (item: any, index: number) => {
    const tempArray = [...invoiceItems];
    if (item === null) {
      const newItem = {
        'description': '',
        'isFixed': true,
        'name': '',
        'price': 0,
        'quantity': 1,
        'tax': 0,
        'taxAmount': 0,
        'total': 0
      };
      tempArray[index] = newItem;
    } else {
      if (itemTier?._id && !item.isDiscountItem) {
        // @ts-ignore
        const customerTier = item?.tiers.find(({tier}) => tier._id === itemTier._id);
        tempArray[index].price = customerTier?.charge || 0;
      } else {
        tempArray[index].price = item?.charges || 0;
      }
      tempArray[index].tax = item?.tax
        ? taxes[0].tax
        : 0;
      tempArray[index].isFixed = item?.isFixed ?? true;
      tempArray[index]._id = item?._id;

      tempArray[index]['name'] = item.name;

      tempArray[index].taxAmount = parseFloat(((tempArray[index].price * tempArray[index].quantity) * (tempArray[index].tax / 100)).toFixed(2)); // eslint-disable-line
      tempArray[index].subTotal = (tempArray[index].price * tempArray[index].quantity) + tempArray[index].taxAmount;
    }
    handleChange(tempArray);
  }

  const handleItemChange = (value: string | null, index:number, fieldName:string) => {
    const tempArray = [...invoiceItems];
    tempArray[index][fieldName] = value;

    tempArray[index].taxAmount = parseFloat(((tempArray[index].price * tempArray[index].quantity) * (tempArray[index].tax / 100)).toFixed(2)); // eslint-disable-line
    tempArray[index].subTotal = (tempArray[index].price * tempArray[index].quantity) + tempArray[index].taxAmount; // eslint-disable-line
    handleChange(tempArray);
  };

  const removeItem = (rowIndex:number) => {
    const newItems = [...invoiceItems];
    newItems.splice(rowIndex, 1);
    handleChange(newItems);
  };

  useEffect(() => {
    handleChange(invoiceItems);
  }, [invoiceItems])

  useEffect(() => {
    if (!state?.invoiceDetail) {
      invoiceItems.forEach((invoiceItem: any, index: number) => {
        const fullItem = serviceItems.find((serviceItem: any) => serviceItem._id === invoiceItem._id)
        handleServiceChange(fullItem, index)
      })
    }
  }, [itemTier])

  useEffect(() => {
    getItems(true)
      .then(res => {
        const tempServiceItems = res.items;
        tempServiceItems
          .sort((a:any, b:any) => a.name.toLowerCase() > b.name.toLowerCase() ? 1 : a.name.toLowerCase() <b.name.toLowerCase() ? -1 : 0)
          .sort((a:any, b:any) => !a.isDiscountItem && b.isDiscountItem ? 1 : -1)
          .reverse();
        setServiceItems(tempServiceItems)
      })
      .catch(console.log)
  }, [])
  

  return (
    <>
      <Grid container spacing={1} className={invoiceTableStyle.itemsTableHeader}>
        <Grid item xs={5}>Service / Product</Grid>
        <Grid item xs={1} className={invoiceTableStyle.textCenter}>Quantity</Grid>
        <Grid item xs={2} className={invoiceTableStyle.textCenter}>Price</Grid>
        <Grid item xs={1} className={invoiceTableStyle.textCenter}>Unit</Grid>
        <Grid item xs={1} className={invoiceTableStyle.textCenter}>Tax</Grid>
        <Grid item xs={1} className={invoiceTableStyle.textRight}>Amount</Grid>
        <Grid item xs={1} className={invoiceTableStyle.textCenter}></Grid>
      </Grid>
      {
        invoiceItems.map((rowData: any, rowIndex: number) => {
          return (
            <div className={invoiceTableStyle.itemsTableRoot} key={rowIndex}>
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={5}>
                  <FormControl className={invoiceTableStyle.formFieldFullWidth}>
                    <Autocomplete
                      id="combo-box-demo"
                      options={serviceItems}
                      onChange={(e, newValue) => handleServiceChange(newValue, rowIndex)}
                      value={rowData}
                      getOptionLabel={(option) => option.name}
                      classes= {{
                        root: classNames(invoiceTableStyle.autocomplete, {
                        [invoiceTableStyle.bootstrapRootError]: errors?.itemsNames?.indexOf(rowIndex) >=0
                      }),
                        inputRoot: invoiceTableStyle.autocompleteInput,
                      }}
                      renderInput={(params) =>
                        <TextField
                          {...params}
                          variant="outlined" />
                      }
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={1}>
                  <FormControl className={invoiceTableStyle.formField}>
                    <InputBase
                      id="one"
                      name="quantity"
                      type="number"
                      inputProps={{ min: 1, max: 100 }}
                      value={rowData?.quantity}
                      error={!!errors.quantity}
                      onChange={(e: any) => handleItemChange(e.target.value, rowIndex, 'quantity')}
                      classes={{
                        root: classNames(invoiceTableStyle.bootstrapRoot, {
                          [invoiceTableStyle.bootstrapRootError]: !!errors.quantity
                        }),
                        input: invoiceTableStyle.bootstrapInput,
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  <FormControl className={invoiceTableStyle.formField}>
                    <InputBase
                      id="one"
                      name="price"
                      type="number"
                      value={rowData?.price}
                      error={!!errors.price}
                      onChange={(e: any) => handleItemChange(e.target.value, rowIndex, 'price')}
                      classes={{
                        root: classNames(invoiceTableStyle.bootstrapRoot, {
                          [invoiceTableStyle.bootstrapRootError]: !!errors.price
                        }),
                        input: invoiceTableStyle.bootstrapInput,
                      }}
                      readOnly={user._id != profile.companyAdmin && !values.isDraft}
                      startAdornment={<InputAdornment position="start">$</InputAdornment>}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={1}>
                  <FormControl className={invoiceTableStyle.formFieldFullWidth}>
                    <Select
                      onChange={(e: any) => handleItemChange(e.target.value, rowIndex, 'isFixed')}
                      value={rowData.isFixed}
                      input={<InputBase
                        classes={{
                          root: classNames(invoiceTableStyle.bootstrapRoot, {
                            [invoiceTableStyle.bootstrapRootError]: !!errors.unit
                          }),
                          input: invoiceTableStyle.bootstrapInput,
                        }}
                        error={!!errors.unit} />}
                    >
                      <MenuItem value={"true"}>
                        Fixed
                      </MenuItem>
                      <MenuItem value={"false"}>
                        Hourly
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={1}>
                  <FormControl className={invoiceTableStyle.formFieldFullWidth}>
                    <Select
                      onChange={(e: any) => handleItemChange(e.target.value, rowIndex, 'tax')}
                      value={rowData.tax}
                      input={<InputBase
                        classes={{
                          root: classNames(invoiceTableStyle.bootstrapRoot, {
                            [invoiceTableStyle.bootstrapRootError]: !!errors.tax
                          }),
                          input: invoiceTableStyle.bootstrapInput,
                        }}
                        error={!!errors.tax} />}
                    > {rowData.tax !== 0 && !taxes.find((tax:any) => tax.tax === rowData.tax) &&
                    <MenuItem value={rowData.tax} disabled>
                      {rowData.tax}
                    </MenuItem>

                    }
                      <MenuItem value={"0"}>
                        N/A
                      </MenuItem>
                      {taxes.map((tax: any, taxIndex: number) =>
                        <MenuItem value={tax.tax} key={taxIndex}>
                          {tax.tax} %
                        </MenuItem>
                      )}

                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={1} className={invoiceTableStyle.textRight}>
            <span>
              {rowData.subTotal && rowData.subTotal >= 0 ? `$ ${parseFloat(rowData.subTotal).toFixed(2)}` : `-$ ${Math.abs(parseFloat(rowData.subTotal)).toFixed(2)}`}
            </span>
                </Grid>
                <Grid item xs={1} className={invoiceTableStyle.textCenter}>
                  <IconButton aria-label="delete" color="primary" size="small" onClick={() => removeItem(rowIndex)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Grid>
              </Grid>

              <Grid container spacing={1} justify="space-between" alignItems="center">
                <Grid item xs={9}>
                  <FormControl className={invoiceTableStyle.formFieldFullWidth}>
                    <InputBase
                      id="one"
                      name="message"
                      value={rowData.description}
                      error={!!errors.message}
                      onChange={(e: any) => handleItemChange(e.target.value, rowIndex, 'description')}
                      classes={{
                        root: classNames(invoiceTableStyle.bootstrapRoot, {
                          [invoiceTableStyle.bootstrapRootError]: !!errors.message
                        }),
                        input: invoiceTableStyle.bootstrapInput,
                      }}
                    />
                  </FormControl>
                </Grid>
                <Grid item xs={2}>
                  --
                </Grid>
              </Grid>



            </div>
          )
        })
      }
    </>
  )
}

export default withStyles(styles)(BCInvoiceItemsTableRow);
