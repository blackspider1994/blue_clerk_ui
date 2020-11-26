import request from "utils/http.service";

export const getEmployeesForJob = async () => {
  let responseData;
  try {
    const response: any = await request("/getEmployeesForJob", "POST", {}, false);
    responseData = response.data;
  } catch (err) {
    responseData = err.data;
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(
        err.data.errors ||
          err.data.message ||
          `${err.data["err.user.incorrect"]}\nYou have ${err.data.retry} attempts left`
      );
    } else {
      throw new Error(`Something went wrong`);
    }
  }
  return responseData.employees;
};

export const getEmployees = async () => {
  let responseData;
  try {
    const response: any = await request("/getAllEmployees", "POST", null, false);
    responseData = response.data;
    console.log(responseData);
  } catch (err) {
    responseData = err.data;
    if (err.response.status >= 400 || err.data.status === 0) {
      throw new Error(
        err.data.errors ||
        err.data.message ||
        `${err.data["err.user.incorrect"]}\nYou have ${err.data.retry} attempts left`
      );
    } else {
      throw new Error(`Something went wrong`);
    }
  }
  return responseData.employees;
};