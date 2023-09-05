import  React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useStyles } from '../components/bc-qb-sync-status/bc-qb-sync-status.style';

import { Dialog,DialogTitle,DialogContent,DialogActions,Button, IconButton, Typography, MenuItem, Select, FormControl, InputLabel } from '@material-ui/core';
import { useDispatch } from "react-redux";
import CircularProgress from '@material-ui/core/CircularProgress';


import { Close as CloseIcon } from '@material-ui/icons';
interface QbSyncDialogProps
{
    loading:boolean;
    handleSync:any;
    resyncing:boolean;
    open:boolean;
    itemName:string;
    handleClose:()=>void;
    qbAccounts: any[];
}

const QbSyncDialog: React.FC<QbSyncDialogProps> = ({ open, handleClose, itemName, qbAccounts, handleSync, loading, resyncing }) =>{
    const [selectedOption, setSelectedOption] = useState('Select');
    const [selectedAccount, setSelectedAccount] = useState('Select');
    const classes = useStyles({ isSynced: false, hasError:false });

    const handleOptionChange = (event: { target: { value: any; }; }) => {
        let selected_account = qbAccounts[event.target.value];
        setSelectedOption(event.target.value);
        setSelectedAccount(selected_account);
        console.log("Account on change", selected_account);
    };
return(
    <Dialog open={open} onClose={handleClose} >
        <DialogTitle>
            <IconButton aria-label="close" onClick={handleClose} style={{ position: 'absolute', top: '10px', right: '10px' }}>
                <CloseIcon />
            </IconButton>
        </DialogTitle>
        <DialogContent style={{width:"400px"}}>
            <Typography variant="h6" gutterBottom>
                Sync Item {itemName ? itemName : ' '}
            </Typography>

            {loading ? <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }} ><p><b><i>Fetching Accounts List</i></b></p><br /><CircularProgress size={28} className={classes.accProgress} /></div> :<>
                <InputLabel id="demo-controlled-open-select-label">Select income account</InputLabel>
                <Select
                    value={selectedOption}
                    onChange={handleOptionChange}
                    fullWidth
                    variant="outlined"
                    style={{ marginTop: '20px' }}
                >
                {qbAccounts && qbAccounts.length > 0 ? (
                    qbAccounts.map((accounts, index) => (
                        <MenuItem key={index} value={index}> {accounts.Name}</MenuItem>
                    ))
                ) : (
                    <MenuItem disabled>No accounts available</MenuItem>
                )}
                </Select>   
            </>
}

                
            
            
        </DialogContent>
        <DialogActions>
            <Button onClick={handleClose} color="primary">
                Close
            </Button>
            <Button onClick={
                () => handleSync(selectedAccount)
                } color="primary">
                {resyncing ? <CircularProgress size={28} className={classes.accProgress} /> :"Sync Item"}
            </Button>
        </DialogActions>
    </Dialog>
);
};

export default QbSyncDialog;