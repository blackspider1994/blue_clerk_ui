import BCTableContainer from 'app/components/bc-table-container/bc-table-container';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import styles from './job-costing.styles';
import { FormControlLabel, Grid, Switch, withStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { getAllDiscountItemsAPI } from 'api/discount.api';
import {
  openModalAction,
  setModalDataAction,
} from 'actions/bc-modal/bc-modal.action';
import { modalTypes } from '../../../../../constants';
import { getAllSalesTaxAPI } from 'api/tax.api';
import { CSButton } from '../../../../../helpers/custom';
import { addJobCostingApi, updateJobCosting } from 'api/items.api';
import {
  error as SnackBarError,
  success,
} from 'actions/snackbar/snackbar.action';
import {
  loadInvoiceItems,
  loadJobCostingList,
  loadTierListItems,
} from 'actions/invoicing/items/items.action';
interface Props {
  classes: any;
}
function AdminSetupPage({ classes }: Props) {
  const dispatch = useDispatch();
  const { loading: costingTierLoading, error: tiersError, costingList } = useSelector(
    ({ InvoiceJobCosting }: any) => InvoiceJobCosting
  );
  const [loading, setLoading] = useState(costingTierLoading);
  const [updating, setUpdating] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [statusFilter, setStatusFilter] = useState(true);

  useEffect(() => {
    let filteredTiers = costingList.filter((res: any) => res.tier.isActive === true);
    setTableData(filteredTiers);
  }, [costingList]);

  useEffect(() => {
    setLoading(costingTierLoading);
  }, [costingTierLoading]);

  useEffect(() => {
    let filteredTiers = costingList.filter((res: any) => res.tier.isActive === statusFilter);
    setTableData(filteredTiers);
  }, [statusFilter]);

  function Toolbar() {
    return (
      <Grid
        container
        direction="row"
        justify='space-between'
      >
        <FormControlLabel
          control={
            <Switch checked={statusFilter} onChange={() => setStatusFilter(!statusFilter)} name="active" color="primary" />
          }
          label={statusFilter ? "Active" : "Inactive"}
        />
        <CSButton
          color={'primary'}
          disableElevation
          onClick={addTier}
          disabled={updating}
          size={'small'}
          style={{
            color: 'white',
          }}
          variant={'contained'}
        >
          {'Add'}
        </CSButton>
      </Grid>
    );
  }
  const addTier = async () => {
    setUpdating(true);
    setLoading(true);
    const response = await addJobCostingApi().catch((err) => {
      dispatch(SnackBarError(err.message));
      setUpdating(false);
    });
    if (response) {
      dispatch(success(response.message));
      setUpdating(false);
      dispatch(loadJobCostingList.fetch());
      dispatch(loadInvoiceItems.fetch());
    }
  };
  const handleClick = async (tier: any) => {
    setLoading(true);
    const { _id, isActive, name } = tier;
    const result = await updateJobCosting({
      costingTierId: _id,
      isActive: isActive ? '0' : '1',
      name,
    }).catch((err) => dispatch(SnackBarError(err.message)));
    if (result) {
      dispatch(
        success(
          isActive ? `Tier ${name} deactivated` : `Tier ${name} activated`
        )
      );
      dispatch(loadJobCostingList.fetch());
      dispatch(loadInvoiceItems.fetch());
    }
  };
  const renderAdd = () => {
    dispatch(
      setModalDataAction({
        data: {
          discountItem: {
            name: '',
            description: '',
            tax: 0,
            charges: 0,
          },
          modalTitle: 'Add New Discount',
        },
        type: modalTypes.ADD_DISCOUNT_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };
  const columns: any = [
    {
      Cell({ row }: any) {
        return (
          <>
            <div style={{ fontSize: 14, lineHeight: '16px', marginBottom: 7 }}>
              TIER {row.original?.tier?.name}
            </div>
          </>
        );
      },
      Header: 'Name',
      accessor: 'name',
      sortable: true,
      width: 100,
    },
    {
      Cell({ row }: any) {
        return (
          <div className={'flex items-center'}>
            <CSButton
              aria-label={'edit'}
              color={row.original.tier.isActive ? 'secondary' : 'primary'}
              onClick={() => handleClick(row.original.tier)}
              size={'small'}
              style={{
                marginRight: 10,
                minWidth: 35,
                padding: '5px 10px',
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              {row.original?.tier?.isActive ? 'Deactivate' : 'Activate'}
            </CSButton>
          </div>
        );
      },
      Header: 'Actions',
      id: 'action',
      sortable: false,
      width: 60,
    },
  ];
  useEffect(() => {
    dispatch(getAllDiscountItemsAPI());
    dispatch(getAllSalesTaxAPI());
    localStorage.setItem('nestedRouteKey', 'services/setup');
  }, []);
  return (
    <MainContainer>
      <PageContainer>
        <BCTableContainer
          columns={columns}
          isLoading={loading}
          isPageSaveEnabled
          tableData={tableData}
          toolbar={Toolbar()}
        />
      </PageContainer>
    </MainContainer>
  );
}
const MainContainer = styled.div`
  display: flex;
  flex: 1 1 100%;
  width: 100%;
  overflow-x: hidden;
  flex-direction: column;
`;
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  padding: 30px;
  width: 100%;
`;
export default withStyles(styles, { withTheme: true })(AdminSetupPage);
