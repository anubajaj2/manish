sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/demo/cart/model/formatter",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/HTML",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/m/Dialog",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
], function(BaseController, formatter, UIComponent, JSONModel, HTML, MessageToast, MessageBox, Dialog,History,Filter,FilterOperator) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.MyProduct", {
		formatter: formatter,
		onInit: function() {

			this._oRouter = UIComponent.getRouterFor(this);

			var oC = new JSONModel({
				"images": []
			});
			this.getView().setModel(oC, "C");
			this.a = [];
			this._oRouter.getRoute("MyProduct").attachMatched(this._routePatternMatched, this);
			this._oLocalModel = this.getOwnerComponent().getModel("local");
			// this.mode = "Create";
			// this.setMode();
		},
		onPopUpSearch: function(oEvent) {
			var searchStr = oEvent.getParameter("value");
			var oFilter = new sap.ui.model.Filter({
				filters: [
					new sap.ui.model.Filter("ProductId", sap.ui.model.FilterOperator.Contains, searchStr) //,
				]
			});
			var oPopup = oEvent.getSource();
			oPopup.getBinding("items").filter(oFilter);
		},
		setAvailableProductCode: function() {
			this.pattern = this.getView().getModel("local").getProperty("/ManufacturerData/Pattern");
			//read count of all products for current supplier
			var oFilter1 = new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, "'" + this.createdBy + "'");
			var that = this;
			//
			$.get("/getpattern?Createdby="+this.CreatedBy)
				.then(function(count) {
					count = parseInt(count) + 1;
					that._oLocalModel.setProperty("/Product/ProductId",that.pattern + "_" + count.toString());
					// that.getView().byId("idName").setValue(that.pattern + "_" + count.toString());
				});

		},
		_routePatternMatched: function() {
			debugger;
			var that = this;
			this._oLocalModel = this.getOwnerComponent().getModel("local");
			this._oLocalModel.getProperty("/ProdWeights");
			this.onCancel();
			// this.mode = "Create";
			// this.setMode();

			this.lastTwoDisplay();
			//remove categories not set for Manufacturers
			this.loadCategories(this.getView().getModel("local").getProperty("/ManufacturerData/Categories"));
			//pattern to set
			if (this.getOwnerComponent().getModel('local').getProperty('/Authorization') === "") {
				this.logOutApp();
			}
			this.lastTwoDisplay();
			this.createdBy = this.getView().getModel("local").getProperty("/CurrentUser");
			// this.setAvailableProductCode();
		},
		onDelete1: function() {
			debugger;
			var that = this;
			var productId = this.getView().getModel("local").getProperty("/Product").ProductId;
			$.post('/DeleteProduct', {
					"productCode": productId
				})
				.done(function(result, status) {
					if (result.startsWith("id")) {
						var prodWeights = that.getView().getModel("local").getProperty("/ProdWeights");
						prodWeights.forEach((item) => {
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/ProdWeights('" + item.id + "')",
								"DELETE", {}, {}, that);
						});
						var allImages = that.getView().getModel("local").getProperty("/allImages");
						allImages.forEach((item) => {
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Photos('" + item.id + "')",
								"DELETE", {}, {}, that);
						});
						var id = result.split(":")[1];
						var that2 = that;
						that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Products('" + id + "')",
								"DELETE", {}, {}, that)
							.then(function(result) {
								that2.onCancel();
								that2.onClear();
								MessageToast.show("Product deleted successfully");
								that2.ProductsearchPopup = null;
							});

					} else {
						MessageToast.show(result);
						that.ProductsearchPopup = null;
					}
				})
				.fail(function(xhr, status, error) {

				});
		},

