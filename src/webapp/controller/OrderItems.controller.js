sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",
	"sap/ui/demo/cart/model/formatter",
	"sap/ui/model/json/JSONModel",
], function(BaseController, UIComponent, Filter, FilterOperator, MessageToast, formatter, JSONModel) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.OrderItems", {
		onInit: function() {
			debugger;
				var odataModel = new JSONModel({
				"groupCodeState": "None",
				"emailState": "None",
				"PatternState": "None",
				"Image": ""
			});
			this.setModel(odataModel, "OrderItemModel");
			this._router = UIComponent.getRouterFor(this);
			this._router.getRoute("OrderItems").attachMatched(this.herculis, this);
			this.getView().byId('idListOI').refreshItems();

		},

		herculis: function(oEvent) {
			debugger;
			this.getView().getModel("OrderItemModel").setProperty("/OrderItems", "");
			this.getView().setBusy(true);
			this.firstTwoDisplay();
			var oList = this.getView().byId("idListOI");
			oEvent.getParameter('arguments').id;
			var CreatedBy = oEvent.getParameter('arguments').id;
			var that = this;

			$.get("/OrderItemShows?OrderNo=" + oEvent.getParameter('arguments').id)
				.then(function(data) {
					debugger;
					that.getView().getModel("OrderItemModel").setProperty("/OrderItems", data);

				});


				setTimeout(() => {
					this.getView().setBusy(false);
				}, 1000);

			oList.attachUpdateFinished(this.counter, this);
			that.getView().byId('idListOI').refreshItems();

			// this.getModel("local").setProperty("/layout", LayoutType.TwoColumnsMidExpanded);

			// var sScooby = oEvent.getParameters().arguments.id;
			//

		},

		loadOrderItems: function(id) {
			debugger;
			var that = this;
			var oFilters = [];
			oFilters.push(new sap.ui.model.Filter("OrderNo", "EQ", "'" + id + "'"));
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/OrderItems", "GET", {
						filters: oFilters
					},
					// {},
					{}, this)
				.then(function(oData) {
					debugger;
					that.getOwnerComponent().getModel("local").setProperty("/list", {
						OrderItem: oData.results
					});
				})
				.catch(function(oError) {
					debugger;
					that.getView().setBusy(false);
					MessageToast.show("Cannot fetch Order Status please Refresh");

				});
		},

		counter: function(oEvent) {
			debugger;
			var items = oEvent.getSource().getItems();
			var oLocal = this.getView().getModel("local");
			var oDataModel = this.getView().getModel();
			var oDataModel1 = this.getView().getModel("OrderItemModel");
			for (var i = 0; i < items.length; i++) {
				var sPath = items[i].getBindingContextPath();
				// var picsSize = oDataModel1.getProperty(sPath + "/ToProduct/ToPhotos");
				var sImage = sPath + "/ToMaterial/ToPhotos/0/Content";
				var sUrl = formatter.getImageUrlFromContent(oDataModel1.getProperty(sImage));
				// if (!this.allImageURLs[sImage]) {
				// 	this.allImageURLs[sImage] = sUrl;
				// }
				items[i].setIcon(sUrl);
			}

		},
		onBack: function() {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.getView().byId('idListOI').refreshItems();
			// this.getView().byId('idListOI').removeAllItems();
			this.oRouter.navTo("OrderStatus");
			this.getView().byId('idListOI').refreshItems();
			this.getView().getModel("OrderItemModel").setProperty("/OrderItems", "");

		}
	});
});
