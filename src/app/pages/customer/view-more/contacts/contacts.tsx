import React, { useState, useEffect } from 'react';
import styles from './contacts.style';
import { Fab, FormControl, Grid, MenuItem, Select, withStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import BCTableContainer from '../../../../components/bc-table-container/bc-table-container';
import { NON_OCCUPIED_GREY, OCCUPIED_GREEN, modalTypes } from '../../../../../constants';
import { getContacts, addContact, updateContact, removeContact } from 'api/contacts.api';
import { useLocation, useHistory } from 'react-router-dom';
import {CSButton, CSButtonSmall} from "../../../../../helpers/custom";

function CustomerContactsPage({ classes, id, type, customerId }: any) {
  const dispatch = useDispatch();
  const { isLoading, refresh, contacts } = useSelector((state: any) => state.contacts);
  const [filterBySMSStatus, setFilterBySMSStatus] = useState('all');

  const location = useLocation<any>();
  const history = useHistory();
  const filteredContacts = (() => {
    switch(filterBySMSStatus) {
      case 'all':
        return contacts;
      case 'optedIn':
        return contacts.filter((item : any) => item.smsStatus === true);
      case 'optedOut':
        return contacts.filter((item : any) => item.smsStatus !== true);
    }
  })();

  const locationState = location.state;

  const prevPage = locationState && locationState.prevPage ? locationState.prevPage : null;

  const [currentPage, setCurrentPage] = useState({
    page: 0,
    pageSize: 10,
    sortBy: [],
  });

  const initialValues = {
    name: "",
    email: "",
    phone: "",
    type,
    referenceNumber: id,
  }

  const columns: any = [

    {
      'Header': 'Contact Name',
      'accessor': 'name',
      'className': 'font-bold',
      'sortable': true,
      'width': 200
    },
    {
      'Header': 'Email',
      'accessor': 'email',
      'className': 'font-bold',
      'sortable': true,
      'width': 200
    },
    {
      'Header': 'Phone',
      'accessor': 'phone',
      'className': 'font-bold',
      'sortable': true,
      'width': 200
    },
   
    {
      'Cell'({ row }: any) {
        return row.values?.phone ? (<div className={classes.smsStatusCell}>
          <span style={{
            marginTop: 10,
            height: "10px",
            width: "10px",
            backgroundColor: row.values?.smsStatus ? OCCUPIED_GREEN : NON_OCCUPIED_GREY,
            borderRadius: "50%",
            display: "flex", 
            justifyContent: 'center',
            alignItems: 'center',
          }}></span>
          <span className={classes.smsStatusText}>{ row.values.smsStatus ? 'Opted in' : 'Opted out' }</span>
        </div>) : <div></div>
      },
      'Header': 'SMS Messaging Status',
      'id': 'smsStatus',
      'accessor': 'smsStatus',
      'sortable': true,
      'width': 200
    },
    {
      'Cell'({ row }: any) {
        return <div className={'flex items-center'}>
          <CSButtonSmall
            aria-label={'edit-contact'}
            color={'primary'}
            onClick={() => openEditContactModal(row)}
            variant={'contained'}>
            {'Edit'}
          </CSButtonSmall>
          <CSButtonSmall
            aria-label={'edit-contact'}
            style={{ marginLeft: 15 }}
            color={'secondary'}
            onClick={() => openDeleteContactModal(row)}
            variant={'contained'}>
            { type === 'JobLocation' ? 'Remove' : row['original']?.isActive ? 'Deactivate': 'Activate'}
          </CSButtonSmall>
        </div>
      },
      'Header': 'Actions',
      'id': 'action-edit-contact',
      'sortable': false,
      'width': 40
    },
  ]

  function Toolbar() {
    return <div style={{display: 'flex', alignItems: 'center'}}>
      <strong style={{fontSize: 16}}>{'Show:'}&nbsp;</strong>
      <FormControl variant="standard" style={{minWidth: 80}}>
        <Select
          labelId="location-status-label"
          id="location-status-select"
          value={filterBySMSStatus}
          label="Age"
          onChange={(event: any) => setFilterBySMSStatus(event.target.value)}
        >
          <MenuItem value={'all'}>All</MenuItem>
          <MenuItem value={'optedIn'}>Opted in SMS</MenuItem>
          <MenuItem value={'optedOut'}>Opted out SMS</MenuItem>
        </Select>
      </FormControl>
    </div>
  }

  const handleAddContact = async (values: any) => {
    try {
      const response = await dispatch(addContact(values));
      return response;
    } catch (err) {
      throw new Error(err);
    }

  }

  const handleUpdateContact = async (values: any) => {

    try {
      const response = await dispatch(updateContact(values));
      return response;
    } catch (err) {
      throw new Error(err);
    }

  }

  const handleDeleteContact = async (values: any) => {

    try {
      if(values.type === "JobLocation") {
        const response = await dispatch(removeContact(values));
        return response;
      }
      else {
        const response = await dispatch(updateContact(values));
        return response;
      }
    } catch (err) {
      throw new Error(err);
    }
  }


  const openAddContactModal = () => {

    dispatch(setModalDataAction({
      'data': {
        'data': {
          initialValues,
          apply: (values: any) => handleAddContact(values),
          newContact: true,
          contacts,
          customerId,
        },
        'modalTitle': `${type === 'Customer' ? "Add Customer Contact" : "Add Subdivision Contact"}`,
        'removeFooter': false
      },
      'type': modalTypes.ADD_CONTACT_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const openEditContactModal = (row: any) => {
    let origRow = row['original'];


    dispatch(setModalDataAction({
      'data': {
        'data': {
          initialValues: {
            name: origRow['name'],
            email: origRow['email'],
            phone: origRow['phone'],
            _id: origRow['_id'],
            isActive: origRow['isActive'],
          },
          onEdit: true,
          apply: (values: any) => handleUpdateContact(values)
        },
        'modalTitle': 'Edit Contact',
        'removeFooter': false
      },
      'type': modalTypes.ADD_CONTACT_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };


  const openDeleteContactModal = (row: any) => {
    let origRow = row['original'];


    history.replace({
      ...history.location,
      state: {
        ...locationState,
        onUpdatePage: currentPage
      }
    })

    dispatch(setModalDataAction({
      'data': {
        'data': {
          contact: {
            name: origRow['name'],
            email: origRow['email'],
            phone: origRow['phone'],
            isActive: origRow['isActive'],
            _id: origRow['_id'],
            type,
            referenceNumber: id,
          },
          apply: (values: any) => handleDeleteContact(values)
        },
        'modalTitle': type === "JobLocation" ? 'Remove Contact' : origRow['isActive'] ? 'Deactivate Contact' : 'Activate Contact',
        'removeFooter': false
      },
      'type': modalTypes.DELETE_CONTACT_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };



  useEffect(() => {
    let data: any = {
      type,
      referenceNumber: id
    }

    dispatch(getContacts(data));
  }, [refresh])

  return (
    <>
      <div className={classes.addButtonArea}>
        <CSButton
          aria-label={'add-new-contact'}
          color={'primary'}
          onClick={() => openAddContactModal()}
          variant={'contained'}>
          {'Add New Contact'}
        </CSButton>
      </div>

      <BCTableContainer
        currentPage={currentPage}
        setPage={setCurrentPage}
        columns={columns}
        isLoading={isLoading}
        search
        searchPlaceholder={"Search contacts"}
        tableData={filteredContacts.sort((a: any, b: any) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))}
        initialMsg="There are no contacts"
        toolbarPositionLeft={true}
        toolbar={Toolbar()}
      />
    </>
  )
}


export default withStyles(
  styles,
  { 'withTheme': true }
)(CustomerContactsPage);
