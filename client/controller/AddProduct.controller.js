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
		onPopUpSearch: function(oEvent) {
			var searchStr = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("ProductId", sap.ui.model.FilterOperator.Contains, searchStr)//,
				]
			});
			var oPopup = oEvent.getSource();
			oPopup.getBinding("items").filter(oFilter);
		},
		setAvailableProductCode: function(){
			this.pattern = this.getView().getModel("local").getProperty("/ManufacturerData/Pattern");
			//read count of all products for current supplier
			var oFilter1 = new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, "'" + this.createdBy + "'");
			var that = this;
			that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
			 "/Products/$count", "GET", {
					filters: [oFilter1]
				}, {}, that)
				.then(function(count) {
					count = parseInt(count) + 1;
					that.getView().byId("idName").setValue(that.pattern + "_" + count.toString());
			});

		},
		_routePatternMatched: function(){
				//remove categories not set for Manufacturers
				this.loadCategories(this.getView().getModel("local").getProperty("/ManufacturerData/Categories"));
				//pattern to set
				if(this.getOwnerComponent().getModel('local').getProperty('/Authorization')===""){
					this.logOutApp();
				}
				this.lastTwoDisplay();
				this.createdBy = this.getView().getModel("local").getProperty("/CurrentUser");
				this.setAvailableProductCode();
		},
		onCancel: function(){

			if(this.cancelSave() === true){
				this._oLocalModel.setProperty("/Product",{
					"id":"",
					"ProductId": "",
					"Name": "",
					"Category": this.getView().byId("idCat").getSelectedKey(),
					"SubCategory": this.getView().byId("idSubCat").getSelectedKey(),
					"Type": "S",
					"PairType": 2,
					"ShortDescription": "null",
					"ItemType": "G",
					"Karat": "22/22",
					"Gender": "F",
					"OverallStatus": "N",
					"ProdStatus":"A",
					"HindiName": "",
					"Tunch": 0,
					"Wastage": 0,
					"Making": 0,
					"ApprovedOn": "",
					"AlertQuantity": 0,
					"CreatedBy": "",
					"CreatedOn": "",
					"ChangedBy": "",
					"ChangedOn": ""
				});
				this.mode = "Create";
				this.setMode();
				this.setAvailableProductCode();
			}

		},
		onChange: function(){
			this.getView().getModel("local").setProperty("/checkChange", true);
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
			if(this.mode === "Edit"){
				delete productPayload.ToChangedBy;
				delete productPayload.ToCreatedBy;
				delete productPayload.ToOrder;
				delete productPayload.ToPhotos;
				delete productPayload.ToWeights;
				console.log(productPayload);
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
				    "/Products(\'"+ productPayload.id +"\')", "PUT", {}, productPayload, this)
						.then(function(data) {
							that.performCameraSave(productPayload.id);
							MessageToast.show("Product Updated Successfully");
							that.getView().getModel("local").setProperty("/checkChange", false);
							that.mode = "Edit";
							that.setMode();
						}).catch(function(oError) {
							MessageBox.error("Error while saving product data");
						});
			}else{
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
											that2.getView().getModel("local").setProperty("/Product", data);
											that2.getView().getModel("local").setProperty("/checkChange", false);
											that2.mode = "Edit";
											that2.setMode();
										}).catch(function(oError) {
											MessageBox.error("Error while saving product data");
										});
						}
				});
			}


	},
			onProductValueHelp: function(oEvent){
       debugger;
			 if (!this.ProductsearchPopup) {
				 this.ProductsearchPopup = new sap.ui.xmlfragment("sap.ui.demo.cart.fragments.popup0", this);
				 this.getView().addDependent(this.ProductsearchPopup);
				 var title = this.getView().getModel("i18n").getProperty("Products");
				 this.ProductsearchPopup.setTitle(title);
				 var oFilter1 = new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, "'" + this.createdBy + "'");
				 this.ProductsearchPopup.bindAggregation("items", {
					 path: '/Products',
					 filters: [oFilter1],
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
    	    this.getView().byId("idName").fireSubmit();
  	  },
			onEnter: function(oEvent){
				var that = this;
				var sValue = this.getView().byId("idName").getValue().toUpperCase();
				this.getView().byId("idName").setValue(sValue);
				var Filter1 = new sap.ui.model.Filter("ProductId", "EQ", sValue);
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Products", "GET", {
						filters: [Filter1]
					}, {}, this)
					.then(function(oData) {
						if (oData.results.length != 0) {
							if(oData.results[0].CreatedBy === that.createdBy){
								MessageToast.show("Product Already Exist");
								that.loadProductData(oData.results[0].id);
								that.getView().getModel("local").setProperty("/Product",oData.results[0]);
								that.mode = "Edit";
								that.setMode();
							}else{
								MessageToast.show("Product Already Exist, Please choose a different name");
							}
					}else{
						MessageToast.show("Create as new product");
						that.getView().byId("idPName").focus();
					}
				});
				this.getView().byId("idPName").focus();
			},
			onEnterRemark:function(){
				this.getView().byId("idCat").focus();
			},
			onEnterCat:function(){
				this.getView().byId("idSubCat").focus();
			},
			onEnterSubCat:function(){
				this.getView().byId("idType").focus();
			},
			onEnterType:function(){
				this.getView().byId("idPairType").focus();
			},
			onEnterPairType:function(){
				this.getView().byId("idSD").focus();
			},
			onMaking:function(){
				this.getView().byId("idCat").focus();
			},
			onWastage:function(){
				this.getView().byId("idMkg").focus();
			},
			onTunch:function(){
				this.getView().byId("idWastage").focus();
			},
			onGender:function(){
				this.getView().byId("idTunch").focus();
			},
			onKarat:function(){
				this.getView().byId("idGender").focus();
			},
			onSD:function(){
				this.getView().byId("idCat").focus();
			},
			onPairType:function(){
				this.getView().byId("idKarat").focus();
			},
			onCat:function(){
				this.getView().byId("idSubCat").focus();
			},
			onSubCat:function(){
				this.getView().byId("idType").focus();
			},
			onType:function(){
				this.getView().byId("idPairType").focus();
			}

	});
});
