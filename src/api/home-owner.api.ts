import request from '../utils/http.service';

export const callGetHomeOwner =  (id : string) => {
  return new Promise((resolve, reject) => {
    request(`/homeOwner?id= ${id}`, 'get', undefined, false)
    .then((res: any) => {
      return resolve(res.data.homeOwner);
    })
    .catch(err => {
      return reject(err);
    });
  });
};

export const callGetAllHomeOwners = () => {
  return new Promise((resolve, reject) => {
    request(`/homeOwner/all`, 'get', undefined, false)
    .then((res: any) => {
      return resolve(res.data.homeOwners);
    })
    .catch(err => {
      return reject(err);
    });
  });
};

export const callGetHomeownerByAddress = (address : string, subdivision : string) => {
  return new Promise((resolve, reject) => {

    request(`/homeOwner/all?address=${address}${subdivision ? `&subdivision=${subdivision}` : ''}`, 'get', undefined, false)
    .then((res: any) => {
      return resolve(res.data.homeOwners);
    })
    .catch(err => {
      return reject(err);
    });
  });
};

export const callCreateHomeOwner = (data: any) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    request(`/homeOwner`, 'post', formData, false)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch(err => {
        return reject(err);
      });
  });
};

export const callEditHomeOwner = (data: any) => {
  return new Promise((resolve, reject) => {
    const formData = new FormData();

    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });


    request(`/homeOwner`, 'put', formData)
      .then((res: any) => {
        return resolve(res.data);
      })
      .catch(err => {
        return reject(err);
      });
  });
};