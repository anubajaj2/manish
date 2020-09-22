sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/f/LayoutType",
	"sap/m/MessageToast"
], function(BaseController, UIComponent,JSONModel, LayoutType, MessageToast) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.AdminPanel", {
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("AdminPanel").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function(oEvent) {
				var that = this;
				this.getModel("local").setProperty("/layout", LayoutType.TwoColumnsMidExpanded);
				this.firstTwoDisplay();
				var oModelManufacturer = new JSONModel();
				var oModelCustomer = new JSONModel();

				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/Manufacturers", "GET", {}, {}, this)
				 .then(function(oData) {
					oModelManufacturer.setData(oData);
	 	      that.getView().setModel(oModelManufacturer, "manufactureModelInfo");
				 }).catch(function(oError) {
					 MessageToast.show("cannot fetch the data");
				 });
				 
				 this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						 "/Customers", "GET", {}, {}, this)
					 .then(function(oData) {
						 oModelCustomer.setData(oData);
						 that.getView().setModel(oModelCustomer, "customerModelInfo");
					 }).catch(function(oError) {
						 MessageToast.show("cannot fetch the data");
					 });
			},
			userStatusUpdate : function(caller,id,status){
					// var oFilter = new sap.ui.model.Filter("id","EQ", "'" + key + "'")
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					                          caller+"('"+ id + "')",
					                          "PUT", {}, {Status : status}, this)
					.then(function(oData) {
						MessageToast.show("Success");
					}).catch(function(oError) {
						MessageToast.show("Error");
					});
			},
			onBlockSwitch: function(oEvent) {
				var sPath = oEvent.getSource().getParent().getBindingContextPath()+"/id";
				var id = this.getView().getModel('customerModelInfo').getProperty(sPath);
	      var status = (oEvent.getParameters("Selected").state ? "U":"B");
				this.userStatusUpdate("/Customers",id,status);
	    },
			onBlockSwitch2: function(oEvent) {
				var sPath = oEvent.getSource().getParent().getBindingContextPath()+"/id";
				var id = this.getView().getModel('manufactureModelInfo').getProperty(sPath);
				debugger;
				var status = (oEvent.getParameters("Selected").state ? "U":"B");
				this.userStatusUpdate("/Manufacturers",id,status);
			}
			// loadAdminPanel: function(){
			// 		var that = this;
			// 		this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			// 					"/Groups", "GET", {}, {}, this)
			// 					.then(function(oData) {
			// 		that.getOwnerComponent().getModel("local").setProperty("/list",{
			// 		AdminPanel:oData.results
			// 		});
			//
			// 		})
			// 		.catch(function(oError) {
			// 				MessageToast.show("cannot fetch the data");
			// 		 });
			// 	}
	});
});
