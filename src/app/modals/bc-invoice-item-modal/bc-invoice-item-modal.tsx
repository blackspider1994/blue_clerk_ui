/* eslint-disable react/jsx-handler-names */
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createStyles, withStyles, Theme } from '@material-ui/core/styles';
import { useFormik } from 'formik';
import styled from 'styled-components';
import * as yup from 'yup';
import {
  Button,
  FormControl,
  MenuItem,
  Select,
  Grid,
  DialogContent,
  DialogActions,
  InputBase,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Typography,
} from '@material-ui/core';

import {
  validateDecimalAmount,
  replaceAmountToDecimal,
} from 'utils/validation';
import {
  closeModalAction,
  setModalDataAction,
} from 'actions/bc-modal/bc-modal.action';
import BCInput from 'app/components/bc-input/bc-input';
import { Item } from 'actions/invoicing/items/items.types';
import { updateInvoiceItem } from 'actions/invoicing/items/items.action';
import { RootState } from 'reducers';
import {
  error as errorSnackBar,
  success,
} from 'actions/snackbar/snackbar.action';
import * as CONSTANTS from '../../../constants';
import styles from './bc-invoice-item-modal.styles';
import { updateItems, addItem } from 'api/items.api';
import { loadInvoiceItems } from 'actions/invoicing/items/items.action';

const EditItemValidation = yup.object().shape({
  name: yup.string().required(),
  description: yup.string(),
  isFixed: yup.boolean().required(),
  isJobType: yup.boolean().required(),
  tax: yup.string().required(),
});

const StyledInput = withStyles((theme: Theme) =>
  createStyles({
    root: {
      marginTop: 10,
      marginBottom: 10,
    },
    input: {
      width: 130,
      borderRadius: 7,
      position: 'relative',
      backgroundColor: theme.palette.background.paper,
      border: '1px solid #ced4da',
      fontSize: 16,
      padding: '10px 26px 10px 12px',
      transition: theme.transitions.create(['border-color', 'box-shadow']),
      fontFamily: ['Roboto', 'sans-serif'].join(','),
      '&:focus': {
        borderRadius: 4,
        borderColor: '#80bdff',
        boxShadow: '0 0 0 0.2rem rgba(0,123,255,.25)',
      },
    },
  })
)(InputBase);

interface ModalProps {
  item: Item;
  classes: any;
}

