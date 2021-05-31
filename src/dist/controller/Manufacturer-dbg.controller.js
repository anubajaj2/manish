sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/demo/cart/model/formatter",
  "sap/m/MessageBox",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/SelectDialog",
  "sap/ui/export/library",
  "sap/ui/export/Spreadsheet"
], function(BaseController, UIComponent, JSONModel,
  MessageToast, Formatter, MessageBox, Filter, FilterOperator, SelectDialog, exportLibrary, Spreadsheet) {
  "use strict";
  var manufacturerId;
  var changeCheck = 'false';
  var groupID = [];
  var EdmType = exportLibrary.EdmType;
  return BaseController.extend("sap.ui.demo.cart.controller.Manufacturer", {
    formatter: Formatter,
    onInit: function() {
      var oViewDetailModel = new JSONModel({
        "buttonText": "Save",
        "deleteEnabled": false,
        "blockStatus": false
      });
      this.setModel(oViewDetailModel, "viewModel");

      var oRouter = this.getRouter();
      oRouter.getRoute("Manufacturer").attachMatched(this._onRouteMatched, this);
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
      viewModel.setProperty("/PatternStatus", true);
      var odataModel = new JSONModel({
        "groupCodeState": "None",
        "emailState": "None",
        "PatternState": "None"
      });
      this.setModel(odataModel, "dataModel");
      var oModelManufacturer = new JSONModel();
      var oModelGroup = new JSONModel();

      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				"/Manufacturers", "GET", {}, {}, this)
			 .then(function(oData) {
         oModelManufacturer.setData(oData);
         that.getView().setModel(oModelManufacturer, "manufactureModelInfo");
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
      //this.clearScreen();
    },
    onManufacturerSearch: function(oEvent) {
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
      var manufacturerModel = this.getView().getModel("local").getProperty("/Manufacturer");
      var viewModel = this.getView().getModel("viewModel");
      var dataModel = this.getView().getModel("dataModel");
      var group = this.getView().getModel("local").getProperty("/groupSelected");
      group.GroupCode = "";
      group.GroupId = "";
      this.getView().getModel("local").setProperty("/groupSelected", group);
      manufacturerModel.CustomerCode = "";
      manufacturerModel.Name = "";
      manufacturerModel.Address = "";
      manufacturerModel.City = "";
      manufacturerModel.MobilePhone = "";
      manufacturerModel.EmailId = "";
      manufacturerModel.Status = "";
      manufacturerModel.Pattern = "";
      manufacturerModel.Categories = [];
      manufacturerModel.Groups = [];
      viewModel.setProperty("/codeEnabled", true);
      viewModel.setProperty("/buttonText", "Save");
      viewModel.setProperty("/deleteEnabled", false);
      viewModel.setProperty("/blockStatus", false);
      dataModel.setProperty("/groupCodeState", "None");
      dataModel.setProperty("/emailState", "None");
      dataModel.setProperty("/PatternState", "None");

      this.getView().getModel("local").setProperty("/Manufacturer", manufacturerModel);
    },

    CheckEmailExists: function(data) {
      var that = this;
      var manufacturerJson = this.getView().getModel("manufactureModelInfo").getData().results;

      function CheckdataExists(data) {
        return manufacturerJson.filter(
          function(exists) {
            return exists.EmailId === data;
          });
      }
      var Exists = CheckdataExists(data);
      if (Exists.length > 0) {
        return true;
      }
    },
    CheckPatternExists: function(data) {
      var that = this;
      var manufacturerJson = this.getView().getModel("manufactureModelInfo").getData().results;

      function CheckdataExists(data) {
        return manufacturerJson.filter(
          function(exists) {
            return exists.Pattern === data;
          });
      }
      var Exists = CheckdataExists(data);
      if (Exists.length > 0) {
        return true;
      }
    },

    manufacturerCheck1: function(code) {
      var that = this;
      var manufacturerJson = this.getView().getModel("manufactureModelInfo").getData().results;

      function getmanufacturerDetail(code) {
        return manufacturerJson.filter(
          function(data) {
            return (data.CustomerCode === code);
          });
      }
      if (manufacturerJson && manufacturerJson.length > 0) {
        var found = getmanufacturerDetail(code);
        if (found.length > 0) {
          var id = found[0].id;
        } else {
          var id = "";
        }
      }

      return id;

    },
    onManufacturerSelect: function(oEvent) {
      var code = oEvent.getSource().getRows()[oEvent.getSource().getSelectedIndex()].getCells()[0].getText();
      this.manufacturerCheck(code);
    },
    onCustomerFilter: function(oEvent) {
      if (!this.oDialog) {
        var manufacturerInfo = this.getView().getModel("manufactureModelInfo").getProperty("/results");
        var s = new Set();
        manufacturerInfo.forEach((item) => {
          s.add(item.City);
        });
        manufacturerInfo = [];
        s.forEach((item) => {
          manufacturerInfo.push({
            "City": item
          });
        });
        this.getView().getModel("manufactureModelInfo").setProperty("/uniqueCities", manufacturerInfo);
        this.oDialog = new SelectDialog({
          title: "Select Cities",
          multiSelect: true,
          search: this.searchCityFilter.bind(this),
          confirm: this.filterConfirm.bind(this),
          cancel: this.filterCancel.bind(this)
        });
        this.getView().addDependent(this.oDialog);
        this.oDialog.setModel(this.getView().getModel("manufactureModelInfo"));
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
    searchCityFilter: function(oEvent) {
      var search = oEvent.getParameter("value");
      var oFilter = new Filter('City', FilterOperator.Contains, search);
      this.oDialog.getBinding('items').filter([oFilter]);
    },
    filterConfirm: function(oEvent) {
      var selectedItems = oEvent.getParameter("selectedItems");
      var filters = []
      selectedItems.forEach((item) => {
        filters.push(new Filter('City', FilterOperator.Contains, item.getLabel()));
      });
      this.getView().byId('customerTable').getBinding('rows').filter(new Filter({
        filters: filters,
        and: false
      }));
    },
    filterCancel: function() {
      this.getView().byId('customerTable').getBinding('rows').filter([]);
    },
    manufacturerCheck: function(code) {
      var that = this;
      var manufacturerJson = this.getView().getModel("manufactureModelInfo").getData().results;
      debugger;

      function getmanufacturerDetail(code) {
        return manufacturerJson.filter(
          function(data) {
            return (data.CustomerCode === code);
          });
      }
      if (manufacturerJson && manufacturerJson.length > 0) {
        var found = getmanufacturerDetail(code);
        if (found.length > 0) {
          var viewModel = this.getView().getModel("viewModel");
          var status = viewModel.getProperty("/blockStatus");
          var manufacturer = this.getView().getModel("local").getProperty("/Manufacturer");
          manufacturer.CustomerCode = found[0].CustomerCode;
          manufacturer.Address = found[0].Address;
          manufacturer.Name = found[0].Name;
          manufacturer.City = found[0].City;
          manufacturer.MobilePhone = found[0].MobilePhone;
          manufacturer.Groups = found[0].Groups;
          manufacturer.Categories = found[0].Categories;
          manufacturer.EmailId = found[0].EmailId;
          manufacturer.Pattern = found[0].Pattern;
          if (found[0].Status === "B") {
            viewModel.setProperty("/blockStatus", false);
          } else if (found[0].Status === "U") {
            viewModel.setProperty("/blockStatus", true);
          }

          if (found[0].id) {
            var oFilter = new Filter({
              filters: [
                new Filter("ManufacturerId",
                  FilterOperator.EQ, found[0].id)
              ]
            });
            this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/ManuGroups", "GET", oFilter, {}, this)
              .then(function(oData) {
                //that.getView().getModel("local").setProperty("/Manufacturer", oData.results[0]);
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
          //this.getView().getModel("local").setProperty("/Manufacturer", manufacturer);
          viewModel.setProperty("/buttonText", "Update");
          viewModel.setProperty("/deleteEnabled", true);
          viewModel.setProperty("/codeEnabled", false);
          viewModel.setProperty("/emailStatus", false);
          viewModel.setProperty("/PatternStatus", false);
          return found[0].id;
        } else {
          // return false;
        }
      }
    },
    updateGroup: function(oFilter) {
      var that = this;
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/ManuGroups", "GET", oFilter, {}, this)
        .then(function(oData) {
          //again update all group codes
          for (var i = 0; i < oData.results.length; i++) {
            that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
                "/ManuGroups('" + oData.results.id + "')", "DELETE ", {}, {}, that)
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

    ValidateManufacturerData: function(oSaveData) {
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
      if (oSaveData.Pattern && oSaveData.Pattern !== "") {

        oSaveData.Pattern = oSaveData.Pattern.toUpperCase();
        if (Formatter.noSpace(this.getView().byId("idPattern")) !== true) {
          return {
            "status": false,
            "error": "No Space Allowed"
          };
          //return this.getView().byId("idPattern").setValueState("Error");
        }
      }
      if (oSaveData.EmailId && oSaveData.EmailId !== "") {
        oSaveData.EmailId = oSaveData.EmailId.toLowerCase();
        if (Formatter.checkEmail(this.getView().byId("idEmail")) !== true) {
          return {
            "status": false,
            "error": "InValid EmailId"
          };
          //return this.getView().byId("idEmail").setValueState("Error");
        }
        if (Formatter.noSpace(this.getView().byId("idEmail")) !== true) {
          return {
            "status": false,
            "error": "No Space Allowed"
          };
          //this.getView().byId("idEmail").setValueStateText("No Space Allowed");
          //return  this.getView().byId("idEmail").setValueState("Error");
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
      if (this.CheckPatternExists(oSaveData.Pattern) === true) {
        return {
          "status": false,
          "error": "Pattern already used for supplier"
        };
      }
      return {
        "status": true,
        "error": ""
      };
    },

    saveData: function(oEvent) {
      debugger;
      var that = this;

      var dataModel = this.getView().getModel("dataModel");
      var viewModel = this.getView().getModel("viewModel");
      var manufacturerData = this.getView().getModel("local").getProperty("/Manufacturer");
      var groupId = this.getView().getModel("local").getProperty("/groupSelected/GroupId");
      if (manufacturerData.CustomerCode !== "") {

        var oSaveData = JSON.parse(JSON.stringify(manufacturerData));

        if (viewModel.getProperty("/blockStatus") === false) {
          debugger;
          oSaveData.Status = "B";
        } else {
          oSaveData.Status = "U";
        }
        var result = this.ValidateManufacturerData(oSaveData);
        if (result.status === false) {
          MessageBox.error(result.error);
          return;
        }

        var id = this.manufacturerCheck1(oSaveData.CustomerCode);
        if (id) {
          var oFilter = new Filter({
            filters: [
              new Filter("ManufacturerId",
                FilterOperator.EQ, id)
            ]
          });
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/Manufacturers('" + id + "')", "PUT", {},
              oSaveData, this)
            .then(function(oData) {
              that._onRouteMatched();
              MessageToast.show("Data saved successfully");
              that.UpdateLocalModel();
              that.clearScreen();
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
          //change user status
          if (this.onSwitch === true) {
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
          debugger;

          var result = this.ValidateDataCreation(oSaveData);
          if (result.status === false) {
            MessageBox.error(result.error);
            return;
          }

          this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/Manufacturers", "POST", {}, oSaveData, this)
            .then(function(oData) {
              debugger;
              /*    var manufactureId = oData.id;
                  for (var i = 1; i < groupId.length; i++) {
                    debugger;
                    var status = that.updateGroupDetails(groupId, i, manufactureId);
                  } */
              MessageToast.show("Data saved sucessfully");
              that.clearScreen();
              that._onRouteMatched();
            })
            .catch(function(oError) {
              MessageToast.show("Data could not be saved");
              //that._onRouteMatched();
            });
          //Create new user
          debugger;
          var createUserPayload = {
            name: oSaveData.Name,
            emailId: oSaveData.EmailId,
            role: "Maker",
            Authorization: this.getModel("local").getProperty("/Authorization")
          };
          this.createUserPayload(createUserPayload);

        } //id check
      } else {
        var required = this.getView().byId("idCode");
        required.setValueState("Error");
        required.setValueStateText("Please enter a Code!");
      }
    },
    updateGroupDetails: function(groupId, i, manufactureID) {
      var that = this;
      var manuGroup = this.getView().getModel("local").getProperty("/ManuGroup");
      var oModel = this.getView().getModel();
      if (groupId[i] !== "") {
        manuGroup.ManufacturerId = manufactureID;
        manuGroup.GroupId = groupId[i];
        manuGroup.ChangedBy = "";
        manuGroup.ChangedOn = "";
        manuGroup.CreatedBy = "";
        manuGroup.CreatedOn = "";
        // batchArray.push(
        this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
            "/ManuGroups", "POST", {}, manuGroup, this)
          .then(function(oData) {
            manuGroup.ManufacturerId = "";
            manuGroup.GroupId = "";
            manuGroup.ChangedBy = "";
            manuGroup.ChangedOn = "";
            manuGroup.CreatedBy = "";
            manuGroup.CreatedOn = "";
            MessageToast.show("Data saved successfully");
            that.clearScreen();
            //that._onRouteMatched();
          })
          .catch(function(oError) {
            manuGroup.ManufacturerId = "";
            manuGroup.GroupId = "";
            manuGroup.ChangedBy = "";
            manuGroup.ChangedOn = "";
            manuGroup.CreatedBy = "";
            manuGroup.CreatedOn = "";
            // return false;
            // MessageToast.show("Data could not be saved");
          });
        // );
        // return true;
      }
    },
    onSwitch: function(oEvent) {
      var status = oEvent.getParameters("Selected").state;
      return this.onSwitch = true;
    },

    onSelectionChange: function(oEvent) {
      debugger;
      var oSrc = oEvent.getSource();
      var aItems = oSrc.getSelectedItems();
      if (aItems.length > 0) {
        debugger;
        for (var i = 0; i < aItems.length; i++) {

        }
      }
    },
    groupCodeCheck: function(oEvent) {
      debugger;
      var input_source = oEvent.getSource();
      changeCheck = 'true';
    },
    CodeCheck: function(oEvent) {
      debugger;
      var text = oEvent.getParameter("newValue");
      var viewModel = this.getView().getModel("viewModel");
      //  var customerId = this.customerCheck(text);
      var manufactureId = this.manufacturerCheck(text);
      this.getView().byId("idName").focus();
    },
    /*onEnter: function(oEvent){
      debugger;
      var that = this;
      var sValue = this.getView().byId("idCode").getValue().toUpperCase();
      this.getView().byId("idCode").setValue(sValue);
      var Filter1 = new Filter("CustomerCode", "EQ", sValue);
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Manufacturers", "GET", {
          filters: [Filter1]
        }, {}, this)
        .then(function(oData) {
          if (oData.results.length != 0) {
              MessageToast.show("Manufacturer Already Exist");
              that.getView().getModel("local").setProperty("/Manufacturer",oData.results[0]);
        }else{
          MessageToast.show("Create as new Manufacturer");
        }
      });

    },*/
    deleteManufacturer: function(oEvent) {
      debugger;
      var that = this;
      var manufacturerData = this.getView().getModel("local").getProperty("/Manufacturer");
      if (manufacturerData.CustomerCode) {
        var id = this.manufacturerCheck(manufacturerData.CustomerCode);
        if (id) {
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/Manufacturers('" + id + "')", "DELETE", {}, {}, this)
            .then(function(oData) {
              debugger;
              var groupId = that.getView().getModel("local").getProperty("/groupSelected");
              //again update all group codes
              for (var i = 0; i < groupId.length; i++) {
                that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
                    "/ManuGroups('" + groupId.ManuId + "')", "DELETE ", {}, {}, that)
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
    onNameEnt: function(oEvent) {
      this.getView().byId("idName").setValue(oEvent.getParameter("value").toUpperCase());
      this.getView().byId("idAddress").focus();
    },
    onAddrEnt: function(oEvent) {
      this.getView().byId("idCity").focus();
    },
    onCityEnt: function(oEvent) {
      this.getView().byId("idContact").focus();
    },
    onContEnt: function(oEvent) {
      this.getView().byId("idgpCode").focus();
    },
    onPatternEnt: function(oEvent) {
      this.getView().byId("idBlock").focus();
    },
    onEmailEnt: function(oEvent) {
      this.getView().byId("idPattern").focus();
    },
    onSelectionFinish: function() {
      debugger;
      this.getView().byId("idCatCode").focus();
    },
    onSelectionFinish1: function() {
      debugger;
      this.getView().byId("idEmail").focus();
    },
    createUserPayload: function(createUserPayload) {
      debugger;

      $.post('/createNewUser', createUserPayload)
        .then(function(data) {
          debugger;
        })
        .fail(function(error) {
          sap.m.MessageBox.error("User Creation failed");
        });
    },
    changeUserStatus: function(changeUserStatus) {
      debugger;

      $.post('/changeUserStatus', changeUserStatus)
        .then(function(data) {
          debugger;
        })
        .fail(function(error) {
          sap.m.MessageBox.error("Changing User Status failed");
        });
    },
    UpdateLocalModel: function(data) {
      var that = this;
      var code = this.getView().byId("idCode").getValue();
      var manufactureJson = this.getView().getModel("manufactureModelInfo").getData().results;

      function getmanufactureDetail(code) {
        return manufactureJson.filter(
          function(data) {
            return (data.CustomerCode === code);
          });
      }
      if (manufactureJson && manufactureJson.length > 0) {
        var manufactureModelInfo = getmanufactureDetail(code);
        if (manufactureModelInfo.length > 0) {
          var viewModel = this.getView().getModel("viewModel");
          var status = viewModel.getProperty("/blockStatus");
          var omanufacture = this.getView().getModel("local").getProperty("/Manufacturer");

          manufactureModelInfo[0].CustomerCode = omanufacture.CustomerCode;
          manufactureModelInfo[0].Address = omanufacture.Address;
          manufactureModelInfo[0].Name = omanufacture.Name;
          manufactureModelInfo[0].City = omanufacture.City;
          manufactureModelInfo[0].MobilePhone = omanufacture.MobilePhone;
          manufactureModelInfo[0].EmailId = omanufacture.EmailId;
          manufactureModelInfo[0].Groups = omanufacture.Groups;
          manufactureModelInfo[0].Categories = omanufacture.Categories;
          manufactureModelInfo[0].Pattern = omanufacture.Pattern;
          var group = this.getView().getModel("local").getProperty("/groupSelected");

          if (status === false) {
            manufactureModelInfo[0].Status = "B";
          } else if (status === true) {
            manufactureModelInfo[0].Status = "U";
          }
        }
      }
    }
  });
});
