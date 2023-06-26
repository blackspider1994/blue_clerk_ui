import BCTableContainer from 'app/components/bc-table-container/bc-table-container';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import styles from './setup.styles';
import { withStyles } from '@material-ui/core';
import { useDispatch, useSelector } from 'react-redux';
import { getAllDiscountItemsAPI } from 'api/discount.api';
import { getAllSalesTaxAPI } from 'api/tax.api';
import { CSButton } from '../../../../../helpers/custom';
import { addTierApi, updateTier } from 'api/items.api';
import {
  error as SnackBarError,
  success,
} from 'actions/snackbar/snackbar.action';
import {
  loadInvoiceItems,
  loadTierListItems,
} from 'actions/invoicing/items/items.action';
interface Props {
  classes: any;
}
function AdminSetupPage({ classes }: Props) {
  const dispatch = useDispatch();
  const { loading: tiersLoading, error: tiersError, tiers } = useSelector(
    ({ invoiceItemsTiers }: any) => invoiceItemsTiers
  );
  const [updating, setUpdating] = useState(false);
  function Toolbar() {
    return (
      <>
        <CSButton
          color={'primary'}
          disableElevation
          onClick={addTier}
          size={'small'}
          style={{
            color: 'white',
          }}
          variant={'contained'}
        >
          {'Add'}
        </CSButton>
      </>
    );
  }
  const addTier = async () => {
    setUpdating(true);
    const response = await addTierApi().catch((err) => {
      dispatch(SnackBarError(err.message));
      setUpdating(false);
    });
    if (response) {
      dispatch(success(response.message));
      setUpdating(false);
      dispatch(loadInvoiceItems.fetch());
    }
  };
  const handleClick = async (tier: any) => {
    const { _id, isActive, name } = tier;
    const result = await updateTier({
      itemTierId: _id,
      isActive: isActive ? '0' : '1',
      name,
    }).catch((err) => dispatch(SnackBarError(err.message)));
    if (result) {
      dispatch(
        success(
          isActive ? `Tier ${name} deactivated` : `Tier ${name} activated`
        )
      );
      dispatch(loadTierListItems.fetch());
      dispatch(loadInvoiceItems.fetch());
    }
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
  // <Button
  //   color={tier.isActive ? 'secondary' : 'primary'}
  //   onClick={() => handleClick(tier)}
  //   size={'small'}
  //   variant={'contained'}
  // >
  //   {tier.isActive ? 'Deactivate' : 'Activate'}
  // </Button>;
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
          isLoading={tiersLoading}
          isPageSaveEnabled
          tableData={tiers}
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