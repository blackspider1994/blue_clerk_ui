export enum ItemActionTypes {
  GET_ITEMS = 'GET_ITEMS',
  UPDATE_ITEM = 'UPDATE_ITEM',
  UPDATE_TIER = 'LOAD_TIER',
  UPDATE_JOB_COSTING = 'UPDATE_JOB_COSTING',
}

export interface Item {
    _id: string;
    name: string;
    description: string;
    isFixed: boolean;
    isJobType: boolean;
    charges: number;
    tax: number;
    company: string;
    tiers: any;
    costing: any;
    itemType:string;
    productCost:number,
}
