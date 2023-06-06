export function getVendor(job: any) {
  const {tasks} = job;
  let value = '';
  if (tasks) {
    if (tasks.length === 0) return null;
    else if (tasks.length > 1) value = 'Multiple Techs';
    else if (tasks[0].vendor) {
      value = tasks[0].vendor.profile
        ? tasks[0].vendor.profile.displayName
        : tasks[0].vendor.info.companyName;
    } else if (tasks[0].contractor) {
      value = tasks[0].contractor.info.displayName
        ? tasks[0].contractor.info.displayName
        : tasks[0].contractor.info.companyName;
    } else if (tasks[0].technician) {
      value = tasks[0].technician.profile
        ? tasks[0].technician.profile.displayName
        : tasks[0].technician.info.companyName;
    }
  }
  return value.toLowerCase();
}

export function getJobType(job: any) {
  const allTypes = job.tasks.reduce((acc: string[], task: any) => {
    if (task.jobType?.title) {
      if (acc.indexOf(task.jobType.title) === -1) acc.push(task.jobType.title);
      return acc;
    }

    const all = task.jobTypes?.map((item: any) => item.jobType?.title);
    all.forEach((item: string) => {
      if (item && acc.indexOf(item) === -1) acc.push(item);
    })
    return acc;
  }, []);

  return allTypes.length === 1 ? allTypes[0].toLowerCase() : 'multiple jobs';
}

export function getJobRequestDescription(jobRequest: any) {
  const {requests, windows} = jobRequest;
  let value = '';
  if (requests.length > 0) {
    if (requests.length > 1) {
      value = 'Multiple requests';
    } else if (requests[0]) {
      value = requests[0].category ? requests[0].category : '-'
    } else {
      value = '-'
    }
  } else if (windows.length > 0) {
    if (windows.length === 0) {
      return '';
    } else if (windows.length > 1) {
      value = 'Multiple Windows';
    } else if (windows[0]) {
      value = windows[0].title || '';
    }
  }
  return value.toLowerCase();
}
