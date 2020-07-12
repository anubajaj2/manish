sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel",
	"sap/ui/demo/cart/model/formatter"

], function(BaseController, UIComponent, MessageToast, JSONModel, formatter) {

	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.OrderStatus", {
		formatter: formatter,
		//onInit: function () {
		//this._router = UIComponent.getRouterFor(this);
		//},
		onInit: function() {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("OrderStatus").attachMatched(this._onRouteMatched, this);

		},
		_onRouteMatched: function(oEvent) {
			this.loadOrderStatus();
		},

		loadOrderStatus: function() {
			debugger;
			var that = this;
			//var oFilter = new sap.ui.model.Filter("Status","EQ", "P");
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/OrderHeaders", "GET",
					//{filters: [oFilter]},
					{}, {}, this)
				.then(function(oData) {
					that.getOwnerComponent().getModel("local").setProperty("/list", {
						OrderHeader: oData.results
					});

				})
				.catch(function(oError) {
					MessageToast.show("cannot fetch the data");
				});
		},

		onFilterOrderStatus: function(oEvent) {
			debugger;
			this.Popup = null;
			if (this.Popup === null) {
				this.Popup = new sap.ui.xmlfragment("sap.ui.demo.cart.fragments.popup", this);
				this.Popup.bindAggregation("items", {
					path: '/OrderHeaders',
					template: new sap.m.DisplayListItem({
						label: "{OrderNo}"
							//value:"{City}"
					})
				});
				this.getView().addDependent(this.Popup);
				this.Popup.setTitle("Order No");
			}
			this.Popup.open();
			// build filter array
			var aFilter = [];
			var sQuery = oEvent.getParameter("query");
			if (sQuery) {
				aFilter.push(new sap.ui.model.Filter("OrderNo", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.getView().byId("idListOS");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);

		},
		onConfirm: function(oEvent) {
			debugger;
			if (oEvent.getSource().getTitle() === "Order No") {
				var allItems = oEvent.getParameter("selectedItems");
				var aFilters = [];
				for (var i = 0; i < allItems.length; i++) {
					var OrdNo = allItems[i].getLabel();
					var oFilter = new sap.ui.model.Filter("OrderNo", sap.ui.model.FilterOperator.EQ,
						OrdNo);
					aFilters.push(oFilter);
				}
				var mainFilter = new sap.ui.model.Filter({
					filters: aFilters,
					and: false
				});
				// filter binding
				var oList = this.getView().byId("idListOS");
				var oBinding = oList.getBinding("items");
				oBinding.filter(mainFilter);
			} else {
				var selectedItem = oEvent.getParameter("selectedItem");
				var myValue = selectedItem.getLabel();
				sap.ui.getCore().byId(this.Popup).setValue(myValue);
			}
		}

	});
});
