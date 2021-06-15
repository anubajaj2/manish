sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/demo/cart/model/cart",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/demo/cart/model/formatter",
	"sap/ui/model/FilterOperator"
], function (BaseController, cart, JSONModel, Filter, formatter, FilterOperator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Welcome", {
		formatter: formatter,
		onGridItemPress: function(oEvent) {
			//alert("ay");
			if(oEvent.getParameter("listItem").hasStyleClass("colorGreen")){
					oEvent.getParameter("listItem").removeStyleClass("colorGreen");
			}else{
				oEvent.getParameter("listItem").addStyleClass("colorGreen");
			}
			console.log(oEvent.getParameter("listItem").getContent()[0].getItems()[0].getItems()[0].getText());

		},
		onSearch: function(){
			var oView = this.getView();
			var aFilter = [];
			var orFilter = [];
			debugger;
			//read categories selected
			var aItems = oView.byId("gridList").getItems();
			for (var i = 0; i < aItems.length; i++) {
				if(aItems[i].hasStyleClass("colorGreen")){
					aFilter.push(new Filter("Category",FilterOperator.EQ,
					aItems[i].getContent()[0].getItems()[0].getItems()[0].getText()
					));
				}
			}
			if ( aFilter.length > 0 ){
				orFilter.push(new Filter(aFilter, false));
				aFilter = [];
			}
			//read sub categories
			var aItems2 = this.getView().getParent().getParent().getBeginColumnPages()[0].getContent()[0].getContent()[0].getItems();
			for (var i = 0; i < aItems2.length; i++) {
				if(aItems2[i].hasStyleClass("colorGreen")){
					aFilter.push(new Filter("SubCategory",FilterOperator.EQ,
					aItems2[i].getLabel()
					));
				}
			}
			if ( aFilter.length > 0 ){
				orFilter.push(new Filter(aFilter, false));
				aFilter = [];
			}
			//read range Value low and high
			var aRange = oView.byId("range").getRange();
			aFilter.push(new Filter("GrossWeight",FilterOperator.BT, aRange[0], aRange[1]));

			orFilter.push(new Filter(aFilter));
			aFilter = [];

			aFilter.push(new Filter("ProdStatus",FilterOperator.EQ, "A"));

			orFilter.push(new Filter(aFilter));
			aFilter = [];
			//read the type
			if(oView.byId("togPlain").getPressed()){
				aFilter.push(new Filter("Type",FilterOperator.EQ,"P"));
			}
			if(oView.byId("togStudded").getPressed()){
				aFilter.push(new Filter("Type",FilterOperator.EQ,"S"));
			}
			if ( aFilter.length > 0 ){
				orFilter.push(new Filter(aFilter, false));
				aFilter = [];
			}

			var oFilter = new Filter({
				filters: orFilter,
				and:true
			});
			//set filter
			this.getOwnerComponent().getModel("local").setProperty("/searchFilter", oFilter);

			this.getRouter().navTo("productSearch");

		},
		onClear: function(){

		},
		onInit: function () {
			this.oRouter = this.getOwnerComponent().getRouter();
			this.oRouter.getRoute("home").attachMatched(this._onRouteMatched, this);
			// this.loadCategories();
			// setTimeout(this._initLoad.bind(this),1000);
		},
		// _initLoad: function(){
		// 	var oPage = this.getView().byId("myPage");
		// 	var allBtn = this.getOwnerComponent().getModel("local").getProperty("/cat/category");
		// 	for (var i = 0; i < allBtn.length; i++) {
		// 		var text = allBtn[i].Category;
		// 		oPage.addContent(new sap.m.ToggleButton({
		// 			text: text
		//
		// 		}).addStyleClass('class','sapUiResponsiveMargin sapUiLargeMargin sapUiLargePadding'));
		// 	}
		// },
		_onRouteMatched: function (oEvent) {
			//this.firstTwoDisplay();
		},
		onNavButtonPress: function(){
			this.oRouter.navTo("CustomerLanding");
		}
	});
});
