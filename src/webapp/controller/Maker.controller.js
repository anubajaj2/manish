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

    onTabSelect1: function(oEvent) {
      debugger;
    var sKey = oEvent.getParameter("selectedItem").getProperty("key");
    this.getOwnerComponent().getModel("local").setProperty("/sKeyType", sKey);

  },
  onAddExcelData:function(){
    debugger;
    var that=this;
    	if (this.fixedDialog === undefined) {
				this.fixedDialog = new Dialog({
					title: "Choose XSLX File For Upload",
					width: "60%",
					beginButton: new sap.m.Button({
						text: "Close",
						press: function(oEvent) {
							that.fixedDialog.close();
						}
					}),
					content: [
						new FileUploader("excelUploader", {
							fileType: "XLSX,xlsx",
							change: [this.onUpload, this],
							class: "sapUiLargeMargin"
						})
					]
				});
				this.getView().addDependent(this.fixedDialog);
        	}
			this.fixedDialog.open();
  },
  onUpload: function(e) {
			this._import(e.getParameter("files") && e.getParameter("files")[0]);
		},
    		_import: function(file) {
			var that = this;
			var excelData = {};
			if (file && window.FileReader) {
				var reader = new FileReader();
				reader.onload = function(e) {
					var data = e.target.result;
					var workbook = XLSX.read(data, {
						type: 'binary'
					});
					workbook.SheetNames.forEach(function(sheetName) {
						// Here is your object for every sheet in workbook
						excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);

					});
					var excelD = [];
					debugger;
					for (var i = 0; i < excelData.length; i++) {

						excelD.push({
							TagNo: excelData[i]["TAG NO"],
							GWt: excelData[i]["G WT"],
							Amount: excelData[i]["Amount"],
							PCS: excelData[i]["PCS"],
							Size: excelData[i]["Size"],
							Remark: excelData[i]["Remark"]
						});

					}
					debugger;
					// Setting the data to the local model

					that.getView().getModel("dataModel").setProperty("/PurchaseLite",excelD);
          that.getView().getModel("dataModel").setProperty("/title",excelD.length);
				};
				reader.onerror = function(ex) {
					console.log(ex);
				};
				reader.readAsBinaryString(file);
				this.fixedDialog.close();
			}
		}


  });
});
