class UserAuth {
  constructor() {
    this.userLaboratoryID = this.getUserLaboratoryID();
  }
  
  setUserLaboratoryID(UserLaboratoryID) {
    this.userLaboratoryID = UserLaboratoryID;
    localStorage.setItem("UserLaboratoryID", UserLaboratoryID);
  }

  getUserLaboratoryID() {
    return localStorage.getItem("UserLaboratoryID");
  }

  removeUserLaboratoryID() {
    this.userLaboratoryID = null;
    localStorage.removeItem("UserLaboratoryID");
  }
}

const userAuth = new UserAuth();

export default userAuth;