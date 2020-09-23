sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/f/LayoutType",
  "sap/m/MessageToast"
], function(BaseController, UIComponent, JSONModel, LayoutType, MessageToast) {
  "use strict";

  return BaseController.extend("sap.ui.demo.cart.controller.AdminPanel", {
    onInit: function() {
      var oRouter = this.getOwnerComponent().getRouter();
      oRouter.getRoute("AdminPanel").attachMatched(this._onRouteMatched, this);
    },
    _onRouteMatched: function(oEvent) {
      var that = this;
      this.getView().setBusy(true);
      this.getModel("local").setProperty("/layout", LayoutType.TwoColumnsMidExpanded);
      this.firstTwoDisplay();
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			 "/AppUsers", "GET", {}, {}, this)
				.then(function(oData) {
					var appUsersMap = new Map();
					oData.results.forEach((item) => {
						appUsersMap.set(item.EmailId, {
							pwdChange: item.pwdChange,
							appUserId : item.id,
							lastLogin : (item.lastLogin ? item.lastLogin.toString().slice(4,24) :"Not logged in till now")
						});
					});
					that.loadCustomerManufacture(appUsersMap);
				}).catch(function(oError) {
					this.getView().setBusy(false);
          MessageToast.show("cannot fetch the data");
        });
    },
		loadCustomerManufacture : function(appUsersMap){
			var that = this;
      var oModelManufacturer = new JSONModel();
      var oModelCustomer = new JSONModel();

      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/Manufacturers", "GET", {}, {}, this)
        .then(function(oData) {
					oData.results.forEach((item,index)=>{
						if(appUsersMap.has(item.EmailId)){
							oData.results[index].pwdChange = appUsersMap.get(item.EmailId).pwdChange;
							oData.results[index].appUserId = appUsersMap.get(item.EmailId).appUserId;
							oData.results[index].lastLogin = appUsersMap.get(item.EmailId).lastLogin;
						}
					});
          oModelManufacturer.setData(oData);
          that.getView().setModel(oModelManufacturer, "manufactureModelInfo");
        }).catch(function(oError) {
          MessageToast.show("cannot fetch the data");
        });

      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/Customers", "GET", {}, {}, this)
        .then(function(oData) {
					oData.results.forEach((item,index)=>{
						if(appUsersMap.has(item.EmailId)){
							oData.results[index].pwdChange = appUsersMap.get(item.EmailId).pwdChange;
							oData.results[index].appUserId = appUsersMap.get(item.EmailId).appUserId;
							oData.results[index].lastLogin = appUsersMap.get(item.EmailId).lastLogin;
						}
					});
          oModelCustomer.setData(oData);
          that.getView().setModel(oModelCustomer, "customerModelInfo");
          that.getView().setBusy(false);
        }).catch(function(oError) {
          that.getView().setBusy(false);
          MessageToast.show("cannot fetch the data");
        });
		},

    userStatusUpdate: function(caller, id, status) {
      // var oFilter = new sap.ui.model.Filter("id","EQ", "'" + key + "'")
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          caller + "('" + id + "')",
          "PUT", {}, {
            Status: status
          }, this)
        .then(function(oData) {
          MessageToast.show("Success");
        }).catch(function(oError) {
          MessageToast.show("Error, Invalid Data");
        });
    },
    onBlockSwitch: function(oEvent) {
      var sPath = oEvent.getSource().getParent().getBindingContextPath() + "/id";
      var id = this.getView().getModel('customerModelInfo').getProperty(sPath);
      var status = (oEvent.getParameters("Selected").state ? "U" : "B");
      this.userStatusUpdate("/Customers", id, status);
    },
    onBlockSwitch2: function(oEvent) {
      var sPath = oEvent.getSource().getParent().getBindingContextPath() + "/id";
      var id = this.getView().getModel('manufactureModelInfo').getProperty(sPath);
      debugger;
      var status = (oEvent.getParameters("Selected").state ? "U" : "B");
      this.userStatusUpdate("/Manufacturers", id, status);
    },

		setPasswordChange: function(id, state) {
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/AppUsers('" + id + "')",
          "PUT", {}, {
            pwdChange: true
          }, this)
        .then(function(oData) {
          MessageToast.show("Success, Password reseted");
        }).catch(function(oError) {
          MessageToast.show("Error, Invalid Data");
        });
    },
    onPassSwitch: function(oEvent) {
      var sPath = oEvent.getSource().getParent().getBindingContextPath() ;
      var id = this.getView().getModel('customerModelInfo').getProperty(sPath+"/appUserId");
      var state = oEvent.getParameters("Selected").state;
			if(state===false){
				MessageToast.show("Can't, Password is reseted!");
				this.getView().getModel('customerModelInfo').setProperty(sPath+"/pwdChange",true);
			}
			else{
				this.setPasswordChange(id, state);
			}
    },
		onPassSwitch2: function(oEvent) {
      var sPath = oEvent.getSource().getParent().getBindingContextPath();
      var id = this.getView().getModel('manufactureModelInfo').getProperty(sPath+ "/appUserId");
      var state = oEvent.getParameters("Selected").state;
			if(state===false){
				MessageToast.show("Can't, Password is reseted");
				this.getView().getModel('manufactureModelInfo').setProperty(sPath+"/pwdChange",true);
			}
			else{
				this.setPasswordChange(id, state);
			}
    }
    // loadAdminPanel: function(){
    // 		var that = this;
    // 		this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
    // 					"/Groups", "GET", {}, {}, this)
    // 					.then(function(oData) {
    // 		that.getOwnerComponent().getModel("local").setProperty("/list",{
    // 		AdminPanel:oData.results
    // 		});
    //
    // 		})
    // 		.catch(function(oError) {
    // 				MessageToast.show("cannot fetch the data");
    // 		 });
    // 	}
  });
});
