import { Item } from 'actions/invoicing/items/items.types';
import request from 'utils/http.service';

export const getItems = async (includeDiscountItems = false) => {
  try {
    const requestObj: any = {};
    if (includeDiscountItems) {
      requestObj.includeDiscountItems = true;
    }
    const response: any = await request('/getItems', 'POST', requestObj);
    return response.data;
  } catch (err) {
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(
        err.data.errors ||
          err.data.message ||
          `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`
      );
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};

export const updateItem = async (item: Item) => {
  try {
    const response: any = await request('/updateItem', 'POST', item, false);
    return response.data;
  } catch (err) {
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(
        err.data.errors ||
          err.data.message ||
          `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`
      );
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};

export const getItemTierList = async () => {
  try {
    const response: any = await request('/getItemTierList', 'GET', false);
    return response.data;
  } catch (err) {
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(
        err.data.errors ||
          err.data.message ||
          `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`
      );
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};

export const addTierApi = async () => {
  try {
    const response: any = await request('/addItemTier', 'POST', false);
    return response.data;
  } catch (err) {
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(
        err.data.errors ||
          err.data.message ||
          `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`
      );
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};

export const updateTier = async (data: any) => {
  try {
    const response: any = await request('/updateItemTier', 'PUT', data, false);
    return response.data;
  } catch (err) {
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(
        err.data.errors ||
          err.data.message ||
          `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`
      );
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};

export const updateItems = async (items: any) => {
  try {
    const response: any = await request(
      '/updateItems',
      'POST',
      { items: JSON.stringify(items) },
      false
    );
    return response.data;
  } catch (err) {
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(
        err.data.errors ||
          err.data.message ||
          `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`
      );
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};

export const addItem = async (item: any) => {
  try {
    const response: any = await request(
      '/createJobType',
      'POST',
      { title: item.name, description: item.description},
      false
    );
    if (response.data.status === 0) {
      throw response;
    }
    const responseUpdate: any = await request(
      '/updateItems',
      'POST',
      { items: JSON.stringify([{ ...item, itemId: response.data.item._id }]) },
      false
    );
    if (responseUpdate.data.status === 0) {
      throw responseUpdate;
    }
    return responseUpdate.data;
  } catch (err) {
    if (err?.response?.status >= 400 || err?.data?.status === 0) {
      throw new Error(
        err?.data?.errors ||
          err?.data?.message ||
          `${err?.data['err.user.incorrect']}\nYou have ${err?.data?.retry} attempts left`
      );
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};

export const addItemProduct = async (item: any) => {
  try {
    const response: any = await request(
      '/createItem',
      'POST',
      {
        title: item.name, description: item.description,
        ...item
      },
      false
    );
    if (response.data.status === 0) {
      throw response;
    }
    const responseUpdate: any = await request(
      '/updateItems',
      'POST',
      { items: JSON.stringify([{ ...item, itemId: response.data.item._id }]) },
      false
    );
    if (responseUpdate.data.status === 0) {
      throw responseUpdate;
    }
    return responseUpdate.data;
  } catch (err) {
    if (err?.response?.status >= 400 || err?.data?.status === 0) {
      throw new Error(
        err?.data?.errors ||
        err?.data?.message ||
        `${err?.data['err.user.incorrect']}\nYou have ${err?.data?.retry} attempts left`
      );
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};

export const getJobCostingList = async () => {
  try {
    const response: any = await request('/getJobCostingList', 'GET', false);
    return response.data;
  } catch (err) {
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(
        err.data.errors ||
          err.data.message ||
          `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`
      );
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};
export const addJobCostingApi = async () => {
  try {
    const response: any = await request('/addJobCosting', 'POST', false);
    return response.data;
  } catch (err) {
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(
        err.data.errors ||
          err.data.message ||
          `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`
      );
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};
export const updateJobCosting = async (data: any) => {
  try {
    const response: any = await request(
      '/updateJobCosting',
      'PUT',
      data,
      false
    );
    return response.data;
  } catch (err) {
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(
        err.data.errors ||
          err.data.message ||
          `${err.data['err.user.incorrect']}\nYou have ${err.data.retry} attempts left`
      );
    } else {
      throw new Error(`Something went wrong`);
    }
  }
};
