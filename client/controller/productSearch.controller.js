sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/demo/cart/model/formatter",
	"sap/ui/Device",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment"
], function (
	BaseController,
	formatter,
	Device,
	Filter,
	FilterOperator,
	MessageToast,
	JSONModel,
	Fragment) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.productSearch", {
		formatter : formatter,
		onInit: function () {
			this._oRouter = this.getOwnerComponent().getRouter();
			this._oRouter.getRoute("productSearch").attachMatched(this._onRouteMatched, this);

		},
		_onRouteMatched: function() {
			//alert("yo");
			debugger;
		},
		/**
		 * Always navigates back to category overview
		 * @override
		 */
		onBack: function () {
			debugger;
			this.getRouter().navTo("categories");
		}
	});
});
