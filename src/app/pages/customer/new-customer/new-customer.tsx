import * as CONSTANTS from '../../../../constants';
import BCMapWithMarker from '../../../components/bc-map-with-marker/bc-map-with-marker';
import BCTextField from '../../../components/bc-text-field/bc-text-field';
import Config from '../../../../config';
import Geocode from 'react-geocode';
import { allStates } from 'utils/constants';
import classNames from 'classnames';
import styled from 'styled-components';
import styles from './new-customer.styles';
import { withStyles } from '@material-ui/core/styles';
import {
  Box,
  Button,
  FormGroup,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@material-ui/core';
import { Field, Form, Formik } from 'formik';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createCustomerAction } from 'actions/customer/customer.action';
import { useHistory } from 'react-router-dom';

interface Props {
  classes: any
}

function NewCustomerPage({ classes }: Props) {
  const initialValues = {
    'city': '',
    'name': '',
    'contactName': '',
    'email': '',
    'latitude': 0.0,
    'longitude': 0.0,
    'phone': '',
    'state': {
      'id': 0
    },
    'street': '',
    'zipCode': ''
  };
  const [positionValue, setPositionValue] = useState({
    'lang': 0.0,
    'lat': 0.0
  });
  const dispatch = useDispatch();
  const history = useHistory();

  const updateMap = (values: any, street?:any, city?:any, zipCode?: number, state?: number): void => {
    Geocode.setApiKey(Config.REACT_APP_GOOGLE_KEY);
    let stateVal:any = '' ;
    Geocode.setApiKey(Config.REACT_APP_GOOGLE_KEY);
    if(state){
      stateVal = allStates[state].name;
    } 

    let fullAddr = '';
    fullAddr = fullAddr.concat(street ? street : values.street, ' ', city ? city : values.city, ' ', stateVal, ' ', zipCode ? zipCode : values.zipCode, ' ', 'USA');

    Geocode.fromAddress(fullAddr).then(
      (response: { results: { geometry: { location: { lat: any; lng: any; }; }; }[]; }) => {
        const { lat, lng } = response.results[0].geometry.location;
        setPositionValue({
          'lang': lng,
          'lat': lat
        });
      },
      (error: any) => {
        console.error(error);
      }
    );
  };

  const updateMapFromLatLng = (name: string, value: any): void => {
    Geocode.setApiKey(Config.REACT_APP_GOOGLE_KEY);
    if (name === 'lat') {
      setPositionValue({
        'lang': positionValue.lang,
        'lat': parseFloat(value)
      });
    } else {
      setPositionValue({
        'lang': parseFloat(value),
        'lat': positionValue.lat
      });
    }
  };

  return (
    <>
      
      <MainContainer>
        <PageContainer>
          <DataContainer
            id={'0'}>
            <Grid container>
              <Grid
                item
                sm={6}>
                <Formik
                  initialValues={initialValues}
                  onSubmit={(values, { setSubmitting }) => {
                     let state = values.state.id;
                     values.latitude = positionValue.lat;
                     values.longitude = positionValue.lang;
                     const reqObj = { ...values, state: allStates[state].name }
                     reqObj.state = allStates[state].name === 'none' ? '' : allStates[state].name;
                     dispatch(createCustomerAction(reqObj, () => {
                      history.push('/main/customers');
                    }))
                    }
                  }
                  validateOnChange>
                  {({ handleChange, values, errors, isSubmitting, setFieldValue }) =>
                    <Form >
                      <Grid
                        className={classes.paper}
                        item
                        sm={12}>
                        <p className={classes.subTitle}>
                          {'New Customer Information'}
                        </p>
                      </Grid>

                      <Grid
                        className={classes.paper}
                        item
                        sm={12}>
                        <FormGroup className={'required'}>
                          <InputLabel className={classes.label}>
                            {'Name'}
                          </InputLabel>

                          <BCTextField
                            required
                            name={'name'}
                            placeholder={'Customer Name'}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Grid>

                      <Grid
                        className={classes.paper}
                        item
                        sm={12}>
                        <FormGroup className={'required'}>
                          <InputLabel className={classes.label}>
                            {'Email'}
                          </InputLabel>
                          <BCTextField
                            required
                            name={'email'}
                            placeholder={'Email'}
                            type={'email'}
                            onChange={handleChange}
                          />
                        </FormGroup>
                      </Grid>

                      <Grid container>
                        <Grid
                          className={classes.paper}
                          item
                          sm={6}>
                          <FormGroup>
                            <InputLabel className={classes.label}>
                              {'Contact Name'}
                            </InputLabel>
                            <BCTextField
                              name={'contactName'}
                              placeholder={'Contact Name'}
                              onChange={handleChange}
                            />
                          </FormGroup>
                        </Grid>
                        <Grid
                          className={classes.paper}
                          item
                          sm={6}>
                          <FormGroup>
                            <InputLabel className={classes.label}>
                              {'Phone Number'}
                            </InputLabel>
                            <BCTextField
                              type={'number'}
                              name={'phone'}
                              placeholder={'Phone Number'}
                              onChange={handleChange}
                            />
                          </FormGroup>
                        </Grid>
                      </Grid>

                      <Grid container>
                        <Grid
                          className={classes.paper}
                          item
                          sm={6}>
                          <FormGroup>
                            <InputLabel className={classes.label}>
                              {'Street'}
                            </InputLabel>
                            <BCTextField
                              name={'street'}
                              placeholder={'Street'}
                              onChange={(e:any)=> { 
                                setFieldValue('street', e.target.value)
                                updateMap(values)
                                }}
                            />
                          </FormGroup>
                        </Grid>
                        <Grid
                          className={classes.paper}
                          item
                          sm={6}>
                          <FormGroup>
                            <InputLabel className={classes.label}>
                              {'City'}
                            </InputLabel>
                            <BCTextField
                              name={'city'}
                              placeholder={'City'}
                              onChange={(e:any)=> { 
                                setFieldValue('city', e.target.value)
                                updateMap(values)
                                }}

                            />
                          </FormGroup>
                        </Grid>
                      </Grid>

                      <Grid container>
                        <Grid
                          className={classes.paper}
                          item
                          sm={6}>
                          <FormGroup>
                            <InputLabel className={classes.label}>
                              {'State'}
                            </InputLabel>
                            <Field
                              as={Select}
                              enableReinitialize
                              name={'state.id'}
                              onChange={(e: any) => {
                                updateMap(values, undefined, e.target.value);
                                handleChange(e);
                              }}
                              type={'select'}
                              variant={'outlined'}>
                              { allStates.map((state, id) =>
                                <MenuItem
                                  key={id}
                                  value={id}>
                                  { state.name }
                                </MenuItem>)
                              }
                            </Field>
                          </FormGroup>
                        </Grid>
                        <Grid
                          className={classes.paper}
                          item
                          sm={6}>
                          <FormGroup >
                            <InputLabel className={classes.label}>
                              {'Zip Code'}
                            </InputLabel>
                            <BCTextField
                              type={'number'}
                              name={'zipCode'}
                              placeholder={'Zip Code'}
                              onChange={(e:any)=> { 
                                setFieldValue('zipCode', e.target.value)
                                updateMap(values, e.target.value)
                                }}
                            />
                          </FormGroup>
                        </Grid>
                      </Grid>

                      <Grid
                        className={classes.paper}
                        item
                        md={12}>
                        <Box mt={2}>
                          <Button
                            className={'save-customer-button'}
                            color={'primary'}
                            type={'submit'}
                            variant={'contained'}>
                            {'Save'}
                          </Button>
                          <Button
                            className={'cancel-customer-button'}
                            color={'secondary'}
                            variant={'contained'}>
                            {'Cancel'}
                          </Button>
                        </Box>
                      </Grid>

                      {/* <pre>
                        {JSON.stringify(values, null, 2)}
                      </pre>
                      <pre>
                        {JSON.stringify(errors, null, 2)}
                      </pre> */}
                    </Form>
                  }
                </Formik>
              </Grid>

              <Grid
                className={classNames(classes.paper, classes.mapLocation)}
                item
                sm={6}>
                <Grid container>
                  <Grid
                    className={classes.paper}
                    item
                    sm={6}>
                    <FormGroup>
                      <InputLabel className={classes.label}>
                        {'Latitude'}
                      </InputLabel>
                      <TextField
                        type={'number'}
                        onChange={(e: any) => updateMapFromLatLng('lat', e.target.value)}
                        placeholder={'Longitude'}
                        variant={'outlined'}
                        value={positionValue.lat}
                      />
                    </FormGroup>
                  </Grid>
                  <Grid
                    className={classes.paper}
                    item
                    sm={6}>
                    <FormGroup>
                      <InputLabel className={classes.label}>
                        {'Longitude'}
                      </InputLabel>
                      <TextField
                        type={'number'}
                        onChange={(e: any) => updateMapFromLatLng('lng', e.target.value)}
                        placeholder={'Longitude'}
                        variant={'outlined'}
                        value={positionValue.lang}
                      />
                    </FormGroup>
                  </Grid>
                </Grid>

                <div className={classNames(classes.paper, classes.mapWrapper)}>
                  <BCMapWithMarker
                    lang={positionValue.lang}
                    lat={positionValue.lat}
                  />
                </div>
              </Grid>
            </Grid>
          </DataContainer>
        </PageContainer>
      </MainContainer>
    </>
  );
}

const MainContainer = styled.div`
  display: flex;
  flex: 1 1 100%;
  width: 100%;
  overflow-x: hidden;
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  padding: 30px;
  width: 100%;
  padding-left: 65px;
  padding-right: 65px;
  margin: 0 auto;
`;

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: 12px;
  margin-top: 12px;
  border-radius: 10px;
  background-color: ${CONSTANTS.PRIMARY_WHITE};

  .MuiFormLabel-root {
    font-style: normal;
    font-weight: normal;
    font-size: 20px;
    line-height: 30px;
    color: ${CONSTANTS.PRIMARY_DARK};
    margin-bottom: 6px;
  }
  .MuiInputBase-input {
    color: #383838;
    font-size: 16px;
    padding: 12px 14px;
  }
  .required > label:after {
    margin-left: 3px;
    content: "*";
    color: red;
  }
  .save-customer-button {
    margin-right: 16px;
    color: ${CONSTANTS.PRIMARY_WHITE};
  }
`;

export default withStyles(
  styles,
  { 'withTheme': true }
)(NewCustomerPage);
