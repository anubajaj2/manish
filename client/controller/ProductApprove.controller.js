sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function(BaseController, UIComponent, MessageToast, JSONModel) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.ProductApprove", {

		//onInit: function () {
			//this._router = UIComponent.getRouterFor(this);
		//},
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("ProductApprove").attachMatched(this._onRouteMatched, this);

		},
		_onRouteMatched: function(oEvent) {
				this.loadProductApprovals();
			},

			loadProductApprovals: function(){
				debugger;
					var that = this;
					var oFilter = new sap.ui.model.Filter("Status","EQ", "P");
					this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			          "/Products", "GET", {filters: [oFilter]}, {}, this)
				        .then(function(oData) {
					that.getOwnerComponent().getModel("local").setProperty("/list",{
					Products:oData.results
					});

		      })
		      .catch(function(oError) {
		          MessageToast.show("cannot fetch the data");
		       });
				}

	});
});
