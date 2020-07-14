sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/f/LayoutType"
], function(BaseController, UIComponent, MessageToast, JSONModel, LayoutType) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.GroupPermission", {
		//onInit: function () {
			//this._router = UIComponent.getRouterFor(this);
		//},
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("GroupPermission").attachMatched(this._onRouteMatched, this);

		},
		_onRouteMatched: function(oEvent) {
				this.loadGroupPermissions();
				this.getModel("local").setProperty("/layout", LayoutType.TwoColumnsMidExpanded);
				this.firstTwoDisplay();
			},

			loadGroupPermissions: function(){
				debugger;
					var that = this;
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
								"/Groups", "GET", {}, {}, this)
								.then(function(oData) {
					that.getOwnerComponent().getModel("local").setProperty("/list",{
					Groups:oData.results
					});

					})
					.catch(function(oError) {
							MessageToast.show("cannot fetch the data");
					 });
				},
				onSelectItem: function(oEvent){
					debugger;
					var oListItem = oEvent.getParameter("listItem");
					this.getRouter().navTo("GroupPermission01",{
						id: oListItem.getTitle()
					});
					this.getOwnerComponent().getModel("local").setProperty("/list",{
				 	Title:oListItem.getTitle()
				 	});
			}
	});
});
