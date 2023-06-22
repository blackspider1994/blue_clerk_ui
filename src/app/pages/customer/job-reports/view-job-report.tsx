import BCCircularLoader from 'app/components/bc-circular-loader/bc-circular-loader';
import BCJobReport from '../../../components/bc-job-report/bc-job-report-v2';
import { loadJobReportActions } from 'actions/customer/job-report/job-report.action';
import {error as errorSnackBar, success} from "actions/snackbar/snackbar.action";
import { useParams, useHistory } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllJobTypesAPI } from 'api/job.api';
import { callCreateInvoiceAPI, getInvoiceDetail } from 'api/invoicing.api';


function ViewJobReportsPage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const { jobReportId } = useParams<any>();

  const { loading, jobReportObj, error } = useSelector(({ jobReport }: any) =>
    jobReport);
  const { 'loading': jobTypesLoading, data } = useSelector(({ jobTypes }: any) => jobTypes);

  useEffect(() => {
    dispatch(getAllJobTypesAPI());
    dispatch(loadJobReportActions.fetch({ jobReportId }));
  }, []);

  const generateInvoiceHandler = async(invoiceObj:any) => {
    const result:any = await callCreateInvoiceAPI(invoiceObj);
    if (result && result?.status !== 0) {
      const { 'invoice': newInvoice } = result;
      dispatch(loadJobReportActions.success({ ...jobReportObj,
        'invoiceCreated': true,
        'invoice': newInvoice }));
      history.push({
        'pathname': `/main/customers/job-reports/view/${newInvoice._id}`,
      });
      dispatch(success(`Draft ${newInvoice.invoiceId} Created`));
    } else {
      dispatch(errorSnackBar(result.message));
    }
  }

  if (loading || jobTypesLoading) {
    return <BCCircularLoader heightValue={'200px'} />;
  }

  return <BCJobReport
    jobReportData={jobReportObj}
    jobTypes={data}
    generateInvoiceHandler={generateInvoiceHandler}
    getInvoiceDetailHandler={getInvoiceDetail}
  />;
}

export default ViewJobReportsPage;
