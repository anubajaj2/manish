sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/demo/cart/model/formatter"
],
   function(BaseController, UIComponent, JSONModel,
  MessageToast, Formatter) {
  "use strict";
	var customerId;
	var changeCheck = 'false';
  var groupID = [];

  return BaseController.extend("sap.ui.demo.cart.controller.Customers", {
    formatter: Formatter,
    onInit: function() {
      var oViewDetailModel = new JSONModel({
        "buttonText": "Save",
        "deleteEnabled": false,
        "blockStatus": false
      });
      this.setModel(oViewDetailModel, "viewModel");

      var oRouter = this.getRouter();
      oRouter.attachRoutePatternMatched(this._onRouteMatched,this);
      //oRouter.getRoute("Customers").attachMatched(this._onRouteMatched, this);
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
    //  this.clearScreen();
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
      this.getView().byId("__component0---Customers--Customer--idgpCode").clearSelection();//setSelectedKeys(null);//;//setValue("");
      customerModel.CustomerCode = "";
      customerModel.Name = "";
      customerModel.Address = "";
      customerModel.City = "";
      customerModel.MobilePhone = "";
      customerModel.EmailId = "";
      customerModel.Status = "";
      customerModel.Groups = [];
      viewModel.setProperty("/codeEnabled", true);
      viewModel.setProperty("/buttonText", "Save");
      viewModel.setProperty("/deleteEnabled", false);
      viewModel.setProperty("/blockStatus", false);
      dataModel.setProperty("/groupCodeState", "None");
      dataModel.setProperty("/emailState", "None");
      this.getView().getModel("local").setProperty("/Customer", customerModel);
    },

		CodeCheck: function(oEvent) {
      debugger;
      var text = oEvent.getParameter("newValue");
      var viewModel = this.getView().getModel("viewModel");
      var customerId = this.customerCheck(text);
      debugger;
      this.getView().byId("__component0---Customers--Customer--idName").focus();
    //  $("#idCode").keydown(function(event) {
      //  if (event.keyCode == 13) {
        //  $('#idName').focus();
        //}
    //  });
    },
		groupCodeCheck: function(oEvent) {
      debugger;
    //this.getView().byId("__component0---Customers--Customer--idEmail").focus();
      return changeCheck = 'true';
    },
    onSelectionFinish:function(){
      debugger;
      this.getView().byId("__component0---Customers--Customer--idEmail").focus();
      //  $('#__component0---Customers--Customer--idEmail').focus();

    },
    onNameEnt: function(oEvent) {
      this.getView().byId("__component0---Customers--Customer--idName").setValue(oEvent.getParameter("value").toUpperCase());
      this.getView().byId("__component0---Customers--Customer--idAddress").focus();
    },
    onAddrEnt: function(oEvent) {
      this.getView().byId("__component0---Customers--Customer--idCity").focus();
    },
    onCityEnt: function(oEvent) {
      this.getView().byId("__component0---Customers--Customer--idContact").focus();
    },
    onContEnt: function(oEvent) {
      this.getView().byId("__component0---Customers--Customer--idgpCode").focus();
    },
    onEmailEnt: function(oEvent) {
      this.getView().byId("__component0---Customers--Customer--idBlock").focus();
    },
    onSwitch: function() {
      debugger;
      //var input_source = oEvent.getSource();
      return this.onSwitch = true;
    },
    customerCheck1: function(code) {
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
          var id = found[0].id;
        }else{
          var id = "";
        }
      }

      return id;

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
          oCustomer.Groups = found[0].Groups;
          oCustomer.EmailId = found[0].EmailId;
          if (found[0].Status === "B") {
            viewModel.setProperty("/blockStatus", true);
          } else if (found[0].Status === "U") {
            viewModel.setProperty("/blockStatus", false);
          }
          if (found[0].id) {

            var oFilter = new sap.ui.model.Filter({
              filters: [
                new sap.ui.model.Filter("RetailerId", sap.ui.model.FilterOperator.EQ, found[0].id)
              ]
            });
            this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/RetailerGroups", "GET", oFilter, {}, this)
              .then(function(oData) {
                debugger;
              //  that.getView().getModel("local").setProperty("/Customer", oData.results[0]);
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
                  debugger;
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
          debugger;
          this.getView().getModel("local").setProperty("/Customer", oCustomer);
            viewModel.setProperty("/buttonText", "Update");
          //  this.update = "X";
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
			//var groupId = this.getView().getModel("local").getProperty("/groupSelected/GroupId");
      var groupId = this.getView().getModel("local").getProperty("/groupSelected");
      //customerData.Groups = groupId;
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
          if (Formatter.checkEmail(this.getView().byId("__component0---Customers--Customer--idEmail")) !== true){
            return this.getView().byId("__component0---Customers--Customer--idEmail").setValueState("Error");
          }
			  }

				if (viewModel.oData.blockStatus === true) {
					oSaveData.Status = "B";
				} else {
					oSaveData.Status = "U";
				}

				var id = this.customerCheck1(oSaveData.CustomerCode);
				if (id) {
          var oFilter =  new sap.ui.model.Filter("RetailerId",
            sap.ui.model.FilterOperator.EQ, id);
      //  if (changeCheck === 'false') {
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							"/Customers('" + id + "')", "PUT", {},
							oSaveData, this)
						.then(function(oData) {

							that.UpdateLocalModel();
              that.clearScreen();
              MessageToast.show("Data saved successfully");
						}).catch(function(oError) {
							MessageToast.show("Data could not be saved");
						});
        //  }
					if (changeCheck === 'true') {
						debugger;
						var that = this;
						this.updateGroup(oFilter);
						for (var i = 0; i < groupId.length; i++) {
              debugger;
							var status = that.updateGroupDetails(groupId, i, id);
						}
					}
          //change user status
          if (this.onSwitch === true){
            debugger;
              var changeUserStatus = {
                emailId: oSaveData.EmailId,
                name: oSaveData.Name,
                bStat: viewModel.oData.blockStatus,
                Authorization: this.getModel("local").getProperty("/Authorization")
              };
              this.changeUserStatus(changeUserStatus);
          }

				} else {
					// var manufactureId = [];
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
							"/Customers", "POST", {}, oSaveData, this)
						.then(function(oData) {
							debugger;

            //  that.UpdateLocalModel(oData);
              that.clearScreen();
					/*		var customerId = oData.id;
							for (var i = 0; i < groupId.length; i++) {
								debugger;
								var status = that.updateGroupDetails(groupId, i, customerId);
							} */

							MessageToast.show("Data saved sucessfully");
							 that._onRouteMatched();
						})
						.catch(function(oError) {
							MessageToast.show("Data could not be saved");
              that.clearScreen();
							//that._onRouteMatched();
						});

        //Create new user
        debugger;
          var createUserPayload = {
            name: oSaveData.Name,
            emailId: oSaveData.EmailId,
            role: "Retailer",
            Authorization: this.getModel("local").getProperty("/Authorization")
          };
      this.createUserPayload(createUserPayload);

				} //id check
			} else {
				var required = this.getView().byId("__component0---Customers--Customer--idCode");
				required.setValueState("Error");
				required.setValueStateText("Please enter a Code!");
			}
		},
		updateGroupDetails: function(groupId, i, customerId) {
      debugger;
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
            //that.UpdateLocalGroupModel();
            that.UpdateLocalModel();
          })
          .catch(function(oError) {
            retailerGroup.RetailerId = "";
            retailerGroup.GroupId = "";
            retailerGroup.ChangedBy = "";
            retailerGroup.ChangedOn = "";
            retailerGroup.CreatedBy = "";
            retailerGroup.CreatedOn = "";
          });
      }
    },
		updateGroup: function(oFilter) {
      debugger;

      var that = this;
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/RetailerGroups", "GET", {	filters: [oFilter] }, {}, this)
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
              that.clearScreen();
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
    },
    createUserPayload:function(createUserPayload){
      debugger;

      $.post('/createNewUser', createUserPayload)
      .then(function(data){
        debugger;
      })
      .fail(function(error) {
        sap.m.MessageBox.error("User Creation failed");
      });
    },
    changeUserStatus:function(changeUserStatus){
      debugger;

      $.post('/changeUserStatus', changeUserStatus)
      .then(function(data){
        debugger;
      })
      .fail(function(error) {
        sap.m.MessageBox.error("Changing User Status failed");
      });
    },
    UpdateLocalModel:function(data){
      debugger;
        var that = this;
        var code = this.getView().byId("__component0---Customers--Customer--idCode").getValue();
        var customerJson = this.getView().getModel("customerModelInfo").getData().results;

        function getcustomerDetail(code) {
          return customerJson.filter(
            function(data) {
              return (data.CustomerCode === code);
            });
        }
        if (customerJson && customerJson.length > 0) {
          var customerModelInfo = getcustomerDetail(code);
          if (customerModelInfo.length > 0) {
            var viewModel = this.getView().getModel("viewModel");
            var status = viewModel.getProperty("/blockStatus");
            var oCustomer = this.getView().getModel("local").getProperty("/Customer");

             customerModelInfo[0].CustomerCode = oCustomer.CustomerCode;
             customerModelInfo[0].Address = oCustomer.Address;
             customerModelInfo[0].Name = oCustomer.Name;
             customerModelInfo[0].City = oCustomer.City ;
             customerModelInfo[0].MobilePhone = oCustomer.MobilePhone;
             customerModelInfo[0].EmailId = oCustomer.EmailId;
             customerModelInfo[0].Groups = oCustomer.Groups;
             var group = this.getView().getModel("local").getProperty("/groupSelected");

             debugger;
             if (status === true) {
               customerModelInfo[0].Status = "B" ;
             } else if (status === false) {
               customerModelInfo[0].Status = "U" ;
             }
           }/*else{
             var viewModel = this.getView().getModel("viewModel");
             var status = viewModel.getProperty("/blockStatus");
             var oCustomer = this.getView().getModel("local").getProperty("/Customer");
              customerModelInfo[0] = data;
            //  customerModelInfo[0] = customerJson[0];
              customerModelInfo[0].CustomerCode = oCustomer.CustomerCode;
              customerModelInfo[0].Address = oCustomer.Address;
              customerModelInfo[0].Name = oCustomer.Name;
              customerModelInfo[0].City = oCustomer.City ;
              customerModelInfo[0].MobilePhone = oCustomer.MobilePhone;
              customerModelInfo[0].EmailId = oCustomer.EmailId;
              customerModelInfo[0].Groups = oCustomer.Groups;
              var group = this.getView().getModel("local").getProperty("/groupSelected");

              debugger;
              if (status === true) {
                customerModelInfo[0].Status = "B" ;
              } else if (status === false) {
                customerModelInfo[0].Status = "U" ;
              }

           }*/
          }
        }

      /*  UpdateLocalGroupModel:function(){

          var group = this.getView().getModel("local").getProperty("/groupSelected");

        } */


  });
});
