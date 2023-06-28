import request from "utils/http.service";

export const getCommissionHistoryByJob = async (jobId: string) => {
    let responseData;
    try {
        const response: any = await request(`/getCommissionHistoryByJob/${jobId}`, "GET", false);
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
    return responseData.history;
};
