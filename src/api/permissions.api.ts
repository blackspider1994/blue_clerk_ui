import axios from "axios";

export const getUserPermissions = async (userId: string) => {
  let responseData;

  try {
    const response: any = await axios.get(`${process.env.REACT_APP_LAMBDA_URL}/permissions/${userId}`);
    responseData = response?.data?.body;
  } catch (err) {
    responseData = {
      status: 0,
      message: 'We are facing some issues, please try again.\''
    };
  }
  return responseData;
}
