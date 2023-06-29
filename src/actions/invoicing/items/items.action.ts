import { ItemActionTypes } from './items.types';
import { createApiAction } from 'actions/action.utils';


export const loadInvoiceItems = createApiAction(ItemActionTypes.GET_ITEMS);
export const updateInvoiceItem = createApiAction(ItemActionTypes.UPDATE_ITEM);
export const loadTierListItems = createApiAction(ItemActionTypes.UPDATE_TIER);
export const loadJobCostingList = createApiAction(ItemActionTypes.UPDATE_JOB_COSTING);

