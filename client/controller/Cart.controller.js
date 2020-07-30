sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device",
	"sap/ui/demo/cart/model/formatter",
	"sap/m/MessageBox"
], function(
	BaseController,
	JSONModel,
	Device,
	formatter,
	MessageBox
) {
	"use strict";

	var sCartModelName = "local";
	var sSavedForLaterEntries = "savedForLaterEntries";
	var sCartEntries = "cartEntries";

	return BaseController.extend("sap.ui.demo.cart.controller.Cart", {
		formatter: formatter,

		onInit: function () {
			debugger;
			this._oRouter = this.getOwnerComponent().getRouter();
			this._oRouter.attachRoutePatternMatched(this._routePatternMatched,this);
			//this._oRouter.getRoute("cart").attachMatched(this._routePatternMatched, this);
			// // set initial ui configuration model
			var oCfgModel = new JSONModel({});
			this.getView().setModel(oCfgModel, "cfg");
			this._toggleCfgModel();
		},

		onExit: function () {
			debugger;
			if (this._orderDialog) {
				this._orderDialog.destroy();
			}
			if (this._orderBusyDialog) {
				this._orderBusyDialog.destroy();
			}
		},
		onBack: function(){
			debugger;
			this._oRouter.navTo("productSearch");
		},
		_routePatternMatched: function () {
			debugger;
			//this._setLayout("Three");
			var oCartModel = this.getModel("local");
			var oCartEntries = oCartModel.getProperty("/cartItems");
			//enables the proceed and edit buttons if the cart has entries
			if (Object.keys(oCartEntries).length > 0) {
				oCartModel.setProperty("/showProceedButton", true);
				oCartModel.setProperty("/showEditButton", true);
			}else{
				oCartModel.setProperty("/showProceedButton", false);
				oCartModel.setProperty("/showEditButton", false);
			}
			//set selection of list back
			var oEntryList = this.byId("entryList");
			oEntryList.removeSelections();
			//this.lastTwoDisplay(this.getView());
			setTimeout(this.loads(this),3000);
		},
		loads: function () {
			debugger;
				this.lastTwoDisplay(this.getView());
		},
		onCartItemDelete: function(oEvent){
			debugger;
			var oObj = oEvent.getParameter("listItem").getModel("local").getProperty(oEvent.getParameter("listItem").getBindingContextPath());
			var productId = oObj.id;
  		this.removeProductFromCart(oObj);
		},
		removeProductFromCart: function(productRec){
			var cartItems = this.getOwnerComponent().getModel("local").getProperty("/cartItems");
			var allWeightsSel = this.getOwnerComponent().getModel("local").getProperty("/addedWeights");

			for (var j = 0; j < allWeightsSel.length; j++) {
				if (allWeightsSel[j].id === productRec.WeightId ){
					allWeightsSel.splice(j,1);
					break;
				}
			}

			for (var i = 0; i < cartItems.length; i++) {
				if(cartItems[i].WeightId === productRec.WeightId){
					cartItems.splice(i,1);
					break;
				}
			}
			this.getOwnerComponent().getModel("local").setProperty("/cartItems", cartItems);
			this.getOwnerComponent().getModel("local").setProperty("/addedWeights", allWeightsSel);
		},
		getGridItemById: function(productId){
			debugger;
			var gridList = sap.ui.getCore().byId("__component0---productSearch--gridList").getItems();
			for (var i = 0; i < gridList.length; i++) {
				if(gridList[i].getBindingContextPath().indexOf(productId) != -1){
					return gridList[i];
				}
			}
		},
		getButtonInsideGrid: function(productId){
			debugger;
			var oItem = this.getGridItemById(productId);
			return oItem.getContent()[2].getItems()[0];
		},
		onEditOrDoneButtonPress: function () {
			debugger;
			this._toggleCfgModel();
		},

		_toggleCfgModel: function () {
			debugger;
			var oCfgModel = this.getView().getModel("cfg");
			var oData = oCfgModel.getData();
			var oBundle = this.getResourceBundle();
			var bDataNoSetYet = !oData.hasOwnProperty("inDelete");
			var bInDelete = (bDataNoSetYet ? true : oData.inDelete);
			var sPhoneMode = (Device.system.phone ? "None" : "SingleSelectMaster");
			var sPhoneType = (Device.system.phone ? "Active" : "Inactive");

			oCfgModel.setData({
				inDelete: !bInDelete,
				notInDelete: bInDelete,
				listMode: (bInDelete ? sPhoneMode : "Delete"),
				listItemType: (bInDelete ? sPhoneType : "Inactive"),
				pageTitle: (bInDelete ? oBundle.getText("appTitle") : oBundle.getText("cartTitleEdit"))
			});
		},

		onEntryListPress: function (oEvent) {
			debugger;
			this._showProduct(oEvent.getSource());
		},

		onEntryListSelect: function (oEvent) {
			debugger;
			this._showProduct(oEvent.getParameter("listItem"));
		},

		/**
		 * Called when the "save for later" link of a product in the cart is pressed.
		 * @public
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		onSaveForLater: function (oEvent) {
			debugger;
			var oBindingContext = oEvent.getSource().getBindingContext(sCartModelName);
			this._changeList(sSavedForLaterEntries, sCartEntries, oBindingContext);
		},

		/**
		 * Called when the "Add back to basket" link of a product in the saved for later list is pressed.
		 * @public
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		onAddBackToBasket: function (oEvent) {
			debugger;
			var oBindingContext = oEvent.getSource().getBindingContext(sCartModelName);

			this._changeList(sCartEntries, sSavedForLaterEntries, oBindingContext);
		},

		/**
		 * Moves a product from one list to another.
		 * @private
		 * @param {string} sListToAddItem Name of list, where item should be moved to
		 * @param {string} sListToDeleteItem Name of list, where item should be removed from
		 * @param {Object} oBindingContext Binding context of product
		 */
		_changeList: function (sListToAddItem, sListToDeleteItem, oBindingContext) {
			debugger;
			var oCartModel = oBindingContext.getModel();
			var oProduct = oBindingContext.getObject();
			var oModelData = oCartModel.getData();
			// why are the items cloned? - the JSON model checks if the values in the object are changed.
			// if we do our modifications on the same reference, there will be no change detected.
			// so we modify after the clone.
			var oListToAddItem = Object.assign({}, oModelData[sListToAddItem]);
			var oListToDeleteItem = Object.assign({}, oModelData[sListToDeleteItem]);
			var sProductId = oProduct.ProductId;

			// find existing entry for product
			if (oListToAddItem[sProductId] === undefined) {
				// copy new entry
				oListToAddItem[sProductId] = Object.assign({}, oProduct);
			}

			//Delete the saved Product from cart
			delete oListToDeleteItem[sProductId];
			oCartModel.setProperty("/" + sListToAddItem, oListToAddItem);
			oCartModel.setProperty("/" + sListToDeleteItem, oListToDeleteItem);
		},

		_showProduct: function (oItem) {
			debugger;
			var oEntry = oItem.getBindingContext(sCartModelName).getObject();

			// close cart when showing a product on phone
			var bCartVisible = false;
			if (!Device.system.phone) {
				bCartVisible = this.getModel("appView").getProperty("/layout").startsWith("Three");
			} else {
				bCartVisible = false;
				this._setLayout("Two");
			}
			this._oRouter.navTo(bCartVisible ? "productCart" : "product", {
				id: oEntry.Category,
				productId: oEntry.ProductId
			}, !Device.system.phone);
		},

		onCartEntriesDelete: function (oEvent) {
			debugger;
			this._deleteProduct(sCartEntries, oEvent);
		},

		onSaveForLaterDelete: function (oEvent) {
			debugger;
			this._deleteProduct(sSavedForLaterEntries, oEvent);
		},

		/**
		 * Helper function for the deletion of items from <code>cart</code> or <code>savedForLater</code> list.
		 * If the delete button is pressed, a message dialog will open.
		 * @private
		 * @param {string} sCollection the collection name
		 * @param {sap.ui.base.Event} oEvent Event object
		 */
		_deleteProduct: function (sCollection, oEvent) {
			debugger;
			var oBindingContext = oEvent.getParameter("listItem").getBindingContext(sCartModelName);
			var sEntryId = oBindingContext.getObject().ProductId;
			var oBundle = this.getResourceBundle();

			// show confirmation dialog
			MessageBox.show(oBundle.getText("cartDeleteDialogMsg"), {
				title: oBundle.getText("cartDeleteDialogTitle"),
				actions: [
					MessageBox.Action.DELETE,
					MessageBox.Action.CANCEL
				],
				onClose: function (oAction) {
					debugger;
					if (oAction !== MessageBox.Action.DELETE) {
						return;
					}
					var oCartModel = oBindingContext.getModel("local");
					var oCollectionEntries = Object.assign({}, oCartModel.getData()[sCollection]);

					delete oCollectionEntries[sEntryId];

					// update model
					oCartModel.setProperty("/" + sCollection, Object.assign({}, oCollectionEntries));
				}
			});
		},

		/**
		 * Called when the proceed button in the cart is pressed.
		 * Navigates to the checkout wizard
		 * @public
		 */
		onProceedButtonPress: function () {
debugger;

			this.getRouter().navTo("checkout");
		}
	});
});
