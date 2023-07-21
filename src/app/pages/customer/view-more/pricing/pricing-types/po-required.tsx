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
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const handleChange = (e:any) => {
    setValue(e.target.value);
    const defaultValue = customer.isPORequired ? "Yes" : "No";
    if (defaultValue == e.target.value) {
      setIsSubmitDisabled(true);
    }else{
      setIsSubmitDisabled(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitDisabled(true);
    const customerUpdate = { ...customer,
      'customerId': customer._id,
      'isPORequired': value == "Yes" ? true : false
    };
    await dispatch(updateCustomerAction(customerUpdate, () => {
      setIsSubmitDisabled(false);
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
          {'PO Required'}
        </InputLabel>
        <Select
          label={'PO Required'}
          onChange={handleChange}
          value={value}>
          <MenuItem
            key={"No"}
            value={"No"}>
            No
          </MenuItem>
          <MenuItem
            key={"Yes"}
            value={"Yes"}>
            Yes
          </MenuItem>
        </Select>
      </FormControl>
    
      <Fab
        color={'primary'}
        disabled={isSubmitDisabled}
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
