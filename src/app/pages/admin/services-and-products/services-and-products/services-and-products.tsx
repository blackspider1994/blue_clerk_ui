import BCTableContainer from 'app/components/bc-table-container/bc-table-container';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import styles from './services-and-products.styles';
import { Button, Fab, Grid, Tooltip, withStyles } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'reducers';
import { loadInvoiceItems } from 'actions/invoicing/items/items.action';

import {
  openModalAction,
  setModalDataAction,
} from 'actions/bc-modal/bc-modal.action';
import { PRIMARY_RED, modalTypes } from '../../../../../constants';
import { Item } from 'actions/invoicing/items/items.types';
import { getAllSalesTaxAPI } from 'api/tax.api';
import BCDebouncedInput from 'app/components/bc-input/bc-debounced-input';
import { updateItems } from 'api/items.api';
import {
  error as SnackBarError,
  success,
} from 'actions/snackbar/snackbar.action';
import BCQbSyncStatus from '../../../../components/bc-qb-sync-status/bc-qb-sync-status-item';
import { CSButton, CSButtonSmall } from '../../../../../helpers/custom';
import { stringSortCaseInsensitive } from '../../../../../helpers/sort';
import { Can, ability } from 'app/config/Can';



interface Props {
  classes: any;
}

const normalizeTiers = (tiers: any) => {
  const obj: any = {};

  tiers.forEach((tier: any) => {
    obj[tier.tier._id] = tier;

    if (tier.charge % 1 !== 0 && tier.charge !== undefined) {
      obj[tier.tier._id].charge = Number(tier.charge).toFixed(2);
    }
  });

  return obj;
};

const normalizeJobCosting = (tiers: any, activeJobCostsIDs: string[]) => {
  const obj: any = {};

  tiers.forEach((tier: any) => {
    if (!activeJobCostsIDs?.includes(tier.tier._id)) return
    obj[tier.tier._id] = tier;

    if (tier.charge % 1 !== 0 && tier.charge !== undefined) {
      obj[tier.tier._id].charge = Number(tier.charge).toFixed(2);
    }
  });

  return obj;
};

