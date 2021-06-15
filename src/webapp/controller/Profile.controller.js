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
  return BaseController.extend("sap.ui.demo.cart.controller.Profile", {
    formatter: Formatter,
    onInit: function() {
      debugger;
      var oViewDetailModel = new JSONModel({
        "buttonText": "Save",
        "deleteEnabled": false,
        "blockStatus": false
      });
      this.setModel(oViewDetailModel, "viewModel");

      var oRouter = this.getRouter();
      oRouter.getRoute("Profile").attachMatched(this._onRouteMatched, this);
    },
    _onRouteMatched: function(oEvent) {
      debugger
      var that = this;
      var oModelCustomer = new JSONModel();
      var oModelManufacturer = new JSONModel();
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


  });
});
