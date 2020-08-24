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
			if(!this.orderStatusList){
				this.getView().setBusy(true);
				this.loadOrderStatus();
			}
		},
		setOrderStatus : function(orderHeader,that){
			var i = 0;
			var totalWeight = 0;
			var totalAmount = 0;
			that.orderStatusList = [];
			// debugger;
			orderHeader.get("OrderHeader").forEach((item,key)=>{
				totalWeight = 0;
				totalAmount = 0;
				if(orderHeader.get("OrderItem").has(key)){
					orderHeader.get("OrderItem").get(item.id).forEach((oItem)=>{
						totalWeight+=orderHeader.get("Weight").get(oItem.WeightId).GrossWeight;
						totalAmount+=orderHeader.get("Weight").get(oItem.WeightId).Amount;
					});
				}
				that.orderStatusList[i++] = {
					id : key,
					CustomerName : orderHeader.get("Customer").get(item.Customer).Name,
					CustomerCode : orderHeader.get("Customer").get(item.Customer).CustomerCode,
					TotalWeight : totalWeight,
					TotalAmount : totalAmount,
					OrderDate : item.Date,
					OrderNo : item.OrderNo,
					OrderStatus : item.Status
				};
			});
			that.getOwnerComponent().getModel("local").setProperty("/list", {
				OrderHeader: that.orderStatusList
			});
			that.getView().byId('idListOS').refreshItems();
			that.getView().byId('idListOS').removeSelections();
			that.getView().setBusy(false);
		},
		loadProdWeights : function(orderHeader,that){
			var oFilters = [];
			orderHeader.get("Weight").forEach((item,key)=>{
				oFilters.push(new sap.ui.model.Filter("id","EQ", "'" + key + "'"));
			});
			// var oFilter = new sap.ui.model.Filter("Status","EQ", "P");
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/ProdWeights", "GET",
					{filters: oFilters},
					// {},
					 {}, this)
				.then(function(oData) {
					oData.results.forEach((item)=>{
						orderHeader.get("Weight").set(item.id,item);
					});
					that.setOrderStatus(orderHeader,that);
				})
				.catch(function(oError) {
					that.getView().setBusy(false);
					MessageToast.show("Cannot fetch Order Status please Refresh");
				});
		},
		loadOrderItems : function(orderHeader,that){
			var oFilters = [];
			orderHeader.get("OrderHeader").forEach((item,key)=>{
				oFilters.push(new sap.ui.model.Filter("OrderNo","EQ", "'" + key + "'"));
			});
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/OrderItems", "GET",
					{filters: oFilters},
					// {},
					 {}, this)
				.then(function(oData) {
					oData.results.forEach((item)=>{
						if(orderHeader.get("OrderItem").has(item.OrderNo)){
							orderHeader.get("OrderItem").get(item.OrderNo).push(item);
							orderHeader.get("Weight").set(item.WeightId,"");
						}
					});
					that.loadProdWeights(orderHeader,that);
				})
				.catch(function(oError) {
					that.getView().setBusy(false);
					MessageToast.show("Cannot fetch Order Status please Refresh");
				});
		},
		loadCustomer : function(customerIds,orderHeader){
			var that = this;
			orderHeader.set("Customer",new Map());
			var oFilters = [];
			customerIds.forEach((item)=>{
				oFilters.push(new sap.ui.model.Filter("id","EQ", "'" + item + "'"));
			});
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/Customers", "GET",
					{filters: oFilters},
					// {},
					{}, this)
				.then(function(oData) {
					oData.results.forEach((item)=>{
						orderHeader.get("Customer").set(item.id,item);
					});
				})
				.catch(function(oError) {
					that.getView().setBusy(false);
					MessageToast.show("Cannot fetch Order Status please Refresh");
				});
		},
		loadOrderStatus: function() {
			var that = this;
			var customerIds = new Set();
			var orderHeader = new Map();
			orderHeader.set("OrderHeader",new Map());
			orderHeader.set("OrderItem",new Map());
			orderHeader.set("Product",new Map());
			orderHeader.set("Weight",new Map());
			var oFilterN = new sap.ui.model.Filter("Status","EQ", "N");
			var oFilterA = new sap.ui.model.Filter("Status","EQ", "A");
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/OrderHeaders", "GET",
					{filters: [oFilterN,oFilterA]},
					// {},
					 {}, this)
				.then(function(oData) {
					// debugger;
					oData.results.forEach((item,index)=>{
						orderHeader.get("OrderHeader").set(item.id,item);
						orderHeader.get("OrderItem").set(item.id,[]);
						customerIds.add(item.Customer);
					});
					that.loadCustomer(customerIds,orderHeader);
					that.loadOrderItems(orderHeader,that);
				})
				.catch(function(oError) {
					that.getView().setBusy(false);
					MessageToast.show("Cannot fetch Order Status please Refresh");
				});

		},
		orderStatusUpdate : function(sPaths,orderStatus){
			sPaths.forEach((item)=>{
				var id = this.orderStatusList[item.split('/')[item.split('/').length-1]].id;
				// debugger;
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				                          "/OrderHeaders('"+ id + "')",
				                          "PUT", {}, {Status : orderStatus}, this)
				.then(function(oData) {
					// this.getOwnerComponent().getModel("local").setProperty(item+"/OrderStatus", "A");
					// MessageToast.show("Updated");
				}).catch(function(oError) {
					MessageToast.show("Error");
				});
				// this.getOwnerComponent().getModel("local").setProperty(item+"/OrderStatus", orderStatus);
			});
			setTimeout(()=>{
				this.getView().setBusy(true);
				this.loadOrderStatus();
			},1000);
		},
		onApprove : function(oEvent){
			var sPaths = this.getView().byId('idListOS').getSelectedContextPaths();
			if(sPaths.length){
				this.orderStatusUpdate(sPaths,"A");
			}
		},
		onReject : function(oEvent){
			var sPaths = this.getView().byId('idListOS').getSelectedContextPaths();
			if(sPaths.length){
				this.orderStatusUpdate(sPaths,"R");
			}
		},
		onDelivered : function(oEvent){
			var sPaths = this.getView().byId('idListOS').getSelectedContextPaths();
			if(sPaths.length){
				this.orderStatusUpdate(sPaths,"D");
			}
		},
		onRefresh : function(){
			this.getView().setBusy(true);
			this.loadOrderStatus();
		}
		// onFilterOrderStatus: function(oEvent) {
		// 	debugger;
		// 	this.Popup = null;
		// 	if (this.Popup === null) {
		// 		this.Popup = new sap.ui.xmlfragment("sap.ui.demo.cart.fragments.popup", this);
		// 		this.Popup.bindAggregation("items", {
		// 			path: '/OrderHeaders',
		// 			template: new sap.m.DisplayListItem({
		// 				label: "{OrderNo}"
		// 					//value:"{City}"
		// 			})
		// 		});
		// 		this.getView().addDependent(this.Popup);
		// 		this.Popup.setTitle("Order No");
		// 	}
		// 	this.Popup.open();
		// 	// build filter array
		// 	var aFilter = [];
		// 	var sQuery = oEvent.getParameter("query");
		// 	if (sQuery) {
		// 		aFilter.push(new sap.ui.model.Filter("OrderNo", FilterOperator.Contains, sQuery));
		// 	}
		//
		// 	// filter binding
		// 	var oList = this.getView().byId("idListOS");
		// 	var oBinding = oList.getBinding("items");
		// 	oBinding.filter(aFilter);
		// },
		// onConfirm: function(oEvent) {
		// 	debugger;
		// 	if (oEvent.getSource().getTitle() === "Order No") {
		// 		var allItems = oEvent.getParameter("selectedItems");
		// 		var aFilters = [];
		// 		for (var i = 0; i < allItems.length; i++) {
		// 			var OrdNo = allItems[i].getLabel();
		// 			var oFilter = new sap.ui.model.Filter("OrderNo", sap.ui.model.FilterOperator.EQ,
		// 				OrdNo);
		// 			aFilters.push(oFilter);
		// 		}
		// 		var mainFilter = new sap.ui.model.Filter({
		// 			filters: aFilters,
		// 			and: false
		// 		});
		// 		// filter binding
		// 		var oList = this.getView().byId("idListOS");
		// 		var oBinding = oList.getBinding("items");
		// 		oBinding.filter(mainFilter);
		// 	} else {
		// 		var selectedItem = oEvent.getParameter("selectedItem");
		// 		var myValue = selectedItem.getLabel();
		// 		sap.ui.getCore().byId(this.Popup).setValue(myValue);
		// 	}
		// }

	});
});
