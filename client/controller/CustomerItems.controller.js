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
			// this.getOwnerComponent().getRouter().getRoute("orders").attachMatched(this._onRouteMatched, this);
			// this.loadCategories();
			// setTimeout(this._initLoad.bind(this),1000);
		},
		// _initLoad: function(){
		// 	var oPage = this.getView().byId("myPage");
		// 	var allBtn = this.getOwnerComponent().getModel("local").getProperty("/cat/category");
		// 	for (var i = 0; i < allBtn.length; i++) {
		// 		var text = allBtn[i].Category;
		// 		oPage.addContent(new sap.m.ToggleButton({
		// 			text: text
		//
		// 		}).addStyleClass('class','sapUiResponsiveMargin sapUiLargeMargin sapUiLargePadding'));
		// 	}
		// },
		_onRouteMatched: function (oEvent) {
			//this.firstTwoDisplay();
		}
	});
});
