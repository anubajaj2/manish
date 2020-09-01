sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/demo/cart/model/formatter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/Device",
	"sap/ui/model/json/JSONModel"
], function (
	BaseController,
	formatter,
	Filter,
	FilterOperator,
	Device,
	JSONModel,
) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.Home", {
		formatter : formatter,
		onInit: function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("home").attachMatched(this._onRouteMatched, this);

		},
		_firstTime: true,
		_onRouteMatched: function(oEvent) {
				this.loadCategories();
				//if(this._firstTime){
				this.firstTwoDisplay();
				//		this._firstTime = false;
				//}
		},
		onSearch: function () {
			this._search();
		},
		onGridItemPress: function(oEvent) {
			//alert("ay");
			if(oEvent.getParameter("listItem").hasStyleClass("colorGreen")){
					oEvent.getParameter("listItem").removeStyleClass("colorGreen");
			}else{
				oEvent.getParameter("listItem").addStyleClass("colorGreen");
			}

		},
		onRefresh: function () {
			debugger;
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
			debugger;
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
			debugger;
			var oItem = oEvent.getParameter("listItem");
			this._showProduct(oItem);
		},

		onProductListItemPress: function (oEvent) {
			debugger;
			var oItem = oEvent.getSource();
			this._showProduct(oItem);
		},

		_showProduct: function (oItem) {
			debugger;
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
			debugger;
			this.getRouter().navTo("home");
		}
	});
});
