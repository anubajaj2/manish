sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent"
], function(BaseController, UIComponent) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.MyItemsApproval", {
		onInit: function () {
			this._router = UIComponent.getRouterFor(this);
		}
	});
});