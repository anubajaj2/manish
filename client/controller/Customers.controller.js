sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/demo/cart/model/formatter"
], function(BaseController, UIComponent, JSONModel,
  MessageToast, formatter) {
  "use strict";
	var customerId;
	var changeCheck = 'false';
  return BaseController.extend("sap.ui.demo.cart.controller.Customers", {
    onInit: function() {
      var oViewDetailModel = new JSONModel({
        "buttonText": "Save",
        "deleteEnabled": false,
        "blockStatus": false
      });
      this.setModel(oViewDetailModel, "viewModel");

      var oRouter = this.getRouter();
      oRouter.getRoute("Customers").attachMatched(this._onRouteMatched, this);
      // this._router = UIComponent.getRouterFor(this);
    },
    _onRouteMatched: function(oEvent) {
      debugger;
      var that = this;
      var viewModel = this.getView().getModel("viewModel");
      viewModel.setProperty("/codeEnabled", true);
      viewModel.setProperty("/buttonText", "Save");
      viewModel.setProperty("/deleteEnabled", false);
      viewModel.setProperty("/blockStatus", false);
      var odataModel = new JSONModel({
        "groupCodeState": "None",
        "emailState": "None"
      });
      this.setModel(odataModel, "dataModel");
      debugger;
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/Customers", "GET", {}, {}, this)
        .then(function(oData) {
          debugger;
          var oModelManufacturer = new JSONModel();
          oModelManufacturer.setData(oData);
          that.getView().setModel(oModelManufacturer, "customerModelInfo");
        }).catch(function(oError) {
          MessageToast.show("cannot fetch the data");
        });

      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/Groups", "GET", {}, {}, this)
        .then(function(oData) {
          var oModelGroup = new JSONModel();
          oModelGroup.setData(oData);
          that.getView().setModel(oModelGroup, "groupModelCode");
        }).catch(function(oError) {
          MessageToast.show("cannot fetch the data");
        });
      //
      this.clearScreen();
    },
    clearScreen: function() {
      debugger;
      var customerModel = this.getView().getModel("local").getProperty("/Customer");
      var viewModel = this.getView().getModel("viewModel");
      var dataModel = this.getView().getModel("dataModel");
      var group = this.getView().getModel("local").getProperty("/groupSelected");
      group.GroupCode = "";
      group.GroupId = "";
      this.getView().getModel("local").setProperty("/groupSelected", group);
      customerModel.CustomerCode = "";
      customerModel.Name = "";
      customerModel.Address = "";
      customerModel.City = "";
      customerModel.MobilePhone = "";
      customerModel.EmailId = "";
      customerModel.Status = "";
      viewModel.setProperty("/codeEnabled", true);
      viewModel.setProperty("/buttonText", "Save");
      viewModel.setProperty("/deleteEnabled", false);
      viewModel.setProperty("/blockStatus", false);
      dataModel.setProperty("/groupCodeState", "None");
      dataModel.setProperty("/emailState", "None");
      this.getView().getModel("local").setProperty("/Customer", customerModel);
    },
    checkEmail: function(oInput) {
      if (oInput) {
        var email = oInput.getParameter("newValue");
        var dataModel = this.getView().getModel("dataModel");
        var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
        if (!email.match(mailregex)) {
          dataModel.setProperty("/emailState", "Error");
        } else {
          dataModel.setProperty("/emailState", "None");
          this.getView().getModel("local").setProperty("/Customer/EmailId", email);
        }
      }
    },
		CodeCheck: function(oEvent) {
      debugger;
      var input_source = oEvent.getSource();
      var id = input_source.getSelectedKey();
      var text = input_source.getSelectedItem().getText();
      var viewModel = this.getView().getModel("viewModel");
      var customerId = this.customerCheck(text);
      debugger;
      $('#idCode').keypress(function(event) {
        if (event.keyCode == 13) {
          $('#idName').focus();
        }
      });
    },
		groupCodeCheck: function(oEvent) {
      debugger;
      var input_source = oEvent.getSource();
      changeCheck = 'true';
    },
		customerCheck: function(code) {
      debugger;
      var that = this;
      var customerJson = this.getView().getModel("customerModelInfo").getData().results;

      function getcustomerDetail(code) {
        return customerJson.filter(
          function(data) {
            return (data.CustomerCode === code);
          });
      }
      if (customerJson && customerJson.length > 0) {
        var found = getcustomerDetail(code);
        if (found.length > 0) {
          var viewModel = this.getView().getModel("viewModel");
          var status = viewModel.getProperty("/blockStatus");
          var oCustomer = this.getView().getModel("local").getProperty("/Customer");
          oCustomer.CustomerCode = found[0].CustomerCode;
          oCustomer.Address = found[0].Address;
          oCustomer.Name = found[0].Name;
          oCustomer.City = found[0].City;
          oCustomer.MobilePhone = found[0].MobilePhone;
          oCustomer.EmailId = found[0].EmailId;
          if (found[0].Status === "B") {
            viewModel.setProperty("/blockStatus", true);
          } else if (found[0].Status === "U") {
            viewModel.setProperty("/blockStatus", false);
          }
          if (found[0].id) {
            var oFilter = new sap.ui.model.Filter({
              filters: [
                new sap.ui.model.Filter("RetailerId",
                  sap.ui.model.FilterOperator.Equals, found[0].id)
              ]
            });
            this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/RetailerGroups", "GET", oFilter, {}, this)
              .then(function(oData) {
                debugger;
                var groups = that.getView().getModel("local").getProperty("/groupSelected");
                var groupModelJson = that.getView().getModel("groupModelCode").getData().results;

                function getGroupDetail(groupId) {
                  return groupModelJson.filter(
                    function(data) {
                      return (data.id === groupId);
                    });
                }
                for (var i = 0; i < oData.results.length; i++) {
                  var groupId = oData.results[i].GroupId;
                  var group = getGroupDetail(groupId);
                  debugger;
                  var seletedData = that.getView().getModel("local").getProperty("/groupSelected");
                  that.getView().getModel("local").setProperty("/groupSelected/GroupCode", group[i].groupCode);
                  that.getView().getModel("local").setProperty("/groupSelected/GroupId", group[i].id);
                  that.getView().getModel("local").setProperty("/groupSelected/ManuId", oData.results[i].id);
                  seletedData.GroupCode = group[i].groupCode;
                  seletedData.GroupId = group[i].id;
                  seletedData.ManuId = group[i].oData.results[i].id;
                  var oData = JSON.parse(JSON.stringify(seletedData));
                  groupID.push(oData);
                }
              })
              .catch(function(oError) {
                // MessageToast.show("Data could not be saved");
              });
          }
          this.getView().getModel("local").setProperty("/Customer", oCustomer);
          viewModel.setProperty("/buttonText", "Update");
          viewModel.setProperty("/deleteEnabled", true);
          viewModel.setProperty("/codeEnabled", false);
          return found[0].id;
        } else {
          // return false;
        }
      }
    },
		saveData: function(oEvent) {
			debugger;
			var that = this;
			var dataModel = this.getView().getModel("dataModel");
			var viewModel = this.getView().getModel("viewModel");
			var customerData = this.getView().getModel("local").getProperty("/Customer");
			var groupId = this.getView().getModel("local").getProperty("/groupSelected/GroupId");
			if (customerData.CustomerCode !== "") {

				var oSaveData = JSON.parse(JSON.stringify(customerData));
				oSaveData.CustomerCode = oSaveData.CustomerCode.toUpperCase();
				if (oSaveData.Name && oSaveData.Name !== "") {
					oSaveData.Name = oSaveData.Name.toUpperCase();
				}
				if (oSaveData.Address && oSaveData.Address !== "") {
					oSaveData.Address = oSaveData.Address.toUpperCase();
				}
				if (oSaveData.City && oSaveData.City !== "") {
					oSaveData.City = oSaveData.City.toUpperCase();
				}
				if (oSaveData.EmailId && oSaveData.EmailId !== "") {
					oSaveData.EmailId = oSaveData.EmailId.toUpperCase();
				}

				if (viewModel.oData.blockStatus === "true") {
					oSaveData.Status = "B";
				} else {
					oSaveData.Status = "U";
				}
				var id = this.customerCheck(oSaveData.CustomerCode);
				if (id) {
					var oFilter = new sap.ui.model.Filter({
						filters: [
							new sap.ui.model.Filter("RetailerId",
								sap.ui.model.FilterOperator.Equals, id)
						]
					});
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							"/Customers('" + id + "')", "PUT", {},
							oSaveData, this)
						.then(function(oData) {
							MessageToast.show("Data saved successfully");
							that._onRouteMatched();
						}).catch(function(oError) {
							MessageToast.show("Data could not be saved");
						});
					if (changeCheck === "true") {
						debugger;
						var that = this;
						this.updateGroup(oFilter);
						for (var i = 1; i < groupId.length; i++) {
							var status = that.updateGroupDetails(groupId, i, id);
						}
					}

				} else {
					// var manufactureId = [];
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							"/Customers", "POST", {}, oSaveData, this)
						.then(function(oData) {
							debugger;
							var customerId = oData.id;
							for (var i = 1; i < groupId.length; i++) {
								debugger;
								var status = that.updateGroupDetails(groupId, i, customerId);
							}
							MessageToast.show("Data saved sucessfully");
							// that._onRouteMatched();
						})
						.catch(function(oError) {
							MessageToast.show("Data could not be saved");
							that._onRouteMatched();
						});

				} //id check
			} else {
				var required = this.getView().byId("idCode");
				required.setValueState("Error");
				required.setValueStateText("Please enter a Code!");
			}
		},
		updateGroupDetails: function(groupId, i, customerId) {
      var that = this;
      var retailerGroup = this.getView().getModel("local").getProperty("/RetailerGroup");
      var oModel = this.getView().getModel();
      if (groupId[i] !== "") {
        retailerGroup.RetailerId = customerId;
        retailerGroup.GroupId = groupId[i];
        retailerGroup.ChangedBy = "";
        retailerGroup.ChangedOn = "";
        retailerGroup.CreatedBy = "";
        retailerGroup.CreatedOn = "";
        // batchArray.push(
        this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
            "/RetailerGroups", "POST", {}, retailerGroup, this)
          .then(function(oData) {
            retailerGroup.RetailerId = "";
            retailerGroup.GroupId = "";
            retailerGroup.ChangedBy = "";
            retailerGroup.ChangedOn = "";
            retailerGroup.CreatedBy = "";
            retailerGroup.CreatedOn = "";
            MessageToast.show("Data saved successfully");
            that._onRouteMatched();
          })
          .catch(function(oError) {
            retailerGroup.RetailerId = "";
            retailerGroup.GroupId = "";
            retailerGroup.ChangedBy = "";
            retailerGroup.ChangedOn = "";
            retailerGroup.CreatedBy = "";
            retailerGroup.CreatedOn = "";
            // return false;
            // MessageToast.show("Data could not be saved");
          });
        // );
        // return true;
      }
    },
		updateGroup: function(oFilter) {
      var that = this;
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/RetailerGroups", "GET", oFilter, {}, this)
        .then(function(oData) {
          //again update all group codes
          for (var i = 0; i < oData.results.length; i++) {
            that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
                "/RetailerGroups('" + oData.results.id + "')", "DELETE ", {}, {}, that)
              .then(function(oData) {
                debugger;
                // MessageToast.show("Entry deleted sucessfully");
              })
              .catch(function(oData) {
                debugger
              })
          }
        })
        .catch(function(oError) {
          that._onRouteMatched();
          MessageToast.show("Error in Update");
        });

    },
		deleteCustomer: function(oEvent) {
      debugger;
      var that = this;
      var customerData = this.getView().getModel("local").getProperty("/Customer");
      if (customerData.CustomerCode) {
        var id = this.customerCheck(customerData.CustomerCode);
        if (id) {
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/Customers('" + id + "')", "DELETE", {}, {}, this)
            .then(function(oData) {
              debugger;
              var groupId = that.getView().getModel("local").getProperty("/groupSelected");
              //again update all group codes
              for (var i = 0; i < groupId.length; i++) {
                that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
                    "/RetailerGroups('" + groupId.ManuId + "')", "DELETE ", {}, {}, that)
                  .then(function(oData) {
                    debugger;
                    // MessageToast.show("Entry deleted sucessfully");
                  })
                  .catch(function(oData) {
                    debugger
                  })
              }
              that._onRouteMatched();
              MessageToast.show("Entry Deleted Sucessfully");
            })
            .catch(function(oError) {
              that._onRouteMatched();
              MessageToast.show("Could not delete the entry");
            });

          // that.updateGroupDetails(groupId, i, oData);

        }
      }
    }
  });
});
