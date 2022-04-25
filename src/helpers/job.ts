export function getVendor (job: any) {
  const {tasks} = job;
  let value = '';
  if (tasks) {
    if (tasks.length === 0) return null;
    else if (tasks.length > 1) value = 'Multiple Techs';
    else if (tasks[0].vendor) {
      value = tasks[0].vendor.profile
        ? tasks[0].vendor.profile.displayName
        : tasks[0].vendor.info.companyName;
    } else if (tasks[0].technician) {
      value =  tasks[0].technician.profile
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
