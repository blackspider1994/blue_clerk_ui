import React, {useEffect, useState} from 'react';
import styles from './bc-company-profile.style';
import {IconButton, withStyles} from '@material-ui/core';
import NoCompanyLogo from 'assets/img/avatars/NoCompanyLogo.png';
import {ADMIN_SIDEBAR_BG} from '../../../constants';
import DropDownMenu, {DROP_ITEM} from "../bc-menu-dropdown";
import {Add as AddIcon, Business as BusinessIcon, Edit as EditIcon} from '@material-ui/icons';
import {
  CompanyLocation,
  CompanyProfileStateType,
} from "../../../actions/user/user.types";

interface Props {
  classes: any;
  setLocation: (location: CompanyLocation) => void;
  profileState: CompanyProfileStateType;
  openAddContactModal: () => void;
  editItem: (selectedItem:any) => void;
  handleAddLocation: () => void;
}

interface Avatar {
  isEmpty?: string;
  url?: string;
  onChange?: (f: File) => void
  noUpdate?: boolean
  imageUrl?: any;
}

function BCCompanyLocation(props: Props) {
  const {
    classes,
    setLocation,
    profileState,
    openAddContactModal,
    editItem,
    handleAddLocation,
  } = props;

  const [selectedItem, setSelectedItem] = useState<DROP_ITEM | null>(null);
  const [locations, setLocations] = useState<DROP_ITEM[]>([]);
  const [showEdit, setEdit] = useState(false);

  useEffect(() => {
    let mainIndex = 0;
    const companyLocations = profileState.locations.map((location: any, index) => {
      const temp: DROP_ITEM = {
        id: location._id,
        title: location.isMainLocation ? location.isActive ? `${location.name} (Main)` : `${location.name} (Main) (Inactive)` :  location.isActive ? location.name : `${location.name} (Inactive)`,
        icon: undefined,
        selectable: true,
      };
      if (temp.id === selectedItem?.id) setSelectedItem(temp);
      if (location.isMainLocation) mainIndex = index;
      return temp;
    });
    companyLocations.unshift({id: '0', title: 'Add New Location', icon: AddIcon, selectable: false});
    setLocations(companyLocations);
    if (!selectedItem || selectedItem.id == "0") {
      setSelectedItem(companyLocations[mainIndex + 1]);
    }
    if (companyLocations.length == 1) {
      setSelectedItem(companyLocations[0]);
    }
  }, [profileState.locations])

  useEffect(() => {
    const fullItem = profileState.locations.find((location) => location._id === selectedItem?.id);
    if (fullItem) setLocation(fullItem);
  }, [selectedItem])

  const handleClick = (event: React.MouseEvent<HTMLElement>, item: DROP_ITEM) => {
    if (item.selectable) {
      setSelectedItem(item);
    } else {
      if (item.id === '0') {
        handleAddLocation()
      }
    }
  }


  return (
    <div className={classes.profilePane}>
      <div className={classes.avatarArea}>
        <img src={profileState.logoUrl === '' ? NoCompanyLogo :profileState.logoUrl}/>
      </div>

      <div className={classes.namePane} >
        <span className={classes.labelText}>Company Name
          <IconButton onClick={() => openAddContactModal()}>
            <EditIcon className={classes.editProfileIcon}/>
          </IconButton>
        </span>
        <span className={classes.companyText}>{profileState.companyName}</span>
      </div>

      <div className={classes.locationPane}
        onMouseEnter={() => setEdit(true)}
        onMouseLeave={() => setEdit(false)}
      >
        <DropDownMenu
          selectedItem={selectedItem}
          items={locations}
          onSelect={handleClick}
        />
        {locations.length == 1 &&(
            <IconButton
              onClick={() => handleAddLocation()}
            >
              <AddIcon style={{color: ADMIN_SIDEBAR_BG}}/>
            </IconButton>   
        )
        }
        {locations.length > 1 &&(
          <IconButton
            disabled={!selectedItem}
            onClick={() => editItem(selectedItem)}
          >
            <EditIcon style={{color:  ADMIN_SIDEBAR_BG }}/>
          </IconButton>
         )}
      </div>
    </div>
  );
}

export default withStyles(
  styles,
  { 'withTheme': true }
)(BCCompanyLocation);
