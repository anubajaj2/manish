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

		ProductCategories:{
			"Category":[],
			"SubCategory":[]
			},
			sl1:{
				"Category":[]
				},
			sl2:{
				"SubCategory":[]
				},

		onInit: function () {
			debugger;
		//	this._router = this.getOwnerComponent().getRouter();
			//this._router.attachRouteMatched(this._onRouteMatched, this);
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.attachRouteMatched(this._onRouteMatched, this);
		//oRouter.getRoute("categories").attachRoutePatternMatched(this._onRouteMatched, this);
			//var oSubCatModel = new JSONModel();
			//this.getView().setModel(oSubCatModel, "view");
			//var oSubCatModel = new JSONModel();

			//	var s13 = this.getView().getModel("view12")	.getData();
			//this.getView().setModel(oSubCatModel, "view12");
			//oSubCatModel.setData({oData:this.s12});
		},


		_onRouteMatched: function(oEvent) {
			debugger;
			//var oParameters = oEvent.getParameters();
      //var sRouteName = oParameters.name; // Yay! Our route name!
			var oLocalModel = this.getView().getModel("local");
			var that = this;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/ProductCategories", "GET", {}, {}, this)
			.then(function(oData){

				for(var i =0 ;i < oData.results.length; i++){
					that.ProductCategories.Category[i] = oData.results[i].Category;
					that.ProductCategories.SubCategory[i] = oData.results[i].SubCategory;
					that.sl1.Category[i] = that.ProductCategories.Category[i];
					that.sl2.SubCategory[i] = that.ProductCategories.SubCategory[i];
				}
					var i = 0;
					var j = 0;
					for(i=0; i<Object.keys(that.sl1.Category).length; i++) {
						for(j=(i+1); j<Object.keys(that.sl1.Category).length; j++) {
							if(that.sl1.Category[i] === that.sl1.Category[j]){
									that.sl1.Category.splice(j--, 1);
								}	} }
						var i = 0;
						var j = 0;
						for(i=0; i<Object.keys(that.sl2.SubCategory).length; i++) {
							for(j=(i+1); j<Object.keys(that.sl2.SubCategory).length; j++) {
								if(that.sl2.SubCategory[i] === that.sl2.SubCategory[j]){
										that.sl2.SubCategory.splice(j--, 1);
									}	}	}
									if (Object.keys(that.sl2.SubCategory).length > 0) {
										var oFilter;
										var aFilter2 = [];
										var that2 = that;
										debugger;
										for (var i = 0; i < Object.keys(that.sl2.SubCategory).length; i++) {
											oFilter = new sap.ui.model.Filter("SubCategory", "EQ", "'" + that.sl2.SubCategory[i] + "'");
											that2.aFilter2.push(oFilter);
										}

										that.getView().byId("idSubCategoryTable").getBinding("items").filter(that2.aFilter2);
}//									var oSubCatModel = new JSONModel();
									//	var s13 = this.getView().getModel("view12")	.getData();
	//								this.getView().getModel(oSubCatModel, "view12");
		//			        oSubCatModel.setData(that.s12);
			}).catch(function(oError) {
//				var oPopover = that.getErrorMessage(oError);
			});

			},

		onSearch: function () {
			debugger;
			this._search();
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
	debugger;

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
