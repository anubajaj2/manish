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
			//read sub categories
			var aItems2 = this.getView().getParent().getParent().getBeginColumnPages()[0].getContent()[0].getContent()[0].getItems();
			for (var i = 0; i < aItems2.length; i++) {
				if(aItems2[i].hasStyleClass("colorGreen")){
					aFilter.push(new Filter("SubCategory",FilterOperator.EQ,
					aItems2[i].getLabel()
					));
				}
			}
			//read range Value low and high
			var aRange = oView.byId("range").getRange();
			aFilter.push(new Filter("GrossWeight",FilterOperator.BT, aRange[0], aRange[1]));
			//read the type
			if(oView.byId("togPlain").getPressed()){
				aFilter.push(new Filter("Type",FilterOperator.EQ,"PLAIN"));
			}
			if(oView.byId("togStudded").getPressed()){
				aFilter.push(new Filter("Type",FilterOperator.EQ,"STUDDED"));
			}
			var oFilter = new Filter({
				filters: aFilter,
				and:false
			});
			//set filter
			this.getOwnerComponent().getModel("local").setProperty("/searchFilter", oFilter);
			
			this.getRouter().navTo("productSearch");

		},
		onClear: function(){

		},
		onInit: function () {
			this.getRouter().attachRouteMatched(this._onRouteMatched, this);
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

		}
	});
});
