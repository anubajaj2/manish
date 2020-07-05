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
		onImageOut: function(oEvent){
			oEvent.getSource().setSrc("https://5.imimg.com/data5/RU/WR/MY-8087605/kundan-meena-set-500x500.jpg");
		},
		onImageIn: function(oEvent){
			oEvent.getSource().setSrc("https://img5.cfcdn.club/5e/cb/5ef37886b3ad099ddb939520191ec4cb_350x350.jpg");
		},
		onImageOpen: function(){
			
		},
		onRefresh: function () {
			// trigger search again and hide pullToRefresh when data ready
			var oProductList = this.byId("gridList");
			var bShowSearchResults = false;
			var oBinding = oProductList.getBinding("items");
			var fnHandler = function () {
				//this.byId("pullToRefresh").hide();
				oBinding.detachDataReceived(fnHandler);
			}.bind(this);
			oBinding.attachDataReceived(fnHandler);

			if (oBinding) {
				if (bShowSearchResults) {
					var oFilter = new Filter("Name", FilterOperator.Contains, oSearchField.getValue());
					oBinding.filter([oFilter]);
				} else {
					oBinding.filter([]);
				}
			}
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
