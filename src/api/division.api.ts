import request from "utils/http.service";

export const getDivision = async (userId: string) => {
   let responseData;
   try {
      const response: any = await request(`/getUserDivisions`, "POST", {userId: userId}, false);
      responseData = response.data;
   } catch (err) {
      responseData = { message: '' };
      responseData.message = 'We are facing some issues, please try again.'
   }
   return responseData.divisions;
};
