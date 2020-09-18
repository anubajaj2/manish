sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/demo/cart/model/formatter",
  "sap/ui/Device",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageToast",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Fragment",
  "sap/m/Image",
  "sap/m/Dialog",
  "sap/m/Carousel",
  "sap/m/Button",
  "sap/m/MessageBox",
  "sap/m/SelectDialog"
], function(
  BaseController,
  formatter,
  Device,
  Filter,
  FilterOperator,
  MessageToast,
  JSONModel,
  Fragment,
  Image, Dialog, Carousel, Button, MessageBox, SelectDialog) {
  "use strict";

  return BaseController.extend("sap.ui.demo.cart.controller.CustomerOrders", {
    formatter: formatter,
    onInit: function() {
      debugger;
      this._oRouter = this.getOwnerComponent().getRouter();
      //this._oRouter.getRoute("CustomerOrders").attachMatched(this._onRouteMatched, this);
      this._oRouter.getRoute("orders").attachMatched(this._onRouteMatched, this);
    },
    _onRouteMatched: function(oEvent) {

    },
    /**
     * Always navigates back to category overview
     * @override
     */
    onBack: function() {
      this.getRouter().navTo("categories");
    }
  });
});
