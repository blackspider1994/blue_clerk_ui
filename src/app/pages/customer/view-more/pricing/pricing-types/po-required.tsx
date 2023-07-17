import React, {useState} from 'react';
import styled from 'styled-components';
import { Customer } from 'reducers/customer.types';
import { Fab, FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import PricingHeader from '../pricing-header';
import { getCustomerDetailAction, loadingSingleCustomers, updateCustomerAction } from 'actions/customer/customer.action';


interface PORequiredProps {
    customer: Customer;
    header: any;
    dispatch: any;
}

export default function PORequired({ customer, header, dispatch }:PORequiredProps) {
  const [value, setValue] = useState(customer.isPORequired ? "Yes" : "No");
  const handleChange = (e:any) => {
    setValue(e.target.value);
  };


  const handleSubmit = async () => {
    const customerUpdate = { ...customer,
      'customerId': customer._id,
      'isPORequired': value == "Yes" ? true : false
    };
    await dispatch(updateCustomerAction(customerUpdate, () => {
      dispatch(loadingSingleCustomers());
      dispatch(getCustomerDetailAction(customerUpdate));
    }));
  };

  return <PORequiredContainer>
    <PricingHeader {...header} />
    <div className={'body'}>
      <FormControl
        fullWidth
        variant={'outlined'}>
        <InputLabel >
          {'Purchase Order Required'}
        </InputLabel>
        <Select
          label={'Purchase Order Required'}
          onChange={handleChange}
          value={value}>
          <MenuItem
            key={"Yes"}
            value={"Yes"}>
            Yes
          </MenuItem>
          <MenuItem
            key={"No"}
            value={"No"}>
            No
          </MenuItem>
        </Select>
      </FormControl>

      <Fab
        color={'primary'}
        onClick={handleSubmit}>Save
      </Fab>
    </div>
  </PORequiredContainer>;
}


const PORequiredContainer = styled.div`
    margin: 0 auto;
    text-align: center;

    h3 {
        max-width: 400px;
        margin: 40px auto ;
    }
    
    button {
        margin-top: 30px;
        color: #fff;
        width: 200px;
        border-radius: 30px;
    }
`;
