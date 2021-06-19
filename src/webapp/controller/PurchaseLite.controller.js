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
			var odataModel = new JSONModel({
        "groupCodeState": "None",
        "emailState": "None",
        "PatternState": "None"
      });
      this.setModel(odataModel, "PurchaseLiteModel");
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
							ItemCode:"***",
							TagNo: excelData[i]["TAG NO"],
							GWt: excelData[i]["G WT"],
							Amount: excelData[i]["Amount"],
							PCS: excelData[i]["PCS"],
							Size: excelData[i]["Size"],
							Remark: excelData[i]["Remark"],
							Photo:""
						});

					}
					debugger;
					// Setting the data to the local model

					that.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite",excelD);
          that.getView().getModel("PurchaseLiteModel").setProperty("/title",excelD.length);
				};
				reader.onerror = function(ex) {
					console.log(ex);
				};
				reader.readAsBinaryString(file);
				this.fixedDialog.close();
			}
		},
		onAdd:function(){
			debugger;
			var oNew ={
						ItemCode:"***",
						TagNo: "",
						GWt: "",
						Amount: "",
						PCS: "",
						Size: "",
						Remark: "",
						Photo:""
					};
			this.getView().getModel("PurchaseLiteModel").setProperty("/entry",oNew);
			var that=this;
			if(!this.oAddProduct){
			Fragment.load({
					id: "idAddProduct",
					name: "sap.ui.demo.cart.fragments.PurchaseStyleCURD",
					controller: this
				}).then(function(oPopup) {
					that.oAddProduct = oPopup;
					that.getView().addDependent(oPopup);
					oPopup.setTitle("ADD");	
					oPopup.open();
				});
			}
			else{
				this.oAddProduct.open();
			}
		},
		onEdit:function(oEvent){
			debugger;
			var that=this;
			var sPath=oEvent.getSource().getParent().getParent().getRowBindingContext().getPath();
			var value=this.getView().getModel("PurchaseLiteModel").getProperty(sPath);
			this.getView().getModel("PurchaseLiteModel").setProperty("/entry",value);
			if(!this.oEditProduct){
			Fragment.load({
					id: "idEditProduct",
					name: "sap.ui.demo.cart.fragments.PurchaseStyleCURD",
					controller: this
				}).then(function(oPopup) {
					that.oEditProduct = oPopup;
					that.getView().addDependent(oPopup);
					oPopup.setTitle("ADD");	
					oPopup.open();
				});
			}
			else{
				this.oEditProduct.open();
			}
		},
		onCopy:function(oEvent){
			debugger;
			var that=this;
			var sPath=oEvent.getSource().getParent().getParent().getRowBindingContext().getPath();
			var value=this.getView().getModel("PurchaseLiteModel").getProperty(sPath);
			this.getView().getModel("PurchaseLiteModel").setProperty("/entry",value);
			if(!this.oCopyProduct){
			Fragment.load({
					id: "idCopyProduct",
					name: "sap.ui.demo.cart.fragments.PurchaseStyleCURD",
					controller: this
				}).then(function(oPopup) {
					that.oCopyProduct = oPopup;
					that.getView().addDependent(oPopup);
					oPopup.setTitle("ADD");	
					oPopup.open();
				});
			}
			else{
				this.oCopyProduct.open();
			}
		},
		onPressHandleSecureCancelPopup:function(oEvent){
			debugger;
			oEvent.getSource().getParent().close();
			// this.oAddProduct.close();
		},
		onPressHandleSecureOkPopup:function(oEvent){
			var sId=oEvent.getSource().getParent().getId().split("--")[0];
			if(sId==="idAddProduct"){
				debugger;
				MessageToast.show("Under Construction...");

			}
			else if(sId==="idEditProduct"){
				debugger;
				MessageToast.show("Under Construction...");
			}
			else if(sId==="idCopyProduct"){
				debugger;
				MessageToast.show("Under Construction...");
			}
			// this.oAddProduct.close();
			oEvent.getSource().getParent().close();
		},
		onPressTemplateDownload:function(){
			debugger;
			var aCols, aMessages, oSettings;
			// if (Array.isArray(exportData) && exportData.length) {
				aCols = this._createExcelColumns();
				var reportExcel = [];
				for(var i=1;i<51;i++){
					reportExcel.push({
						ItemCode:"***",
						TagNo: "T-"+i,
						GWt: i*10,
						Amount: (i*10)+(i*5),
						PCS: i,
						Size: i,
						Remark: i,
						Photo:""
					});
				}
				// reportExcel.push("TEMPLATE");
				oSettings = {
					workbook: {
						columns: aCols
					},
					dataSource: reportExcel
				};
				new Spreadsheet(oSettings)
					.build()
					.then(function() {
						MessageToast.show("Spreadsheet export has finished");
					});
			// }
		},
		_createExcelColumns:function(){
			return [
				// {
				// 	label: 'Action',
				// 	property: 'Action',
				// 	width: '25'
				// }, 
				{
					label: 'TAG NO',
					property: 'TagNo'

				}, {
					label: 'G WT',
					property: 'GWt'
				}, {
					label: 'Amount',
					property: 'Amount'
				}, {
					label: 'PCS',
					property: 'PCS'

				}, {
					label: 'Size',
					property: 'Size'
				}, {
					label: 'Remark',
					property: 'Remark'
				}
			];
		}
	});
});
