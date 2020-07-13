sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History",
	"sap/ui/demo/cart/model/cart",
	"sap/ui/demo/cart/dbapi/dbapi",
	"sap/f/LayoutType"
], function(Controller, MessageToast, UIComponent, History, cart, ODataHelper, LayoutType) {
	"use strict";


	return Controller.extend("sap.ui.demo.cart.controller.BaseController", {
		cart: cart,
		ODataHelper: ODataHelper,
		cleanApp: function() {
			this.getOwnerComponent().getModel("local").setProperty("/cartItems",[]);
		},
		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		onInit: function () {

		},
		calculateOrderEstimate: function(){
			var allItems = this._oLocalModel.getProperty("/cartItems");
			var totalAmount = 0;
			var totalGm = 0;
			for (var i = 0; i < allItems.length; i++) {
				var fineGold = allItems[i].GrossWeight - allItems[i].StoneWeight;
				fineGold = fineGold * allItems[i].Tunch / 100;
				fineGold = fineGold * parseInt(allItems[i].Qty);
				var makingFee = allItems[i].GrossWeight * ( allItems[i].Making / 10 );
				var amount = ( allItems[i].StonePc * allItems[i].StoneRs ) + allItems[i].OtherFee;
				amount = amount + makingFee;
				amount = amount * parseInt(allItems[i].Qty);
				totalGm = totalGm + fineGold;
				totalAmount = totalAmount + amount;
				fineGold = 0; amount = 0;
			}
			this._oLocalModel.setProperty("/fineGm", totalGm);
			this._oLocalModel.setProperty("/fineRs", totalAmount);
		},
		firstTwoDisplay: function(){
			//this.getModel("local").setProperty("/layout", LayoutType.TwoColumnsMidExpanded);
		},
		lastTwoDisplay: function(oView){

			this.getModel("local").setProperty("/layout", LayoutType.ThreeColumnsMidExpanded);
		},
		getRouter: function () {
			return UIComponent.getRouterFor(this);
		},
		loadCategories: function(){
			var that = this;
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/ProductCategories", "GET", {}, {}, this)
        .then(function(oData) {
          var a = [];
          var b = [];
          for (var i = 0; i < oData.results.length; i++) {
            if (a.indexOf(oData.results[i].Category) === -1) {
              a.push(oData.results[i].Category);
            }
          }

          for (var j = 0; j < a.length; j++) {
            var object = {};
            object.Category = a[j];
            b.push(object);
          }
          //SubCategory
          var c = [];
          var d = [];
          for (var i = 0; i < oData.results.length; i++) {
            if (c.indexOf(oData.results[i].SubCategory) === -1) {
              c.push(oData.results[i].SubCategory);
            }
          }

          for (var j = 0; j < c.length; j++) {
            var object = {};
            object.SubCategory = c[j];
            d.push(object);
          }
          that.getOwnerComponent().getModel("local").setProperty("/cat",{
						category: b,
            subCatergory: d,
						type: ["Plain", "Studded"]
					});
        })
        .catch(function(oError) {
          MessageToast.show("cannot fetch the data");
        });
		},
		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} [sName] the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function (sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function (oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function () {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Handler for the Avatar button press event
		 * @public
		 */
		onAvatarPress: function () {
			var sMessage = this.getResourceBundle().getText("avatarButtonMessageToastText");
			MessageToast.show(sMessage);
		},

		/**
		 * React to FlexibleColumnLayout resize events
		 * Hides navigation buttons and switches the layout as needed
		 * @param {sap.ui.base.Event} oEvent the change event
		 */
		onStateChange: function (oEvent) {
/*var sLayout = oEvent.getParameter("layout"),
				iColumns = oEvent.getParameter("maxColumnsCount");

			if (iColumns === 1) {
				this.getModel("appView").setProperty("/smallScreenMode", true);
			} else {
				this.getModel("appView").setProperty("/smallScreenMode", false);
				// swich back to two column mode when device orientation is changed
				if (sLayout === "OneColumn") {
					this._setLayout("Two");
				}
			}*/
		},

		/**
		 * Sets the flexible column layout to one, two, or three columns for the different scenarios across the app
		 * @param {string} sColumns the target amount of columns
		 * @private
		 */
		_setLayout: function (sColumns) {
			if (sColumns) {
				this.getModel("local").setProperty("/layout", sColumns + "Column" + (sColumns === "One" ? "" : "sMidExpanded"));
			}
		},

		/**
		 * Apparently, the middle page stays hidden on phone devices when it is navigated to a second time
		 * @private
		 */
		_unhideMiddlePage: function () {
			debugger;
			// TODO: bug in sap.f router, open ticket and remove this method afterwards
			setTimeout(function () {
			this.getOwnerComponent().getRootControl().getContent()[0].getPages()[1].byId("layout").getCurrentMidColumnPage().removeStyleClass("sapMNavItemHidden");
			}.bind(this), 0);
		},

		/**
		 * Navigates back in browser history or to the home screen
		 */
		onBack: function () {
			this._unhideMiddlePage();
			var oHistory = History.getInstance();
			var oPrevHash = oHistory.getPreviousHash();
			if (oPrevHash !== undefined) {
				window.history.go(-1);
			} else {
				this.getRouter().navTo("home");
			}
		},

		/**
		 * Called, when the add button of a product is pressed.
		 * Saves the product, the i18n bundle, and the cart model and hands them to the <code>addToCart</code> function
		 * @public
		 */
		onAddToCart : function () {
			var oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			var oEntry =  arguments[0].getSource().getBindingContext().getObject();
			var oCartModel = this.getView().getModel("cartProducts");
			cart.addToCart(oResourceBundle, oEntry, oCartModel);
		},
		onPopUpSearch: function(oEvent) {
			debugger;
			var searchStr = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("OrderNo", sap.ui.model.FilterOperator.EQ, searchStr)//,
				]//,
				//and: false
			});
			var oPopup = oEvent.getSource();
			oPopup.getBinding("items").filter(oFilter);
		},
		/**
		 * Clear comparison model
		 * @protected
		 */
	/*	_clearComparison: function (){
			var oModel = this.getOwnerComponent().getModel("comparison");
			oModel.setData({
				category: "",
				item1: "",
				item2: ""
			});
		} */
	});
});
