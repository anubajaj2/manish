sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/HTML",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/f/LayoutType"
], function(BaseController, UIComponent, JSONModel, HTML, MessageToast, MessageBox, LayoutType) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.AddProduct", {
		onInit: function () {
			debugger;
			this._oRouter = UIComponent.getRouterFor(this);

				this._oRouter.getRoute("AddProduct").attachMatched(this._routePatternMatched, this);
				this._oLocalModel = this.getOwnerComponent().getModel("local");
				this.a = this.getOwnerComponent().getModel("local").getProperty("/Product");

		},
		_routePatternMatched: function(){
			debugger;
				this.loadCategories();
				this.lastTwoDisplay();
<<<<<<< HEAD
//<<<<<<< HEAD

		},

//=======
=======
<<<<<<< HEAD

		},

=======
>>>>>>> 693b65b0b03054ea3340e77e81a1a87f95e6a1ac
		},
		onCancel: function(){
			this.cancelSave();
		},
<<<<<<< HEAD
//>>>>>>> 9a4414c2878eb74b8ca9188fd7f6a7fa45cf6b63
=======
>>>>>>> 9a4414c2878eb74b8ca9188fd7f6a7fa45cf6b63
>>>>>>> 693b65b0b03054ea3340e77e81a1a87f95e6a1ac
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
<<<<<<< HEAD
//<<<<<<< HEAD

			//Product Id Cannot be Duplicated
//=======
			productPayload.GrossWeight = this.getView().getModel("local").getProperty("/ProdWeights")[0].GrossWeight;
			//		Product Id Cannot be Duplicated
//>>>>>>> 9a4414c2878eb74b8ca9188fd7f6a7fa45cf6b63
=======
<<<<<<< HEAD

			//Product Id Cannot be Duplicated
=======
			productPayload.GrossWeight = this.getView().getModel("local").getProperty("/ProdWeights")[0].GrossWeight;
			//		Product Id Cannot be Duplicated
>>>>>>> 9a4414c2878eb74b8ca9188fd7f6a7fa45cf6b63
>>>>>>> 693b65b0b03054ea3340e77e81a1a87f95e6a1ac
			var Filter1 = new sap.ui.model.Filter("ProductId", "EQ", this.getView().byId("idName").getValue());

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			    "/Products", "GET", {	filters: [Filter1] }, {}, this)
				.then(function(oData) {
					if (oData.results.length != 0) {
						var result = that.validateProductData();
						if (result.status) {
							var	sPath = "/Products";
							sPath = sPath + "(" + "\'" + oData.results[0].id + "\'" + ")";
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
								sPath, "PUT", {}, productPayload, that)
								.then(function(data) {
									MessageToast.show("Product edited");
								}).catch(function(oError) {
									MessageToast.show("Cannot edit the data");
								});
							}
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
<<<<<<< HEAD

=======
>>>>>>> 9a4414c2878eb74b8ca9188fd7f6a7fa45cf6b63
			onProductValueHelp: function(oEvent){
       debugger;
			 if (!this.ProductsearchPopup) {
				 this.ProductsearchPopup = new sap.ui.xmlfragment("sap.ui.demo.cart.fragments.popup0", this);
				 this.getView().addDependent(this.ProductsearchPopup);
				 var title = this.getView().getModel("i18n").getProperty("Products");
				 this.ProductsearchPopup.setTitle(title);
				 this.ProductsearchPopup.bindAggregation("items", {
					 path: '/Products',
					 template: new sap.m.DisplayListItem({
						 label: "{ProductId}"
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
<<<<<<< HEAD
//<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 693b65b0b03054ea3340e77e81a1a87f95e6a1ac
						that.getView().byId("idName").setProperty("editable", false );
						that.getView().byId("idPName").setValue(oData.results[0].Name);
						that.getView().byId("idCat").setSelectedKey(oData.results[0].Category);
						that.getView().byId("idSubCat").setSelectedKey(oData.results[0].SubCategory);
<<<<<<< HEAD
//=======
					  that.loadProductData(oData.results[0].id);
	//					that.getView().byId("idCat").setValue(oData.results[0].Category);
		//				that.getView().byId("idSubCat").setValue(oData.results[0].SubCategory);
						that.getView().byId("idType").setValue(oData.results[0].Type);
//>>>>>>> 9a4414c2878eb74b8ca9188fd7f6a7fa45cf6b63
=======
=======
					  that.loadProductData(oData.results[0].id);
						that.getView().byId("idCat").setValue(oData.results[0].Category);
						that.getView().byId("idSubCat").setValue(oData.results[0].SubCategory);
						that.getView().byId("idType").setValue(oData.results[0].Type);
>>>>>>> 9a4414c2878eb74b8ca9188fd7f6a7fa45cf6b63
>>>>>>> 693b65b0b03054ea3340e77e81a1a87f95e6a1ac
						that.getView().byId("idPairType").setValue(oData.results[0].PairType);
						that.getView().byId("idSD").setSelectedKey(oData.results[0].ShortDescription);
						that.getView().byId("idKarat").setSelectedKey(oData.results[0].Karat);
						that.getView().byId("idTunch").setValue(oData.results[0].Tunch);
						that.getView().byId("idWastage").setValue(oData.results[0].Wastage);
						that.getView().byId("idMkg").setValue(oData.results[0].Making);
					}
				});
			},

			onClear: function(oEvent){
				debugger;

						this.getView().byId("idName").setValue("");
						this.getView().byId("idPName").setValue("null");
						this.getView().byId("idName").setProperty("editable", true );
            this.getView().byId("idCat").setSelectedKey("");
						this.getView().byId("idSubCat").setSelectedKey("");
						this.getView().byId("idType").setSelectedKey("");
						this.getView().byId("idPairType").setSelectedKey("2");
						this.getView().byId("idSD").setValue("null");
						this.getView().byId("idGender").setSelectedKey("");
						this.getView().byId("idKarat").setSelectedKey("");
						this.getView().byId("idTunch").setValue("0");
						this.getView().byId("idWastage").setValue("0");
						this.getView().byId("idMkg").setValue("0");

			}
	});
});
