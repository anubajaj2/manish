sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent"
], function(BaseController, UIComponent) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.OrderItems", {
		onInit: function () {
			this._router = UIComponent.getRouterFor(this);
      this._router.getRoute("OrderItems").attachMatched(this.herculis, this);
		},

    herculis: function(oEvent){
      debugger;
      this.loadOrderItems();
      // this.getModel("local").setProperty("/layout", LayoutType.TwoColumnsMidExpanded);
      this.firstTwoDisplay();
			// var sScooby = oEvent.getParameters().arguments.id;
      //
		},

    loadOrderItems: function(){
      debugger;
        var that = this;
        this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/OrderItems", "GET", {}, {}, this)
              .then(function(oData) {
        that.getOwnerComponent().getModel("local").setProperty("/list",{
        OrderItems:oData.results
        });

        })
        .catch(function(oError) {
            MessageToast.show("cannot fetch the data");
         });
      },
      onBack:function(){
        this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        this.oRouter.navTo("OrderStatus");
      }
	});
});
