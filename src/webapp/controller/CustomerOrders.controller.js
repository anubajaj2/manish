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
      this._oRouter.getRoute("orders").attachMatched(this._onRouteMatched, this);
    },
    _onRouteMatched: function(oEvent) {
      if(!this.orderStatusList){
				this.getView().setBusy(true);
        debugger;
				this.loadOrderStatus();
			}
    },

    setOrderStatus : function(orderHeader,that){
			var i = 0;
			var totalWeight = 0;
			var totalAmount = 0;
			var totalNetWeight = 0;
			var orderItemDetails = [];
			that.orderStatusList = [];
			orderHeader.get("OrderHeader").forEach((item,key)=>{
				totalWeight = 0;
				totalAmount = 0;
				totalNetWeight=0;
				orderItemDetails = [];
				if(orderHeader.get("OrderItem").has(key)){
					orderHeader.get("OrderItem").get(item.id).forEach((oItem,index)=>{
						orderItemDetails.push(index+1);
						var tempProd = orderHeader.get("Product").get(oItem.Material);
						var tunch = tempProd.Tunch+tempProd.Wastage;
						orderItemDetails.push(tempProd.Category.toLowerCase()+' / '+tempProd.SubCategory.toLowerCase() +
						' / '+tempProd.Name.toLowerCase()+' ('+tunch+'Tunch) ');
						totalWeight+=orderHeader.get("Weight").get(oItem.WeightId).GrossWeight;
						orderItemDetails.push(orderHeader.get("Weight").get(oItem.WeightId).GrossWeight);
						totalNetWeight+=orderHeader.get("Weight").get(oItem.WeightId).NetWeight;
						orderItemDetails.push(orderHeader.get("Weight").get(oItem.WeightId).NetWeight);
						totalAmount+=orderHeader.get("Weight").get(oItem.WeightId).Amount;
						orderItemDetails.push(orderHeader.get("Weight").get(oItem.WeightId).Amount);
					});
				}
				that.orderStatusList[i++] = {
					id : key,
					CustomerName : orderHeader.get("Customer").get(item.Customer).Name,
					CustomerCode : orderHeader.get("Customer").get(item.Customer).CustomerCode,
					CustomerCity :  orderHeader.get("Customer").get(item.Customer).City,
					CustomerMob : orderHeader.get("Customer").get(item.Customer).MobilePhone,
					TotalWeight : totalWeight.toFixed(2),
					TotalNetWeight : totalNetWeight,
					TotalAmount : totalAmount,
					OrderDate : item.Date,
					OrderNo : item.OrderNo,
					OrderStatus : item.Status,
					ItemDetails : orderItemDetails
				};
			});
			that.getOwnerComponent().getModel("local").setProperty("/list", {
				OrderHeader: that.orderStatusList
			});
			// this.getView().byId('idListOL').refreshItems();
			this.getView().byId('idListOL').removeSelections();
      this.orderHeader = orderHeader;
      if(this.orderStatusList.length){
        var orderHeaderId = this.orderStatusList[0].id;
        var orderProducts = [];
        this.orderHeader.get("OrderItem").get(orderHeaderId).forEach((item)=>{
          orderProducts.push(this.orderHeader.get("Product").get(item.Material));
        });
        this.getOwnerComponent().getModel("local").setProperty("/CustomerOrderItems",orderProducts);
      }
			this.getView().setBusy(false);
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
		loadProducts : function(orderHeader,that){
			var oFilters = [];
			orderHeader.get("Product").forEach((item,key)=>{
				oFilters.push(new sap.ui.model.Filter("id","EQ", "'" + key + "'"));
			});
			// var oFilter = new sap.ui.model.Filter("Status","EQ", "P");
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/Products", "GET",
					{filters: oFilters},
					// {},
					 {}, this)
				.then(function(oData) {
					oData.results.forEach((item)=>{
						orderHeader.get("Product").set(item.id,item);
					});
					that.loadProdWeights(orderHeader,that);
					// that.setOrderStatus(orderHeader,that);
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
							orderHeader.get("Product").set(item.Material,"");
						}
					});
					that.loadProducts(orderHeader,that);
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
      var customerId = this.getView().getModel("local").getProperty("/CustomerData/id");
			var customerIds = new Set();
			var orderHeader = new Map();
			orderHeader.set("OrderHeader",new Map());
			orderHeader.set("OrderItem",new Map());
			orderHeader.set("Product",new Map());
			orderHeader.set("Weight",new Map());
      var oFilter = new sap.ui.model.Filter("Customer","EQ", "'"+customerId+"'");
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
					"/OrderHeaders", "GET",
					{filters: [oFilter]},
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
    onRefresh : function(){
			this.getView().setBusy(true);
			this.loadOrderStatus();
		},
    onItemPress : function(oEvent){
      var sPath = oEvent.getSource().getSelectedContextPaths()[0];
      var sIndex = sPath.split("/")[sPath.split("/").length-1];
      var orderHeaderId = this.orderStatusList[sIndex].id;
      var orderProducts = [];
      this.orderHeader.get("OrderItem").get(orderHeaderId).forEach((item)=>{
        orderProducts.push(this.orderHeader.get("Product").get(item.Material));
      });
      this.getOwnerComponent().getModel("local").setProperty("/CustomerOrderItems",orderProducts);
    }
  });
});
