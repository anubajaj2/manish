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
  "sap/ui/export/Spreadsheet",
	"sap/ui/core/Fragment",
  "sap/m/Dialog",
	"sap/ui/unified/FileUploader",
], function(BaseController, UIComponent, JSONModel,
  MessageToast, Formatter, MessageBox, Filter, FilterOperator, SelectDialog, exportLibrary, Spreadsheet,Fragment, Dialog, FileUploader) {
  "use strict";
  var manufacturerId;
  var changeCheck = 'false';
  var groupID = [];
  var EdmType = exportLibrary.EdmType;
  return BaseController.extend("sap.ui.demo.cart.controller.Maker", {
    formatter: Formatter,
    onInit: function() {
      var oViewDetailModel = new JSONModel({
        "buttonText": "Save",
        "deleteEnabled": false,
        "blockStatus": false
      });
      this.setModel(oViewDetailModel, "viewModel");

      var oRouter = this.getRouter();
      oRouter.getRoute("Maker").attachMatched(this._onRouteMatched, this);
    },
    _onRouteMatched: function(oEvent) {
      debugger;
      var that = this;
      var auth=this.getView().getModel("local").getProperty("/Authorization");
			if(!auth){
				this.logOutApp();
			}
      this.loadCategories(this.getView().getModel("local").getProperty("/ManufacturerData/Categories"));
      this.getView().setBusy(true);
      this.getView().getModel("local").setProperty("/sKeyType", 'PURCHASESLITE');
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
      var oCategoies=new JSONModel();

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
       "/Categories", "GET", {}, {}, this)
      .then(function(oData) {
        oCategoies.setData(oData);
        that.getView().setModel(oCategoies, "categories");
        // that.getView().setBusy(false);
      }).catch(function(oError) {
        // that.getView().setBusy(false);
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

    onTabSelect1: function(oEvent) {
      debugger;
    var sKey = oEvent.getParameter("selectedItem").getProperty("key");
    this.getOwnerComponent().getModel("local").setProperty("/sKeyType", sKey);

  },
  onMasterSave: function () {
    debugger;

    // return;
    var oPurchaseView=sap.ui.getCore().byId("__component0---idMaker--PurchaseLiteBlock-Collapsed");
    var payload = oPurchaseView.getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
    if (!payload) {
      MessageToast.show("Please enter a data");
      return;
    }
    sap.ui.core.BusyIndicator.show();
    oPurchaseView.getModel("PurchaseLiteModel").setProperty("/visible", false);
    var CreatedBy = this.getView().getModel("local").getProperty("/CurrentUser");
    var oFilter1 = new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, "'" + CreatedBy + "'");
    var that = this;
    // that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
    //   "/Products/$count", "GET", {
    //   filters: [oFilter1]
    // }, {}, that)
    $.get("/getpattern?Createdby="+CreatedBy)
      .then(function (count) {
        debugger;
        count = parseInt(count) + 1;
        var pattern = that.getView().getModel("local").getProperty("/ManufacturerData/Pattern");
        var batch_Id = that.create_UUID();
        // var Product = [];
        // var ProdWeight = [];
        // var Photo = [];
        var payload = oPurchaseView.getModel("PurchaseLiteModel").getProperty("/PurchaseLite");

        for (var i = 0; i < payload.length; i++) {
          payload[i].ItemCode = pattern + "_" + count.toString();
          payload[i].BatchId = batch_Id;
          payload[i].CreatedBy = that.getView().getModel("local").getProperty("/CurrentUser");
          count = parseInt(count) + 1;
          // var pdt={
          // 	"ProductId":payload[i].ItemCode,
          // 	"TagNo":payload[i].TagNo,
          // 	"Name":payload[i].Remark,
          // 	"Category":"HardCode",
          // 	"Tunch":0,
          // 	"Wastage":0,
          // 	"GrossWeight":0,
          // 	"AlertQuantity":0,
          // 	"BatchId":batch_Id
          // };
          // Product.push(pdt);
          // var wgt={
          // 	"ProductId":"",
          // 	"Amount":payload[i].Amount,
          // 	"GrossWeight":payload[i].GWt,
          // 	"PairSize":payload[i].Size,
          // 	"Remarks":payload[i].Remark,
          // 	"Piece":payload[i].PCS
          // };
          // ProdWeight.push(wgt);
          // if(payload[i].Photo.length>0){
          // 	var seq=0;
          // 	for(var j=0;j<payload[i].Photo.length;j++){
          // 		var pht={
          // 			"Product":"",
          // 			"FileName":payload[i].Photo[j].Name,
          // 			"Stream":payload[i].Photo[j].Stream,
          // 			"Content":payload[i].Photo[j].Content,
          // 			"SeqNo":seq
          // 		};
          // 		seq=seq+1;
          // 		Photo.push(pht);
          // 	}
          // }

        }
        var that2 = that;

        // var SData={
        // 	"Product":Product,
        // 	"ProdWeight":ProdWeight,
        // 	"Photo":Photo
        // };
        $.post('/PurchaseLiteSave', {
          "allData": payload,
        })
          .done(function (data, status) {
            debugger;
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("data has been saved successfully");
            that2.getView().byId("PurchaseLiteTable").getBinding("rows").refresh();
          })
          .fail(function (xhr, status, error) {
            sap.ui.core.BusyIndicator.hide();
            MessageBox.error(error);
            debugger;
          });
        // that.getView().byId("idName").setValue(that.pattern + "_" + count.toString());
      });


  },
  create_UUID: function () {
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
  }
  


  });
});
