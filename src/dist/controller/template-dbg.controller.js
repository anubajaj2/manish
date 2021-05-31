sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/routing/History",
	"sap/ui/demo/cart/model/formatter",
	"sap/m/MessageToast",
	"sap/ui/model/Filter"
], function(BaseController, UIComponent, JSONModel,
						History,
						formatter,
						MessageToast,
						Filter) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.template", {
		formatter: formatter,
		onInit : function () {
			var oRouter = this.getRouter();
			oRouter.getRouter().attachMatched(this._onRouteMatched, this);
		},
		 _onRouteMatched : function(){
			var that = this;
			this._oLocalModel = this.getOwnerComponent().getModel("local");
			this.firstTwoDisplay();
		 },
		 _odataExampleCall: function() {
			 this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
 			 "/YOURENTITYNAME", "GET", {}, {}, this)
 				.then(function(data) {
 					that._oLocalModel.setProperty("/globalProperty",data.results);
 				}).catch(function(oError) {
 						MessageToast.show("cannot fetch the data");
 				});
		 },
		_onObjectMatched : function (oEvent) {

		},
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		_bindView : function (sObjectPath) {

		},
		_onBindingChange : function () {

		}
	});
});
