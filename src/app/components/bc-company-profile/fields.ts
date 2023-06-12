import { createFilterOptions } from "@material-ui/lab";
import {
  CompanyLocation,
  CompanyProfileStateType
} from "../../../actions/user/user.types";
import {allStates} from "../../../utils/constants";

export const companyProfileFields = (profileState: CompanyProfileStateType) => [
  {
    left: {
      id: 'companyName',
      label: 'Company Name:',
      placehold: 'Input Company Name',
      value: profileState.companyName,
    },
    right: {
      id: 'companyEmail',
      label: 'Company Email:',
      placehold: 'Input Company Email',
      value: profileState.companyEmail,
    },
  },
  {
    left: {
      id: 'phone',
      label: 'Phone:',
      placehold: 'Input Phone Number',
      value: profileState.phone,
      type: 'number',
      max: 10,
    },
    right: {
      id: 'fax',
      label: 'Fax:',
      placehold: 'Input Fax',
      value: profileState.fax,
      type: 'number',
      max: 10,
    }
  },
  {
    left: {
      id: 'street',
      label: 'Street:',
      placehold: 'Input Street',
      value: profileState.street,
    },
    right: {
      id: 'city',
      label: 'City:',
      placehold: 'Input City',
      value: profileState.city,
    }
  },
  {
    left: {
      id: 'state',
      label: 'State:',
      placehold: 'Input State',
      value: profileState.state,
      data: allStates,
      filterOptions: createFilterOptions({
        stringify: (option: any) => option.name + option.abbreviation,
      })
    },
    right: {
      id: 'zipCode',
      label: 'Zip Code:',
      placehold: 'Input Zip Code',
      value: profileState.zipCode,
      type: 'number',
      max: 5,
    }
  },
];


export const companyProfileFields2 = (profileState: CompanyProfileStateType) => [
  {
    id: 'companyEmail',
    label: 'Company Email:',
    value: profileState.companyEmail,
  }, {
    id: 'phone',
    label: 'Phone:',
    value: profileState.phone,
  }, {
    id: 'fax',
    label: 'Fax:',
    value: profileState.fax,
  }, {
    id: 'street',
    label: 'Street:',
    placehold: 'Input Street',
    value: profileState.street,
  }, {
    id: 'city',
    label: 'City:',
    value: profileState.city,
  }, {
    id: 'state',
    label: 'State:',
    value: profileState.state,
  }, {
    id: 'zipCode',
    label: 'Zip Code:',
    value: profileState.zipCode,
  }
]

export const companyLocationFields = (location: CompanyLocation) => [
  {
    id: 'contactName',
    label: 'Contact Name',
    value: location.contactName,
  }, {
    id: 'contactNumber',
    label: 'Contact Number',
    value: location.contact?.phone,
  }, {
    id: 'contactEmail',
    label: 'Contact Email',
    value: location.info?.companyEmail,
  }, {
    id: 'isActive',
    label: 'Status:',
    value: location.isActive ? "Active": "Inactive",
  }, {
    id: 'street',
    label: 'Street:',
    value: location.address?.street,
  }, {
    id: 'city',
    label: 'City:',
    value: location.address?.city,
  }, {
    id: 'state',
    label: 'State:',
    value: location.address?.state,
  }, {
    id: 'zipCode',
    label: 'Zip Code:',
    value: location.address?.zipCode,
  }
]
