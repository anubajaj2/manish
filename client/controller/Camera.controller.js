sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/base/util/deepExtend",
	"sap/ui/core/syncStyleClass",
	"sap/ui/core/mvc/Controller",
	"sap/m/ObjectMarker",
	"sap/m/MessageToast",
	"sap/m/UploadCollectionParameter",
	"sap/m/library",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/format/FileSizeFormat",
	"sap/ui/Device",
	"sap/ui/demo/cart/model/formatter"
], function(BaseController, deepExtend, syncStyleClass, Controller, ObjectMarker, MessageToast, UploadCollectionParameter, MobileLibrary, JSONModel, FileSizeFormat, Device, formatter) {
	"use strict";
	var ListMode = MobileLibrary.ListMode,
	ListSeparators = MobileLibrary.ListSeparators;
	return BaseController.extend("sap.ui.demo.cart.controller.Camera", {
		formatter: formatter,

		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("Camera").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched : function(){
			 var that = this;
			 this._oLocalModel = this.getOwnerComponent().getModel("local");
			 this.firstTwoDisplay();
		},
		getAllItems: function(oGrid){
			var getSelectedItems = oGrid.getSelectedItems();
			var paths = [];
			for (var i = 0; i < getSelectedItems.length; i++) {
				paths.push(getSelectedItems[i].getBindingContext("local").getPath());
			}
			return paths;
		},
		onDelete: function(oEvent){
			var sPaths = this.getAllItems(oEvent.getSource().getParent().getParent());
			sPaths = this.reverseSort(sPaths,"allImages");
			var that = this;
			for (var i = 0; i < sPaths.length; i++) {
				var toBeDeleted = this.getView().getModel("local").getProperty(sPaths[i]);
				if(toBeDeleted.id){
					//To be deleted from server also
					if (toBeDeleted.id !== "") {
						$.post('/DeletePhoto', {"id": toBeDeleted.id})
							.done(function(data, status){
								 that.deleteImage(toBeDeleted.Stream);
							})
							.fail(function(xhr, status, error) {

							});
					}
				}else{
					this.deleteImage(toBeDeleted.Stream);
				}
			}
			oEvent.getSource().getParent().getParent().removeSelections();
		},
		deleteImage: function (Stream) {
			for (var j = 0; j < this._allImages.length; j++) {
				if(this._allImages[j].Stream === Stream){
					this._allImages.splice(j,1);
					break;
				}
			}
			this.getView().getModel("local").setProperty("/allImages",this._allImages);
		},

		onUploadChange: function(oEvent) {
			const files = oEvent.getParameter("files");
			var that = this;
			if (!files.length) {

			} else {
				for (let i = 0; i < files.length; i++) {
					//const img = document.createElement("img");
					var reader = new FileReader();
					reader.onload = function(e){
						try {
							var vContent = e.currentTarget.result; //.result.replace("data:image/jpeg;base64,", "");
							for (var i = 0; i < that._allImages.length; i++) {
								if(!that._allImages[i].Content){
									that._allImages[i].Content = vContent;
									that.getView().getModel("local").setProperty("/allImages", that._allImages);
									//console.log(that._allImages);
									break;
								}
							}
						} catch (e) {

						}
					};
					var img = {
						"Stream": "",
						"Content": ""
					};
					img.Stream = URL.createObjectURL(files[i]);
					reader.readAsDataURL(files[i]);
					this._allImages.push(img);
				}
			}
		},

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		_bindView : function (sObjectPath) {

		},
		_onBindingChange : function () {

		}
	});
});
