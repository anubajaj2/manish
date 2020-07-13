sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/HTML"
], function(BaseController, UIComponent, JSONModel, HTML) {
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
		onSave: function(){
			debugger;
			var productPayload = this._oLocalModel.getProperty("/Product");

			this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
			"/Products", "POST", {}, productPayload, this)
			 .then(function(data) {
					 MessageToast.show("post Done");
			 }).catch(function(oError) {
					 MessageToast.show("cannot fetch the data");
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

			}


	});
});