function BCInvoiceEditModal({ item, classes }: ModalProps) {
  const { _id, name, isFixed, isJobType, description, tax, tiers } = item;
  const { itemObj, error, loadingObj } = useSelector(
    ({ invoiceItems }: RootState) => invoiceItems
  );
  const { data: taxes } = useSelector(({ tax }: any) => tax);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const isAdd = _id ? false : true;

  const closeModal = () => {
    dispatch(
      setModalDataAction({
        data: {},
        type: '',
      })
    );
    dispatch(closeModalAction());
  };

  const activeTiers = Object.keys(tiers)
    .map((tier_id) => ({
      ...tiers[tier_id].tier,
      charge:
        tiers[tier_id].charge !== null &&
        typeof tiers[tier_id].charge !== 'undefined'
          ? `${tiers[tier_id].charge}`
          : '',
      cost:
        tiers[tier_id].cost !== null &&
        typeof tiers[tier_id].cost !== 'undefined'
          ? `${tiers[tier_id].cost}`
          : '',
    }))
    .filter((tier) => tier.isActive);

  const formik = useFormik({
    initialValues: {
      itemId: _id,
      name: name,
      description: description,
      isFixed: `${isFixed}`,
      isJobType: isJobType,
      tax: tax ? 1 : 0,
      tiers: activeTiers.reduce(
        (total, currentValue) => ({
          ...total,
          [currentValue._id]: currentValue,
        }),
        {}
      ),
    },
    onSubmit: async (values) => {
      setIsSubmitting(true);
      if (Number(values.tax) === 1) {
        values.tax = taxes[0].tax;
      } else {
        values.tax = 0;
      }
      // dispatch(updateInvoiceItem.fetch(values));
      const tiers: {
        ['string']: { _id: string; charge: string; cost: string };
      } = values.tiers;
      const tierArr = Object.values(tiers).map((tier) => ({
        tierId: tier._id,
        charge: !(
          typeof tier.charge === 'undefined' ||
          tier.charge === null ||
          tier.charge === ''
        )
          ? parseFloat(tier.charge).toFixed(2)
          : null,
        cost: !(
          typeof tier.cost === 'undefined' ||
          tier.cost === null ||
          tier.cost === ''
        )
          ? parseFloat(tier.cost).toFixed(2)
          : null,
      }));

      const invalidCharge = tierArr.filter(
        (tier) => typeof tier.charge === 'undefined' || tier.charge === null
      );

      if (invalidCharge.length) {
        dispatch(errorSnackBar('Tier Prices cannot be empty'));
        return setIsSubmitting(false);
      }
      const itemObject = {
        itemId: values.itemId,
        name: values.name,
        description: values.description || '',
        isFixed: values.isFixed === 'true' ? true : false,
        isJobType: values.isJobType,
        tax: values.tax,
        tiers: tierArr,
      };
      let response;
      if (isAdd) {
        response = await addItem(itemObject).catch((err: { message: any }) => {
          dispatch(errorSnackBar(err.message));
        });
      } else {
        response = await updateItems([itemObject]).catch(
          (err: { message: any }) => {
            dispatch(errorSnackBar(err.message));
          }
        );
      }
      if (response) {
        dispatch(loadInvoiceItems.fetch());
        dispatch(success(`Items successfully ${isAdd ? 'added' : 'updated'}`));
        closeModal();
      }
      setIsSubmitting(false);
    },
    validateOnBlur: false,
    validateOnChange: true,
    validationSchema: EditItemValidation,
  });

  useEffect(() => {
    if (error) {
      dispatch(errorSnackBar('Something went wrong, failed to update item'));
      return;
    }

    if (itemObj && itemObj._id === _id && !loadingObj) {
      dispatch(success('Item successfully updated'));
      setTimeout(() => {
        dispatch(closeModalAction());
        setTimeout(() => {
          dispatch(
            setModalDataAction({
              data: {},
              type: '',
            })
          );
        }, 200);
      }, 100);

      return () => {
        dispatch(updateInvoiceItem.cancelled());
      };
    }
  }, [itemObj]);

  return (
    <DataContainer>
      <hr
        style={{ height: '1px', background: '#D0D3DC', borderWidth: '0px' }}
      />
      <form onSubmit={formik.handleSubmit}>
        <DialogContent classes={{ root: classes.dialogContent }}>
          <Grid container alignItems={'center'}>
            <Grid
              item
              xs={12}
              sm={3}
              container
              alignItems={'center'}
              justify={window.innerWidth < 600 ? 'flex-start' : 'flex-end'}
              style={{ padding: '0 7px' }}
            >
              <span style={{ color: '#4F4F4F', fontWeight: 500 }}>
                ITEM NAME
              </span>
            </Grid>
            <Grid
              item
              xs={12}
              sm={9}
              alignItems="center"
              style={{ padding: '0 7px' }}
            >
              <BCInput
                error={formik.touched.name && Boolean(formik.errors.name)}
                handleChange={formik.handleChange}
                helperText={formik.touched.name && formik.errors.name}
                name={'name'}
                value={formik.values.name}
                margin={'none'}
                inputProps={{
                  style: {
                    padding: '12px 14px',
                  },
                }}
                InputProps={{
                  style: {
                    borderRadius: 8,
                    marginTop: 10,
                  },
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              container
              alignItems={'center'}
              justify={window.innerWidth < 600 ? 'flex-start' : 'flex-end'}
              style={{ padding: '0 7px' }}
            >
              <span
                style={{ color: '#4F4F4F', fontWeight: 500, marginTop: 20 }}
              >
                DESCRIPTION
              </span>
            </Grid>
            <Grid
              item
              xs={12}
              sm={9}
              alignItems="center"
              style={{ padding: '0 7px' }}
            >
              <BCInput
                error={
                  formik.touched.description &&
                  Boolean(formik.errors.description)
                }
                handleChange={formik.handleChange}
                helperText={
                  formik.touched.description && formik.errors.description
                }
                name={'description'}
                value={formik.values.description}
                multiline
                margin={'none'}
                inputProps={{
                  style: {
                    padding: '12px 14px',
                  },
                }}
                InputProps={{
                  style: {
                    borderRadius: 8,
                    marginTop: 10,
                  },
                }}
              />
            </Grid>
            <Grid
              item
              xs={12}
              sm={3}
              container
              alignItems={'center'}
              justify={window.innerWidth < 600 ? 'flex-start' : 'flex-end'}
              style={{ padding: '0 7px' }}
            />
            <Grid
              item
              xs={12}
              sm={9}
              alignItems="center"
              style={{ padding: '0 7px' }}
            >
              <FormControlLabel
                classes={{ label: classes.checkboxLabel }}
                control={
                  <Checkbox
                    color={'primary'}
                    checked={formik.values.isJobType}
                    onChange={formik.handleChange}
                    name="isJobType"
                    classes={{ root: classes.checkboxInput }}
                  />
                }
                label={`This Item is also a Job Type`}
              />
            </Grid>
            <Grid container>
              <Grid
                item
                xs={12}
                sm={3}
                container
                alignItems={'center'}
                justify={window.innerWidth < 600 ? 'flex-start' : 'flex-end'}
                style={{ padding: '0 7px' }}
              >
                <span
                  style={{
                    color: '#4F4F4F',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                  }}
                >
                  CHARGE TYPE
                </span>
              </Grid>
              <Grid
                item
                xs={12}
                sm={2}
                alignItems="center"
                style={{ padding: '0 7px' }}
              >
                <Select
                  error={
                    formik.touched.isFixed && Boolean(formik.errors.isFixed)
                  }
                  input={<StyledInput />}
                  name={'isFixed'}
                  onChange={formik.handleChange}
                  value={formik.values.isFixed}
                >
                  <MenuItem value={'true'}>{'Fixed'}</MenuItem>
                  <MenuItem value={'false'}>{'Hourly'}</MenuItem>
                  <MenuItem value={'%'}>{'Percentage(%)'}</MenuItem>
                </Select>
              </Grid>
              <Grid
                item
                xs={12}
                sm={3}
                container
                alignItems={'center'}
                justify={window.innerWidth < 600 ? 'flex-start' : 'flex-end'}
                style={{ padding: '0 7px' }}
              >
                <span style={{ color: '#4F4F4F', fontWeight: 500 }}>TAX</span>
              </Grid>
              <Grid
                item
                xs={12}
                sm={3}
                alignItems="center"
                style={{ padding: '0 7px' }}
              >
                <FormControl>
                  <Select
                    error={formik.touched.tax && Boolean(formik.errors.tax)}
                    input={<StyledInput />}
                    name={'tax'}
                    onChange={formik.handleChange}
                    value={formik.values.tax}
                  >
                    <MenuItem value={1}>{'Yes'}</MenuItem>
                    <MenuItem value={0}>{'No'}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container className="pricing">
              <Grid container justify="center">
                <Typography variant={'h6'}>
                  <strong>Tier Prices</strong>
                </Typography>
              </Grid>
              <Grid container>
                {activeTiers.map((tier) => (
                  <Grid
                    item
                    xs={12}
                    sm={4}
                    container
                    alignItems="center"
                    key={tier.name}
                  >
                    <Grid
                      style={{
                        padding: '0 7px 0 0',
                        color: '#4F4F4F',
                        fontWeight: 500,
                      }}
                    >
                      TIER {tier.name} PRICE
                    </Grid>
                    <FormControl>
                      <BCInput
                        onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                          formik.setFieldValue(
                            `tiers.${tier._id}.charge`,
                            replaceAmountToDecimal(e.target.value)
                          );
                        }}
                        handleChange={(
                          e: React.ChangeEvent<HTMLInputElement>
                        ) => {
                          const amount = e.target.value;
                          if (!validateDecimalAmount(amount)) return;
                          formik.setFieldValue(
                            `tiers.${tier._id}.charge`,
                            amount
                          );
                        }}
                        name={`tiers.${tier._id}.charge`}
                        value={`${formik.values.tiers[tier._id].charge}`}
                        margin={'none'}
                        inputProps={{
                          style: {
                            padding: '12px 14px',
                            width: 110,
                          },
                        }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">$</InputAdornment>
                          ),
                          style: {
                            borderRadius: 8,
                            marginTop: 10,
                          },
                        }}
                      />
                    </FormControl>
                  </Grid>
                ))}
              </Grid>
            </Grid>
            {formik.values.isFixed !== '%' && (
              <Grid container className="pricing">
                <Grid container justify="center">
                  <Typography variant={'h6'}>
                    <strong>Job costing</strong>
                  </Typography>
                </Grid>
                <Grid container>
                  {activeTiers.map((tier) => (
                    <Grid
                      item
                      xs={12}
                      sm={4}
                      container
                      alignItems="center"
                      key={tier.name}
                    >
                      <Grid
                        style={{
                          padding: '0 7px 0 0',
                          color: '#4F4F4F',
                          fontWeight: 500,
                        }}
                      >
                        TIER {tier.name} COST
                      </Grid>
                      <FormControl>
                        <BCInput
                          onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                            formik.setFieldValue(
                              `tiers.${tier._id}.cost`,
                              replaceAmountToDecimal(e.target.value)
                            );
                          }}
                          handleChange={(
                            e: React.ChangeEvent<HTMLInputElement>
                          ) => {
                            const amount = e.target.value;
                            if (!validateDecimalAmount(amount)) return;
                            formik.setFieldValue(
                              `tiers.${tier._id}.cost`,
                              amount
                            );
                          }}
                          name={`tiers.${tier._id}.cost`}
                          value={`${formik.values.tiers[tier._id].cost}`}
                          margin={'none'}
                          inputProps={{
                            style: {
                              padding: '12px 14px',
                              width: 110,
                            },
                          }}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                            style: {
                              borderRadius: 8,
                              marginTop: 10,
                            },
                          }}
                        />
                      </FormControl>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <hr
          style={{ height: '1px', background: '#D0D3DC', borderWidth: '0px' }}
        />
        <DialogActions
          classes={{
            root: classes.dialogActions,
          }}
        >
          <Grid container justify={'space-between'}>
            <Grid item />
            <Grid item>
              <Button
                disabled={isSubmitting}
                aria-label={'record-payment'}
                onClick={closeModal}
                classes={{
                  root: classes.closeButton,
                }}
                variant={'outlined'}
              >
                Cancel
              </Button>
              <Button
                disabled={isSubmitting}
                aria-label={'create-job'}
                classes={{
                  root: classes.submitButton,
                  disabled: classes.submitButtonDisabled,
                }}
                color="primary"
                type={'submit'}
                variant={'contained'}
              >
                Save
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </form>
    </DataContainer>
  );
}

