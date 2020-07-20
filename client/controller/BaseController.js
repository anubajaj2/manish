sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/core/UIComponent",
	"sap/ui/core/routing/History",
	"sap/ui/demo/cart/model/cart",
	"sap/ui/demo/cart/dbapi/dbapi",
	"sap/f/LayoutType",
	"sap/ui/demo/cart/model/formatter",
	"sap/m/MessageBox"
], function(Controller, MessageToast, UIComponent, History, cart, ODataHelper, LayoutType, formatter, MessageBox) {
	"use strict";


	return Controller.extend("sap.ui.demo.cart.controller.BaseController", {
		cart: cart,
		ODataHelper: ODataHelper,
		formatter:formatter,
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
		_allWeights: [],
		reverseSort: function(data, text){
			var arr = [];
			for (var i = 0; i < data.length; i++) {
				arr.push(data[i].split('/')[data[i].split('/').length - 1]);
			}
			arr.sort(function(a, b){return b-a});
			var retSet = [];
			for (var i = 0; i < arr.length; i++) {
				retSet.push("/" + text + "/" + arr[i]);
			}
			return retSet;
		},
		_deletedImages: [],
		ProdWeights: [],
		validateProductData: function(){
			var allWeights = this.getView().getModel("local").getProperty("/ProdWeights");
			var Product = this.getView().getModel("local").getProperty("/Product");

			if(Product.ProductId === "" || Product.ProductId === "null" ){
				return { "status" : false, "error": "Product Id not valid"};
			}
			if(Product.Name === "" || Product.Name === "null" ){
				return { "status" : false, "error": "Product Name not valid"};
			}
			if(Product.Tunch === "" || Product.Tunch === "null" || Product.Tunch === "0" || parseInt(Product.Tunch) === 0 ){
				return { "status" : false, "error": "Tunch is not valid"};
			}
			if (parseInt(Product.Tunch) > 100) {
				return { "status" : false, "error": "Tunch is not valid"};
			}
			if (parseInt(Product.Wastage) > 100) {
				return { "status" : false, "error": "Wastage is not valid"};
			}
			if (parseInt(Product.Making) > 9999) {
				return { "status" : false, "error": "Making not valid"};
			}
<<<<<<< HEAD
			if ((parseInt(Product.Tunch) + parseInt(Product.Wastage)) >= 100) {
				return { "status" : false, "error": "Tunch+Wastage not valid"};
			}

=======
			if (allWeights.length <= 0) {
				return { "status" : false, "error": "at least one weight required"};
			}
>>>>>>> 9a4414c2878eb74b8ca9188fd7f6a7fa45cf6b63
			for (var i = 0; i < allWeights.length; i++) {
				if(allWeights[i].Fine === "" || allWeights[i].Fine === "0" || parseInt(allWeights[i].Fine) === 0 || parseInt(allWeights[i].Fine) < 0 || allWeights[i].Fine === "null"){
					return { "status" : false, "error": "Fine cannot be calculated"};
				}
			}

			return { "status" : true, "error": ""};
		},
		prepareFinalData: function(ProductId){
			//check if allWeights has product id to create association
			var allWeights = this.getView().getModel("local").getProperty("/ProdWeights");
			for (var i = 0; i < allWeights.length; i++) {
				allWeights[i].ProductId = ProductId;
			}

			var allImages = this.getView().getModel("local").getProperty("/allImages");
			//check if image has product id to create association
			for (var j = 0; j < allImages.length; j++) {
				if(!allImages[j].id){
					allImages[j].Product = ProductId;
				}
			}
			this.getView().getModel("local").setProperty("/allImages",allImages);
			this.getView().getModel("local").setProperty("/ProdWeights", allWeights);
		},
		performCameraSave: function(ProductId){
			//Commit to be done
			//Validate everything before saving images, deleting images or upserting data
				this.prepareFinalData(ProductId);
				//delete the images which are marked for deletion from server
				//based on collection for deletetioon this._deletedImages
				//if no images to be deleted nothing happen
				this.massImageDelete();
				//upload only images which has no id
				//all will be uploaded in one shot and ui will update with
				//stored images back on screen
				this.handleUploadPress();
				//upsert all records of all weights again of "A" - Available only
				//API will flush and recreate every record again
				//this way no need to compare changes, or new recods
				//if no records in weight table nothing will happen
				this.upsertWeights();
				this.checkChange = false;
		},
		loadProdWeights: function(productId){
			var that = this;
			return new Promise(function(resolve, reject) {
				$.post('/GetProdWeights', {"productId": productId})
					.done(function(data, status){
						that.ProdWeights = data.ProdWeights;
						that.getView().getModel("local").setProperty("/ProdWeights", that.ProdWeights);
						resolve(data);
					})
					.fail(function(xhr, status, error) {
						reject(error);
					});
			});

		},
		loadProdInitImages: function(productId){

		},
		loadProdAllImages: function(productId){
			var that = this;
			$.post('/GetAllPhotos', {"productId": productId})
				.done(function(data, status){
					that._deletedImages = [];
					that.getView().getModel("local").setProperty("/allImages", data.allImages);
					that.processImages();
				})
				.fail(function(xhr, status, error) {

				});
		},
		loadProductData: function(productId){
			var that = this;
			if(productId !== "" && !productId){
				return;
			}
			this.loadProdAllImages(productId);
			this.loadProdWeights(productId);
		},
		checkChange: false,
		cancelSave: function(){
			var that = this;
			if(this.checkChange === true){
				MessageBox.confirm("Unsaved data will be lost",{
					title: "Confirmation",
					type: "Warning",
					onClose: function(reply){
							if(reply === "OK"){
								that._deletedImages = [];
								that.getView().getModel("local").setProperty("/ProdWeights", []);
								that.getView().getModel("local").setProperty("/allImages", []);
								that.checkChange = false;
							}else{
								//do nothing
							}
					}
				})
			}else{
				this._deletedImages = [];

				this.getView().getModel("local").setProperty("/ProdWeights", []);
				this.getView().getModel("local").setProperty("/allImages", []);
				that.checkChange = false;
			}

		},
		massImageDelete: function(){
			var that = this;
			if(this._deletedImages.length === 0){
				return;
			}
			$.post('/DeletePhotos', {"images": this._deletedImages})
				.done(function(data, status){
					that._deletedImages = [];
				})
				.fail(function(xhr, status, error) {

				});
		},
	  upsertWeights: function(){
			var that = this;
			var allWeights = this.getView().getModel("local").getProperty("/ProdWeights");
			if(allWeights.length === 0){
				return;
			}
			//check if product id is set properly
			//and fine is calculated
				$.post('/ProdWeights', {"ProdWeights": allWeights})
					.done(function(data, status){
						 that.ProdWeights = data.ProdWeights;
						 that.getView().getModel("local").setProperty("/ProdWeights", that.ProdWeights);
					})
					.fail(function(xhr, status, error) {
						MessageBox.error("Internal error occurred");
					});
		},
		handleUploadPress: function(oEvent){
			//https://sap.github.io/ui5-webcomponents/playground/components/FileUploader/
			var imagesPost = [];
			var allImages = this.getView().getModel("local").getProperty("/allImages");
			for (var i = 0; i < allImages.length; i++) {
				if(!allImages[i].id){
					imagesPost.push({
						"SeqNo": i,
						"Product": allImages[i].Product,
						"Stream": allImages[i].Stream,
						"Content": allImages[i].Content,
						"Filename": "",
						"Filetype": "",
						"ViewCount": 0,
						"LastDate": new Date(),
						"CreatedBy": this.getView().getModel("local").getProperty("/CurrentUser"),
						"CreatedOn": new Date()
					});
				}
			}
			if(imagesPost.length === 0){
				return;
			}
			var that = this;
			$.post('/Photos', {"images": imagesPost})
				.done(function(data, status){
					 that.getView().getModel("local").setProperty("/allImages", data.allImages);
					 that.processImages();
				})
				.fail(function(xhr, status, error) {

				});

		},
		processImages: function(){
			var allImages = this.getView().getModel("local").getProperty("/allImages");
			for (var i = 0; i < allImages.length; i++) {
				allImages[i].Stream = formatter.getImageUrlFromContent(allImages[i].Content);
			}
			this.getView().getModel("local").setProperty("/allImages", allImages);
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
			debugger;
			this.getModel("local").setProperty("/layout", LayoutType.TwoColumnsMidExpanded);
		},
		lastTwoDisplay: function(oView){
      debugger;
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
						type: [{Type:"Plain", Key:"P"},
						       {Type:"Studded", Key:"S"}]
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
			debugger;
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
					new sap.ui.model.Filter("OrderNo", sap.ui.model.FilterOperator.EQ, searchStr)
				]
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
