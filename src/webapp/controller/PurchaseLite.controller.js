sap.ui.define([
	"sap/ui/demo/cart/controller/BaseController",
	"sap/ui/core/UIComponent",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast",
	"sap/ui/demo/cart/model/formatter",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/SelectDialog",
	"sap/ui/export/library",
	"sap/ui/export/Spreadsheet",
	"sap/ui/core/Fragment",
	"sap/m/Dialog",
	"sap/ui/unified/FileUploader"
], function (BaseController, UIComponent, JSONModel,
	MessageToast, Formatter, MessageBox, Filter, FilterOperator, SelectDialog, exportLibrary, Spreadsheet, Fragment, Dialog, FileUploader) {
	"use strict";

	return BaseController.extend("sap.ui.demo.cart.controller.PurchaseLite", {
		onInit: function () {
			this._router = UIComponent.getRouterFor(this);
			var odataModel = new JSONModel({
				"groupCodeState": "None",
				"emailState": "None",
				"PatternState": "None"
			});
			debugger;
			this.setModel(odataModel, "PurchaseLiteModel");
			this.getView().getModel("PurchaseLiteModel").setProperty("/title", 0);
			this.getView().getModel("PurchaseLiteModel").setProperty("/visible", true);
			var Purc = [];
			// this.loadCategories(this.getOwnerComponent().getModel("local").getProperty("/ManufacturerData/Categories"));
			debugger;
			var oNew = {
				ItemCode: "",
				TagNo: "",
				GWt: 0,
				Amount: 0,
				Rate:0,
				PCS: "",
				Size: "",
				Remark: "",
				Photo: [],
				Tunch:0,
				NetWt:0,
				LessWt:0,
				FineGold:0,
				FineGold:0,
				PhotoCheck: false
			};
			for (var i = 0; i < 50; i++) {
				Purc.push(JSON.parse(JSON.stringify(oNew)));
			}
			this.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite", Purc);
			// this.getView().byId("PurchaseLiteTable").getBinding("rows").refresh();
			// var oRouter = this.getRouter();
			// oRouter.getRoute("Maker").attachMatched(this._onRouteMatched, this);
		},
		getTotalItem:function(){
			var tData=this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
			var count=0;
			for(var i=0;i<tData.length;i++){
				if(tData[i].ItemCode && tData[i].GWt && tData[i].Tunch){
					count++
				}
			}
			this.getView().getModel("PurchaseLiteModel").setProperty("/title", count);
			return count;
		},
		onPurityClick:function(oEvent){
			debugger;
			var sId=oEvent.getSource().getId().split("--")[(oEvent.getSource().getId().split("--").length)-1];
			if(sId==="id22"){
				if(oEvent.getSource().getType()==="Emphasized"){
					this.getView().byId("id22").setType("Default");
					this.getView().byId("id18").setType("Emphasized");
					this.getView().byId("idPurityInput").setValue("");
				}
				else{
					this.getView().byId("id18").setType("Default");
					this.getView().byId("id22").setType("Emphasized");
					this.getView().byId("idPurityInput").setValue("91.66");
				}
				
			}
			else if(sId==="id18"){
				if(oEvent.getSource().getType()==="Emphasized"){
					this.getView().byId("id18").setType("Default");
					this.getView().byId("id22").setType("Emphasized");
					this.getView().byId("idPurityInput").setValue("");
				}
				else{
					this.getView().byId("id18").setType("Emphasized");
					this.getView().byId("id22").setType("Default");
					this.getView().byId("idPurityInput").setValue("75.20");
				}
			}
		},
		onTypePress:function(oEvent){
			var sId=oEvent.getSource().getId();
			if(sId.includes("idTypeStudded")){
				this.getView().byId("idTypeStudded").setType("Emphasized");
				this.getView().byId("idTypePlain").setType("Default");
			}
			else{
				this.getView().byId("idTypeStudded").setType("Default");
				this.getView().byId("idTypePlain").setType("Emphasized");
			}

		},
		// onFixPress:function(oEvent){
		// 	var type=oEvent.getSource().getType();
		// 	if(type==="Emphasized"){
		// 		oEvent.getSource().setType("Default");
		// 		this.getView().byId("idFixInput").setEditable(true);
		// 		this.getView().byId("idFixInput").setValue("");
		// 	}
		// 	else{
		// 		oEvent.getSource().setType("Emphasized");
		// 		this.getView().byId("idFixInput").setEditable(false);
		// 		this.getView().byId("idFixInput").setValue("3.5");
		// 	}
		// },
		onEnter: function (oEvent) {
			debugger;
			var currentBoxId=oEvent.getSource().getId();
			var id = "input[id*='---idMaker--']";
			var textboxes = $(id);
			var findCurrentBox = textboxes.toArray().filter((i) => i.id.includes(currentBoxId));
			var currentBoxNumber = textboxes.index(findCurrentBox[0]);
			//	if(findCurrentBox.length !== 0){
			if (textboxes[currentBoxNumber + 1] != null) {
				var nextBox = textboxes[currentBoxNumber + 1]
				nextBox.focus();
				nextBox.select();
			}
		},
		// _onRouteMatched:function(){
		// 	var Purc=[];
		// 	debugger;
		// 	var oNew = {
		// 		ItemCode: "***",
		// 		TagNo: "",
		// 		GWt: "",
		// 		Amount: "",
		// 		PCS: "",
		// 		Size: "",
		// 		Remark: "",
		// 		Photo: [],
		// 		PhotoCheck: false
		// 	};
		// 	for(var i=0;i<50;i++){
		// 		Purc.push(oNew);
		// 	}
		// 	this.getView().getModel("PurchaseLiteModel").setProperty("/entry", Purc);
		// },
		onAddExcelData: function () {
			debugger;
			var that = this;
			if (this.fixedDialog === undefined) {
				this.fixedDialog = new Dialog({
					title: "Choose XSLX File For Upload",
					width: "60%",
					beginButton: new sap.m.Button({
						text: "Close",
						press: function (oEvent) {
							that.fixedDialog.close();
						}
					}),
					content: [
						new FileUploader("excelUploader", {
							fileType: "XLSX,xlsx",
							change: [this.onUpload, this],
							class: "sapUiLargeMargin"
						})
					]
				});
				this.getView().addDependent(this.fixedDialog);
			}
			this.fixedDialog.open();
		},

		onUpload: function (e) {
			this._import(e.getParameter("files") && e.getParameter("files")[0]);
		},
		_import: function (file) {
			var that = this;
			var excelData = {};
			if (file && window.FileReader) {
				var reader = new FileReader();
				reader.onload = function (e) {
					var data = e.target.result;
					var workbook = XLSX.read(data, {
						type: 'binary'
					});
					workbook.SheetNames.forEach(function (sheetName) {
						// Here is your object for every sheet in workbook
						excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);

					});
					var excelD = [];
					debugger;
					for (var i = 0; i < excelData.length; i++) {

						excelD.push({
							ItemCode: excelData[i]["ItemCode"],
							TagNo: excelData[i]["TAG NO"],
							GWt: excelData[i]["G WT"],
							Amount: excelData[i]["Amount"],
							PCS: excelData[i]["PCS"],
							Size: excelData[i]["Size"],
							Remark: excelData[i]["Remark"],
							Photo: [],
							PhotoCheck: false
						});

					}
					debugger;
					// Setting the data to the local model

					that.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite", excelD);
					that.getView().getModel("PurchaseLiteModel").setProperty("/title", excelD.length);
				};
				reader.onerror = function (ex) {
					console.log(ex);
				};
				reader.readAsBinaryString(file);
				this.fixedDialog.close();
			}
		},
		onAddImageData: function () {
			debugger;
			var that = this;
			if (this.ImageDialog === undefined) {
				this.ImageDialog = new Dialog({
					title: "Choose JPG/JPEG File For Upload",
					beginButton: new sap.m.Button({
						text: "Close",
						press: function (oEvent) {
							that.ImageDialog.close();
						}
					}),
					content: [
						new FileUploader("PhotoMassUploader", {
							fileType: "jpeg,jpg",
							change: [this.onMassImageUpload, this],

							multiple: true
						})
					]
				});
				this.getView().addDependent(this.ImageDialog);
			}
			this.ImageDialog.open();
		},
		onMassImageUpload: function (oEvent) {
			debugger;
			var photo = [];
			this.photoCount = 0;
			var that = this;
			const files = oEvent.getParameter("files");
			for (let i = 0; i < files.length; i++) {
				//const img = document.createElement("img");
				var reader = new FileReader();
				reader.onload = function (e) {
					debugger;
					try {
						var vContent = e.currentTarget.result;
						var _allImages = that.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
						var mPhoto = that.getView().getModel("PurchaseLiteModel").getProperty("/MassPhoto");
						for (var i = 0; i < _allImages.length; i++) {
							debugger;
							if (_allImages[i].TagNo.toUpperCase() === mPhoto[that.photoCount].Name.split(".")[0].toUpperCase()) {
								mPhoto[that.photoCount].Content = vContent;
								_allImages[i].PhotoCheck = true;
								_allImages[i].Photo.push(mPhoto[that.photoCount]);
								that.photoCount = that.photoCount + 1;
								that.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite", _allImages);
								that.ImageDialog.close();
								that.getView().byId("PurchaseLiteTable").getBinding("rows").refresh();
								break;
							}
						}
					} catch (e) {

					}
				}
				var img = {
					"Name": "",
					"Stream": "",
					"Content": ""
				};
				// debugger;
				img.Name = files[i].name;
				img.Stream = URL.createObjectURL(files[i]);
				reader.readAsDataURL(files[i]);
				photo.push(img);
				// debugger;
			}
			this.getView().getModel("PurchaseLiteModel").setProperty("/MassPhoto", photo);
		},
		onAdd: function () {
			debugger;
			var oNew = {
				ItemCode: "",
				TagNo: "",
				GWt: 0,
				Amount: 0,
				Rate:0,
				PCS: "",
				Size: "",
				Remark: "",
				Photo: [],
				Tunch:0,
				NetWt:0,
				LessWt:0,
				PhotoCheck: false
			};
			// this.getView().getModel("PurchaseLiteModel").setProperty("/entry", oNew);
			var value = this.getView().getModel("PurchaseLiteModel").getProperty("/entry");
			var data = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");

			// var data = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
			// if (sId === "idAddProduct") {
				if (!data) {
					data = [];
				}
				data.unshift(oNew);
				debugger;
				this.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite", data);
				this.getView().getModel("PurchaseLiteModel").setProperty("/title", data.length);
				MessageToast.show("Data Added Successful");

			// }
			// var that = this;
			// if (!this.oAddProduct) {
			// 	Fragment.load({
			// 		id: "idAddProduct",
			// 		name: "sap.ui.demo.cart.fragments.PurchaseStyleCURD",
			// 		controller: this
			// 	}).then(function (oPopup) {
			// 		that.oAddProduct = oPopup;
			// 		that.getView().addDependent(oPopup);
			// 		oPopup.setTitle("ADD");
			// 		oPopup.open();
			// 	});
			// } else {
			// 	this.oAddProduct.open();
			// }
		},
		onEdit: function (oEvent) {
			debugger;
			var that = this;
			this.EditPath = oEvent.getSource().getParent().getParent().getRowBindingContext().getPath();
			var value = JSON.parse(JSON.stringify(this.getView().getModel("PurchaseLiteModel").getProperty(this.EditPath)));
			this.getView().getModel("PurchaseLiteModel").setProperty("/entry", value);
			if (!this.oEditProduct) {
				Fragment.load({
					id: "idEditProduct",
					name: "sap.ui.demo.cart.fragments.PurchaseStyleCURD",
					controller: this
				}).then(function (oPopup) {
					that.oEditProduct = oPopup;
					that.getView().addDependent(oPopup);
					oPopup.setTitle("EDIT");
					oPopup.getButtons()[0].setText("Edit");
					oPopup.open();
				});
			} else {
				this.oEditProduct.open();
			}
		},
		onCopy: function (oEvent) {
			debugger;
			var that = this;
			var sPath = oEvent.getSource().getParent().getParent().getRowBindingContext().getPath();
			var value = JSON.parse(JSON.stringify(this.getView().getModel("PurchaseLiteModel").getProperty(sPath)));
			this.getView().getModel("PurchaseLiteModel").setProperty("/entry", value);
			if (!this.oCopyProduct) {
				Fragment.load({
					id: "idCopyProduct",
					name: "sap.ui.demo.cart.fragments.PurchaseStyleCURD",
					controller: this
				}).then(function (oPopup) {
					that.oCopyProduct = oPopup;
					that.getView().addDependent(oPopup);
					oPopup.setTitle("COPY");
					oPopup.getButtons()[0].setText("Copy");
					oPopup.open();
				});
			} else {
				this.oCopyProduct.open();
			}
		},
		onPressHandleSecureCancelPopup: function (oEvent) {
			debugger;
			oEvent.getSource().getParent().close();
			MessageToast.show("Operation Cancelled");
		},
		onPressHandleSecureOkPopup: function (oEvent) {
			var sId = oEvent.getSource().getParent().getId().split("--")[0];
			var value = this.getView().getModel("PurchaseLiteModel").getProperty("/entry");
			var data = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
			if (sId === "idAddProduct") {
				if (!data) {
					data = [];
				}
				data.unshift(value);
				debugger;
				this.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite", data);
				this.getView().getModel("PurchaseLiteModel").setProperty("/title", data.length);
				MessageToast.show("Data Added Successful");

			} else if (sId === "idEditProduct") {
				debugger;
				this.getView().getModel("PurchaseLiteModel").setProperty(this.EditPath, value);
				MessageToast.show("Data Edited Successful");
			} else if (sId === "idCopyProduct") {
				data.unshift(value);
				this.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite", data);
				this.getView().getModel("PurchaseLiteModel").setProperty("/title", data.length);
				debugger;
				MessageToast.show("Data Copied Successful");
			}
			oEvent.getSource().getParent().close();
		},
		onPressTemplateDownload: function () {
			debugger;
			var aCols, aMessages, oSettings;
			// if (Array.isArray(exportData) && exportData.length) {
			aCols = this._createExcelColumns();
			var reportExcel = [];
			for (var i = 1; i < 11; i++) {
				reportExcel.push({
					ItemCode: 100+i,
					TagNo: "T-" + i,
					GWt: i * 10,
					Amount: (i * 10) + (i * 5),
					PCS: i,
					Size: i,
					Remark: i,
					Photo: [],
					PhotoCheck: false
				});
			}
			// reportExcel.push("TEMPLATE");
			oSettings = {
				workbook: {
					columns: aCols
				},
				dataSource: reportExcel
			};
			new Spreadsheet(oSettings)
				.build()
				.then(function () {
					MessageToast.show("Spreadsheet export has finished");
				});
			// }
		},
		_createExcelColumns: function () {
			return [
				{
					label: 'ItemCode',
					property: 'ItemCode',
					// width: '25'
				}, 
				{
					label: 'TAG NO',
					property: 'TagNo'

				}, {
					label: 'G WT',
					property: 'GWt'
				}, {
					label: 'Amount',
					property: 'Amount'
				}, {
					label: 'PCS',
					property: 'PCS'

				}, {
					label: 'Size',
					property: 'Size'
				}, {
					label: 'Remark',
					property: 'Remark'
				}
			];
		},
		onPhotoClick: function (oEvent) {
			debugger;
			var that = this;
			this.PhotoPath = oEvent.getSource().getParent().getRowBindingContext().getPath();
			var Images = JSON.parse(JSON.stringify(this.getView().getModel("PurchaseLiteModel").getProperty(this.PhotoPath + "/Photo")));
			this.getView().getModel("PurchaseLiteModel").setProperty("/allImages", Images);
			// this.PhotoButton = oEvent.getSource();

			if (!this.oPhotoPopUp) {
				Fragment.load({
					id: "idPhotoPopUp",
					name: "sap.ui.demo.cart.fragments.PurchasePhoto",
					controller: this
				}).then(function (oPopup) {
					that.oPhotoPopUp = oPopup;
					debugger;
					that.getView().addDependent(oPopup);
					oPopup.setTitle("ADD");
					// sap.ui.getCore().byId("idPhotoPopUp--gridList").bindAggregation(that.getView().getModel("PurchaseLiteModel").getProperty(spath+"/Photo"));
					oPopup.open();
				});
			} else {
				debugger;
				// sap.ui.getCore().byId("idPhotoPopUp--gridList").bindItems();
				this.oPhotoPopUp.open();
			}
		},
		onUploadChange: function (oEvent) {
			debugger;
			const files = oEvent.getParameter("files");
			var that = this;
			var allImages = this.getView().getModel("PurchaseLiteModel").getProperty("/allImages");
			if (!files.length) {
				MessageToast.show("No File Find");
			} else {
				for (let i = 0; i < files.length; i++) {
					//const img = document.createElement("img");
					var reader = new FileReader();
					reader.onload = function (e) {
						var _allImages = that.getView().getModel("PurchaseLiteModel").getProperty("/allImages");
						// var _allImages=[];
						debugger;
						try {
							var vContent = e.currentTarget.result;
							for (var i = 0; i < _allImages.length; i++) {
								if (!_allImages[i].Content) {
									_allImages[i].Content = vContent;
									that.getView().getModel("PurchaseLiteModel").setProperty("/allImages", _allImages);
									debugger;
									that.getView().byId("idPhotoPopUp--gridList").getBinding("items").refresh();
									break;
								}
							}
						} catch (e) {

						}
					};
					var img = {
						"Name": "",
						"Stream": "",
						"Content": ""
					};
					debugger;
					img.Name = files[i].name;
					img.Stream = URL.createObjectURL(files[i]);
					reader.readAsDataURL(files[i]);
					allImages.push(img);
					this.getView().getModel("PurchaseLiteModel").setProperty("/allImages", allImages);
				}
			}
		},
		onOkayPhotoFrag: function (oEvent) {
			debugger;
			var allImages = this.getView().getModel("PurchaseLiteModel").getProperty("/allImages");
			this.getView().getModel("PurchaseLiteModel").setProperty(this.PhotoPath + "/PhotoCheck", true);
			this.getView().getModel("PurchaseLiteModel").setProperty(this.PhotoPath + "/Photo", allImages);
			this.getView().byId("PurchaseLiteTable").getBinding("rows").refresh();
			oEvent.getSource().getParent().close();
			MessageToast.show("Photo added Successfully");
		},
		onCancelPhotoFrag: function (oEvent) {
			oEvent.getSource().getParent().close();
			MessageToast.show("Operation Cancelled");
		},
		onDelete: function (oEvent) {
			var sPath = oEvent.getSource().getParent().getParent().getRowBindingContext().getPath().split("/")[length - 1];
			var data = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
			data.splice(sPath, 1);
			this.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite", data);
			this.getView().getModel("PurchaseLiteModel").setProperty("/title", data.length);
			MessageToast.show("Deleted Successfully");

		},
		// onMasterSave: function () {
		// 	debugger;

		// 	// return;
		// 	var payload = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
		// 	if (!payload) {
		// 		MessageToast.show("Please enter a data");
		// 		return;
		// 	}
		// 	sap.ui.core.BusyIndicator.show();
		// 	this.getView().getModel("PurchaseLiteModel").setProperty("/visible", false);
		// 	var CreatedBy = this.getView().getModel("local").getProperty("/CurrentUser");
		// 	var oFilter1 = new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, "'" + CreatedBy + "'");
		// 	var that = this;
		// 	that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
		// 		"/Products/$count", "GET", {
		// 		filters: [oFilter1]
		// 	}, {}, that)
		// 		.then(function (count) {
		// 			count = parseInt(count) + 1;
		// 			var pattern = that.getView().getModel("local").getProperty("/ManufacturerData/Pattern");
		// 			var batch_Id = that.create_UUID();
		// 			var Product = [];
		// 			var ProdWeight = [];
		// 			var Photo = [];
		// 			var payload = that.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");

		// 			for (var i = 0; i < payload.length; i++) {
		// 				payload[i].ItemCode = pattern + "_" + count.toString();
		// 				payload[i].BatchId = batch_Id;
		// 				payload[i].CreatedBy = that.getView().getModel("local").getProperty("/CurrentUser");
		// 				count = parseInt(count) + 1;
		// 				// var pdt={
		// 				// 	"ProductId":payload[i].ItemCode,
		// 				// 	"TagNo":payload[i].TagNo,
		// 				// 	"Name":payload[i].Remark,
		// 				// 	"Category":"HardCode",
		// 				// 	"Tunch":0,
		// 				// 	"Wastage":0,
		// 				// 	"GrossWeight":0,
		// 				// 	"AlertQuantity":0,
		// 				// 	"BatchId":batch_Id
		// 				// };
		// 				// Product.push(pdt);
		// 				// var wgt={
		// 				// 	"ProductId":"",
		// 				// 	"Amount":payload[i].Amount,
		// 				// 	"GrossWeight":payload[i].GWt,
		// 				// 	"PairSize":payload[i].Size,
		// 				// 	"Remarks":payload[i].Remark,
		// 				// 	"Piece":payload[i].PCS
		// 				// };
		// 				// ProdWeight.push(wgt);
		// 				// if(payload[i].Photo.length>0){
		// 				// 	var seq=0;
		// 				// 	for(var j=0;j<payload[i].Photo.length;j++){
		// 				// 		var pht={
		// 				// 			"Product":"",
		// 				// 			"FileName":payload[i].Photo[j].Name,
		// 				// 			"Stream":payload[i].Photo[j].Stream,
		// 				// 			"Content":payload[i].Photo[j].Content,
		// 				// 			"SeqNo":seq
		// 				// 		};
		// 				// 		seq=seq+1;
		// 				// 		Photo.push(pht);
		// 				// 	}
		// 				// }

		// 			}
		// 			var that2 = that;

		// 			// var SData={
		// 			// 	"Product":Product,
		// 			// 	"ProdWeight":ProdWeight,
		// 			// 	"Photo":Photo
		// 			// };
		// 			$.post('/PurchaseLiteSave', {
		// 				"allData": payload,
		// 			})
		// 				.done(function (data, status) {
		// 					debugger;
		// 					sap.ui.core.BusyIndicator.hide();
		// 					MessageToast.show("data has been saved successfully");
		// 					that2.getView().byId("PurchaseLiteTable").getBinding("rows").refresh();
		// 				})
		// 				.fail(function (xhr, status, error) {
		// 					sap.ui.core.BusyIndicator.hide();
		// 					MessageBox.error(error);
		// 					debugger;
		// 				});
		// 			// that.getView().byId("idName").setValue(that.pattern + "_" + count.toString());
		// 		});


		// },
		// create_UUID: function () {
		// 	var dt = new Date().getTime();
		// 	var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		// 		var r = (dt + Math.random() * 16) % 16 | 0;
		// 		dt = Math.floor(dt / 16);
		// 		return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		// 	});
		// 	return uuid;
		// }
	});
});