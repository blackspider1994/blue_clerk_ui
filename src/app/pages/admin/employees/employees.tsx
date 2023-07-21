import styled from 'styled-components';
import styles from './employees.style';
import { Fab, withStyles } from '@material-ui/core';
import AdminAddNewEmployeePage from './add-new-employee';
import { Roles as RoleEnums } from './add-new-employee';
import BCTableContainer from '../../../components/bc-table-container/bc-table-container';
import EmployeeProfile from './employee-profile';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getEmployeeDetailAction, getEmployeePermissionsAction, getEmployees, loadingEmployees, loadingSingleEmployee } from 'actions/employee/employee.action';
import { EmployeeRoles, UserProfile } from 'actions/employee/employee.types';
import { useHistory, useLocation } from 'react-router-dom';
import { CSButton } from "../../../../helpers/custom";

interface Props {
  classes: any;
  children?: React.ReactNode;
}

function AdminEmployeesPage({ classes, children }: Props) {
  const dispatch = useDispatch();
  const employees = useSelector((state: any) => state.employees);


  const location = useLocation<any>();
  const history = useHistory();

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
      'accessor': 'profile.displayName',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Phone',
      'accessor': 'contact.phone',
      'className': 'font-bold',
      'sortable': true
    },
    {
      'Header': 'Email',
      'accessor': 'auth.email',
      'className': 'font-bold',
      'sortable': true
    },
  ];

  useEffect(() => {
    dispatch(loadingEmployees());
    dispatch(getEmployees());
  }, []);

  const resetLocationState = () => {
    window.history.replaceState({}, document.title)
  }

  useEffect(() => {
    window.addEventListener("beforeunload", resetLocationState);
    return () => {
      window.removeEventListener("beforeunload", resetLocationState);
    };
  }, []);

  const renderViewMore = (row: any) => {
    const baseObj = row.original;

    const employeeId = baseObj._id;
    const displayName = baseObj.profile.displayName.split(' ').join('-');

    const employeeObj:any = {
      employeeId,
      displayName,
      currentPage,
    };

    if(location?.state?.prevPage?.search){
      employeeObj.currentPage.search = location.state.prevPage.search
    }


    localStorage.setItem('nestedRouteKey', `${displayName}`);

    history.push({
      'pathname': `/main/admin/employees/${displayName}`,
      'state': {
        ...employeeObj,
      }
    });
  };

  const handleRowClick = (event: any, row: any) => renderViewMore(row);

  return (
    <MainContainer>
      <PageContainer>
        <div className={classes.addButtonArea}>
          <CSButton
            aria-label={'new-ticket'}
            color={'primary'}
            onClick={() => {
              localStorage.setItem('nestedRouteKey', `add-new-employee`);
              history.push({
                'pathname': `/main/admin/employees/add-new-employee`,
                'state': {
                  currentPage
                }
              });
            }}
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
          isLoading={employees.loading}
          onRowClick={handleRowClick}
          search
          searchPlaceholder={'Search Employees....'}
          setPage={setCurrentPage}
          tableData={employees.data}
        />

        {/* {stage === 1 &&
            <AdminAddNewEmployeePage submit={add} cancel={cancel} />
          }

          {stage === 2 &&
            <EmployeeProfile profile={profile} back={cancel} />
          } */}
      </PageContainer>
    </MainContainer>
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
  padding-bottom: 30px;
  width: 100%;
  padding-left: 65px;
  padding-right: 65px;
  margin: 0 auto;
`;


export default withStyles(
  styles,
  { 'withTheme': true }
)(AdminEmployeesPage);
