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
], function (
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

	return BaseController.extend("sap.ui.demo.cart.controller.productSearch", {
		formatter : formatter,
		onInit: function () {
			this._oRouter = this.getOwnerComponent().getRouter();
			this._oRouter.getRoute("productSearch").attachMatched(this._onRouteMatched, this);
			this._oLocalModel = this.getOwnerComponent().getModel("local");
		},
		_onRouteMatched: function(oEvent) {
			//alert("yo");
			//debugger;
			//if previous route is search then only we search
			var oList = this.getView().byId("gridList")
			// oList.bindItems({
			// 	path : '/Products',
			// 	parameters: {
		  //      expand: "ToPhotos",
			// 		 top: 1
		  //   }
			// });
			oList.attachUpdateFinished(this.counter, this);
		},
		allImageURLs: [],
		counter: function(oEvent){
			// debugger;
			var items = oEvent.getSource().getItems();
			var oLocal = this.getView().getModel("local");
			var oDataModel = this.getView().getModel();
			for (var i = 0; i < items.length; i++) {
			 var sPath = items[i].getBindingContextPath();
			 var sImage = sPath + "/ToPhotos/0/Content" ;
			 var sUrl = formatter.getImageUrlFromContent(oDataModel.getProperty(sImage));
			 if(!this.allImageURLs[sImage]){
				 	this.allImageURLs[sImage] =  sUrl;
			 }
			 var sImage = sPath + "/ToPhotos/1/Content" ;
			 var sUrl = formatter.getImageUrlFromContent(oDataModel.getProperty(sImage));
			 if(!this.allImageURLs[sImage]){
				 	this.allImageURLs[sImage] =  sUrl;
			 }
			 debugger;
			 //items[i].setIcon(sUrl);
			 items[i].getContent()[1].getItems()[0].setSrc(sUrl);
			}
		},
		onImageOut: function(oEvent){
			var sPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
			var sImage = sPath + "/ToPhotos/1/Content" ;
			oEvent.getSource().setSrc(this.allImageURLs[sImage]);
		},
		rollback: "",
		rollback2: "",
		pimage: "",
		onImageIn: function(oEvent){
				var sPath = oEvent.getSource().getParent().getParent().getBindingContextPath();
				var sImage = sPath + "/ToPhotos/0/Content" ;
				oEvent.getSource().setSrc(this.allImageURLs[sImage]);
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
		closeWeights: function(oEvent){
			var selectedItems = oEvent.getParameter("selectedItems");
			if(selectedItems.length > 0){

			}else{
				this.oBtn.setPressed(false);
			}
			if(this.oBtn.getPressed()){
				this.oBtn.setIcon("sap-icon://delete");
				this.oBtn.setType("Emphasized");
				this.addProductToCart(this.oBtn.getParent().getModel().getProperty(this.sPath));
			}else{
				this.oBtn.setIcon("sap-icon://cart-3");
				this.oBtn.setType("Default");
				this.removeProductFromCart(this.oBtn.getParent().getModel().getProperty(this.sPath));
			}
		},
		selectedWeights: function(oEvent){
			debugger;
			var selectedItems = oEvent.getParameter("selectedItems");
			if(selectedItems.length > 0){

			}else{
				this.oBtn.setPressed(false);
			}
			if(this.oBtn.getPressed()){
				this.oBtn.setIcon("sap-icon://delete");
				this.oBtn.setType("Emphasized");
				this.addProductToCart(this.oBtn.getParent().getModel().getProperty(this.sPath));
			}else{
				this.oBtn.setIcon("sap-icon://cart-3");
				this.oBtn.setType("Default");
				this.removeProductFromCart(this.oBtn.getParent().getModel().getProperty(this.sPath));
			}
		},
		onAddToCart: function(oEvent){
     debugger;
			var oBtn = oEvent.getSource();
			//get binding path of parent list item
			var sPath = oBtn.getParent().getBindingContext().getPath();
			this.oBtn = oBtn;
			this.sPath = sPath;
			var that = this;
			this.loadProdWeights(sPath.split("'")[sPath.split("'").length - 2]).
			then(function(){
				debugger;
				var oDialog = new SelectDialog({
					title: "Select weights",
					multiSelect: true,
					confirm: that.selectedWeights.bind(that),
					close: that.closeWeights.bind(that)
				});
				that.getView().addDependent(oDialog);
				oDialog.setModel(that._oLocalModel);
				oDialog.bindAggregation("items",{
					path : "/ProdWeights",
					template: new sap.m.DisplayListItem({
						label: "{NetWeight} gm",
						value: "{Amount} INR"
					})
				});
				oDialog.open();
			});



		},
		onCartClick: function(oEvent){
			debugger;
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
			//this.lastTwoDisplay();
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
			debugger;
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
