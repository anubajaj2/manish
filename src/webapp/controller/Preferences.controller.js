sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/f/LayoutType"
], function(BaseController, UIComponent, LayoutType) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Preferences", {
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("Preferences").attachMatched(this._onRouteMatched, this);

		},
		_onRouteMatched: function(oEvent) {
				this.loadPreferences();
			//	this.getModel("local").setProperty("/layout", LayoutType.TwoColumnsMidExpanded);
				this.firstTwoDisplay();
			},

			loadPreferences: function(){
				debugger;
					var that = this;
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
								"/Groups", "GET", {}, {}, this)
								.then(function(oData) {
					that.getOwnerComponent().getModel("local").setProperty("/list",{
					Preferences:oData.results
					});

					})
					.catch(function(oError) {
							MessageToast.show("cannot fetch the data");
					 });
				}
	});
});
