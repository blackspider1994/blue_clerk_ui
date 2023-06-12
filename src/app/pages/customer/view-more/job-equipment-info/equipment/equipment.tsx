import BCBackButtonNoLink from '../../../../../components/bc-back-button/bc-back-button-no-link';
import BCTableContainer from '../../../../../components/bc-table-container/bc-table-container';
import BCTabs from '../../../../../components/bc-tab/bc-tab';
import {Grid, Typography} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import styles from './equipment.style';
import { withStyles } from '@material-ui/core/styles';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import { getCustomerDetailAction, loadingSingleCustomers } from 'actions/customer/customer.action';
import { getCutomerEquipments } from 'api/customerEquipments.api';
import { DUMMY_DATA, DUMMY_COLUMN } from '../dummy-data';

interface LocationStateTypes {
  customerName: string;
  customerId: string;
}

function CustomersJobEquipmentInfoEquipmentPage({ classes }: any) {
  const dispatch = useDispatch();

  const { isLoading = true, customerEquipments, refresh = true } = useSelector(
    ({ customerEquipments }: any) => ({
      'isLoading': customerEquipments.isLoading,
      'customerEquipments': customerEquipments.equipments,
      'refresh': customerEquipments.refresh,
    })
  );

  const { customerObj } = useSelector((state: any) => state.customers);

  const location = useLocation<any>();
  const history = useHistory();
  const [curTab, setCurTab] = useState(0);

  const handleTabChange = (newValue: number) => {
    setCurTab(newValue);
  };

  const renderGoBack = (location: any) => {
    const baseObj = location;
/*    let customerName =
      baseObj["customerName"] && baseObj["customerName"] !== undefined
        ? baseObj["customerName"]
        : "N/A";*/
    let customerName = baseObj["customerName"].replace(/[\/ ]/g, '');
    let customerId =
      baseObj["customerId"] && baseObj["customerId"] !== undefined
        ? baseObj["customerId"]
        : "N/A";

    let linkKey: any = localStorage.getItem('nestedRouteKey');
    localStorage.setItem('prevNestedRouteKey', linkKey);
    localStorage.setItem('nestedRouteKey', `${customerName}`);

    history.push({
      pathname: `/main/customers/${customerName}`,
      state: {
        ...location,
        customerName,
        customerId,
        from: 1
      }
    });
  }

  const columns: any = [
    {
      Header: "Brand",
      accessor: "brand.title",
      className: "font-bold",
      sortable: true,
    },
    {
      Header: "Type",
      accessor: "type.title",
      className: "font-bold",
      sortable: true,
    },
    {
      Header: "Model",
      accessor: "info.model",
      className: "font-bold",
      sortable: true,
    },
    {
      Header: "Serial Number",
      accessor: "info.serialNumber",
      className: "font-bold",
      sortable: true,
    },
  ]

  useEffect(() => {

    const cusObj = location.state;

    let data: any = {
      customerId: cusObj.customerId,
    }

    dispatch(getCutomerEquipments(data))


    if (customerObj._id === '') {
      const obj: any = location.state;
      const customerId = obj.customerId;
      dispatch(loadingSingleCustomers());
      dispatch(getCustomerDetailAction({ customerId }));
    }
  }, [customerObj]);

  return (
    <>
      <div className={classes.pageMainContainer}>
        <div className={classes.pageContainer}>
          <div className={classes.pageContent}>

            <Grid
              container>
              <BCBackButtonNoLink
                func={() => renderGoBack(location.state)}
              />
              <div className="tab_wrapper">
                <BCTabs
                  curTab={curTab}
                  indicatorColor={'primary'}
                  onChangeTab={handleTabChange}
                  tabsData={[
                    {
                      'label': 'CUSTOMER EQUIPMENT',
                      'value': 0
                    },
                  ]}
                />
              </div>
              <div style={{ flexGrow: 1 }}></div>

              <div className={classes.customerNameLocation}>
                <Typography><strong>Customer Name: </strong>{location?.state?.customerName}</Typography>
              </div>
            </Grid>

            <div
              style={{
                'height': '15px'
              }}
            />

            <div
              className={`${classes.dataContainer} `}
              hidden={curTab !== 0}
              id={'0'}>
              <BCTableContainer
                columns={columns}
                isLoading={isLoading}
                search
                searchPlaceholder={"Search...(Keyword, Date, Tag, etc.)"}
                tableData={customerEquipments}
                initialMsg="There are no data!"
              />
            </div>

          </div>
        </div>
      </div>
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

export default withStyles(
  styles,
  { 'withTheme': true }
)(CustomersJobEquipmentInfoEquipmentPage);
