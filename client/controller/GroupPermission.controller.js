sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function(BaseController, UIComponent, MessageToast, JSONModel) {
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
					//this.getModel("local").setProperty("/CurrentUser")
          //this.getView().getId("Title1").setTitle("Group01")
					this.getRouter().navTo("GroupPermission01");

			}
	});
});
