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

	return BaseController.extend("sap.ui.demo.cart.controller.PurchaseLite", {
		onInit: function () {
			this._router = UIComponent.getRouterFor(this);
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
