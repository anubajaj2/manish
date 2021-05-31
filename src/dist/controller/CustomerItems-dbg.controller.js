sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/demo/cart/model/cart",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/demo/cart/model/formatter",
	"sap/ui/model/FilterOperator"
], function (BaseController, cart, JSONModel, Filter, formatter, FilterOperator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.CustomerItems", {
		formatter: formatter,

		onInit: function () {
			this._oRouter = this.getOwnerComponent().getRouter();
			this.getOwnerComponent().getRouter().getRoute("orders").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function (oEvent) {
			//this.firstTwoDisplay();
		},
		restartOrder: function() {
			this.cleanApp();
			this._oRouter.navTo("categories");
		},
		closeApp: function() {
			window.close();
		},
		onNavButtonPress	: function() {
      this._oRouter .navTo("categories");
    }
	});
});
