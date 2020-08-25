import React from "react";
import { Switch, BrowserRouter as Router, Route } from "react-router-dom";
import Header from "./app/Components/Header";

import LoginPage from "./app/Pages/Login";
import SignUpPage from "./app/Pages/SignUp";
import RecoverPage from "./app/Pages/Recover";
import GroupPage from "./app/Pages/Employees/Group";
import TechnicianPage from "./app/Pages/Employees/Technician";
import ManagerPage from "./app/Pages/Employees/Manager";
import OfficeAdminPage from "./app/Pages/Employees/Office";
import CustomersPage from "./app/Pages/Customers";

// for dev
import TempPage from "./app/Pages/Customers/ScheduleJobs/tempPage";

import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";

const App = () => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <Router>
        <div className="App">
          <Switch>
            <Route path="/login" component={LoginPage} />
            <Route path="/signup" component={SignUpPage} />
            <Route path="/recover" component={RecoverPage} />

            <Route path="/">
              <Header />
              <div className="main-container">
                <Switch>
                  <Route exact path="/employees" component={GroupPage} />
                  <Route exact path="/employees/groups" component={GroupPage} />
                  <Route
                    exact
                    path="/employees/technicians"
                    component={TechnicianPage}
                  />
                  <Route
                    exact
                    path="/employees/managers"
                    component={ManagerPage}
                  />
                  <Route
                    exact
                    path="/employees/office"
                    component={OfficeAdminPage}
                  />

                  <Route exact path="/customers" component={CustomersPage} />
                  <Route
                    exact
                    path="/customers/customer-list"
                    component={CustomersPage}
                  />
                  {/* for dev */}
                  <Route
                    exact
                    path="/customers/schedule"
                    component={TempPage}
                  />
                </Switch>
              </div>
            </Route>
          </Switch>
        </div>
      </Router>
    </MuiPickersUtilsProvider>
  );
};
export default App;
