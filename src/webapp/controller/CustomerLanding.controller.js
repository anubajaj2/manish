sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/m/MessageToast",
	"sap/m/Dialog",
	"sap/m/DialogType",
	"sap/m/Button",
	"sap/m/ButtonType",
], function(Controller, MessageToast, Dialog, DialogType, Button, ButtonType) {
	"use strict";

	return Controller.extend("sap.ui.demo.cart.controller.CustomerLanding", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf victoria.view.App
		 */
			onInit: function() {
				this.oRouter = this.getOwnerComponent().getRouter();
				this.oRouter.getRoute("CustomerLanding").attachMatched(this._onRouteMatched, this);
			},
			_onRouteMatched: function() {
				setInterval(function(){sap.ui.getCore().byId("__component0---idCustomerLanding--caro").next()},4000);
			},
			onMen: function(){
				this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
				this.oRouter.navTo("categories");
			}
		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf victoria.view.App
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf victoria.view.App
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf victoria.view.App
		 */
		//	onExit: function() {
		//
		//	}

	});

});
