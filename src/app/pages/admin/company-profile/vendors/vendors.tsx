import BCTableContainer from '../../../../components/bc-table-container/bc-table-container';
import { useLocation } from "react-router-dom";
import styled from 'styled-components';
import { Chip, withStyles } from "@material-ui/core";
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import styles from "./vendors.style";
import { CSButton } from 'helpers/custom';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { modalTypes } from '../../../../../constants';
import { CompanyLocation } from 'actions/user/user.types';

function TabVendorsGrid({ classes, companyLocation}: {classes: any, companyLocation: CompanyLocation | null}) {
  const dispatch = useDispatch();
  const location = useLocation<any>();
  const locationState = location.state;

  const prevPage = locationState && locationState.prevPage ? locationState.prevPage : null;
  const [currentPage, setCurrentPage] = useState({
    'page': prevPage ? prevPage.page : 0,
    'pageSize': prevPage ? prevPage.pageSize : 10,
    'sortBy': prevPage ? prevPage.sortBy : []
  });

  const columns: any = [
    {
      'Header': 'Name',
      'accessor': 'vendor.info.companyName',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Phone',
      'accessor': 'vendor.info.companyEmail',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Work Types',
      'accessor': 'workTypes',
      'className': 'font-bold',
      'Cell'({ row }: any) {
        return <div className={'flex items-center'}>
          {
            row.values.workTypes?.map((res: any, index: number) => {
              return (<Chip
                label={res?.title}
                variant="outlined" 
                key={index}
                />)
            })
          }
        </div>
        }
    },
  ];

  const resetLocationState = () => {
    window.history.replaceState({}, document.title)
  }

  useEffect(() => {
    window.addEventListener("beforeunload", resetLocationState);
    return () => {
      window.removeEventListener("beforeunload", resetLocationState);
    };
  }, []);


  const openAssignModal = () => {
    dispatch(setModalDataAction({
      'data': {
        'modalTitle': 'Assign Vendor',
        'companyLocation': companyLocation,
        'assignee': 'Vendor',
        'removeFooter': false
      },

      'type': modalTypes.ASSIGN_VENDOR_MODAL
    }));
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  return (
    <DataContainer id={'1'}>
        <div className={classes.addButtonArea}>
          <CSButton
            aria-label={'new-ticket'}
            color={'primary'}
            onClick={() => openAssignModal()}
            style={{
              'float': 'right'
            }}
            variant="contained">
            {'Add New'}
          </CSButton>
        </div>
        <BCTableContainer
          columns={columns}
          currentPage={currentPage}
          search
          searchPlaceholder={'Search Vendors....'}
          setPage={setCurrentPage}
          tableData={companyLocation?.assignedVendors ?? []}
        />
    </DataContainer>
  );
}

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export default withStyles(styles, { 'withTheme': true })(TabVendorsGrid);
