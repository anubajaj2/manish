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
			var sPath = "model/mockData/uploadCollection.json";
			this.getView().setModel(new JSONModel(sPath));
			this.getView().setModel(new JSONModel(Device), "device");
			this.getView().setModel(new JSONModel({
				"maximumFilenameLength": 55,
				"maximumFileSize": 1000,
				"mode": ListMode.SingleSelectMaster,
				"uploadEnabled": true,
				"uploadButtonVisible": true,
				"enableEdit": true,
				"enableDelete": true,
				"visibleEdit": true,
				"visibleDelete": true,
				"listSeparatorItems": [
					ListSeparators.All,
					ListSeparators.None
				],
				"showSeparators": ListSeparators.All,
				"listModeItems": [
					{
						"key": ListMode.SingleSelectMaster,
						"text": "Single"
					}, {
						"key": ListMode.MultiSelect,
						"text": "Multi"
					}
				]
			}), "settings");
			this.getView().setModel(new JSONModel({
				"items": ["jpg", "png"],
				"selected": ["jpg", "png"]
			}), "fileTypes");
			var that = this;
			this._reader.onload = function(e) {
				//get an access to the content of the file

			};

		},
		_onRouteMatched : function(){
			 var that = this;
			 this._oLocalModel = this.getOwnerComponent().getModel("local");
			 this.firstTwoDisplay();
		},
		handleUploadComplete: function(oEvent) {
			debugger;
			var sResponse = oEvent.getParameter("response");
			if (sResponse) {
				var sMsg = "";
				var m = /^\[(\d\d\d)\]:(.*)$/.exec(sResponse);
				if (m[1] == "200") {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Success)";
					oEvent.getSource().setValue("");
				} else {
					sMsg = "Return Code: " + m[1] + "\n" + m[2] + "(Upload Error)";
				}

				MessageToast.show(sMsg);
			}
		},
		beforeUploadStarts: function(oEvent){
			debugger;
		},

		onDelete: function(oEvent){


		},
		_allImages: [],
		_reader: new FileReader(),
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
		handleUploadPress: function(oEvent){
			//https://sap.github.io/ui5-webcomponents/playground/components/FileUploader/
			var imagesPost = [];
			for (var i = 0; i < this._allImages.length; i++) {
				if(!this._allImages[i].id){
					imagesPost.push({
						"SeqNo": i,
						"Product": "demo",
						"Stream": this._allImages[i].Stream,
						"Content": this._allImages[i].Content,
						"Filename": "",
						"Filetype": "",
						"ViewCount": 0,
						"LastDate": new Date(),
						"CreatedBy": "anu",
						"CreatedOn": new Date()
					});
				}
			}
			var that = this;
			$.post('/Photos', {"images": imagesPost})
				.done(function(data, status){
					 that._allImages = data.allImages;
					 that.getView().getModel("local").setProperty("/allImages", that._allImages);
				})
				.fail(function(xhr, status, error) {

				});

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
