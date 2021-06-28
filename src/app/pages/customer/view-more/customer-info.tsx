import { withStyles } from '@material-ui/core';
import React, { useEffect } from 'react';
import styles from './view-more.styles';
import { useLocation } from 'react-router-dom';
import {
  openModalAction,
  setModalDataAction
} from 'actions/bc-modal/bc-modal.action';
import {
  getCustomerDetailAction,
  loadingSingleCustomers
} from 'actions/customer/customer.action';
import { useDispatch, useSelector } from 'react-redux';
import '../../../../scss/index.scss';
import { modalTypes } from '../../../../constants';
import BCCircularLoader from 'app/components/bc-circular-loader/bc-circular-loader';

function CustomerInfoPage({ classes }: any) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { customerObj, loading } = useSelector((state: any) => state.customers);

  useEffect(() => {
    if (customerObj?._id === '') {
      const obj: any = location.state;
      const { customerId } = obj;
      dispatch(loadingSingleCustomers());
      dispatch(getCustomerDetailAction({ customerId }));
    }
  }, []);

  const renderCustomerInfo = (row: any) => {
    const baseObj = row;
    const customerName =
      baseObj && baseObj.profile !== undefined
        ? baseObj.profile.displayName
        : 'N/A';
    const customerAddress = baseObj && baseObj.address;
    const vendorId = baseObj && baseObj.vendorId;
    const customerId = baseObj && baseObj._id;
    const contactName =
      baseObj &&
        baseObj.contactName &&
        baseObj.contactName !== undefined &&
        baseObj.contactName !== ''
        ? baseObj.contactName
        : 'N/A';
    let address: any = '';
    let address1: any = '';
    if (customerAddress && customerAddress !== undefined) {
      address = `${customerAddress.street
        ? customerAddress.street
        : ''
      }
      ${customerAddress.unit
    ? `, ${customerAddress.unit}`
    : ''
}`;
    } else {
      address = 'N/A';
    }
    if (customerAddress && customerAddress !== undefined) {
      address1 = `${customerAddress.city
        ? customerAddress.city
        : ''
      } ${Boolean(customerAddress.state) &&
          customerAddress.state !== 'none'
        ? `, ${customerAddress.state}`
        : ''
      } ${customerAddress.zipCode
        ? customerAddress.zipCode
        : ''
      }`;
    } else {
      address1 = 'N/A';
    }
    const email =
      baseObj &&
        baseObj.info &&
        baseObj.info !== undefined &&
        baseObj.info.email !== ''
        ? baseObj.info.email
        : 'N/A';
    const phone =
      baseObj &&
        baseObj.contact &&
        baseObj.contact !== undefined &&
        baseObj.contact.phone !== ''
        ? baseObj.contact.phone
        : 'N/A';
    const location = baseObj && baseObj.location ? baseObj.location : [];
    const itemTierId = baseObj?.itemTier?._id;

    const customerObj = {
      'customerName': customerName,
      address,
      address1,
      'contactName': contactName,
      customerId,
      customerAddress,
      email,
      phone,
      location,
      vendorId,
      itemTierId
    };
    return customerObj;
  };
  const handleEditClick = (customer: any) => {
    dispatch(setModalDataAction({
      'data': {
        'customerObj': customer,
        'modalTitle': 'Edit Customer Information',
        'removeFooter': false
      },
      'type': modalTypes.EDIT_CUSTOMER_INFO
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  if (loading) {
    return <BCCircularLoader heightValue={'200px'} />;
  }
  const customerData = renderCustomerInfo(customerObj);
  return (
    <div className={'customer_info_wrapper'}>
      <div className={'customer_container'}>
        <div className={'name_wrapper customer_details'}>
          <strong>
            {'Name:'}
            {' '}
          </strong>
          {' '}
          {customerData.customerName}
        </div>
        <div className={'customer_details'}>
          <strong>
            {'Contact Name:'}
            {' '}
          </strong>
          {' '}
          {customerData.contactName}
        </div>
        <div className={'customer_details'}>
          <strong>
            {'Address:'}
            {' '}
          </strong>
          {' '}
          {customerData.address.trim() !== '' ? customerData.address : customerData.address1.trim() !== '' ? '' : 'N/A'}
          {customerData.address.trim() !== '' && <br />}
          {customerData.address1.trim() !== '' ? customerData.address1 : ''}
        </div>
        <div className={'customer_details'}>
          <strong>
            {'E-mail:'}
            {' '}
          </strong>
          {' '}
          {customerData.email}
        </div>
        <div className={'customer_details'}>
          {customerData.vendorId !== '' ? <>
            {' '}
            <strong>
              {'Vendor Number:'}
              {' '}
            </strong>
            {' '}
            {customerData.vendorId}
            {' '}
          </> : null}
        </div>
        <div className={'customer_details'}>
          <strong>
            {'Phone:'}
            {' '}
          </strong>
          {' '}
          {customerData.phone}
        </div>
      </div>
      <div
        className={'edit_button'}
        onClick={() => handleEditClick(customerData)}>
        <button className={'MuiFab-primary'}>
          <i className={'material-icons'}>
            {'edit'}
          </i>
        </button>
      </div>
    </div>
  );
}

export default withStyles(styles, { 'withTheme': true })(CustomerInfoPage);
