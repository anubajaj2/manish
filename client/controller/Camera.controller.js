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
			this.getView().setModel(new JSONModel({ allImages:[] }), "images");
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
						var vContent = e.currentTarget; //.result.replace("data:image/jpeg;base64,", "");
						for (var i = 0; i < that._allImages.length; i++) {
							if(!that._allImages[i].content){
								that._allImages[i].content = vContent;
								that.getView().getModel("images").setProperty("/allImages", that._allImages);
								console.log(that._allImages);
								break;
							}
						}
					};
					var img = {};
					debugger;
					img.src = URL.createObjectURL(files[i]);
					img.width = 100;
					img.height = 100;
					img.id=new Date().toString();
					reader.readAsDataURL(files[i]);
					this._allImages.push(img);
					// img.onload = () => {
					// 	URL.revokeObjectURL(img.src);
					// }
					//resultDiv.appendChild(img);
				}
			}
		},
		handleUploadPress: function(oEvent){
			//https://sap.github.io/ui5-webcomponents/playground/components/FileUploader/
			debugger;
			const fileUploader = this.getView().byId("fileUploader"),
			resultDiv = document.querySelector("#__component0---Camera--result");

			// var oItem = oEvent.getSource().getParent().getParent().getItems()[0];
			// var fileName = '8.jpg';//oEvent.getParameter("fileName");
			// var fileReader = new FileReader();
			// var filetype = 'jpg' //oEvent.getParameter("fileType");
			// //var oURL = sUrl;
			// var base64_marker = 'data:' + filetype + ';base64,';
			// 	fileReader.onload = function (oEvent) {
			// 		var base64Index = evt.target.result.indexOf(base64_marker) + base64_marker.length;
			// 		var base64 = oEvent.target.result.substring(base64Index);
			// 		console.log(base64);
			// 		//var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
			// 		// var attachment = {
			// 		// 	"ATTACHMENTID": attachid,
			// 		// 	"ATTACHMENTNAME": docName,
			// 		// 	"ATTACHMENTCONTENT": base64
			// 		// };
			// 		//this.attach = attachment;
			// 		//oStorage.put("oAttachment", attachment);
			// 		this.getView().byId("UploadCollection").upload();
			// 	};
			// 	fileReader.readAsDataURL('C://' + fileName);

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
