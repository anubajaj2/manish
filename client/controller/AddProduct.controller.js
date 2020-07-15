sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/HTML",
	"sap/m/MessageToast"
], function(BaseController, UIComponent, JSONModel, HTML, MessageToast) {
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
		onCaptureImg:function() {
			this._router.navTo("Camera");
			this.getView().getModel("appView").setProperty("/layout", "TwoColumnsBeginExpanded");

			debugger;
			var oHtml = this.byId("htmlControl");

			var that = this;

			if (!oHtml) {
				var sId = this.createId("htmlControl");
				oHtml = new HTML(sId, {
					content: "<video id='player' autoplay></video>"
				});
			}

			var handleSuccess = function(stream) {
				player.srcObject = stream;
			}

			navigator.mediaDevices.getUserMedia({
				video: true
			}).then(handleSuccess);

			var oLayout = this.getView().byId("staticContentLayout");
			oLayout.addContent(oHtml);
		},
		onUploadImg1:function() {
			this._router.navTo("Camera");
			this.getView().getModel("appView").setProperty("/layout", "TwoColumnsBeginExpanded");

			this.getView().byId().setProperty("/visible", "true")
		},
		//takePhoto
		onCaptureImg1: function() {
			//Take the running image from the video stream of camera
				var oVBox = this.getView().byId("wow");
				var items = oVBox.getItems();
				//var snapId = "snap-" + items.length;
				var snapId = "snap-" + this.a.length;
				var textId = snapId + "-text";
				var imageVal = document.getElementById("player"); //this.imageVal;

				if (items.length > 0) {
					oVBox.removeItem(0);
				}
				//set that as a canvas element on HTML page
				var oCanvas = new sap.ui.core.HTML({
					content: "<canvas id='" + snapId + "' width='320px' height='320px' " +
						" style='2px solid red'></canvas> " +
						" <label id='" + textId + "'>" + this.attachName + "</label>"
				});

				oVBox.addItem(oCanvas);
				oCanvas.addEventDelegate({
					onAfterRendering: function() {
						var snapShotCanvas = document.getElementById(snapId);
						var oContext = snapShotCanvas.getContext("2d");
						oContext.drawImage(imageVal, 0, 0, snapShotCanvas.width, snapShotCanvas.height);
					}

				});
				this.sendToCarousal();

		},
		onSave: function() {
			debugger;
      var that = this;
			var productPayload = this._oLocalModel.getProperty("/Product");
			var a = productPayload.ProductId;

			productPayload.ProductId = a.toUpperCase();
			productPayload.Tunch = parseFloat(productPayload.Tunch).toFixed(2);
			productPayload.Wastage = parseFloat(productPayload.Wastage).toFixed(0);
			var skip = "";
			if (productPayload.Tunch > 101.00) {
				MessageToast.show("Please enter Tunch upto 100");
				var skip = "X";
			}
			if (productPayload.Wastage > 101) {
				MessageToast.show("Please enter Wastage upto 100");
				var skip = "X";
			}
			if (productPayload.Making > 10000) {
				MessageToast.show("Please enter Making less than 10000");
				var skip = "X";
			}
			//		Product Id Cannot be Duplicated
			var Filter1 = new sap.ui.model.Filter("ProductId", "EQ", this.getView().byId("idName").getValue());

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			    "/Products", "GET", {	filters: [Filter1] }, {}, this)
				.then(function(oData) {
					if (oData.results.length != 0) {
					MessageToast.show("Product Id Cannot be Duplicated");
				}else{
					if (skip === "") {
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
								"/Products", "POST", {}, productPayload, that)
								.then(function(data) {
									MessageToast.show("Post Done");
								}).catch(function(oError) {
									MessageToast.show("Cannot Post the data");
								});
							}
				}
			});


	},
			sendToCarousal: function(snapId) {
				debugger;
				var snapId = "snap-" + this.a.length;
				var stringImage = document.getElementById(snapId).toDataURL();

				this.a.push(stringImage);

				var oCModel = this.getView().getModel("C");
				oCModel.setProperty("/images", this.a);

				var oCarousel = this.getView().byId("car");

				var imgId = "imgage" + this.a.length;
				var imgSrc = "{C>/images/" + (this.a.length - 1) + "}";
				var imgAlt = "Example picture " + this.a.length;
				var img = new sap.m.Image(imgId, {
					src: imgSrc,
					alt: imgAlt,
					densityAware: false,
					decorative: false
				});

				oCarousel.addPage(img);

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
		   debugger;
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
				var Filter1 = new sap.ui.model.Filter("ProductId", "EQ", this.getView().byId("idName").getValue());

				this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Products", "GET", {
						filters: [Filter1]
					}, {}, this)
					.then(function(oData) {
						if (oData.results.length != 0) {
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
