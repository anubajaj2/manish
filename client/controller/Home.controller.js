sap.ui.define([
	"./BaseController",
	"../model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device"
], function (
	BaseController,
	formatter,
	Filter,
	FilterOperator,
	Device) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Home", {
		formatter : formatter,

		onInit: function () {
			var oComponent = this.getOwnerComponent();
			this._router = oComponent.getRouter();
			this._router.getRoute("categories").attachMatched(this._onRouteMatched, this);
		},

		_onRouteMatched: function() {
			// var bSmallScreen = this.getModel("appView").getProperty("/smallScreenMode");
			// if (bSmallScreen) {
			// 	this._setLayout("One");
			// }
			var that = this;
			// this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/ProductCategories",
			// 									"POST", {}, {
			// 										"Category": "Gold",
			// 										"CategoryName": "Gold Set",
			// 										"NumberOfProducts": 2
			// 									}, this).then(function(data){
			// 										that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
			// 										 "/Products",
			// 																			"POST", {}, {
			// 																				"Category": data.id,
			// 																				"ProductId": "SET1",
			// 																				"Name": "Set 1",
			// 																				"ShortDescription":"demo set",
			// 																				"SupplierName": "Bajaj & Co.",
			// 																				"Weight":"150",
			// 																				"WeightUnit": "gm",
			// 																				"Price":"15000",
			// 																				"Status":"A",
			// 																				"CurrencyCode":"",
			// 																				"PictureUrl": "https://5.imimg.com/data5/JJ/CP/MY-3749260/bridal-gold-necklace-set-500x500.jpg"
			// 																			}, that);
			// 																				alert("aaya");
			// 									});

		},

		onSearch: function () {
			this._search();
		},

		onRefresh: function () {
			// trigger search again and hide pullToRefresh when data ready
			var oProductList = this.byId("productList");
			var oBinding = oProductList.getBinding("items");
			var fnHandler = function () {
				this.byId("pullToRefresh").hide();
				oBinding.detachDataReceived(fnHandler);
			}.bind(this);
			oBinding.attachDataReceived(fnHandler);
			this._search();
		},

		_search: function () {
			var oView = this.getView();
			var oProductList = oView.byId("productList");
			var oCategoryList = oView.byId("categoryList");
			var oSearchField = oView.byId("searchField");

			// switch visibility of lists
			var bShowSearchResults = oSearchField.getValue().length !== 0;
			oProductList.setVisible(bShowSearchResults);
			oCategoryList.setVisible(!bShowSearchResults);

			// filter product list
			var oBinding = oProductList.getBinding("items");
			if (oBinding) {
				if (bShowSearchResults) {
					var oFilter = new Filter("Name", FilterOperator.Contains, oSearchField.getValue());
					oBinding.filter([oFilter]);
				} else {
					oBinding.filter([]);
				}
			}
		},

		onCategoryListItemPress: function (oEvent) {
			var oBindContext = oEvent.getSource().getBindingContext();
			var oModel = oBindContext.getModel();
			var sCategoryId = oModel.getData(oBindContext.getPath()).id;

			this._router.navTo("category", {id: sCategoryId});
			this._unhideMiddlePage();
		},

		onProductListSelect: function (oEvent) {
			var oItem = oEvent.getParameter("listItem");
			this._showProduct(oItem);
		},

		onProductListItemPress: function (oEvent) {
			var oItem = oEvent.getSource();
			this._showProduct(oItem);
		},

		_showProduct: function (oItem) {
			var oEntry = oItem.getBindingContext().getObject();

			this._router.navTo("product", {
				id: oEntry.Category,
				productId: oEntry.ProductId
			}, !Device.system.phone);
		},

		/**
		 * Always navigates back to home
		 * @override
		 */
		onBack: function () {
			this.getRouter().navTo("home");
		}
	});
});
