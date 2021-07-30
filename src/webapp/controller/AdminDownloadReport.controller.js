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
  return BaseController.extend("sap.ui.demo.cart.controller.AdminDownloadReport", {
    formatter: Formatter,
    onInit: function() {
      var oViewDetailModel = new JSONModel({
        "buttonText": "Save",
        "deleteEnabled": false,
        "blockStatus": false
      });
      this.setModel(oViewDetailModel, "viewModel");

      var oRouter = this.getRouter();
      oRouter.getRoute("AdminDownloadReport").attachMatched(this._onRouteMatched, this);
    },
    _onRouteMatched: function(oEvent) {
      debugger;

      var that = this;
      this.getView().getModel("local").getProperty("/Manufacturer/CustomerCode")
      this.getView().setBusy(true);
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
        "/OrderItems", "GET", {}, {}, this)
       .then(function(oData) {
         that.getView().setBusy(false);
        // MessageToast.show("OrderItems");
             }).catch(function(oError) {
          that.getView().setBusy(false);
         MessageToast.show("cannot fetch the data");
       });

       this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
        "/OrderHeaders", "GET", {}, {}, this)
       .then(function(oData) {
         that.getView().setBusy(false);
        // MessageToast.show("OrderItems");
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


    allManufacturers:function(){
      debugger;
      // var CreatedBy = this.getView().getModel("local").getProperty("/CurrentUser");
        window.open("/adminReportDownload?allManufacturers");
      },



    reportDownload:function(oEvent){
      var key1 = oEvent.getSource().getSelectedKey();
      var userName = oEvent.getSource().getSelectedItem().getText();

     $.ajax({
       type: 'GET', // added,
       url: 'adminReportDownloadbyManufacturer?CreatedBy=' + key1,
       success: function(data) {
        if(data.length === 0 || data.length === '0' || data === undefined || data === "" || data === " " || data === "Error"){
           sap.m.MessageBox.error("There is no data for this Maker " + userName);
        }

         else {
           window.open("/adminReportDownloadbyManufacturer?CreatedBy=" + key1);
                sap.m.MessageToast.show("Report Download successfully for " + userName);
         }

       },
       error: function(xhr, status, error) {
         sap.m.MessageToast.show("error in fetching data");
       }
     });

   },

   allRetailers:function(){
     debugger;
     // var CreatedBy = this.getView().getModel("local").getProperty("/CurrentUser");
       window.open("/AllRetailerReportDownload?allRetailers");
     },

     reportRetailerDownload:function(oEvent){
       debugger;
       var key1 = oEvent.getSource().getSelectedKey();
       var userName = oEvent.getSource().getSelectedItem().getText();

      $.ajax({
        type: 'GET', // added,
        url: 'AllRetailerCreatedDownload?CreatedBy=' + key1,
        success: function(data) {
         if(data.length === 0 || data.length === '0' || data === undefined || data === "" || data === " " || data === "Error"){
            sap.m.MessageBox.error("There is no data for this Retailer " + userName);
         }

          else {
            window.open("/AllRetailerCreatedDownload?CreatedBy=" + key1);
                 sap.m.MessageToast.show("Report Download successfully for " + userName);
          }

        },
        error: function(xhr, status, error) {
          sap.m.MessageToast.show("error in fetching data");
        }
      });

    }


  });
});
