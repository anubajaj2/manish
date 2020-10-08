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
				this.loadOrderStatus();
			}
    },

    setOrderStatus : function(orderHeader,that){
			var i = 0;
			var totalWeight = 0;
			var totalAmount = 0;
			var totalNetWeight = 0;
			var orderItemDetails = [];
      var productDetails = [];
			that.orderStatusList = [];
			orderHeader.get("OrderHeader").forEach((item,key)=>{
				totalWeight = 0;
				totalAmount = 0;
				totalNetWeight=0;
        productDetails = [];
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
            productDetails.push({
              "Item": tempProd.Category.toLowerCase(),
              "Description":  tempProd.SubCategory.toLowerCase() + ' / ' + tempProd.Name.toLowerCase(),
               "Tunch" : tunch,
              "NetWeight" :  orderHeader.get("Weight").get(oItem.WeightId).NetWeight,
              "GrossWeight": (orderHeader.get("Weight").get(oItem.WeightId).GrossWeight ? orderHeader.get("Weight").get(oItem.WeightId).GrossWeight : 0),
              "Fine" : orderHeader.get("Weight").get(oItem.WeightId).Fine,
              "Amount" : (orderHeader.get("Weight").get(oItem.WeightId).Amount ? orderHeader.get("Weight").get(oItem.WeightId).Amount : 0)
            });
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
					ItemDetails : orderItemDetails,
          Products: productDetails
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
    },
    getPdf: function(sPaths, that, pIndex = 0) {
      if (pIndex < sPaths.length) {
        var index = sPaths[pIndex].split('/')[sPaths[pIndex].split('/').length - 1];
        var products = this.orderStatusList[index].Products;
        var customerName = this.orderStatusList[index].CustomerName;
        var customerAddress = this.orderStatusList[index].CustomerAddress;
        var customerCity = this.orderStatusList[index].CustomerCity;
        var invoiceName = this.orderStatusList[index].CustomerCode + "-O" +this.orderStatusList[index].OrderNo;
        MessageToast.show("Please wait, preparing...");
        const invoiceDetail = {
            shipping: {
              name: customerName,
              address: (customerAddress ? customerAddress : "N/A"),
              city: (customerCity ? customerCity : "N/A"),
              state: "",
              country: "INDIA",
              postal_code: ""
            },
            items: products,
            GST : "",
            order_number: invoiceName,
            header:{
                company_name: "Mangalam Ornaments",
                company_logo: "",
                company_address: "601-603, APEX MALLLALKOTHI TONK ROAD, JAIPUR RJ 302015 IN"
            },
            footer:{
              text: "---------------------------------------"
            },
            currency_symbol: " INR",
            weight_unit: "gm",
            date: {
              billing_date: Date().slice(4, 15),
              due_date: "",
            }
        };

      let header = (doc, invoice) => {
          if (false) {
            doc.image('logo.png', 50, 45, { width: 50 })
            .fontSize(20)
            .text(invoice.header.company_name, 110, 57)
            .moveDown();
          }else{
            doc.fontSize(20)
            .text(invoice.header.company_name, 50, 45)
            .moveDown()
          }

          if(invoice.header.company_address.length!==0){
            companyAddress(doc, invoice.header.company_address);
          }

      }

      let customerInformation = (doc, invoice)=>{
        doc
          .fillColor("#444444")
          .fontSize(20)
          .text("Invoice", 50, 160);

        generateHr(doc, 185);

        const customerInformationTop = 200;

          doc.fontSize(10)
          .text("Invoice Number:", 50, customerInformationTop)
          .font("Helvetica-Bold")
          .text(invoice.order_number, 150, customerInformationTop)
          .font("Helvetica")
          .text("Billing Date:", 50, customerInformationTop + 15)
          .text(invoice.date.billing_date, 150, customerInformationTop + 15)
          .text("Due Date:", 50, customerInformationTop + 30)
          .text(invoice.date.due_date,150,customerInformationTop + 30)

          .font("Helvetica-Bold")
          .text(invoice.shipping.name, 300, customerInformationTop)
          .font("Helvetica")
          .text(invoice.shipping.address, 300, customerInformationTop + 15)
          .text(
            invoice.shipping.city +
              ", " +
              invoice.shipping.state +
              ", " +
              invoice.shipping.country,
            300,
            customerInformationTop + 30
          )
          .moveDown();

        generateHr(doc, 252);
      }

      let invoiceTable = (doc, invoice) => {
        let i;
        const invoiceTableTop = 330;
        const currencySymbol = invoice.currency_symbol;
        const weightUnit = invoice.weight_unit;

        doc.font("Helvetica-Bold");
        tableRow(
          doc,
          invoiceTableTop,
          "Item",
          "Description",
          "Gross Weight",
          "Net Weight",
          "Fine",
          "Amount"
        );
        generateHr(doc, invoiceTableTop + 20);
        doc.font("Helvetica");
        var totalAmount = 0;
        var totalFine = 0;
        for (i = 0; i < invoice.items.length; i++) {
          const item = invoice.items[i];
          const position = invoiceTableTop + (i + 1) * 30;
          tableRow(
            doc,
            position,
            item.Item,
            item.Description,
            formatWeight(item.GrossWeight,weightUnit),
            formatNetWeightWithTunch(item.NetWeight,weightUnit,item.Tunch),
            formatWeight(item.Fine,weightUnit),
            formatCurrency(item.Amount, currencySymbol)
          );
          totalAmount+=parseFloat(item.Amount);
          totalFine+=parseFloat(item.Fine);
          generateHr(doc, position + 20);
        }

        const subtotalPosition = invoiceTableTop + (i + 1) * 30;
        doc.font("Helvetica-Bold");
        totalTable(
          doc,
          subtotalPosition,
          "Total Fine :",
          formatWeight(totalFine.toFixed(2),weightUnit)
        );
        const gstPosition = subtotalPosition + 20;
        doc.font("Helvetica-Bold");
        totalTable(
          doc,
          gstPosition,
          "GST :",
          checkIfTaxAvailable(invoice.GST)
        );
        const paidToDatePosition = gstPosition + 20;
        doc.font("Helvetica-Bold");
        totalTable(
          doc,
          paidToDatePosition,
          "Total Amount :",
          formatCurrency(applyTaxIfAvailable(totalAmount,invoice.GST).toFixed(2), currencySymbol)
        );
      }

      let footer = (doc, invoice) => {
        if(invoice.footer.text.length!==0){
          doc.fontSize(10).text(invoice.footer.text,50,780,{ align: "center", width: 500 });
        }
      }

      let totalTable = (
        doc,
        y,
        name,
        description
      )=>{
          doc
          .fontSize(10)
          .text(name, 380, y,{ width: 90, align: "right" })
          .text(description, 0, y, { align: "right" })
      }

      let tableRow = (
        doc,
        y,
        item,
        description,
        grossWeight,
        netWeight,
        fine,
        amount
      )=>{
          doc
          .fontSize(10)
          .text(item, 50, y)
          .text(description, 130, y)
          .text(grossWeight, 215, y, { width: 90, align: "right" })
          .text(netWeight, 310, y, { width: 90, align: "right" })
          .text(fine, 380, y,{ width: 90, align: "right" })
          .text(amount, 0, y, { align: "right" });
      }

      let generateHr = (doc, y) => {
          doc
          .strokeColor("#aaaaaa")
          .lineWidth(1)
          .moveTo(50, y)
          .lineTo(550, y)
          .stroke();
      }

      let formatCurrency = (value, symbol) => {
        if(value){
              var x = value.toString().split('.');
              var y = (x.length>1?"."+x[1]:"");
              x=x[0];
              var lastThree = x.substring(x.length-3);
              var otherNumbers = x.substring(0,x.length-3);
              if(otherNumbers != '')
                  lastThree = ',' + lastThree;
              var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
               return  res+y+symbol;
            }
            else{
              return value+symbol
            }
      }

      let formatWeight = (value, symbol) => {
        return value+symbol;
      }

      let formatNetWeightWithTunch = (netWeight, symbol, tunch) => {
        return netWeight+symbol+" X "+tunch+"T";
      }

      let getNumber =  str =>  {
        if(str.length!==0){
          var num = str.replace(/[^0-9]/g, '');
        }else{
          var num = 0;
        }

        return num;
      }

      let checkIfTaxAvailable = tax => {
        let validatedTax = getNumber(tax);
        if(Number.isNaN(validatedTax) === false && validatedTax <= 100 && validatedTax > 0){
          var taxValue = tax;
        }else{
          var taxValue = '---';
        }

        return taxValue;
      }

      let applyTaxIfAvailable = (price, gst) => {


        let validatedTax = getNumber(gst);
        if(Number.isNaN(validatedTax) === false && validatedTax <= 100){
          let taxValue = '.'+validatedTax;
          var itemPrice = price * (1 + taxValue);
        }else{
          var itemPrice = price  * (1 + taxValue);
        }

        return itemPrice;
      }

      let companyAddress = (doc, address) => {
        let str = address;
        let chunks = str.match(/.{0,25}(\s|$)/g);
        let first = 50;
        chunks.forEach(function (i,x) {
          doc.fontSize(10).text(chunks[x], 200, first, { align: "right" });
          first = +first +  15;
        });
      }

      let niceInvoice = (invoice) => {
        var doc = new PDFDocument({ size: "A4", margin: 40 });
        var stream = doc.pipe(blobStream());
        header(doc, invoice);
        customerInformation(doc, invoice);
        invoiceTable(doc, invoice);
        footer(doc, invoice);
        doc.end();
        stream.on('finish', function() {
          // get a blob you can do whatever you like with
          const blob = stream.toBlob('application/pdf');
          // or get a blob URL for display in the browser
          const url = stream.toBlobURL('application/pdf');

          const downloadLink = document.createElement('a');
          downloadLink.href = url;
          downloadLink.download = invoiceName;
          downloadLink.click();
          that.getPdf(sPaths, that, ++pIndex);
        });
      }
      niceInvoice(invoiceDetail);
      }
    },
    onInvoiceDownload: function() {
      var sPaths = this.getView().byId('idListOL').getSelectedContextPaths();
      // this.getView().setBusy(true);
      this.getPdf(sPaths, this)
    }
  });
});
