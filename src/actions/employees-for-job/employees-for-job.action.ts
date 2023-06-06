import {  EmployeesForJobActionType } from './employees-for-job.types';
import { getEmployeesForJob } from 'api/employee.api';


export const loadingEmployeesForJob = () => {
    return {
        type: EmployeesForJobActionType.GET
    }
}

export const getEmployeesForJobAction = (filter?: any) => {
    return async (dispatch: any) => {
        const employeesForJob: any = await getEmployeesForJob(filter);
        dispatch(setEmployeesForJob(employeesForJob));
    };
}

export const setEmployeesForJob = (employeesForJob: any) => {
    return {
        type: EmployeesForJobActionType.SUCCESS,
        payload: employeesForJob
    }
}


