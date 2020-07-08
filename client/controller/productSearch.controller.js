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
	"sap/m/MessageBox"
], function (
	BaseController,
	formatter,
	Device,
	Filter,
	FilterOperator,
	MessageToast,
	JSONModel,
	Fragment,
	Image, Dialog, Carousel, Button, MessageBox) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.productSearch", {
		formatter : formatter,
		onInit: function () {
			this._oRouter = this.getOwnerComponent().getRouter();
			this._oRouter.getRoute("productSearch").attachMatched(this._onRouteMatched, this);

		},
		_onRouteMatched: function() {
			//alert("yo");
			//debugger;
		},
		onImageOut: function(oEvent){
			oEvent.getSource().setSrc("https://5.imimg.com/data5/RU/WR/MY-8087605/kundan-meena-set-500x500.jpg");
		},
		onImageIn: function(oEvent){
			oEvent.getSource().setSrc("https://img5.cfcdn.club/5e/cb/5ef37886b3ad099ddb939520191ec4cb_350x350.jpg");
		},
		addProductToCart: function(productRec){
			var cartItems = this.getOwnerComponent().getModel("local").getProperty("/cartItems");
			productRec.ProductPicUrl = "https://img5.cfcdn.club/5e/cb/5ef37886b3ad099ddb939520191ec4cb_350x350.jpg";
			productRec.Qty = parseInt(1);
			cartItems.push(productRec);
			this.getOwnerComponent().getModel("local").setProperty("/cartItems", cartItems);
		},
		removeProductFromCart: function(productRec){
			var cartItems = this.getOwnerComponent().getModel("local").getProperty("/cartItems");
			for (var i = 0; i < cartItems.length; i++) {
				if(cartItems[i].id === productRec.id){
					cartItems.splice(i,1);
					break;
				}
			}
			this.getOwnerComponent().getModel("local").setProperty("/cartItems", cartItems);
		},
		onAddToCart: function(oEvent){
			var oBtn = oEvent.getSource();
			//get binding path of parent list item
			var sPath = oBtn.getParent().getBindingContext().getPath();

			if(oBtn.getPressed()){
				oBtn.setIcon("sap-icon://delete");
				oBtn.setType("Emphasized");
				this.addProductToCart(oBtn.getParent().getModel().getProperty(sPath));
			}else{
				oBtn.setIcon("sap-icon://cart-3");
				oBtn.setType("Default");
				this.removeProductFromCart(oBtn.getParent().getModel().getProperty(sPath));
			}
		},
		onCartClick: function(oEvent){
			// var oButton = oEvent.getSource();
			// // create popover
			// if (!this._oPopoverCart) {
			// 	Fragment.load({
			// 		id: "popoverCart",
			// 		name: "sap.ui.demo.cart.fragments.cartDetails",
			// 		controller: this
			// 	}).then(function(oPopover){
			// 		this._oPopoverCart = oPopover;
			// 		this.getView().addDependent(this._oPopover);
			// 		this._oPopoverCart.setModel(
			// 			this.getOwnerComponent().getModel("local"),
			// 			"local"
			// 		);
			// 		this._oPopoverCart.openBy(oButton);
			// 	}.bind(this));
			// } else {
			// 	this._oPopoverCart.openBy(oButton);
			// }
			this.lastTwoDisplay();
			this.getRouter().navTo("comparisonCart");
		},
		getGridItemById: function(productId){
			var gridList = this.getView().byId("gridList").getItems();
			for (var i = 0; i < gridList.length; i++) {
				if(gridList[i].getBindingContextPath().indexOf(productId) != -1){
					return gridList[i];
				}
			}
		},
		getButtonInsideGrid: function(productId){
			var oItem = this.getGridItemById(productId);
			return oItem.getContent()[2].getItems()[0];
		},
		alldeleted:[],
		onCartItemDelete: function(oEvent){
			var oObj = oEvent.getParameter("listItem").getModel("local").getProperty(oEvent.getParameter("listItem").getBindingContextPath());
			var productId = oObj.id;
			//sPath = sPath.split("'")[1];
			//oEvent.getSource().removeItem(oEvent.getParameter("listItem"));
			 this.removeProductFromCart(oObj);
			 var oBtn = this.getButtonInsideGrid(productId);
			 oBtn.setIcon("sap-icon://cart-3");
			 oBtn.setType("Default");
			 oBtn.setPressed(false);
		},
		onOrder: function(){
			MessageToast.show("Order has been sent for approval, please check your email!");
		},
		onCloseCart: function(){
			this._oPopoverCart.close();
		},
		afterCartClose: function(){
			this._oPopoverCart.destroy();
			this._oPopoverCart = null;
		},
		onImageOpen: function(){
			if (!this.pressDialog) {
				this.pressDialog = new Dialog({
					title: "Available Images",
					stretch: true,
					content: new Carousel({
						pages:[
								new Image({src : "https://5.imimg.com/data5/RU/WR/MY-8087605/kundan-meena-set-500x500.jpg"}),
								new Image({src : "https://img5.cfcdn.club/5e/cb/5ef37886b3ad099ddb939520191ec4cb_350x350.jpg"})
						]
					}),
					beginButton: new Button({
						type: "Emphasized",
						text: "Close",
						press: function () {
							this.pressDialog.close();
						}.bind(this)
					})
				});

				//to get access to the global model
				this.getView().addDependent(this.pressDialog);
			}

			this.pressDialog.open();
		},
		onFullScreen: function(){
			this.getRouter().navTo("comparisonCart");
		},
		onSelectProduct: function(oEvent){
			//popover of product details
			var oButton = oEvent.getSource();
			//get binding path of parent list item
			var sPath = oButton.getParent().getBindingContext().getPath();

			if (!this._oPopover) {
				Fragment.load({
					name: "sap.ui.demo.cart.fragments.productDetails",
					controller: this
				}).then(function(oPopover){
					this._oPopover = oPopover;
					this.getView().addDependent(this._oPopover);
					this._oPopover.bindElement(sPath);
					this._oPopover.openBy(oButton);
				}.bind(this));
			} else {
				this._oPopover.bindElement(sPath);
				this._oPopover.openBy(oButton);
			}

		},
		handleCloseButton: function(){
			this._oPopover.close();
		},
		onExit : function () {
			if (this._oPopover) {
				this._oPopover.destroy();
			}
		},
		onRefresh: function () {
			// trigger search again and hide pullToRefresh when data ready
			var oProductList = this.byId("gridList");
			var bShowSearchResults = false;
			var oBinding = oProductList.getBinding("items");
			var fnHandler = function () {
				//this.byId("pullToRefresh").hide();
				oBinding.detachDataReceived(fnHandler);
			}.bind(this);
			oBinding.attachDataReceived(fnHandler);

			if (oBinding) {
				if (bShowSearchResults) {
					var oFilter = new Filter("Name", FilterOperator.Contains, oSearchField.getValue());
					oBinding.filter([oFilter]);
				} else {
					oBinding.filter([]);
				}
			}
		},
		/**
		 * Always navigates back to category overview
		 * @override
		 */
		onBack: function () {
			this.getRouter().navTo("categories");
		}
	});
});
