sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent"
], function(BaseController, UIComponent) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.AdminHome", {
		onInit: function () {
			this.oRouter = UIComponent.getRouterFor(this);
		},
		onSelectItem: function(oEvent){
			var oListItem = oEvent.getParameter("listItem");
			var sPath = oListItem.getBindingContextPath();
			var viewId = oListItem.getId().split("--")[oListItem.getId().split("--").length - 1];
			this.oRouter.navTo(viewId);
		},
	});
});
