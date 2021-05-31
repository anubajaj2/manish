sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/f/LayoutType"
], function(BaseController, UIComponent, JSONModel, LayoutType) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Preferences", {
		onInit: function () {
			var oViewDetailModel = new JSONModel({
        "editEnabled": false,
      });
      this.setModel(oViewDetailModel, "viewModel");
			this.getOwnerComponent().getModel('local').setProperty('/invoice',{"gst" : "18",
			"includeGST" : false,
			"footerText" : "Thank you for shoping with us"});
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("Preferences").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched: function(oEvent) {
				this.loadPreferences();
			//	this.getModel("local").setProperty("/layout", LayoutType.TwoColumnsMidExpanded);
				this.firstTwoDisplay();
			},

			loadPreferences: function(){
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
				},
				onEditInvoiceSettings : function(oEvent){
					this.getView().getModel("viewModel").setProperty("/editEnabled",true);
				},
				onSaveInvoiceSettings : function(oEvent){
					this.getView().getModel("viewModel").setProperty("/editEnabled",false);
				}
	});
});