const DataContainer = styled.div`
  margin: auto 0;

  .MuiFormLabel-root {
    font-style: normal;
    font-weight: normal;
    width: 800px;
    font-size: 20px;
    color: ${CONSTANTS.PRIMARY_DARK};
    /* margin-bottom: 6px; */
  }
  .MuiFormControl-marginNormal {
    margin-top: 0.5rem !important;
    margin-bottom: 1rem !important;
    /* height: 20px !important; */
  }
  .MuiInputBase-input {
    color: #383838;
    font-size: 16px;
    padding: 12px 14px;
  }
  .MuiInputAdornment-positionStart {
    margin-right: 0;
  }
  .MuiInputAdornment-root + .MuiInputBase-input {
    padding: 12px 14px 12px 0;
  }
  .MuiOutlinedInput-multiline {
    align-items: flex-start;
  }
  .required > label:after {
    margin-left: 3px;
    content: '*';
    color: red;
  }
  .save-customer-button {
    color: ${CONSTANTS.PRIMARY_WHITE};
  }
  .MuiTypography-h6 {
    color: ${CONSTANTS.PRIMARY_BLUE};
  }
  .pricing {
    margin-top: 20px;
  }
`;

export default withStyles(styles, { withTheme: true })(BCInvoiceEditModal);