function AdminServiceAndProductsPage({ classes }: Props) {
  const dispatch = useDispatch();
  const { loading, error, items } = useSelector(
    ({ invoiceItems }: RootState) => invoiceItems
  );
  const [localItems, setLocalItems] = useState(
    stringSortCaseInsensitive(items, 'name')
  );
  const [columns, setColumns] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isRowEnabled, setIsRowEnabled] = useState(true);

  const { loading: tiersLoading, error: tiersError, tiers } = useSelector(
    ({ invoiceItemsTiers }: any) => invoiceItemsTiers
  );
  const activeTiers = tiers.filter(({ tier }: any) => tier.isActive);
  const costingList = useSelector(
    ({ InvoiceJobCosting }: any) => InvoiceJobCosting.costingList
  );
  const activeJobCosts = costingList.filter(({ tier }: any) => tier.isActive);

  // Function to toggle row enablement
  const toggleRowEnablement = () => {
    setIsRowEnabled(!isRowEnabled);
  };

  const handleTierChange = (id: number, value: string, tierId: string) => {
    const newItems: any = [...localItems];
    const index = newItems.findIndex((item: any) => item._id === id);
    const currentTier: any = newItems[index].tiers[tierId];
    currentTier.charge = value;
    newItems[index].tiers[tierId] = currentTier;
    setLocalItems(newItems);
  };

  const handleUpdateAllTiers = async () => {
    setUpdating(true);
    let hasError: any = '';
    const payload = localItems.map((item: any) => {
      const tiers = Object.keys(item.tiers).map((tierId: any) => {
        if (item.tiers[tierId].tier.isActive && !item.tiers[tierId].charge) {
          if (!hasError) {
            hasError = tierId + item.tiers[tierId].tier.name;
          }
        }
        return {
          tierId,
          charge: item.tiers[tierId].tier.isActive
            ? item.tiers[tierId].charge
            : undefined,
        };
      });

      const activeTiers = tiers.filter(({ charge }) => charge);
      return {
        itemId: item._id,
        tiers: activeTiers,
        costing: activeJobCosts,
      };
    });

    if (hasError) {
      setUpdating(false);
      dispatch(SnackBarError('Please fill in all tier prices'));
    }

    if (payload && !hasError) {
      const response = await updateItems(payload).catch((err) => {
        dispatch(SnackBarError(err.message));
        setEditMode(false);
      });
      if (response) {
        dispatch(success('Tier pricing successfully updated'));
        setEditMode(false);
        setUpdating(false);
      }
    }
  };

  function Toolbar() {
    return editMode ? (
      <>
        <CSButton
          disabled={updating}
          disableElevation
          onClick={() => setEditMode(false)}
          size={'small'}
          variant={'contained'}
        >
          {'Cancel'}
        </CSButton>
        <CSButton
          disabled={updating}
          disableElevation
          onClick={handleUpdateAllTiers}
          size={'small'}
          style={{ backgroundColor: PRIMARY_RED, color: 'white' }}
          variant={'contained'}
        >
          {'Submit'}
        </CSButton>
      </>
    ) : (
      <>
        <Can I={'manage'} a={'Items'}>
          {/* <CSButton
            disabled={updating}
            disableElevation
            onClick={() => setEditMode(true)}
            size={'small'}
            style={{ 'backgroundColor': PRIMARY_GREEN,
              'color': 'white' }}
            variant={'contained'}>
            {'Edit Prices'}
          </CSButton> */}
          <CSButton
            color={'primary'}
            disabled={updating}
            disableElevation
            onClick={renderAdd}
            size={'small'}
            style={{
              color: 'white',
            }}
            variant={'contained'}
          >
            {'New Item'}
          </CSButton>
        </Can>
      </>
    );
  }

  useEffect(() => {
    if (items.length > 0) {
      const activeJobCostsIDs = activeJobCosts.map((item: any) => item.tier._id)
      const newItems = items.map((item: any) => {
        return {
        ...item,
        tiers: normalizeTiers(item.tiers),
        costing: normalizeJobCosting(item.costing, activeJobCostsIDs),
      }
      });
      setLocalItems([...newItems]);
    }
  }, [items, activeJobCosts?.length]);

  const renderEdit = (item: Item) => {
    dispatch(
      setModalDataAction({
        data: {
          item,
          modalTitle: 'Edit Item',
        },
        type: modalTypes.EDIT_ITEM_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  const renderAdd = () => {
    dispatch(
      setModalDataAction({
        data: {
          item: {
            name: '',
            description: '',
            isFixed: true,
            itemType: "",
            productCost: '',
            isJobType: true,
            tax: 0,
            tiers: activeTiers.reduce(
              (total: any, currentValue: any) => ({
                ...total,
                [currentValue.tier._id]: currentValue,
              }),
              {}
            ),
            costing: activeJobCosts.reduce(
              (total: any, currentValue: any) => ({
                ...total,
                [currentValue.tier._id]: currentValue,
              }),
              {}
            ),
          },
          modalTitle: 'New Item',
        },
        type: modalTypes.ADD_ITEM_MODAL,
      })
    );
    setTimeout(() => {
      dispatch(openModalAction());
    }, 200);
  };

  useEffect(() => {
    if (tiers.length || items) {
      const actions = [
        {
          Cell({ row }: any) {
            return (
              <div className={'flex items-center'}>
                <CSButtonSmall
                  aria-label={'edit'}
                  color={'primary'}
                  onClick={() => renderEdit(row.original)}
                  size={'small'}
                  style={{
                    marginRight: 10,
                    minWidth: 35,
                    padding: '5px 10px',
                  }}
                >
                  <EditIcon />
                </CSButtonSmall>
              </div>
            );
          },
          id: 'action',
          sortable: false,
          width: 60,
        },
      ];

      const activateButton=[
        {
          Cell({ row }: any) {
            const handleActivateDeactivate = () => {

              const updatedItem = { ...row.original, isActive: !row.original.isActive };
              // Update the item in your localItems state
              const updatedLocalItems = localItems.map((item: Item) =>
                item._id === updatedItem._id ? updatedItem : item
              );
              setLocalItems(updatedLocalItems);
              console.log(`Toggled activation for item: ${row.original._id}`);
            };

            return (
              <div className="flex items-center">
                <Button
                  variant="outlined"
                  color={row.original.isActive ? 'secondary' : 'primary'}
                  onClick={handleActivateDeactivate}
                  disabled={!isRowEnabled}
                >
                  {row.original.isActive ? 'Deactivate' : 'Activate'}
                </Button>
              </div>
            );
          },
          Header: 'Activate/Deactivate',
          id: 'activateDeactivate',
          sortable: false,
          width: 150, // Adjust the width as needed
        },  
      ];
      const dbSync = [
        {
          Cell({ row }: any) {
            return <BCQbSyncStatus data={row.original}  />;
          },
          id: 'qbSync',
          sortable: false,
          width: 30,
        },
      ];

      const columns: any = [
        {
          Header: 'Name',
          accessor: 'name',
          sortable: true,
          width: 60,
        },
        {
          Cell({ row }: any) {
            const { description } = row.original;
            return (
              <Tooltip arrow title={description}>
                <div className="flex items-center">
                  {description?.length > 30
                    ? `${description?.substr(0, 30)}...`
                    : description}
                </div>
              </Tooltip>
            );
          },
          Header: 'Description',
          accessor: 'description',
          sortable: false,
          width: 100,
        },
        {
          Cell({ row }: any) {
            return (
              <div className={'flex items-center'}>
                {row.original.isFixed ? 'Fixed' : 'Hourly'}
              </div>
            );
          },
          Header: 'Charge Type',
          accessor: 'isFixed',
          sortable: true,
        },

        {
          Cell({ row }: any) {
            return (
              <div className={'flex items-center'}>
                {row.original.tax ? 'Yes' : 'No'}
              </div>
            );
          },
          Header: 'Taxable',
          accessor: 'tax',
          sortable: true,
        },
      ];

      const chargeColumn = [
        {
          Cell({ row }: any) {
            return (
              <p>
                {'$'}
                {row.original.charges}
              </p>
            );
          },
          Header: 'Charge',
          accessor: 'charges',
          sortable: true,
        },
      ];
      const tierColumns =
        activeTiers.map(({ tier }: any) => {
          return {
            Cell({ row }: any) {
              const currentTier = row.original.tiers[tier._id];
              return (
                <>
                  {!editMode ? (
                    currentTier?.charge
                  ) : (
                    <BCDebouncedInput
                      error={!currentTier?.charge}
                      id={tier._id + tier.name}
                      setValue={(val: string) =>
                        handleTierChange(
                          row.original._id,
                          val,
                          currentTier?.tier._id
                        )
                      }
                      value={currentTier?.charge}
                    />
                  )}
                </>
              );
            },
            Header: `Tier ${tier.name} Price`,
            accessor: tier.name,
          };
        }) || [];

      let constructedColumns: any = [
        ...columns,
        ...chargeColumn,
        ...ability.can('manage', 'Company')
          ? actions
          : [],
        ...dbSync,
        ...activateButton
      ];

      if (tiers.length > 0) {
        constructedColumns = [
          ...columns,
          ...tierColumns,
          ...ability.can('manage', 'Company')
            ? actions
            : [],
          ...dbSync,
          ...activateButton
        ];
      }
      setColumns(constructedColumns);
    }
  }, [tiers, editMode, localItems]);

  useEffect(() => {
    dispatch(loadInvoiceItems.fetch());
    dispatch(getAllSalesTaxAPI());
    localStorage.setItem('nestedRouteKey', 'services/services-and-products');
  }, []);

  return (
    <MainContainer>
      <PageContainer>
       
        <BCTableContainer
          columns={columns}
          isLoading={loading || tiersLoading}
          isPageSaveEnabled
          search
          searchPlaceholder={'Search Items'}
          tableData={localItems}
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

export default withStyles(styles, { withTheme: true })(
  AdminServiceAndProductsPage
);