onClear: function(){
	var oFileUploader = this.byId("fileUploader");
	oFileUploader.clear();
},

		onCancel: function() {
			debugger;
			if (this.cancelSave() === true) {
				this._oLocalModel.setProperty("/Product", {
					"id": "",
					"ProductId": "",
					"Name": "",
					"Category": "", //this.getView().byId("idCat").getSelectedKey(),
					"SubCategory": "", //this.getView().byId("idSubCat").getSelectedKey(),
					"Type": "S",
					"PairType": 2,
					"ShortDescription": "null",
					"ItemType": "G",
					"Karat": "22/22",
					"OverallStatus": "N",
					"ProdStatus": "A",
					"HindiName": "",
					"Tunch": 0,
					"Wastage": 0,
					"Making": 0,
					"ApprovedOn": "",
					"AlertQuantity": 0,
					"CreatedBy": "",
					"CreatedOn": "",
					"ChangedBy": "",
					"ChangedOn": ""
				});

				this.mode = "Create";
				this.setMode();
				// this.setAvailableProductCode();
			}

		},
		onChange: function() {
			this.getView().getModel("local").setProperty("/checkChange", true);
		},
		onSave: function() {
			debugger;
			var that = this;
			// var tunch = this._oLocalModel.getProperty("/Product/Tunch");
			// var Wastage = this._oLocalModel.getProperty("/Product/Wastage");
			// if ((tunch === "" && Wastage === "") || (tunch === "0" && Wastage === "0" ) || (tunch === 0 && Wastage === 0)){
			// 	MessageToast.show("Please add Tunch First");
			// 	return;
			// }
			// var props = this._prepModelInitialValues();
			// var oModel = this.getView().getModel("local");
			// var ProdWeights = oModel.getProperty("/ProdWeights");
			// ProdWeights.push(props);
			// oModel.setProperty("/ProdWeights", ProdWeights);
			this.getView().getModel("local").setProperty("/checkChange", true);
			var productPayload = this._oLocalModel.getProperty("/Product");
			if(!productPayload.ItemCode){
				var oCat = this.getView().getModel("local").getProperty("/Categories");
				for (var i = 0; i < oCat.length; i++) {
					if (oCat[i].ItemCode.toString() === productPayload.Category.toString()) {
						productPayload.ItemCode=oCat[i].id;
						break;
					}
				}
			}

			var a = productPayload.ProductId;
			var result = that.validateProductData();
			// if (result.status === false) {
			// 	MessageBox.error(result.error);
			// 	return;
			// }
			// parseInt(productPayload.ProductId.split("_")[1])

			productPayload.ProductId = a.toUpperCase();
			productPayload.Tunch = parseFloat(productPayload.Tunch).toFixed(2);
			productPayload.Wastage = parseFloat(productPayload.Wastage).toFixed(0);
			productPayload.GrossWeight = this.getView().getModel("local").getProperty("/ProdWeights")[0].GrossWeight;
			productPayload.Count = parseInt(productPayload.ProductId.split("_")[productPayload.ProductId.split("_").length-1])

			//		Product Id Cannot be Duplicated
			var Filter1 = new sap.ui.model.Filter("TagNo", "EQ", this.getView().byId("idName").getValue());
			if (this.mode === "Edit") {
				delete productPayload.ToChangedBy;
				delete productPayload.ToCreatedBy;
				delete productPayload.ToOrder;
				delete productPayload.ToPhotos;
				delete productPayload.ToWeights;
				delete productPayload.ToCategory;

				// this.upsertWeights();
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						"/Products(\'" + productPayload.id + "\')", "PUT", {}, productPayload, this)
					.then(function(data) {

						that.performCameraSave(productPayload.id);
						MessageToast.show("Product Updated Successfully");
						that.getView().getModel("local").setProperty("/checkChange", false);
						that.mode = "Edit";
						that.setMode();
						setTimeout(() => {
							that.onCancel();
							that.onClear();
						}, 900);
					}).catch(function(oError) {
						MessageBox.error("Error while saving product data");
					});
			} else if (this.mode === "Copy") {
				delete productPayload.ToChangedBy;
				delete productPayload.ToCreatedBy;
				delete productPayload.ToOrder;
				delete productPayload.ToPhotos;
				delete productPayload.ToWeights;
				delete productPayload.id;
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						"/Products", "GET", {
							filters: [Filter1]
						}, {}, this)
					.then(function(oData) {
						if (oData.results.length != 0) {
							MessageBox.error("Product Id Already Exist");
						} else {
							var that2 = that;
							// that.upsertWeights();
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
									"/Products", "POST", {}, productPayload, that)
								.then(function(data) {
									that2.performCameraSave(data.id);
									MessageToast.show("Product Created Successfully");
									that2.getView().getModel("local").setProperty("/Product", data);
									that2.getView().getModel("local").setProperty("/checkChange", false);
									setTimeout(() => {
										that2.onCancel();
										that2.onClear();
									}, 900);
								}).catch(function(oError) {
									MessageBox.error("Error while saving product data");
								});
						}
					});
			} else {
				this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
						"/Products", "GET", {
							filters: [Filter1]
						}, {}, this)
					.then(function(oData) {
						if (oData.results.length != 0) {
							MessageBox.error("Product Id Already Exist");
						} else {
							var that2 = that;
							// that.upsertWeights();
							that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
									"/Products", "POST", {}, productPayload, that)
								.then(function(data) {
									that2.performCameraSave(data.id);
									MessageToast.show("Product Created Successfully");
									that2.getView().getModel("local").setProperty("/Product", data);
									that2.getView().getModel("local").setProperty("/checkChange", false);
									that2.mode = "Edit";
									that2.setMode();
									setTimeout(() => {
										that2.onCancel();
										that2.onClear();
									}, 900);
								}).catch(function(oError) {
									MessageBox.error("Error while saving product data");
								});
						}
					});
			}
		},
		allImageURLs: [],
		counter: function(oEvent) {
			var items = oEvent.getItems();
			var oLocal = this.getView().getModel("local");
			var oDataModel = this.getView().getModel();
			for (var i = 0; i < items.length; i++) {
				var sPath = items[i].getBindingContextPath();
				var picsSize = oDataModel.getProperty(sPath + "/ToPhotos");
				// for (var i = 0; i < picsSize.length; i++) {
				// 		var sImage = sPath + "/ToPhotos/" + i + "/Content" ;
				// 	var sUrl = formatter.getImageUrlFromContent(oDataModel.getProperty(sImage));
				//   if(!this.allImageURLs[sImage]){
				// 	 	 this.allImageURLs[sImage] =  sUrl;
				//  }
				// }
				var sImage = sPath + "/ToPhotos/0/Content";
				var sUrl = formatter.getImageUrlFromContent(oDataModel.getProperty(sImage));
				if (!this.allImageURLs[sImage]) {
					this.allImageURLs[sImage] = sUrl;
				}
				items[i].setIcon(sUrl);
			}
		},
		onProductValueHelp: function(oEvent) {
			debugger;
			if (!this.ProductsearchPopup) {
				this.ProductsearchPopup = new sap.ui.xmlfragment("sap.ui.demo.cart.fragments.popup0", this);
				this.getView().addDependent(this.ProductsearchPopup);
				var title = this.getView().getModel("i18n").getProperty("Products");
				this.ProductsearchPopup.setTitle(title);
				var oFilter1 = new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, "'" + this.createdBy + "'");
				this.ProductsearchPopup.bindAggregation("items", {
					path: '/Products',
					parameters: {
						expand: 'ToPhotos',
						top: 1
					},
					filters: [oFilter1],
					template: new sap.m.StandardListItem({
						title: "{TagNo}",
						description: "{Category} / {SubCategory} / {Name}"
					})
				});
				setTimeout(() => {
					this.counter(this.ProductsearchPopup);
				}, 4000);
				this.ProductsearchPopup.open();
			} else {
				this.counter(this.ProductsearchPopup);
				this.ProductsearchPopup.open();
			}
		},

		onConfirm: function(oEvent) {
			debugger;
			var that = this;
			//Push the selected product id to the local model
			var myData = this.getView().getModel("local").getProperty("/Product");
			var selProd = oEvent.getParameter("selectedItem").getTitle();
			myData.TagNo = selProd;
			this.getView().byId("idName").setValue(myData.TagNo);
			this.getView().byId("idName").fireSubmit();
		},
		onEnter: function(oEvent) {
			debugger;
			var that = this;
			var sValue = this.getView().byId("idName").getValue().toUpperCase();
			this.getView().byId("idName").setValue(sValue);
			var CreatedBy = this.getView().getModel("local").getProperty("/CurrentUser");
			var Filter1 = new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, "'" + CreatedBy + "'");
			var Filter2 = new sap.ui.model.Filter("TagNo", "EQ", sValue);
			this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Products", "GET", {
					filters: [Filter1,Filter2]
				}, {}, this)
				.then(function(oData) {
					if (oData.results.length != 0) {
						if (oData.results[0].CreatedBy === that.createdBy) {
							MessageToast.show("Product Already Exist");
							that.loadProductData(oData.results[0].id);
							that.getView().getModel("local").setProperty("/Product", oData.results[0]);
							that.mode = "Edit";
							that.setMode();
						} else {
							MessageToast.show("Product Already Exist, Please choose a different name");
						}
					} else {
						that.mode = "Create";
						that.setMode();
						that.setAvailableProductCode();
						MessageToast.show("Create as new product");
						that.getView().byId("idPName").focus();
					}
				});
			this.getView().byId("idPName").focus();
		},
		onCopy: function() {
			this.mode = "Copy";
			this.setMode();
			this.setAvailableProductCode();
			MessageToast.show("Another copy created!, Edit & Save");
		},
		onEnterRemark: function() {
			this.getView().byId("idCat").focus();
		},
		onEnterCat: function() {
			this.getView().byId("idSubCat").focus();
		},
		onEnterSubCat: function() {
			this.getView().byId("idType").focus();
		},
		onEnterType: function() {
			this.getView().byId("idPairType").focus();
		},
		onEnterPairType: function() {
			this.getView().byId("idSD").focus();
		},
		onMaking: function() {
			// this.getView().byId("idCat").focus();
			this.getView().byId("idGrossWt").focus();
			// this.getView().getParent().getParent().getCurrentMidColumnPage().byId("idTab").getItems()[0].getCells()[0].focus();
		},

		onGrossWt: function() {
			this.getView().byId("idlswt").focus();
		},

		onLsWt: function() {
			this.getView().byId("idnetwt").focus();
		},

		onNetWt: function() {
			this.getView().byId("idFine").focus();
		},

		onFine: function() {
			this.getView().byId("idAmount").focus();
		},
		onAmount: function() {
			this.getView().byId("idPiece").focus();
		},
		onPiece: function() {
			this.getView().byId("idMoreAmount").focus();
		},
		onWastage: function() {
			this.getView().byId("idMkg").focus();
		},
		onTunch: function() {
			this.getView().byId("idWastage").focus();
		},
		onGender: function() {
			this.getView().byId("idTunch").focus();
		},
		onKarat: function() {
			this.getView().byId("idTunch").focus();
		},
		onSD: function() {
			this.getView().byId("idCat").focus();
		},
		onPairType: function() {
			this.getView().byId("idKarat").focus();
		},
		onCat: function() {
			this.getView().byId("idSubCat").focus();
		},
		onSubCat: function() {
			this.getView().byId("idType").focus();
		},
		onType: function() {
			this.getView().byId("idPairType").focus();
		},

		getAllItems: function(oGrid, sBool) {
			var getSelectedItems = oGrid.getSelectedItems();
			var paths = [];
			if (sBool) {
				for (var i = 0; i < getSelectedItems.length; i++) {
					paths.push(getSelectedItems[i].getBindingContext().getPath());
				}
			} else {
				for (var i = 0; i < getSelectedItems.length; i++) {
					paths.push(getSelectedItems[i].getBindingContext("local").getPath());
				}
			}
			return paths;
		},

		fixedDialog: {},
		takePhoto: function() {
			debugger;
			//This code was generated by the layout editor.
			var that = this;
			if (this.fixedDialog) {
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
										var allImages = that3.getModel("local").getProperty("/allImages");
										allImages.push({
											"Stream": Stream,
											"Content": reader.result
										});
										that3.getModel("local").setProperty("/allImages", allImages);
										that3.stream.getTracks().forEach(function(track) {
											track.stop();
										});
										// that3.fixedDialog.close();
										that3.fixedDialog.destroy();
										that3.fixedDialog.close();
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
							debugger;
							that.stream.getTracks().forEach(function(track) {
								track.stop();
							});
							// that.fixedDialog.close();
							that.fixedDialog.destroy();
							that.fixedDialog.close();
						}
					})
				});

				this.getView().addDependent(this.fixedDialog);
				this.fixedDialog.attachBeforeClose(this.setImage, this);
			}
			//Step 2: Launch the popup
			this.fixedDialog.open();

			var handleSuccess = function(stream) {
				player.srcObject = stream;
				that.stream = stream;
			}
			navigator.mediaDevices.getUserMedia({
				video: true
			}).then(handleSuccess);
		},

		imageVal: "",
		onDelete: function(oEvent) {
			var sPaths = this.getAllItems(oEvent.getSource().getParent().getParent(), false);
			sPaths = this.reverseSort(sPaths, "allImages");
			var that = this;
			for (var i = 0; i < sPaths.length; i++) {
				var toBeDeleted = this.getView().getModel("local").getProperty(sPaths[i]);
				if (toBeDeleted.id) {
					//To be deleted from server also
					if (toBeDeleted.id !== "") {
						that._deletedImages.push({
							id: toBeDeleted.id
						});
						that.getView().getModel("local").setProperty("/deleteImages", that._deletedImages);
						that.getView().getModel("local").setProperty("/checkChange", true);
					}
				} else {
					//this.deleteImage(toBeDeleted.Stream);
				}
				this.deleteImage(toBeDeleted.Stream);
			}
			oEvent.getSource().getParent().getParent().removeSelections();
		},

		deleteImage: function(Stream) {
			var _allImages = this.getView().getModel("local").getProperty("/allImages");
			for (var j = 0; j < _allImages.length; j++) {
				if (_allImages[j].Stream === Stream) {
					_allImages.splice(j, 1);
					break;
				}
			}
			this.getView().getModel("local").setProperty("/allImages", _allImages);
		},

		onUploadChange: function(oEvent) {
			debugger;
			const files = oEvent.getParameter("files");
			var that = this;
			var allImages = this.getView().getModel("local").getProperty("/allImages");
			if (!files.length) {

			} else {
				for (let i = 0; i < files.length; i++) {
					//const img = document.createElement("img");
					var reader = new FileReader();
					reader.onload = function(e) {
						var _allImages = that.getView().getModel("local").getProperty("/allImages");
						try {
							var vContent = e.currentTarget.result; //.result.replace("data:image/jpeg;base64,", "");
							for (var i = 0; i < _allImages.length; i++) {
								if (!_allImages[i].Content) {
									_allImages[i].Content = vContent;
									that.getView().getModel("local").setProperty("/checkChange", true);
									that.getView().getModel("local").setProperty("/allImages", _allImages);
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
					allImages.push(img);
					this.getView().getModel("local").setProperty("/allImages", allImages);
				}
			}
		},
		onChange1: function(oEvent) {
			debugger;
			var nVal = oEvent.getSource().getValue();
			var sPath = oEvent.getSource().getBindingContext("local").getPath();
			var nIndex = sPath.split("/")[sPath.split("/").length - 1];
			var oModel = this.getView().getModel("local");
			var tunch = oModel.getProperty("/Product/Tunch");
			var Wastage = oModel.getProperty("/Product/Wastage");
			var Making = oModel.getProperty("/Product/Making");
			tunch = parseFloat(tunch) + parseFloat(Wastage);
			var GrossWeight = oModel.getProperty("/ProdWeights/" + nIndex + "/GrossWeight");
			var LessWeight = oModel.getProperty("/ProdWeights/" + nIndex + "/LessWeight");
			// var NetWeight = oModel.getProperty("/ProdWeights/" + nIndex + "/NetWeight");
			var Quantity = oModel.getProperty("/ProdWeights/" + nIndex + "/Quantity");
			var OTRs =  oModel.getProperty("/ProdWeights/" + nIndex + "/OtherChrg");

			if (isNaN(nVal)) {
				nVal = 0;
			}
			if (isNaN(GrossWeight)) {
				GrossWeight = 0;
			}
			if (isNaN(LessWeight)) {
				LessWeight = 0;
			}
			for (var i = 0; i < oEvent.getSource().getParent().getCells().length; i++) {
				var sName = oEvent.getSource().getName();
				if (sName === "GrossWeight") {
					GrossWeight = nVal;
					break;
				}else if (sName === "OtherChrg") {
					OTRs = nVal;
					break;
				}else if (sName === "LessWeight") {
					LessWeight = nVal;
					break;
				}else if (sName === "Quantity") {
					Quantity = nVal;
					break;
				}
			}

			// NetWeight
			nVal = GrossWeight - LessWeight;
			nVal = nVal.toFixed(3);
			oModel.setProperty("/ProdWeights/" + nIndex + "/NetWeight", nVal);

			//Fine
			nVal = nVal * Quantity;
			nVal = nVal * tunch / 100;
			nVal = nVal.toFixed(3);
			oModel.setProperty("/ProdWeights/" + nIndex + "/Fine", nVal);
			nVal = 0;

			nVal = parseInt(oModel.getProperty("/ProdWeights/" + nIndex + "/MoreAmount"));

			if(GrossWeight === ""){
				GrossWeight = 0;
			}
			if(Making === ""){
				Making = 0;
			}
			var MakingCharges = parseFloat(GrossWeight) * parseFloat(Making);
			nVal = nVal + parseInt(OTRs) + parseInt(MakingCharges);
			nVal = nVal.toFixed();
			if(isNaN(nVal)){
				nVal = 0;
			}
			oModel.setProperty("/ProdWeights/" + nIndex + "/Amount", nVal);
			this.getView().getModel("local").setProperty("/checkChange", true);
		},



		_prepModelInitialValues: function() {

			return {
				"ProductId": "null",
				"PairSize": 0,
				"OtherChrg":0,
				"GrossWeight": 0,
				"LessWeight": 0,
				"NetWeight": 0,
				"Quantity": 1,
				"Fine": 0,
				"MoreAmount": 0,
				"Piece":0,
				"Amount": 0,
				"Values": [],
				"Status": "A",
				"SoldOn": new Date(),
				"OrderId":"",
				"Remarks":"null",
				"CreatedOn": new Date(),
				"CreatedBy": ""
			};
			// return props;
},

onNavBack: function() {
	debugger;
	var oHistory = History.getInstance();
	var oPrevHash = oHistory.getPreviousHash();
	if (oPrevHash !== undefined) {
		window.history.go(-1);
	} else {
		this.getRouter().navTo("Profile");
	}
},

onPopUpSearch:function(oEvent){
	debugger;
			var aFilter = [];
			var searchStr = oEvent.getParameter("value").toUpperCase();
			var oFilter1 = new Filter("TagNo", FilterOperator.Contains, searchStr);
			var oFilter2 = new Filter("Category", FilterOperator.Contains, searchStr);
			var oFilter3 = new Filter("SubCategory", FilterOperator.Contains, searchStr);
			var oFilter4 = new Filter("Name", FilterOperator.Contains, searchStr);
			var aFilter = new Filter({
				filters: [oFilter1, oFilter2, oFilter3, oFilter4],
				and: false
			});
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([aFilter]);
}
	});
});
