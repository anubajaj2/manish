sap.ui.define([
    "sap/ui/demo/cart/controller/BaseController",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/demo/cart/model/formatter",
    "sap/m/MessageBox",
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    "sap/m/SelectDialog",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet"
  ],
  function(BaseController, UIComponent, JSONModel,
    MessageToast, Formatter, MessageBox,
    Filter,
    FilterOperator, SelectDialog, exportLibrary, Spreadsheet
  ) {
    "use strict";
    var customerId;
    var changeCheck = 'false';
    var groupID = [];
    var EdmType = exportLibrary.EdmType;
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
        oRouter.attachRoutePatternMatched(this._onRouteMatched, this);
        //oRouter.getRoute("Customers").attachMatched(this._onRouteMatched, this);
        // this._router = UIComponent.getRouterFor(this);
      },
      _onRouteMatched: function(oEvent) {

        var that = this;
        this.getView().setBusy(true);
        var viewModel = this.getView().getModel("viewModel");
        viewModel.setProperty("/codeEnabled", true);
        viewModel.setProperty("/buttonText", "Save");
        viewModel.setProperty("/deleteEnabled", false);
        viewModel.setProperty("/blockStatus", false);
        viewModel.setProperty("/emailStatus", true);
        var odataModel = new JSONModel({
          "groupCodeState": "None",
          "emailState": "None"
        });

        this.setModel(odataModel, "dataModel");
        var oModelCustomer = new JSONModel();
        var oModelGroup = new JSONModel();

        this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
            "/Customers", "GET", {}, {}, this)
          .then(function(oData) {
            oModelCustomer.setData(oData);
            that.getView().setModel(oModelCustomer, "customerModelInfo");
            that.getView().setBusy(false);
          }).catch(function(oError) {
            that.getView().setBusy(false);
            MessageToast.show("cannot fetch the data");
          });

        this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
            "/Groups", "GET", {}, {}, this)
          .then(function(oData) {
            oModelGroup.setData(oData);
            that.getView().setModel(oModelGroup, "groupModelInfo");
          }).catch(function(oError) {
            MessageToast.show("cannot fetch the data");
          });
        this.clearScreen();
      },
      onCustomerFilter: function(oEvent) {
        if (!this.oDialog) {
          var customerInfo = this.getView().getModel("customerModelInfo").getProperty("/results");
          var s = new Set();
          customerInfo.forEach((item) => {
            if(item.City){
            s.add(item.City);
          }
          });
          customerInfo = [];
          s.forEach((item) => {
            customerInfo.push({
              "City": item
            });
          });
          this.getView().getModel("customerModelInfo").setProperty("/uniqueCities", customerInfo);
          this.oDialog = new SelectDialog({
            title: "Select Cities",
            multiSelect: true,
            search: this.searchCity.bind(this),
            confirm: this.filterConfirm.bind(this),
            cancel: this.filterCancel.bind(this)
          });
          this.getView().addDependent(this.oDialog);
          this.oDialog.setModel(this.getView().getModel("customerModelInfo"));
          this.oDialog.bindAggregation("items", {
            path: "/uniqueCities",
            template: new sap.m.DisplayListItem({
              label: "{City}"
            })
          });
          this.oDialog.open();
        } else {
          this.oDialog.open();
        }
      },
      searchCity: function(oEvent) {
        var search = oEvent.getParameter("value");
        var oFilter = new Filter('City', FilterOperator.Contains, search);
        this.oDialog.getBinding('items').filter([oFilter]);
      },
      filterConfirm: function(oEvent) {
        var selectedItems = oEvent.getParameter("selectedItems");
        var oFilters = []
        selectedItems.forEach((item) => {
          oFilters.push(new Filter('City', FilterOperator.Contains, item.getLabel()));
        });
        this.getView().byId('customerTable').getBinding('rows').filter(new Filter({
          filters: oFilters,
          and: false
        }));
      },
      filterCancel: function() {
        this.getView().byId('customerTable').getBinding('rows').filter([]);
      },

      createColumnConfig: function() {
        var aCols = [];

        aCols.push({
          label: 'Full name',
          property: 'Name',
          type: EdmType.String
        });

        aCols.push({
          label: 'Code',
          type: EdmType.String,
          property: 'CustomerCode'
        });

        aCols.push({
          label: 'City',
          property: 'City',
          type: EdmType.String
        });
        aCols.push({
          label: 'Address',
          property: 'Address',
          type: EdmType.String
        });
        aCols.push({
          label: 'Mobile',
          property: 'MobilePhone',
          type: EdmType.String
        });
        aCols.push({
          label: 'E-mail',
          property: 'EmailId',
          type: EdmType.String
        });
        aCols.push({
          label: 'Status',
          property: 'Status',
          type: EdmType.String
        });
        return aCols;
      },
      onDownloadRetailersData: function() {
        var aCols, oRowBinding, oSettings, oSheet, oTable;

        if (!this._oTable) {
          this._oTable = this.byId('customerTable');
        }

        oTable = this._oTable;
        oRowBinding = oTable.getBinding('rows');

        aCols = this.createColumnConfig();

        var oModel = oRowBinding.getModel();

        oSettings = {
          workbook: {
            columns: aCols,
            hierarchyLevel: 'Level'
          },
          dataSource: {
            type: 'odata',
            dataUrl: oRowBinding.getDownloadUrl ? oRowBinding.getDownloadUrl() : null,
            serviceUrl: this._sServiceUrl,
            headers: oModel.getHeaders ? oModel.getHeaders() : null,
            count: oRowBinding.getLength ? oRowBinding.getLength() : null,
            useBatch: true // Default for ODataModel V2
          },
          fileName: 'Table export sample.xlsx',
          worker: false // We need to disable worker because we are using a MockServer as OData Service
        };

        oSheet = new Spreadsheet(oSettings);
        oSheet.build().finally(function() {
          oSheet.destroy();
        });
      },
      clearScreen: function() {
        var customerModel = this.getView().getModel("local").getProperty("/Customer");
        var viewModel = this.getView().getModel("viewModel");
        var dataModel = this.getView().getModel("dataModel");
        var group = this.getView().getModel("local").getProperty("/groupSelected");
        group.GroupCode = "";
        group.GroupId = "";
        this.getView().getModel("local").setProperty("/groupSelected", group);
        this.getView().byId("__component0---Customers--Customer--idgpCode").clearSelection(); //setSelectedKeys(null);//;//setValue("");
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
      onCustomerSearch: function(oEvent) {
        var search = oEvent.getSource().getValue();
        var filters = [new Filter('CustomerCode', FilterOperator.Contains, search.toUpperCase()),
          new Filter('EmailId', FilterOperator.Contains, search),
          new Filter('Name', FilterOperator.Contains, search.toUpperCase()),
          new Filter('MobilePhone', FilterOperator.Contains, search)
        ];
        oEvent.getSource().getParent().getParent().getBinding("rows").filter(new Filter({
          filters: filters,
          and: false
        }));
      },
      CodeCheck: function(oEvent) {

        var text = oEvent.getParameter("newValue");
        var viewModel = this.getView().getModel("viewModel");
        var customerId = this.customerCheck(text);

        this.getView().byId("__component0---Customers--Customer--idName").focus();

      },
      groupCodeCheck: function(oEvent) {

        //this.getView().byId("__component0---Customers--Customer--idEmail").focus();
        return changeCheck = 'true';
      },
      onSelectionFinish: function() {

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
          } else {
            var id = "";
          }
        }

        return id;

      },
      onCustomerSelect: function(oEvent) {
        var code = oEvent.getSource().getRows()[oEvent.getSource().getSelectedIndex()].getCells()[0].getText();
        this.customerCheck(code);
      },
      customerCheck: function(code) {

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
            if (found[0].Status === "U") {
              viewModel.setProperty("/blockStatus", true);
            } else if (found[0].Status === "B") {
              viewModel.setProperty("/blockStatus", false);
            }
            if (found[0].id) {

              var oFilter = new Filter({
                filters: [
                  new Filter("RetailerId", FilterOperator.EQ, found[0].id)
                ]
              });
              this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                  "/RetailerGroups", "GET", oFilter, {}, this)
                .then(function(oData) {

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
            viewModel.setProperty("/emailStatus", false);
            return found[0].id;
          } else {}
        }
      },
      CheckEmailExists: function(data) {
        var that = this;
        var CustomerJson = this.getView().getModel("customerModelInfo").getData().results;

        function CheckdataExists(data) {
          return CustomerJson.filter(
            function(exists) {
              return exists.EmailId === data;
            });
        }
        var Exists = CheckdataExists(data);
        if (Exists.length > 0) {
          return true;
        }
      },

      ValidateCustomerData: function(oSaveData) {
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
          if (Formatter.checkEmail(this.getView().byId("__component0---Customers--Customer--idEmail")) !== true) {
            //return this.getView().byId("__component0---Customers--Customer--idEmail").setValueState("Error");
            return {
              "status": false,
              "error": "InValid EmailId"
            };
          }
          if (Formatter.noSpace(this.getView().byId("__component0---Customers--Customer--idEmail")) !== true) {
            return {
              "status": false,
              "error": "No Space Allowed"
            };
          }
        }

        return {
          "status": true,
          "error": ""
        };
      },

      ValidateDataCreation: function(oSaveData) {

        if (this.CheckEmailExists(oSaveData.EmailId) === true) {
          return {
            "status": false,
            "error": "EmailId already used for supplier"
          };
        }

        return {
          "status": true,
          "error": ""
        };
      },
      saveData: function(oEvent) {
        var that = this;
        var dataModel = this.getView().getModel("dataModel");
        var viewModel = this.getView().getModel("viewModel");
        var customerData = this.getView().getModel("local").getProperty("/Customer");
        //var groupId = this.getView().getModel("local").getProperty("/groupSelected/GroupId");
        var groupId = this.getView().getModel("local").getProperty("/groupSelected");
        //customerData.Groups = groupId;
        if (customerData.CustomerCode !== "") {

          var oSaveData = JSON.parse(JSON.stringify(customerData));

          if (viewModel.oData.blockStatus === false) {
            oSaveData.Status = "B";
          } else {
            oSaveData.Status = "U";
          }
          var result = this.ValidateCustomerData(oSaveData);
          if (result.status === false) {
            MessageBox.error(result.error);
            return;
          }

          var id = this.customerCheck1(oSaveData.CustomerCode);
          if (id) {
            var oFilter = new Filter("RetailerId",
              FilterOperator.EQ, id);
            //  if (changeCheck === 'false') {
            this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/Customers('" + id + "')", "PUT", {},
                oSaveData, this)
              .then(function(oData) {

                that.UpdateLocalModel();
                that.clearScreen();
                that._onRouteMatched();
                MessageToast.show("Data saved successfully");
              }).catch(function(oError) {
                MessageToast.show("Data could not be saved");
              });
            //  }
            if (changeCheck === 'true') {

              var that = this;
              this.updateGroup(oFilter);
              for (var i = 0; i < groupId.length; i++) {

                var status = that.updateGroupDetails(groupId, i, id);
              }
            }
            //change user status
            if (this.onSwitch === true) {

              var changeUserStatus = {
                emailId: oSaveData.EmailId,
                name: oSaveData.Name,
                bStat: viewModel.oData.blockStatus,
                Authorization: this.getModel("local").getProperty("/Authorization")
              };
              this.changeUserStatus(changeUserStatus);
            }

          } else {
            var result = this.ValidateDataCreation(oSaveData);
            if (result.status === false) {
              MessageBox.error(result.error);
              return;
            }
            this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/Customers", "POST", {}, oSaveData, this)
              .then(function(oData) {


                //  that.UpdateLocalModel(oData);
                that.clearScreen();
                /*		var customerId = oData.id;
                		for (var i = 0; i < groupId.length; i++) {

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
        s
        var that = this;
        this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
            "/RetailerGroups", "GET", {
              filters: [oFilter]
            }, {}, this)
          .then(function(oData) {
            //again update all group codes
            for (var i = 0; i < oData.results.length; i++) {
              that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
                  "/RetailerGroups('" + oData.results.id + "')", "DELETE ", {}, {}, that)
                .then(function(oData) {

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

        var that = this;
        var customerData = this.getView().getModel("local").getProperty("/Customer");
        if (customerData.CustomerCode) {
          var id = this.customerCheck(customerData.CustomerCode);
          if (id) {
            this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/Customers('" + id + "')", "DELETE", {}, {}, this)
              .then(function(oData) {


                var groupId = that.getView().getModel("local").getProperty("/groupSelected");
                //again update all group codes
                for (var i = 0; i < groupId.length; i++) {
                  that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
                      "/RetailerGroups('" + groupId.ManuId + "')", "DELETE ", {}, {}, that)
                    .then(function(oData) {

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
      createUserPayload: function(createUserPayload) {


        $.post('/createNewUser', createUserPayload)
          .then(function(data) {

          })
          .fail(function(error) {
            sap.m.MessageBox.error("User Creation failed");
          });
      },
      changeUserStatus: function(changeUserStatus) {


        $.post('/changeUserStatus', changeUserStatus)
          .then(function(data) {

          })
          .fail(function(error) {
            sap.m.MessageBox.error("Changing User Status failed");
          });
      },
      UpdateLocalModel: function(data) {

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
            customerModelInfo[0].City = oCustomer.City;
            customerModelInfo[0].MobilePhone = oCustomer.MobilePhone;
            customerModelInfo[0].EmailId = oCustomer.EmailId;
            customerModelInfo[0].Groups = oCustomer.Groups;
            var group = this.getView().getModel("local").getProperty("/groupSelected");


            if (status === false) {
              customerModelInfo[0].Status = "B";
            } else if (status === true) {
              customerModelInfo[0].Status = "U";
            }
          }
          /*else{
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
