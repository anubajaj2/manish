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
	"sap/ui/demo/cart/model/formatter",
	"sap/m/Dialog"
], function(BaseController, deepExtend, syncStyleClass, Controller, ObjectMarker, MessageToast, UploadCollectionParameter, MobileLibrary, JSONModel, FileSizeFormat, Device, formatter, Dialog) {
	"use strict";
	var ListMode = MobileLibrary.ListMode,
	ListSeparators = MobileLibrary.ListSeparators;
	return BaseController.extend("sap.ui.demo.cart.controller.Camera", {
		formatter: formatter,

		onInit : function () {
			var oRouter = this.getOwnerComponent().getRouter();
			oRouter.getRoute("AddProduct").attachMatched(this._onRouteMatched, this);
		},
		_onRouteMatched : function(){
			 var that = this;
			 this._oLocalModel = this.getOwnerComponent().getModel("local");
//<<<<<<< HEAD
			// this.firstTwoDisplay();
//=======
//>>>>>>> 9a19aab8d7366ad80e2c7670c1bb1923f14c8b8d
			 this.onSwitchOffHide();
		},
		getAllItems: function(oGrid){
			var getSelectedItems = oGrid.getSelectedItems();
			var paths = [];
			for (var i = 0; i < getSelectedItems.length; i++) {
				paths.push(getSelectedItems[i].getBindingContext("local").getPath());
			}
			return paths;
		},
		takePhoto: function() {
			//This code was generated by the layout editor.
			var that = this;
			//Step 1: Create a popup object as a global variable
			this.fixedDialog = new Dialog({
				title: "Click on Capture to take photo",
				beginButton: new sap.m.Button({
					text: "Capture Photo",
					press: function(oEvent) {
						// TO DO: get the object of our video player which live camera stream is running
						//take the image object out of it and set to main page using global variable
						that.imageVal = document.getElementById("player");
						debugger;
						let imageCapture = new ImageCapture(that.stream.getVideoTracks()[0]);
						var that2 = that;
						imageCapture.takePhoto()
					  .then(blob => {
					    that2.imageContent = blob;
							var that3 = that2;
							var reader = new FileReader();
							var Stream = URL.createObjectURL(blob);
							reader.readAsDataURL(blob);
							reader.onloadend = function() {
									debugger;
									that3._allImages.push({
										"Stream": Stream,
										"Content": reader.result
									});
									that3.getModel("local").setProperty("/allImages", that3._allImages);
									that3.stream.getTracks().forEach(function(track) {
										track.stop();
									});
									that3.fixedDialog.close();
									that3.fixedDialog.destroy();
							}
					  })
					  .catch(error =>
							console.log(error)
						);

					}
				}),
				content: [
					new sap.ui.core.HTML({
						content: "<video id='player' autoplay></video>"
					})
				],
				endButton: new sap.m.Button({
					text: "Cancel",
					press: function() {
						that.stream.getTracks().forEach(function(track) {
						  track.stop();
						});
						that.fixedDialog.close();
						that.fixedDialog.destroy();
					}
				})
			});

			this.getView().addDependent(this.fixedDialog);
			//Step 2: Launch the popup
			this.fixedDialog.open();
			this.fixedDialog.attachBeforeClose(this.setImage, this);
			var handleSuccess = function(stream) {
				player.srcObject = stream;
				that.stream = stream;
			}
			navigator.mediaDevices.getUserMedia({
				video: true
			}).then(handleSuccess);
		},
		imageVal: "",
		setImage: function() {
			//Take the running image from the video stream of camera
			// var oVBox = this.getView().byId("wow");
			// var items = oVBox.getItems();
			// var snapId = 'anubhav-' + items.length;
			// var textId = snapId + '-text';
			// var imageVal = this.imageVal;
			//
			// //set that as a canvas element on HTML page
			// var oCanvas = new sap.ui.core.HTML({
			// 	content: "<canvas id='canvas' width='320px' height='320px' " +
			// 		" style='2px solid red'></canvas> " +
			// 		" <label id='" + textId + "'>" + this.attachName + "</label>"
			// });
			// oVBox.addItem(oCanvas);
			// oCanvas.addEventDelegate({
			// 	onAfterRendering: function() {
			// 		var snapShotCanvas = document.getElementById(snapId);
			// 		var oContext = snapShotCanvas.getContext('2d');
			// 		oContext.drawImage(imageVal, 0, 0, snapShotCanvas.width, snapShotCanvas.height);
			// 	}
			// });

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
						that._deletedImages.push({id: toBeDeleted.id});
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

		},
		onDeleteRow: function() {
			// debugger;
			var oItems = this.getView().byId("idTab").getSelectedItems();
			// var oSelContexts = this.getView().byId("idTab").getSelectedItems();
			var aRows = this.getView().getModel("local").getProperty("/ProdWeights");
			if (oItems.length === aRows.length) {
				aRows.splice(0, aRows.length);
			} else {
				var nCount = 0;
				for (var i = 0; i < oItems.length; i++) {
					nCount = nCount + 1;
					var sBindPath = oItems[i].getBindingContextPath();
					var nIndex = sBindPath.split("/")[sBindPath.split("/").length - 1];
					if (nCount > 1) {
						nIndex = nIndex - 1;
					}
					aRows.splice(nIndex, 1);
				}
			}

			this.getView().getModel("local").getProperty("/ProdWeights",aRows);
			this.getView().byId("idTab").removeSelections(true);
			MessageToast.show("Successfully Deleted");
	},
		onInsert: function(oEvent) {
			var tunch = this._oLocalModel.getProperty("/Product/Tunch");
			var Wastage = this._oLocalModel.getProperty("/Product/Wastage");
			if ((tunch === "" && Wastage === "") || (tunch === "0" && Wastage === "0" ) || (tunch === 0 && Wastage === 0)){
				MessageToast.show("Please add Tunch First");
				return;
			}
			var props = this._prepModelInitialValues();
			var oModel = this.getView().getModel("local");
//<<<<<<< HEAD
			this._allWeights = oModel.getProperty("/ProdWeights");
			this._allWeights.push(props);
			oModel.setProperty("/ProdWeights", this._allWeights);
//=======
			var ProdWeights = oModel.getProperty("/ProdWeights");
			ProdWeights.push(props);
			oModel.setProperty("/ProdWeights", ProdWeights);
//>>>>>>> 9a19aab8d7366ad80e2c7670c1bb1923f14c8b8d
		},
		onChange: function(oEvent) {

			var nVal = oEvent.getSource().getValue();
			var sPath = oEvent.getSource().getBindingContext("local").getPath();
			var nIndex = sPath.split("/")[sPath.split("/").length - 1];
			var oModel = this.getView().getModel("local");
			var tunch = oModel.getProperty("/Product/Tunch");
			var Wastage = oModel.getProperty("/Product/Wastage");
			tunch = parseFloat(tunch) + parseFloat(Wastage);
			var StonePc = oModel.getProperty("/ProdWeights/" + nIndex + "/StonePc");
			var StoneWeight = oModel.getProperty("/ProdWeights/" + nIndex + "/StoneWeight");
			var StonePc1 = oModel.getProperty("/ProdWeights/" + nIndex + "/StonePc1");
			var StoneWeight1 = oModel.getProperty("/ProdWeights/" + nIndex + "/StoneWeight1");
			var MoPc = oModel.getProperty("/ProdWeights/" + nIndex + "/MoPc");
			var MoWeight = oModel.getProperty("/ProdWeights/" + nIndex + "/MoWeight");
			var GrossWeight = oModel.getProperty("/ProdWeights/" + nIndex + "/GrossWeight");
			// var NetWeight = oModel.getProperty("/ProdWeights/" + nIndex + "/NetWeight");
			var Quantity = oModel.getProperty("/ProdWeights/" + nIndex + "/Quantity");
			var StoneRs = oModel.getProperty("/ProdWeights/" + nIndex + "/StoneRs");
			var StoneRs1 = oModel.getProperty("/ProdWeights/" + nIndex + "/StoneRs1");
			var MoRs = oModel.getProperty("/ProdWeights/" + nIndex + "/MoRs");
			var OTRs =  oModel.getProperty("/ProdWeights/" + nIndex + "/OtherChrg");
			for (var i = 0; i < oEvent.getSource().getParent().getCells().length; i++) {
				var sName = oEvent.getSource().getName();
				if (sName === "StonePc") {
					StonePc = nVal;
					break;
				} else if (sName === "StoneWeight") {
					StoneWeight = nVal;
					break;
				} else if (sName === "StonePc1") {
					StonePc1 = nVal;
					break;
				} else if (sName === "StoneWeight1") {
					StoneWeight1 = nVal;
					break;
				} else if (sName === "MoPc") {
					MoPc = nVal;
					break;
				} else if (sName === "MoWeight") {
					MoWeight = nVal;
					break;
				} else if (sName === "GrossWeight") {
					GrossWeight = nVal;
					break;
				} else if (sName === "StoneRs") {
					StoneRs = nVal;
					break;
				} else if (sName === "StoneRs1") {
					StoneRs1 = nVal;
					break;
				} else if (sName === "MoRs") {
					MoRs = nVal;
					break;
				}else if (sName === "OtherChrg") {
					OTRs = nVal;
					break;
				}
			}

			if (isNaN(nVal)) {
				nVal = 0;
			}

			// LessWeight
			nVal = (StonePc * StoneWeight) + (StonePc1 * StoneWeight1) + (MoPc * MoWeight);
			oModel.setProperty("/ProdWeights/" + nIndex + "/LessWeight", nVal);

			// NetWeight
			nVal = GrossWeight - nVal;
			nVal = nVal.toFixed(3);
			oModel.setProperty("/ProdWeights/" + nIndex + "/NetWeight", nVal);

			//Fine
			nVal = nVal * Quantity;
			nVal = nVal * tunch / 100;
			oModel.setProperty("/ProdWeights/" + nIndex + "/Fine", nVal);

			//Amount
			nVal = ((StonePc * StoneRs) + (StoneRs1 * StoneWeight1) + (MoRs * MoWeight)) * Quantity;
			nVal = nVal + parseInt(OTRs);
			nVal = nVal.toFixed();
			oModel.setProperty("/ProdWeights/" + nIndex + "/Amount", nVal);

		},
		onSwitchOffHide: function() {
			for (var i = 0; i < 19; i++) {
				if (i >= 4 && i <= 11 || i === 16 || i === 2 || i === 7 || i === 11) {
					var sId = "idCol" + i;
					this.getView().byId(sId).setVisible(false);
					continue;
				}
				sId = "idCol" + i;
				this.getView().byId(sId).setVisible(true);
			}
		},
		onSwitchChange: function(oEvent) {
			if (oEvent.getSource().getState() === true) {
				for (var i = 0; i < 19; i++) {
					if (i === 16 || i === 2 || i === 7 || i === 11) {
						var sId = "idCol" + i;
						this.getView().byId(sId).setVisible(false);
						continue;
					}
					sId = "idCol" + i;
					this.getView().byId(sId).setVisible(true);
				}
			} else {
				this.onSwitchOffHide();
			}
		},
		_prepModelInitialValues: function() {

			return {
				"ProductId": "null",
		    "PairSize": 0,
		    "StonePc":0,
		    "StoneRs":0,
		    "StoneAmt":0,
		    "StoneWeight": 0,
		    "StonePc1":0,
		    "StoneWeight1": 0,
		    "StoneRs1":0,
		    "StoneAmt1":0,
		    "MoPc":0,
		    "MoWeight": 0,
		    "MoRs":0,
		    "MoAmt":0,
		    "OtherChrg":0,
		    "GrossWeight": 0,
		    "LessWeight": 0,
		    "NetWeight": 0,
		    "Quantity": 1,
		    "Fine": 0,
		    "Amount": 0,
		    "Status": "A",
//<<<<<<< HEAD
				"SoldOn": "",
				"OrderId":"",
		    "Remarks":"null",
		    "CreatedOn": "",
//=======
				"SoldOn": new Date(),
				"OrderId":"",
		    "Remarks":"null",
		    "CreatedOn": new Date(),
//>>>>>>> 9a19aab8d7366ad80e2c7670c1bb1923f14c8b8d
		    "CreatedBy": ""
			};
			// return props;
		}
	});
});
