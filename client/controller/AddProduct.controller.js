sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/HTML",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function(BaseController, UIComponent, JSONModel, HTML, MessageToast, MessageBox) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.AddProduct", {
		onInit: function () {
			this._oRouter = UIComponent.getRouterFor(this);

			var oC = new JSONModel({
					"images": []
				});
				this.getView().setModel(oC, "C");
				this.a = [];
				this._oRouter.getRoute("AddProduct").attachMatched(this._routePatternMatched, this);
				this._oLocalModel = this.getOwnerComponent().getModel("local");

		},
		_routePatternMatched: function(){
				this.loadCategories();
				this.lastTwoDisplay();
		},
		onCancel: function(){
			this.cancelSave();
		},
		onSave: function() {
      var that = this;
			var productPayload = this._oLocalModel.getProperty("/Product");
			var a = productPayload.ProductId;
			var result = that.validateProductData();
			if (result.status === false) {
				MessageBox.error(result.error);
				return;
			}
			productPayload.ProductId = a.toUpperCase();
			productPayload.Tunch = parseFloat(productPayload.Tunch).toFixed(2);
			productPayload.Wastage = parseFloat(productPayload.Wastage).toFixed(0);
			productPayload.GrossWeight = this.getView().getModel("local").getProperty("/ProdWeights")[0].GrossWeight;
			//		Product Id Cannot be Duplicated
			var Filter1 = new sap.ui.model.Filter("ProductId", "EQ", this.getView().byId("idName").getValue());

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			    "/Products", "GET", {	filters: [Filter1] }, {}, this)
				.then(function(oData) {
					if (oData.results.length != 0) {
						MessageBox.error("Product Id Already Exist");
					}else{
						var that2 = that;
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
									"/Products", "POST", {}, productPayload, that)
									.then(function(data) {
										that2.performCameraSave(data.id);
										MessageToast.show("Product Created Successfully");
									}).catch(function(oError) {
										MessageBox.error("Error while saving product data");
									});
					}
			});


	},
			onProductValueHelp: function(oEvent){
       debugger;
			 if (!this.ProductsearchPopup) {
				 this.ProductsearchPopup = new sap.ui.xmlfragment("sap.ui.demo.cart.fragments.popup0", this);
				 this.getView().addDependent(this.ProductsearchPopup);
				 var title = this.getView().getModel("i18n").getProperty("Products");
				 this.ProductsearchPopup.setTitle(title);
				 //var oFilter1 = new sap.ui.model.Filter("Type", sap.ui.model.FilterOperator.EQ, "Kata Center");
				 this.ProductsearchPopup.bindAggregation("items", {
					 path: '/Products',
					// filters: [oFilter1],
					 template: new sap.m.DisplayListItem({
						 label: "{ProductId}"//,
						// value: "{Name} - {city}"
					 })
				 });
			 }
			 this.ProductsearchPopup.open();
		 },

		 onConfirm: function(oEvent){
			   var that = this;
			   //Push the selected product id to the local model
		    	var myData = this.getView().getModel("local").getProperty("/Product");
		     	var selProd = oEvent.getParameter("selectedItem").getLabel();
				 	myData.ProductId = selProd;

		     if(selProd){

		           this.getView().byId("idName").setValueState();
		     }
		   },
			onEnter: function(oEvent){
				debugger;
				var that = this;
				var Filter1 = new sap.ui.model.Filter("ProductId", "EQ", this.getView().byId("idName").getValue().toUpperCase());

				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Products", "GET", {
						filters: [Filter1]
					}, {}, this)
					.then(function(oData) {
						if (oData.results.length != 0) {
					  that.loadProductData(oData.results[0].id);
						that.getView().byId("idCat").setValue(oData.results[0].Category);
						that.getView().byId("idSubCat").setValue(oData.results[0].SubCategory);
						that.getView().byId("idType").setValue(oData.results[0].Type);
						that.getView().byId("idPairType").setValue(oData.results[0].PairType);
						that.getView().byId("idSD").setValue(oData.results[0].ShortDescription);
						that.getView().byId("idGender").setValue(oData.results[0].Gender);
						that.getView().byId("idKarat").setValue(oData.results[0].Karat);
						that.getView().byId("idTunch").setValue(oData.results[0].Tunch);
						that.getView().byId("idWastage").setValue(oData.results[0].Wastage);
						that.getView().byId("idMkg").setValue(oData.results[0].Making);

					}
				});
			}
	});
});
