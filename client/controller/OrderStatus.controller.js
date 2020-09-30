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
      if (!this.orderStatusList) {
        this.getView().setBusy(true);
        this.loadOrderStatus();
      }
    },
    setOrderStatus: function(orderHeader, that) {
      var i = 0;
      var totalWeight = 0;
      var totalAmount = 0;
      var totalNetWeight = 0;
      var orderItemDetails = [];
      var productDetails = [];
      that.orderStatusList = [];
      // debugger;
      orderHeader.get("OrderHeader").forEach((item, key) => {
        totalWeight = 0;
        totalAmount = 0;
        totalNetWeight = 0;
        productDetails = [];
        orderItemDetails = [];
        if (orderHeader.get("OrderItem").has(key)) {
          orderHeader.get("OrderItem").get(item.id).forEach((oItem, index) => {
            orderItemDetails.push(index + 1);
            var tempProd = orderHeader.get("Product").get(oItem.Material);
            var tunch = tempProd.Tunch + tempProd.Wastage;
            orderItemDetails.push(tempProd.Category.toLowerCase() + ' / ' + tempProd.SubCategory.toLowerCase() +
              ' / ' + tempProd.Name.toLowerCase() + ' (' + tunch + 'Tunch) ');
            totalWeight += orderHeader.get("Weight").get(oItem.WeightId).GrossWeight;
            orderItemDetails.push(orderHeader.get("Weight").get(oItem.WeightId).GrossWeight);
            totalNetWeight += orderHeader.get("Weight").get(oItem.WeightId).NetWeight;
            orderItemDetails.push(orderHeader.get("Weight").get(oItem.WeightId).NetWeight);
            totalAmount += orderHeader.get("Weight").get(oItem.WeightId).Amount;
            orderItemDetails.push(orderHeader.get("Weight").get(oItem.WeightId).Amount);
            productDetails.push({
              "quantity": 1,
              "description": tempProd.Category.toLowerCase() + ' / ' + tempProd.SubCategory.toLowerCase() +
                ' / ' + tempProd.Name.toLowerCase() + ' (' + tunch + 'Tunch) '
                + orderHeader.get("Weight").get(oItem.WeightId).GrossWeight + ' gm',
              "tax": 19,
              "price": (orderHeader.get("Weight").get(oItem.WeightId).Amount ? orderHeader.get("Weight").get(oItem.WeightId).Amount : 0)
            });
          });
        }
        that.orderStatusList[i++] = {
          id: key,
          CustomerName: orderHeader.get("Customer").get(item.Customer).Name,
          CustomerCode: orderHeader.get("Customer").get(item.Customer).CustomerCode,
          CustomerCity: orderHeader.get("Customer").get(item.Customer).City,
          CustomerMob: orderHeader.get("Customer").get(item.Customer).MobilePhone,
          CustomerAddress: orderHeader.get("Customer").get(item.Customer).Address,
          TotalWeight: totalWeight.toFixed(2),
          TotalNetWeight: totalNetWeight,
          TotalAmount: totalAmount,
          OrderDate: item.Date,
          OrderNo: item.OrderNo,
          OrderStatus: item.Status,
          ItemDetails: orderItemDetails,
          Products: productDetails
        };
      });
      that.getOwnerComponent().getModel("local").setProperty("/list", {
        OrderHeader: that.orderStatusList
      });
      that.getView().byId('idListOS').refreshItems();
      that.getView().byId('idListOS').removeSelections();
      that.getView().setBusy(false);
    },
    loadProdWeights: function(orderHeader, that) {
      var oFilters = [];
      orderHeader.get("Weight").forEach((item, key) => {
        oFilters.push(new sap.ui.model.Filter("id", "EQ", "'" + key + "'"));
      });
      // var oFilter = new sap.ui.model.Filter("Status","EQ", "P");
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/ProdWeights", "GET", {
            filters: oFilters
          },
          // {},
          {}, this)
        .then(function(oData) {
          oData.results.forEach((item) => {
            orderHeader.get("Weight").set(item.id, item);
          });
          that.setOrderStatus(orderHeader, that);
        })
        .catch(function(oError) {
          that.getView().setBusy(false);
          MessageToast.show("Cannot fetch Order Status please Refresh");
        });
    },
    loadProducts: function(orderHeader, that) {
      var oFilters = [];
      orderHeader.get("Product").forEach((item, key) => {
        oFilters.push(new sap.ui.model.Filter("id", "EQ", "'" + key + "'"));
      });
      // var oFilter = new sap.ui.model.Filter("Status","EQ", "P");
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/Products", "GET", {
            filters: oFilters
          },
          // {},
          {}, this)
        .then(function(oData) {
          oData.results.forEach((item) => {
            orderHeader.get("Product").set(item.id, item);
          });
          that.loadProdWeights(orderHeader, that);
          // that.setOrderStatus(orderHeader,that);
        })
        .catch(function(oError) {
          that.getView().setBusy(false);
          MessageToast.show("Cannot fetch Order Status please Refresh");
        });
    },
    loadOrderItems: function(orderHeader, that) {
      var oFilters = [];
      orderHeader.get("OrderHeader").forEach((item, key) => {
        oFilters.push(new sap.ui.model.Filter("OrderNo", "EQ", "'" + key + "'"));
      });
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/OrderItems", "GET", {
            filters: oFilters
          },
          // {},
          {}, this)
        .then(function(oData) {
          oData.results.forEach((item) => {
            if (orderHeader.get("OrderItem").has(item.OrderNo)) {
              orderHeader.get("OrderItem").get(item.OrderNo).push(item);
              orderHeader.get("Weight").set(item.WeightId, "");
              orderHeader.get("Product").set(item.Material, "");
            }
          });
          that.loadProducts(orderHeader, that);
        })
        .catch(function(oError) {
          that.getView().setBusy(false);
          MessageToast.show("Cannot fetch Order Status please Refresh");
        });
    },
    loadCustomer: function(customerIds, orderHeader) {
      var that = this;
      orderHeader.set("Customer", new Map());
      var oFilters = [];
      customerIds.forEach((item) => {
        oFilters.push(new sap.ui.model.Filter("id", "EQ", "'" + item + "'"));
      });
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/Customers", "GET", {
            filters: oFilters
          },
          // {},
          {}, this)
        .then(function(oData) {
          oData.results.forEach((item) => {
            orderHeader.get("Customer").set(item.id, item);
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
      orderHeader.set("OrderHeader", new Map());
      orderHeader.set("OrderItem", new Map());
      orderHeader.set("Product", new Map());
      orderHeader.set("Weight", new Map());
      var oFilterN = new sap.ui.model.Filter("Status", "EQ", "N");
      var oFilterA = new sap.ui.model.Filter("Status", "EQ", "A");
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/OrderHeaders", "GET", {
            filters: [oFilterN, oFilterA]
          },
          // {},
          {}, this)
        .then(function(oData) {
          // debugger;
          oData.results.forEach((item, index) => {
            orderHeader.get("OrderHeader").set(item.id, item);
            orderHeader.get("OrderItem").set(item.id, []);
            customerIds.add(item.Customer);
          });
          that.loadCustomer(customerIds, orderHeader);
          that.loadOrderItems(orderHeader, that);
        })
        .catch(function(oError) {
          that.getView().setBusy(false);
          MessageToast.show("Cannot fetch Order Status please Refresh");
        });

    },
    orderStatusUpdate: function(sPaths, orderStatus) {
      sPaths.forEach((item) => {
        var id = this.orderStatusList[item.split('/')[item.split('/').length - 1]].id;
        // debugger;
        this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
            "/OrderHeaders('" + id + "')",
            "PUT", {}, {
              Status: orderStatus
            }, this)
          .then(function(oData) {
            // this.getOwnerComponent().getModel("local").setProperty(item+"/OrderStatus", "A");
            // MessageToast.show("Updated");
          }).catch(function(oError) {
            MessageToast.show("Error");
          });
        // this.getOwnerComponent().getModel("local").setProperty(item+"/OrderStatus", orderStatus);
      });
      setTimeout(() => {
        this.getView().setBusy(true);
        this.loadOrderStatus();
      }, 1000);
    },
    onApprove: function(oEvent) {
      var sPaths = this.getView().byId('idListOS').getSelectedContextPaths();
      if (sPaths.length) {
        this.orderStatusUpdate(sPaths, "A");
      }
    },
    onReject: function(oEvent) {
      var sPaths = this.getView().byId('idListOS').getSelectedContextPaths();
      if (sPaths.length) {
        this.orderStatusUpdate(sPaths, "R");
      }
    },
    onDelivered: function(oEvent) {
      var sPaths = this.getView().byId('idListOS').getSelectedContextPaths();
      if (sPaths.length) {
        this.orderStatusUpdate(sPaths, "D");
      }
    },
    onRefresh: function() {
      this.getView().setBusy(true);
      this.loadOrderStatus();
    },
    getPrint: function(sPaths, that, pIndex = 0) {
      if (pIndex < sPaths.length) {
        var index = sPaths[pIndex].split('/')[sPaths[pIndex].split('/').length - 1];
        var items = this.orderStatusList[index].ItemDetails.toString().split(',');
        var orderCustomer = [
          this.orderStatusList[index].OrderNo,
          this.orderStatusList[index].OrderDate.toString().slice(4, 16),
          this.orderStatusList[index].CustomerName,
          this.orderStatusList[index].CustomerCity,
          this.orderStatusList[index].CustomerMob
        ].toString().split(',');
        var total = [
          this.orderStatusList[index].TotalWeight,
          this.orderStatusList[index].TotalNetWeight,
          this.orderStatusList[index].TotalAmount
        ].toString().split(',');
        debugger;
        $.post('/invoice', {
          first: orderCustomer,
          second: items,
          third: total
        }).done(function(data, status) {
          var myWindow = window.open("", "MsgWindow", "width=1200,height=700", true);
          myWindow.document.write(data);
          that.getPrint(sPaths, that, ++pIndex);
        }).fail(function(xhr, status, error) {
          that.getView().setBusy(false);
          MessageToast.show("Error");
        });
      } else {
        that.getView().byId('idListOS').removeSelections();
        that.getView().setBusy(false);
      }
    },
    onPrint: function() {
      var sPaths = this.getView().byId('idListOS').getSelectedContextPaths();
      this.getView().setBusy(true);
      this.getPrint(sPaths, this)
    },
    getPdf: function(sPaths, that, pIndex = 0) {
      if (pIndex < sPaths.length) {
        var index = sPaths[pIndex].split('/')[sPaths[pIndex].split('/').length - 1];
        var products = this.orderStatusList[index].Products;
        var customerName = this.orderStatusList[index].CustomerName;
        var customerAddress = this.orderStatusList[index].CustomerAddress;
        var customerCity = this.orderStatusList[index].CustomerCity;
        var invoiceName = this.orderStatusList[index].CustomerCode + "-O" +this.orderStatusList[index].OrderNo;

        var data = {
          //"documentTitle": "RECEIPT", //Defaults to INVOICE
          "currency": "INR",
          "taxNotation": "GST", //or gst
          "marginTop": 25,
          "marginRight": 25,
          "marginLeft": 25,
          "marginBottom": 25,
          "logo": "https://cdn1.jewelxy.com/live/img/business_logo/250x250/TyABL7V4qd_20190624134922.jpg", //or base64
          //"logoExtension": "png", //only when logo is base64
          "sender": {
            "company": "Manglam Ornament",
            "address": "601-603, APEX MALL LALKOTHI TONK ROAD",
            "zip": "302015",
            "city": "Jaipur",
            "country": "India"
            //"custom1": "custom value 1",
            //"custom2": "custom value 2",
            //"custom3": "custom value 3"
          },
          "client": {
            "company": customerName,
            "address": (customerAddress ? customerAddress : "N/A"),
            "zip": "",
            "city": (customerCity ? customerCity : "N/A"),
            "country": "India"
            //"custom1": "custom value 1",
            //"custom2": "custom value 2",
            //"custom3": "custom value 3"
          },
          "invoiceNumber": invoiceName,
          "invoiceDate": Date().slice(4, 15),
          "products": products,
          "bottomNotice": "Kindly pay your invoice within 15 days."
        };
        easyinvoice.createInvoice(data, function(result) {
          easyinvoice.download(invoiceName + '.pdf', result.pdf);
          that.getPdf(sPaths, that, ++pIndex);
        });
      } else {
        that.getView().byId('idListOS').removeSelections();
        // that.getView().setBusy(false);
      }
    },
    onInvoiceDownload: function() {
      var sPaths = this.getView().byId('idListOS').getSelectedContextPaths();
      // this.getView().setBusy(true);
      this.getPdf(sPaths, this)
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
