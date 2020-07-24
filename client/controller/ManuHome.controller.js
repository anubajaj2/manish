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

	return BaseController.extend("sap.ui.demo.cart.controller.ManuHome", {
		formatter: formatter,
		onInit : function () {
			this._oRouter = this.getOwnerComponent().getRouter();
			this._oRouter.attachRoutePatternMatched(this._routePatternMatched,this);
		},
		 _routePatternMatched : function(){
			var that = this;
			this._oLocalModel = this.getOwnerComponent().getModel("local");
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
		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		onSelectItem: function(oEvent){
			var oListItem = oEvent.getParameter("listItem");
			var sPath = oListItem.getBindingContextPath();
			var viewId = oListItem.getId().split("--")[oListItem.getId().split("--").length - 1];
			this._oRouter.navTo(viewId);
		},
		_bindView : function (sObjectPath) {
			
		},
		_onBindingChange : function () {

		}
	});
});
