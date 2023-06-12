import React, { useEffect, useState } from 'react';
import moment from 'moment';
import {
  Button,
  Checkbox,
  DialogActions,
  DialogContent,
  Grid,
  TextField,
  Popper,
  withStyles,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { closeModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import styled from 'styled-components';
import styles from './bc-customize-revenue-report-modal.styles';
import { useDispatch, useSelector } from 'react-redux';
import * as CONSTANTS from "../../../constants";
import { useFormik } from "formik";
import DropDownMenu, {Option} from "app/components/bc-select-dropdown/bc-select-dropdown";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { useHistory } from 'react-router-dom';
import { getCustomers } from 'actions/customer/customer.action';
import { modalTypes } from "../../../constants";
import {
  GENERATE_FROM_OPTIONS,
  PERIOD_OPTIONS,
  LOCATION_OPTIONS,
  DIVISION_OPTIONS,
  ITEM_AND_SERVICE_OPTIONS,
} from './constants'
import { ISelectedDivision } from 'actions/filter-division/fiter-division.types';


function BCCustomizeRevenueReportModal({ classes }: any) {
  const customers: any[] = useSelector(({ customers }: any) => customers.data);
  const dispatch = useDispatch();
  const history = useHistory();
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const currentDivision: ISelectedDivision = useSelector((state: any) => state.currentDivision);

  const closeModal = () => {
    dispatch(closeModalAction());
    setTimeout(() => {
      dispatch(setModalDataAction({
        'data': {},
        'type': ''
      }));
    }, 200);
  };

  useEffect(() => {
    dispatch(getCustomers());
  }, []);

  const handleClick = (event: React.MouseEvent<HTMLElement>, item: Option, fieldName:string) => {
    FormikSetFieldValue(fieldName, item.value);
  }
  const handleDateChange = (fieldName:string, value: any) => {
    FormikSetFieldValue(fieldName, value);
    FormikSetFieldValue('periodOption', '');
  }

  const handlePeriodClick = (event: React.MouseEvent<HTMLElement>, item: Option, fieldName:string) => {
    FormikSetFieldValue(fieldName, item.value);
    switch (item.value) {
      case 'recent':
        FormikSetFieldValue('startDate', moment().day(0).toDate());
        FormikSetFieldValue('endDate', moment().toDate());
        break;
      case 'lastWeek':
        FormikSetFieldValue('startDate', moment().subtract(1, 'week').day(0).toDate());
        FormikSetFieldValue('endDate', moment().subtract(1, 'week').day(6).toDate());
        break;
      case 'lastWeekToDate':
        FormikSetFieldValue('startDate', moment().day(0).subtract(1, 'week').toDate());
        FormikSetFieldValue('endDate', moment().toDate());
        break;
      case 'lastMonth':
        FormikSetFieldValue('startDate', moment().subtract(1, 'month').date(1).toDate());
        FormikSetFieldValue('endDate', moment().subtract(1, 'month').endOf('month').toDate());
        break;
      case 'lastMonthToDate':
        FormikSetFieldValue('startDate', moment().subtract(1, 'month').date(1).toDate());
        FormikSetFieldValue('endDate', moment().toDate());
        break;
      case 'thisQuarter':
        if([0,1,2].includes(moment().month())){
          FormikSetFieldValue('startDate', moment().month(0).date(1).toDate());
          FormikSetFieldValue('endDate', moment().month(2).endOf('month').toDate());
        } else if([3,4,5].includes(moment().month())){
          FormikSetFieldValue('startDate', moment().month(3).date(1).toDate());
          FormikSetFieldValue('endDate', moment().month(5).endOf('month').toDate());
        } else if([6,7,8].includes(moment().month())){
          FormikSetFieldValue('startDate', moment().month(6).date(1).toDate());
          FormikSetFieldValue('endDate', moment().month(8).endOf('month').toDate());
        } else if([9,10,11].includes(moment().month())){
          FormikSetFieldValue('startDate', moment().month(9).date(1).toDate());
          FormikSetFieldValue('endDate', moment().month(11).endOf('month').toDate());
        };
        break;
      case 'thisQuarterToDate':
        if([0,1,2].includes(moment().month())){
          FormikSetFieldValue('startDate', moment().month(0).date(1));
          FormikSetFieldValue('endDate', moment().toDate());
        } else if([3,4,5].includes(moment().month())){
          FormikSetFieldValue('startDate', moment().month(3).date(1));
          FormikSetFieldValue('endDate', moment().toDate());
        } else if([6,7,8].includes(moment().month())){
          FormikSetFieldValue('startDate', moment().month(6).date(1));
          FormikSetFieldValue('endDate', moment().toDate());
        } else if([9,10,11].includes(moment().month())){
          FormikSetFieldValue('startDate', moment().month(9).date(1));
          FormikSetFieldValue('endDate', moment().toDate());
        };
        break;
      case 'lastYear':
        FormikSetFieldValue('startDate', moment().subtract(1, 'year').month(0).date(1).toDate());
        FormikSetFieldValue('endDate', moment().subtract(1, 'year').month(11).endOf('month').toDate());
        break;
      case 'lastYearToDate':
        FormikSetFieldValue('startDate', moment().subtract(1, 'year').month(0).date(1).toDate());
        FormikSetFieldValue('endDate', moment().toDate());
        break;
      case 'thisYear':
        FormikSetFieldValue('startDate', moment().month(0).date(1).toDate());
        FormikSetFieldValue('endDate', moment().month(11).endOf('month').toDate());
        break;
      case 'thisYearToDate':
        FormikSetFieldValue('startDate', moment().month(0).date(1).toDate());
        FormikSetFieldValue('endDate', moment().toDate());
        break;
      default:
        break;
    }
  }

  interface CustomizedRevenueFormikProps {
    generateFrom: string;
    periodOption: string;
    startDate:null | string | number | Date;
    endDate:null | string | number | Date;
    checkCustomer: boolean;
    selectedCustomers: {
        value: string;
        label: string;
    }[];
    checkLocation: boolean;
    location: string;
    checkDivision: boolean;
    division: string;
    checkItemOrService: boolean;
    itemOrService: string;
}

  const form = useFormik<CustomizedRevenueFormikProps>({
    initialValues: {
      generateFrom: GENERATE_FROM_OPTIONS[0].value,
      periodOption: '',
      startDate: null,
      endDate: null,
      checkCustomer: false,
      selectedCustomers: [{value:'all',label:'All Customer'}],
      checkLocation: false,
      location: LOCATION_OPTIONS[0].value,
      checkDivision: false,
      division: DIVISION_OPTIONS[0].value,
      checkItemOrService: false,
      itemOrService: ITEM_AND_SERVICE_OPTIONS[0].value,
    },
    onSubmit: (values: any, { setSubmitting }: any) => {
      history.push({
        'pathname': currentDivision.urlParams ? `/main/reports/revenue/${currentDivision.urlParams}` : "/main/reports/revenue",
        'state': {
          reportQuery: values,
          tab: 0,
        }
      });
      closeModal();
    }
  });

  const {
    'values': FormikValues,
    'handleSubmit': FormikSubmit,
    setFieldValue: FormikSetFieldValue,
  } = form;


  const memorizeReport = () => {
    setIsLoading(true);
    const paramObject:any = {};
    paramObject.reportType = 1;
    paramObject.reportData = 1;
    paramObject.reportSource = FormikValues.generateFrom ? Number(FormikValues.generateFrom) : 1;
    if(FormikValues.selectedCustomers.length && FormikValues.checkCustomer){
      if(FormikValues.selectedCustomers[0].value === 'all'){
        paramObject.reportData = 2;
      } else {
        paramObject.customerIds = JSON.stringify(FormikValues.selectedCustomers.map((customer:any) => customer.value));
        paramObject.reportData = 2;
      }
    }
    if(FormikValues.startDate && FormikValues.endDate){
      let startDate:any = new Date(FormikValues.startDate)
      const startOffset = startDate.getTimezoneOffset() * 60000;
      startDate = new Date(startDate.getTime() - startOffset);
      let endDate:any = new Date(FormikValues.endDate)
      const endOffset = endDate.getTimezoneOffset() * 60000;
      endDate = new Date(endDate.getTime() - endOffset);
      paramObject.startDate = startDate.toISOString().slice(0,10);
      paramObject.endDate = endDate.toISOString().slice(0,10);
    }
    if(FormikValues.periodOption){
      paramObject.periodOption = FormikValues.periodOption;
      delete paramObject.startDate;
      delete paramObject.endDate;
    }
    setIsLoading(false);
    dispatch(
      setModalDataAction({
        'data': {
          'modalTitle': 'Memorize Report',
          'removeFooter': false,
          'paramObject': paramObject
        },
        'type': modalTypes.MEMORIZE_REPORT_MODAL,
      })
    );
  }

  useEffect(() => {
    if((!!FormikValues.startDate || !!FormikValues.endDate) && 
      (!moment(FormikValues.startDate).isValid() || !moment(FormikValues.endDate).isValid())){
      setIsDisabled(true)
    } else {
      setIsDisabled(false)
    }
  }, [FormikValues]);

  const customerOptions = customers.map((cust:any) => ({value: cust._id, label: cust.profile.displayName}))
  customerOptions.sort((a,b) => a.label.localeCompare(b.label))
  customerOptions.unshift({value:'all',label:'All Customer'})

  return <DataContainer>
    <hr style={{ height: '1px', background: '#D0D3DC', borderWidth: '0px' }} />

    <form onSubmit={FormikSubmit}>
      <DialogContent classes={{ 'root': classes.dialogContent }}>
        <div>
          <Accordion defaultExpanded className={classes.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.accordionSummary}>
              GENERATE FROM
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <DropDownMenu
                minwidth='300px'
                selectedItem={FormikValues.generateFrom}
                items={GENERATE_FROM_OPTIONS}
                onSelect={(e, item) => handleClick(e, item, 'generateFrom')}
              />
            </AccordionDetails>
          </Accordion>
          <Accordion defaultExpanded className={classes.accordion}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} className={classes.accordionSummary}>
              REPORT PERIOD
            </AccordionSummary>
            <AccordionDetails className={classes.accordionDetails}>
              <DropDownMenu
                minwidth='180px'
                selectedItem={FormikValues.periodOption}
                items={PERIOD_OPTIONS}
                onSelect={(e, item) => handlePeriodClick(e, item, 'periodOption')}
              />
              <div className={classes.separator} />
              <div style={{ width: 140 }}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    autoOk
                    onChange={(v) => handleDateChange('startDate', v)}
                    format={'MM/dd/yy'}
                    variant={'inline'}
                    inputVariant={'outlined'}
                    value={FormikValues.startDate}
                    InputProps={{
                      className: classes.datePicker,
                    }}
                    maxDate={FormikValues.endDate ? FormikValues.endDate : null}
                  />
                </MuiPickersUtilsProvider>
              </div>
              <div className={classes.separator}>to</div>
              <div style={{ width: 140 }}>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    autoOk
                    onChange={(v) => handleDateChange('endDate', v)}
                    format={'MM/dd/yy'}
                    variant={'inline'}
                    inputVariant={'outlined'}
                    value={FormikValues.endDate}
                    InputProps={{
                      className: classes.datePicker,
                    }}
                    minDate={FormikValues.startDate ? FormikValues.startDate : null}
                  />
                </MuiPickersUtilsProvider>
              </div>
            </AccordionDetails>
          </Accordion>
          <div>
            <Checkbox
              color="primary"
              className={classes.checkbox}
              checked={FormikValues.checkCustomer}
              onChange={(e) => FormikSetFieldValue('checkCustomer', e.target.checked)}
            />
            CUSTOMER
            <div className={classes.inputRow}>
              <Autocomplete
                fullWidth
                disableCloseOnSelect
                // classes={{popper: classes.popper}}
                value={FormikValues.selectedCustomers}
                disabled={!FormikValues.checkCustomer}
                getOptionLabel={option => option.label}
                multiple
                onChange={(ev: any, items: any) => {
                  const allOption = items.filter((item:any) => item.value === 'all')
                  if(allOption.length){
                    FormikSetFieldValue('selectedCustomers', allOption)
                  } else {
                    FormikSetFieldValue('selectedCustomers', items)
                  }
                }}
                options={customerOptions}
                getOptionSelected={(opt,val) => opt.value === val.value || val.value === 'all'}
                renderOption={(option, { selected }) => (
                  <React.Fragment>
                    <Checkbox
                      color={'primary'}
                      style={{ marginRight: 8 }}
                      checked={selected}
                    />
                    {option.label}
                  </React.Fragment>
                )}
                renderInput={params =>
                  <TextField
                    {...params}
                    variant={'outlined'}
                  />
                }
                PopperComponent={(props) => (
                  <Popper
                    {...props}
                    modifiers={{
                      flip: {
                        enabled: false,
                      },
                    }}
                  />
                )}
              />
            </div>
          </div>
          <div>
            <Checkbox
              disabled
              color="primary"
              className={classes.checkbox}
              checked={FormikValues.checkLocation}
              onChange={(e) => FormikSetFieldValue('checkLocation', e.target.checked)}
            />
            LOCATION
            <div className={classes.inputRow}>
              <DropDownMenu
                disabled={!FormikValues.checkLocation}
                minwidth='300px'
                selectedItem={FormikValues.location}
                items={LOCATION_OPTIONS}
                onSelect={(e, item) => handleClick(e, item, 'location')}
              />
            </div>
          </div>
          <div>
            <Checkbox
              disabled
              color="primary"
              className={classes.checkbox}
              checked={FormikValues.checkDivision}
              onChange={(e) => FormikSetFieldValue('checkDivision', e.target.checked)}
            />
            DIVISION
            <div className={classes.inputRow}>
              <DropDownMenu
                disabled={!FormikValues.checkDivision}
                minwidth='300px'
                selectedItem={FormikValues.division}
                items={DIVISION_OPTIONS}
                onSelect={(e, item) => handleClick(e, item, 'division')}
              />
            </div>
          </div>
          <div>
            <Checkbox
              disabled
              color="primary"
              className={classes.checkbox}
              checked={FormikValues.checkItemOrService}
              onChange={(e) => FormikSetFieldValue('checkItemOrService', e.target.checked)}
            />
            ITEM OR SERVICE
            <div className={classes.inputRow}>
              <DropDownMenu
                disabled={!FormikValues.checkItemOrService}
                minwidth='300px'
                selectedItem={FormikValues.itemOrService}
                items={ITEM_AND_SERVICE_OPTIONS}
                onSelect={(e, item) => handleClick(e, item, 'itemOrService')}
              />
            </div>
          </div>
        </div>
      </DialogContent>

      <hr style={{ height: '1px', background: '#D0D3DC', borderWidth: '0px' }} />
      <DialogActions classes={{
        'root': classes.dialogActions
      }}>
        <Grid
          container
          justify={'space-between'}>
          <Grid item>
            <Button
              disabled={isDisabled || isLoading}
              aria-label={'memorize-report'}
              classes={{
                'root': classes.closeButton
              }}
              onClick={memorizeReport}
              variant={'outlined'}>
              Memorize
            </Button>
          </Grid>
          <Grid item>
            <Button
              disabled={isLoading}
              aria-label={'cancel'}
              classes={{
                'root': classes.closeButton
              }}
              onClick={closeModal}
              variant={'outlined'}>
              Cancel
            </Button>

            <Button
              disabled={isDisabled || isLoading}
              aria-label={'run-report'}
              classes={{
                root: classes.submitButton,
                disabled: classes.submitButtonDisabled
              }}
              color="primary"
              type={'submit'}
              variant={'contained'}>
              Run Report
            </Button>
          </Grid>


        </Grid>
      </DialogActions>
    </form>

  </DataContainer>;

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
    margin-top: .5rem !important;
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
    padding: 5px 14px;
    align-items: flex-start;
  }
`;

export default withStyles(
  styles,
  { 'withTheme': true }
)(BCCustomizeRevenueReportModal);
