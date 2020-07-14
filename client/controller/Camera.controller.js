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

			// Sets the text to the label
			this.byId("UploadCollection").addEventDelegate({
				onBeforeRendering: function() {
					this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
				}.bind(this)
			});
		},
		_onRouteMatched : function(){
		 var that = this;
		 this._oLocalModel = this.getOwnerComponent().getModel("local");
		 this.firstTwoDisplay();
		},
		createObjectMarker: function(sId, oContext) {
			var mSettings = null;

			if (oContext.getProperty("type")) {
				mSettings = {
					type: "{type}",
					press: this.onMarkerPress
				};
			}
			return new ObjectMarker(sId, mSettings);
		},

		formatAttribute: function(sValue) {
			if (jQuery.isNumeric(sValue)) {
				return FileSizeFormat.getInstance({
					binaryFilesize: false,
					maxFractionDigits: 1,
					maxIntegerDigits: 3
				}).format(sValue);
			} else {
				return sValue;
			}
		},
		upload: function (fileStore, docName,attachid) {
					this.attach = {};

					if (fileStore) {
						var fileReader = new FileReader();
						var selectedFile = fileStore;
						fileReader.onload = function (oEvent) {
							var base64 = oEvent.target.result;
							var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
							var attachment = {
								"ATTACHMENTID": attachid,
								"ATTACHMENTNAME": docName,
								"ATTACHMENTCONTENT": base64
							};
							this.attach = attachment;
							oStorage.put("oAttachment", attachment);
						};
						fileReader.readAsDataURL(selectedFile);
						sap.m.MessageToast.show("File upload successfully");

					} else {
						sap.m.MessageToast.show("File upload has been failed");
					}

				},
		onChange: function(oEvent) {
			debugger;
			var oUploadCollection = oEvent.getSource();
			// Header Token
			var oCustomerHeaderToken = new UploadCollectionParameter({
				name: "Authorization",
				value: "5raqoMXdLPO009fFosvyBjDHkfPmFIevSAfJ2eL5i43SgsYxe10vHq5iz6RHa4U4"
			});
			oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
		},

		onFileDeleted: function(oEvent) {
			this.deleteItemById(oEvent.getParameter("documentId"));
			MessageToast.show("FileDeleted event triggered.");
		},

		deleteItemById: function(sItemToDeleteId) {
			var oData = this.byId("UploadCollection").getModel().getData();
			var aItems = deepExtend({}, oData).items;
			jQuery.each(aItems, function(index) {
				if (aItems[index] && aItems[index].documentId === sItemToDeleteId) {
					aItems.splice(index, 1);
				}
			});
			this.byId("UploadCollection").getModel().setData({
				"items": aItems
			});
			this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
		},

		deleteMultipleItems: function(aItemsToDelete) {
			var oData = this.byId("UploadCollection").getModel().getData();
			var nItemsToDelete = aItemsToDelete.length;
			var aItems = deepExtend({}, oData).items;
			var i = 0;
			jQuery.each(aItems, function(index) {
				if (aItems[index]) {
					for (i = 0; i < nItemsToDelete; i++) {
						if (aItems[index].documentId === aItemsToDelete[i].getDocumentId()) {
							aItems.splice(index, 1);
						}
					}
				}
			});
			this.byId("UploadCollection").getModel().setData({
				"items": aItems
			});
			this.byId("attachmentTitle").setText(this.getAttachmentTitleText());
		},

		onFilenameLengthExceed: function() {
			MessageToast.show("FilenameLengthExceed event triggered.");
		},

		onFileRenamed: function(oEvent) {
			var oData = this.byId("UploadCollection").getModel().getData();
			var aItems = deepExtend({}, oData).items;
			var sDocumentId = oEvent.getParameter("documentId");
			jQuery.each(aItems, function(index) {
				if (aItems[index] && aItems[index].documentId === sDocumentId) {
					aItems[index].fileName = oEvent.getParameter("item").getFileName();
				}
			});
			this.byId("UploadCollection").getModel().setData({
				"items": aItems
			});
			MessageToast.show("FileRenamed event triggered.");
		},

		onFileSizeExceed: function() {
			MessageToast.show("FileSizeExceed event triggered.");
		},

		onTypeMissmatch: function() {
			MessageToast.show("TypeMissmatch event triggered.");
		},

		onUploadComplete: function(oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			var oData = oUploadCollection.getModel().getData();
			debugger;
			oData.items.unshift({
				"documentId": Date.now().toString(), // generate Id,
				"fileName": oEvent.getParameter("files")[0].fileName,
				"mimeType": "",
				"thumbnailUrl": "",
				"url": "",
				"attributes": [
					{
						"title": "Uploaded By",
						"text": "You",
						"active": false
					},
					{
						"title": "Uploaded On",
						"text": new Date().toLocaleDateString(),
						"active": false
					},
					{
						"title": "File Size",
						"text": "505000",
						"active": false
					}
				],
				"statuses": [
					{
						"title": "",
						"text": "",
						"state": "None"
					}
				],
				"markers": [
					{
					}
				],
				"selected": false
			});
			this.getView().getModel().refresh();

			// Sets the text to the label
			this.byId("attachmentTitle").setText(this.getAttachmentTitleText());

			// delay the success message for to notice onChange message
			setTimeout(function() {
				MessageToast.show("UploadComplete event triggered.");
			}, 4000);
		},

		onBeforeUploadStarts: function(oEvent) {
			// Header Slug
			//https://sap.github.io/ui5-webcomponents/playground/components/FileUploader/
			debugger;
			var oCustomerHeaderSlug = new UploadCollectionParameter({
				name: "slug",
				value: oEvent.getParameter("fileName")
			});
			oEvent.getParameters().addHeaderParameter(oCustomerHeaderSlug);
			MessageToast.show("BeforeUploadStarts event triggered.");
		},
		uploadNow: function(oEvent){
			//https://sap.github.io/ui5-webcomponents/playground/components/FileUploader/

			var oItem = oEvent.getSource().getParent().getParent().getItems()[0];
			var fileName = '8.jpg';//oEvent.getParameter("fileName");
			var fileReader = new FileReader();
			var filetype = 'jpg' //oEvent.getParameter("fileType");
			//var oURL = sUrl;
			var base64_marker = 'data:' + filetype + ';base64,';
				fileReader.onload = function (oEvent) {
					var base64Index = evt.target.result.indexOf(base64_marker) + base64_marker.length;
					var base64 = oEvent.target.result.substring(base64Index);
					console.log(base64);
					//var oStorage = jQuery.sap.storage(jQuery.sap.storage.Type.local);
					// var attachment = {
					// 	"ATTACHMENTID": attachid,
					// 	"ATTACHMENTNAME": docName,
					// 	"ATTACHMENTCONTENT": base64
					// };
					//this.attach = attachment;
					//oStorage.put("oAttachment", attachment);
					this.getView().byId("UploadCollection").upload();
				};
				fileReader.readAsDataURL('C://' + fileName);

		},
		onUploadTerminated: function() {
			/*
			// get parameter file name
			var sFileName = oEvent.getParameter("fileName");
			// get a header parameter (in case no parameter specified, the callback function getHeaderParameter returns all request headers)
			var oRequestHeaders = oEvent.getParameters().getHeaderParameter();
			*/
		},

		onFileTypeChange: function(oEvent) {
			this.byId("UploadCollection").setFileType(oEvent.getSource().getSelectedKeys());
		},

		onSelectAllPress: function(oEvent) {
			var oUploadCollection = this.byId("UploadCollection");
			if (!oEvent.getSource().getPressed()) {
				this.deselectAllItems(oUploadCollection);
				oEvent.getSource().setPressed(false);
				oEvent.getSource().setText("Select all");
			} else {
				this.deselectAllItems(oUploadCollection);
				oUploadCollection.selectAll();
				oEvent.getSource().setPressed(true);
				oEvent.getSource().setText("Deselect all");
			}
			this.onSelectionChange(oEvent);
		},

		deselectAllItems: function(oUploadCollection) {
			var aItems = oUploadCollection.getItems();
			for (var i = 0; i < aItems.length; i++) {
				oUploadCollection.setSelectedItem(aItems[i], false);
			}
		},

		getAttachmentTitleText: function() {
			var aItems = this.byId("UploadCollection").getItems();
			return "Uploaded (" + aItems.length + ")";
		},

		onModeChange: function(oEvent) {
			var oSettingsModel = this.getView().getModel("settings");
			if (oEvent.getParameters().selectedItem.getProperty("key") === ListMode.MultiSelect) {
				oSettingsModel.setProperty("/visibleEdit", false);
				oSettingsModel.setProperty("/visibleDelete", false);
				this.enableToolbarItems(true);
			} else {
				oSettingsModel.setProperty("/visibleEdit", true);
				oSettingsModel.setProperty("/visibleDelete", true);
				this.enableToolbarItems(false);
			}
		},

		enableToolbarItems: function(status) {
			this.byId("selectAllButton").setVisible(status);
			this.byId("deleteSelectedButton").setVisible(status);
			this.byId("selectAllButton").setEnabled(status);
			// This is only enabled if there is a selected item in multi-selection mode
			if (this.byId("UploadCollection").getSelectedItems().length > 0) {
				this.byId("deleteSelectedButton").setEnabled(true);
			}
		},

		onDeleteSelectedItems: function() {
			var aSelectedItems = this.byId("UploadCollection").getSelectedItems();
			this.deleteMultipleItems(aSelectedItems);
			if (this.byId("UploadCollection").getSelectedItems().length < 1) {
				this.byId("selectAllButton").setPressed(false);
				this.byId("selectAllButton").setText("Select all");
			}
			MessageToast.show("Delete selected items button press.");
		},

		onSearch: function() {
			MessageToast.show("Search feature isn't available in this sample");
		},

		onSelectionChange: function() {
			var oUploadCollection = this.byId("UploadCollection");
			// Only it is enabled if there is a selected item in multi-selection mode
			if (oUploadCollection.getMode() === ListMode.MultiSelect) {
				if (oUploadCollection.getSelectedItems().length > 0) {
					this.byId("deleteSelectedButton").setEnabled(true);
				} else {
					this.byId("deleteSelectedButton").setEnabled(false);
				}
			}
		},

		onAttributePress: function(oEvent) {
			MessageToast.show("Attribute press event - " + oEvent.getSource().getTitle() + ": " + oEvent.getSource().getText());
		},

		onMarkerPress: function(oEvent) {
			MessageToast.show("Marker press event - " + oEvent.getSource().getType());
		},

		onOpenAppSettings: function(oEvent) {
			if (!this.oSettingsDialog) {
				this.oSettingsDialog = sap.ui.xmlfragment("sap.m.sample.UploadCollection.AppSettings", this);
				this.getView().addDependent(this.oSettingsDialog);
			}
			syncStyleClass("sapUiSizeCompact", this.getView(), this.oSettingsDialog);
			this.oSettingsDialog.open();
		},

		onDialogCloseButton: function() {
			this.oSettingsDialog.close();
		},

		 _odataExampleCall: function() {
			 this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
 			 "/YOURENTITYNAME", "GET", {}, {}, this)
 				.then(function(data) {
 					that._oLocalModel.setProperty("/globalProperty",data.results);
 				}).catch(function(oError) {
 						MessageToast.show("cannot fetch the data");
 				});
		 },
		_onObjectMatched : function (oEvent) {

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
