import BCTableContainer from '../../../../components/bc-table-container/bc-table-container';
import { useLocation } from "react-router-dom";
import styled from 'styled-components';
import { Chip, withStyles } from "@material-ui/core";
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import styles from "./employees.style";
import { CSButton, CSButtonSmall, CSIconButton } from 'helpers/custom';
import { openModalAction, setModalDataAction } from 'actions/bc-modal/bc-modal.action';
import { modalTypes } from '../../../../../constants';
import { CompanyLocation } from 'actions/user/user.types';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';

function TabEmployeesGrid({ classes, companyLocation}: {classes: any, companyLocation: CompanyLocation | null}) {
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
      'accessor': 'employee.profile.displayName',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Phone',
      'accessor': 'employee.contact.phone',
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
    {
      'Header': 'Action',
      'className': 'font-bold',
      'Cell'({ row }: any) {
        return <div className={'flex items-center'}>
            <CSIconButton
              color="primary"
              size="small"
              aria-label={'edit-ticket'}
              onClick={() => updateAssinedEmployee(row.original)}
            >
              <EditIcon />
            </CSIconButton>
            <CSIconButton
              color="primary"
              size="small"
              aria-label={'edit-ticket'}
              onClick={() => removeAssignedEmployee(row.original)}
            >
              <DeleteIcon />
            </CSIconButton>
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

  const removeAssignedEmployee = (row: any) => {
    if (companyLocation?._id) {
      dispatch(setModalDataAction({
        'data': {
          'companyLocation': companyLocation,
          'assignee':row,
          'page': 'Employee',
          'removeFooter': false
        },
  
        'type': modalTypes.LOCATION_ASSIGN_DELETE_MODAL
      }));
      setTimeout(() => {
        dispatch(openModalAction());
      }, 200);
    }
  }

  const updateAssinedEmployee = (row: any) => {
    let formData = {
      ...row,
      assignee: {
        _id: row.employee._id, 
        name: row.employee.profile?.displayName
      }
    };
    
    dispatch(setModalDataAction({
      'data': {
        'modalTitle': 'Assign Employee',
        'companyLocation': companyLocation,
        'page': 'Employee',
        "formMode": "edit",
        "formData": formData,
        'removeFooter': false
      },

      'type': modalTypes.LOCATION_ASSIGN_MODAL
    }));
    
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  }

  const openAssignModal = () => {
    dispatch(setModalDataAction({
      'data': {
        'modalTitle': 'Assign Employee',
        'companyLocation': companyLocation,
        'page': 'Employee',
        'removeFooter': false
      },

      'type': modalTypes.LOCATION_ASSIGN_MODAL
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
            {'Add'}
          </CSButton>
        </div>
        <BCTableContainer
          columns={columns}
          currentPage={currentPage}
          search
          searchPlaceholder={'Search Employees....'}
          setPage={setCurrentPage}
          
          tableData={companyLocation?.assignedEmployees ?? []}
        />
    </DataContainer>
  );
}

const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

export default withStyles(styles, { 'withTheme': true })(TabEmployeesGrid);
