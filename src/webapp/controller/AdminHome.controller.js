sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast"
], function(BaseController, UIComponent,MessageToast) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.AdminHome", {
		onInit: function () {
			this.oRouter = UIComponent.getRouterFor(this);
			this.oRouter.getRoute("AdminHome").attachMatched(this._onRouteMatched, this);

		},
		_onRouteMatched: function(oEvent) {
			var that = this;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				"/Manufacturers", "GET", {}, {}, this)
			 .then(function(oData) {
				 that.getOwnerComponent().getModel("local").setProperty("/ManufacturersInfos",oData.results);
			 }).catch(function(oError) {
				 MessageToast.show("cannot fetch the data");
			 });

			 this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					 "/Customers", "GET", {}, {}, this)
				 .then(function(oData) {
					 that.getOwnerComponent().getModel("local").setProperty("/CustomersInfos",oData.results);
				 }).catch(function(oError) {
					 MessageToast.show("cannot fetch the data");
				 });

				 this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
	 			 "/Groups", "GET", {}, {}, this)
	 				.then(function(oData) {
	 				that.getOwnerComponent().getModel("local").setProperty("/GroupsInfos",oData.results);
	 				}).catch(function(oError) {
	 						MessageToast.show("cannot fetch the data");
	 				});
		},
		onSelectItem: function(oEvent){debugger;
			var oListItem = oEvent.getParameter("listItem");
			var sPath = oListItem.getBindingContextPath();
			var viewId = oListItem.getId().split("--")[oListItem.getId().split("--").length - 1];
			this.oRouter.navTo(viewId);
		},
	});
});
