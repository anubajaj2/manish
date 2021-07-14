// const { timesSeries } = require("async");
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
			this.getView().getModel("PurchaseLiteModel").setProperty("/titleGW", 0);
			this.getView().getModel("PurchaseLiteModel").setProperty("/titleTF", 0);
			this.getView().getModel("PurchaseLiteModel").setProperty("/titleTA", 0);
			this.getView().getModel("PurchaseLiteModel").setProperty("/visible", true);
			var Purc = [];
			// this.loadCategories(this.getOwnerComponent().getModel("local").getProperty("/ManufacturerData/Categories"));
			debugger;
			var oNew = {
				ItemCode: "",
				TagNo: "",
				GWt: 0.00,
				Amount: 0,
				Rate: 0,
				PCS: "",
				Size: "",
				Remark: "",
				// SubTotal: 0,
				Photo: [],
				Tunch: 0,
				NetWt: 0.000,
				LessWt: 0.000,
				FineGold: 0.000,
				PhotoCheck: false
			};
			for (var i = 0; i < 50; i++) {
				Purc.push(JSON.parse(JSON.stringify(oNew)));
			}
			this.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite", Purc);
			// this.getView().byId("PurchaseLiteTable").getBinding("rows").refresh();
			// var oRouter = this.getRouter();
			// oRouter.getRoute("Maker").attachMatched(this._onRouteMatched, this);
		}, getTotalItem: function () {
			debugger;
			var tData = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
			var count = 0;
			debugger;
			for (var i = 0; i < tData.length; i++) {
				if (!tData[i].ItemCode && !tData[i].GWt && !tData[i].Tunch) {
					continue;
				} else {
					count++;
				}
			}
			var tGwt = 0;
			var tFg = 0;
			var tA = 0;
			this.getView().getModel("PurchaseLiteModel").setProperty("/title", count);
			this.getView().getModel("local").setProperty("/PurchaseLiteCount", count);
			for (var i = 0; i < count; i++) {
				if (tData[i].GWt) {
					tGwt = tGwt + parseFloat(tData[i].GWt);
				}
				if (tData[i].FineGold) {
					tFg = tFg + parseFloat(tData[i].FineGold);
				}
				if (tData[i].Amount) {
					tA = tA + parseFloat(tData[i].Amount);
				}
			}
			this.getView().getModel("PurchaseLiteModel").setProperty("/titleGW", tGwt.toFixed(3));
			this.getView().getModel("PurchaseLiteModel").setProperty("/titleTF", tFg.toFixed(3));
			this.getView().getModel("PurchaseLiteModel").setProperty("/titleTA", tA.toFixed(3));
			return count;
		},
		onPurityClick: function (oEvent) {
			debugger;
			var sId = oEvent.getSource().getId().split("--")[(oEvent.getSource().getId().split("--").length) - 1];
			var tData = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
			var count = this.getTotalItem();
			this.getView().byId("idPurityInput").setEditable(true);
			if (sId === "id22") {
				if (oEvent.getSource().getType() === "Emphasized") {
					this.getView().byId("id22").setType("Default");
					this.getView().byId("id18").setType("Emphasized");
					this.getView().byId("idPurityInput").setValue("");

				}
				else {
					this.getView().byId("id18").setType("Default");
					this.getView().byId("id22").setType("Emphasized");
					this.getView().byId("idPurityInput").setValue("91.66");
					for (var i = 0; i < count; i++) {
						if (!tData[i].ItemCode && !tData[i].GWt) {
							continue;  //this is used due to zero's
						} else {
							tData[i].Tunch = 91.66
							tData[i].Karat = "22/22";
							this.onCalculation(i);
						}
						// tData[i].Tunch=75.20
					}
				}

			}
			else if (sId === "id18") {
				if (oEvent.getSource().getType() === "Emphasized") {
					this.getView().byId("id18").setType("Default");
					this.getView().byId("id22").setType("Emphasized");
					this.getView().byId("idPurityInput").setValue("");
				}
				else {
					this.getView().byId("id18").setType("Emphasized");
					this.getView().byId("id22").setType("Default");
					this.getView().byId("idPurityInput").setValue("75.20");
					// if(count!==0){
					for (var i = 0; i <= count; i++) {
						if (!tData[i].ItemCode && !tData[i].GWt) {
							continue;
						} else {
							tData[i].Tunch = 75.20
							tData[i].Karat = "22/20";
							this.onCalculation(i);
						}
						// tData[i].Tunch=75.20
					}
					// }
				}
			}
		},
		onPurityChange: function (oEvent) {
			debugger;
			var value = oEvent.getSource().getValue();
			if (this.getView().byId("id22").getType() === "Emphasized") {
				if (value > 92 || value < 91.66) {
					oEvent.getSource().setValueState("Error");
					oEvent.getSource().setValueStateText("value should be in between 91.66-92");
					return;
				}
				else {
					oEvent.getSource().setValueState("None");
				}

			}
			else if (this.getView().byId("id18").getType() === "Emphasized") {
				if (value > 76 || value < 75) {
					oEvent.getSource().setValueState("Error");
					oEvent.getSource().setValueStateText("value should be in between 75-76");
					return;
				}
				else {
					oEvent.getSource().setValueState("None");
				}
			}
			var tData = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
			var count = this.getTotalItem();
			for (var i = 0; i < count; i++) {
				if (!tData[i].ItemCode && !tData[i].GWt) {
					continue;
				} else {
					tData[i].Tunch = value;
					this.onCalculation(i);
				}
			}

		},
		onFixChange: function (oEvent) {
			var value = oEvent.getSource().getValue();
			var tData = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
			var count = this.getTotalItem();
			for (var i = 0; i < count; i++) {
				if (!tData[i].ItemCode && !tData[i].GWt) {
					continue;
				} else {
					tData[i].Rate = value;
					this.onCalculation(i);
				}
			}
		},
		onStyleChange: function (oEvent) {
			debugger;
			var value = oEvent.getSource().getSelectedKey();
			var tData = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
			var count = this.getTotalItem();
			for (var i = 0; i < count; i++) {
				if (!tData[i].ItemCode && !tData[i].GWt) {
					continue;
				} else {
					tData[i].SubCategory = value;
				}
			}
		},
		onCalculation: function (oEvent) {
			debugger;
			var rowNo;
			var flag = 0;
			if (typeof (oEvent) === "object") {
				rowNo = parseInt(oEvent.getSource().getParent().getId().split("row")[oEvent.getSource().getParent().getId().split("row").length - 1]);
				var sId = oEvent.getSource().getId();
				if (sId.includes("idLessWT") || sId.includes("idNetWT") ){
					flag = 1;
				}
			}
			else {
				rowNo = oEvent;
			}
			// var cCal=this.getView().getModel("local").getProperty("/CustomCalculation");
			// if(this.getView().byId("id22").getType()==="Emphasized"){
			// 	var bhav=cCal.Second;
			// }
			// else{
			// 	var bhav=cCal.First;
			// }
			var oModel = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite/" + rowNo);
			if (flag === 1) {
				// sId=oEvent.getSource().getId();
				if (sId.includes("idNetWT")) {
					oModel.LessWt = (parseFloat(oModel.GWt) - parseFloat(oModel.NetWt)).toFixed(3);
				}
				else if (sId.includes("idLessWT")) {
					oModel.NetWt = (parseFloat(oModel.GWt) - parseFloat(oModel.LessWt)).toFixed(3);
				}
			} 
			else {
				oModel.NetWt = (parseFloat(oModel.GWt) - parseFloat(oModel.LessWt)).toFixed(3);
				oModel.LessWt = (parseFloat(oModel.GWt) - parseFloat(oModel.NetWt)).toFixed(3);
			}
			oModel.FineGold = ((parseFloat(oModel.NetWt) * (parseFloat(oModel.Tunch) + parseFloat(oModel.Rate))) / 100).toFixed(3);
			// oModel.SubTotal=((parseFloat(oModel.FineGold)*parseFloat(bhav))+parseFloat(oModel.Amount)).toFixed(3);
			this.getTotalItem();
		},
		onDeletePhoto: function (oEvent) {
			debugger;
			var sImage = oEvent.getSource().getParent().getParent().getSelectedContextPaths();
			var _allImages = this.getView().getModel("PurchaseLiteModel").getProperty("/allImages");
			for (var j = 0; j < sImage.length; j++) {
				var oDeleteItem = parseInt(sImage[j].slice(-1));
				_allImages.splice(oDeleteItem, 1);
			}
			this.getView().getModel("PurchaseLiteModel").setProperty("/allImages", _allImages);
			oEvent.getSource().getParent().getParent().removeSelections()
			// var sPaths = this.getAllItems(oEvent.getSource().getParent().getParent(),false);
			// sPaths = this.reverseSort(sPaths,"allImages");
			// var that = this;
			// for (var i = 0; i < sPaths.length; i++) {
			// 	var toBeDeleted = this.getView().getModel("local").getProperty(sPaths[i]);
			// 	if(toBeDeleted.id){
			// 		//To be deleted from server also
			// 		if (toBeDeleted.id !== "") {
			// 			that._deletedImages.push({id: toBeDeleted.id});
			// 			that.getView().getModel("local").setProperty("/deleteImages", that._deletedImages);
			// 			that.getView().getModel("local").setProperty("/checkChange", true);
			// 		}
			// 	}else{
			// 		//this.deleteImage(toBeDeleted.Stream);
			// 	}
			// 	this.deleteImage(toBeDeleted.Stream);
			// }
			// oEvent.getSource().getParent().getParent().removeSelections();
		},
		// deleteImage: function (Stream) {
		// 	debugger;
		// 	var _allImages = this.getView().getModel("local").getProperty("/allImages");
		// 	for (var j = 0; j < _allImages.length; j++) {
		// 		if(_allImages[j].Stream === Stream){
		// 			_allImages.splice(j,1);
		// 			break;
		// 		}
		// 	}
		// 	this.getView().getModel("local").setProperty("/allImages",_allImages);
		// },
		onTypePress: function (oEvent) {
			var sId = oEvent.getSource().getId();
			var tData = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
			var count = this.getTotalItem();
			if (sId.includes("idTypeStudded")) {
				this.getView().byId("idTypeStudded").setType("Emphasized");
				this.getView().byId("idTypePlain").setType("Default");
				for (var i = 0; i < count; i++) {
					if (!tData[i].ItemCode && !tData[i].GWt) {
						continue;
					} else {
						tData[i].Type = "S";
					}
				}
			}
			else {
				this.getView().byId("idTypeStudded").setType("Default");
				this.getView().byId("idTypePlain").setType("Emphasized");
				for (var i = 0; i <= count; i++) {
					if (!tData[i].ItemCode && !tData[i].GWt) {
						continue;
					} else {
						tData[i].Type = "P";
					}
				}
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
			if (oEvent.getSource().getId().split("-")[oEvent.getSource().getId().split("-").length - 2] === "idItemCode") {
				var value = oEvent.getSource().getValue().split(" ")[0];
				var row = parseInt(oEvent.getSource().getParent().getId().split("row")[oEvent.getSource().getParent().getId().split("row").length - 1]);
				var oModel = this.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite/" + row + "/ItemCode", value);
			}
			var currentBoxId = oEvent.getSource().getId();
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
					var allData = that.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
					var count = that.getTotalItem();
					var j = 0;
					if (count !== 0) {
						j = count;
					}
					for (var i = 0; i < excelData.length; i++) {

						// excelD.push({
						if (j < 50) {
							allData[j].ItemCode = excelData[i]["ItemCode"];
							allData[j].TagNo = excelData[i]["TAG NO"];
							allData[j].GWt = excelData[i]["G WT"] ? parseFloat(excelData[i]["G WT"]).toFixed(3) : 0.000;
							allData[j].Amount = excelData[i]["Amount"] ? excelData[i]["Amount"] : 0.000;
							allData[j].Rate = 0;
							allData[j].PCS = excelData[i]["PCS"];
							allData[j].Size = excelData[i]["Size"];
							allData[j].Remark = excelData[i]["Remark"];
							allData[j].Photo = [];
							allData[j].Tunch = that.getView().byId("idPurityInput").getValue() ? that.getView().byId("idPurityInput").getValue() : 0;
							allData[j].NetWt = 0.000;
							allData[j].FineGold = 0.000;
							allData[j].LessWt = excelData[i]["LessWt"] ? parseFloat(excelData[i]["LessWt"]).toFixed(3) : 0.000;
							allData[j].PhotoCheck = false;
							// allData[j].SubTotal = 0;
							var oIn = that.getView().byId("idPurityInput").getValue();
							if (oIn) {
								allData[j].Tunch = oIn;
							}
							if (that.getView().byId("idTypePlain").getType() === "Emphasized") {
								allData[j].Type = "P"
							}
							if (that.getView().byId("idTypeStudded").getType() === "Emphasized") {
								allData[j].Type = "S"
							}
							oIn = that.getView().byId("idFixInput").getValue();
							if (oIn) {
								allData[j].Rate = oIn;
							}
							oIn = that.getView().byId("idPurchaseStyle").getSelectedKey();
							if (oIn) {
								allData[j].SubCategory = oIn;
							}
						}
						else {
							var oNew = {
								ItemCode: excelData[i]["ItemCode"],
								TagNo: excelData[i]["TAG NO"],
								GWt: excelData[i]["G WT"] ? parseFloat(excelData[i]["G WT"]).toFixed(3) : 0.000,
								Amount: excelData[i]["Amount"] ? excelData[i]["Amount"] : 0.000,
								Rate: 0,
								PCS: excelData[i]["PCS"],
								Size: excelData[i]["Size"],
								Remark: excelData[i]["Remark"],
								// SubTotal: 0,
								Photo: [],
								Tunch: that.getView().byId("idPurityInput").getValue() ? that.getView().byId("idPurityInput").getValue() : 0,
								NetWt: 0.000,
								LessWt: excelData[i]["LessWt"] ? parseFloat(excelData[i]["LessWt"]).toFixed(3) : 0.000,
								FineGold: 0.000,
								PhotoCheck: false
							};
							var oIn = that.getView().byId("idPurityInput").getValue();
							if (oIn) {
								oNew.Tunch = oIn;
							}
							if (that.getView().byId("idTypePlain").getType() === "Emphasized") {
								oNew.Type = "P"
							}
							if (that.getView().byId("idTypeStudded").getType() === "Emphasized") {
								oNew.Type = "S"
							}
							oIn = that.getView().byId("idFixInput").getValue();
							if (oIn) {
								oNew.Rate = oIn;
							}
							oIn = that.getView().byId("idPurchaseStyle").getSelectedKey();
							if (oIn) {
								oNew.SubCategory = oIn;
							}
							allData.push(oNew);
						}
						j++;
						// });

					}
					debugger;
					// Setting the data to the local model

					that.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite", allData);
					count = that.getTotalItem();
					allData = that.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
					for (i = 0; i < count; i++) {
						that.onCalculation(i);
					}
					that.getView().byId("PurchaseLiteTable").getModel("PurchaseLiteModel").refresh();
					// that.getView().getModel("PurchaseLiteModel").setProperty("/title", excelD.length);
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
				GWt: 0.000,
				Amount: 0,
				Rate: 0,
				PCS: "",
				Size: "",
				Remark: "",
				// SubTotal: 0,
				Photo: [],
				Tunch: 0,
				NetWt: 0.000,
				LessWt: 0.000,
				FineGold: 0.000,
				PhotoCheck: false
			};
			var oIn = this.getView().byId("idPurityInput").getValue();
			if (oIn) {
				oNew.Tunch = oIn;
			}
			if (this.getView().byId("idTypePlain").getType() === "Emphasized") {
				oNew.Type = "P"
			}
			if (this.getView().byId("idTypeStudded").getType() === "Emphasized") {
				oNew.Type = "S"
			}
			oIn = this.getView().byId("idFixInput").getValue();
			if (oIn) {
				oNew.Rate = oIn;
			}
			oIn = this.getView().byId("idPurchaseStyle").getSelectedKey();
			if (oIn) {
				oNew.SubCategory = oIn;
			}
			// idTypeStudded
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
			// this.getView().getModel("PurchaseLiteModel").setProperty("/title", data.length);
			this.getTotalItem();
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
		onItemCodeChange: function (oEvent) {
			debugger;

		},
		// onEdit: function (oEvent) {
		// 	debugger;
		// 	var that = this;
		// 	this.EditPath = oEvent.getSource().getParent().getParent().getRowBindingContext().getPath();
		// 	var value = JSON.parse(JSON.stringify(this.getView().getModel("PurchaseLiteModel").getProperty(this.EditPath)));
		// 	this.getView().getModel("PurchaseLiteModel").setProperty("/entry", value);
		// 	if (!this.oEditProduct) {
		// 		Fragment.load({
		// 			id: "idEditProduct",
		// 			name: "sap.ui.demo.cart.fragments.PurchaseStyleCURD",
		// 			controller: this
		// 		}).then(function (oPopup) {
		// 			that.oEditProduct = oPopup;
		// 			that.getView().addDependent(oPopup);
		// 			oPopup.setTitle("EDIT");
		// 			oPopup.getButtons()[0].setText("Edit");
		// 			oPopup.open();
		// 		});
		// 	} else {
		// 		this.oEditProduct.open();
		// 	}
		// },
		onCopy: function (oEvent) {
			debugger;
			// var that = this;
			var sPath = oEvent.getSource().getParent().getParent().getRowBindingContext().getPath();
			var value = JSON.parse(JSON.stringify(this.getView().getModel("PurchaseLiteModel").getProperty(sPath)));
			var ssPath = oEvent.getSource().getParent().getParent().getRowBindingContext().getPath().split("/");
			sPath = parseInt(ssPath[ssPath.length - 1]);
			var data = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
			data.splice((sPath + 1), 0, value);
			this.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite", data);
			this.getTotalItem();
			MessageToast.show("Item Copied Successfully");
			// this.getView().getModel("PurchaseLiteModel").setProperty("/entry", value);
			// if (!this.oCopyProduct) {
			// 	Fragment.load({
			// 		id: "idCopyProduct",
			// 		name: "sap.ui.demo.cart.fragments.PurchaseStyleCURD",
			// 		controller: this
			// 	}).then(function (oPopup) {
			// 		that.oCopyProduct = oPopup;
			// 		that.getView().addDependent(oPopup);
			// 		oPopup.setTitle("COPY");
			// 		oPopup.getButtons()[0].setText("Copy");
			// 		oPopup.open();
			// 	});
			// } else {
			// 	this.oCopyProduct.open();
			// }
		},
		// onPressHandleSecureCancelPopup: function (oEvent) {
		// 	debugger;
		// 	oEvent.getSource().getParent().close();
		// 	MessageToast.show("Operation Cancelled");
		// },
		// onPressHandleSecureOkPopup: function (oEvent) {
		// 	var sId = oEvent.getSource().getParent().getId().split("--")[0];
		// 	var value = this.getView().getModel("PurchaseLiteModel").getProperty("/entry");
		// 	var data = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
		// 	if (sId === "idAddProduct") {
		// 		if (!data) {
		// 			data = [];
		// 		}
		// 		data.unshift(value);
		// 		debugger;
		// 		this.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite", data);
		// 		this.getView().getModel("PurchaseLiteModel").setProperty("/title", data.length);
		// 		MessageToast.show("Data Added Successful");

		// 	} else if (sId === "idEditProduct") {
		// 		debugger;
		// 		this.getView().getModel("PurchaseLiteModel").setProperty(this.EditPath, value);
		// 		MessageToast.show("Data Edited Successful");
		// 	} else if (sId === "idCopyProduct") {
		// 		data.unshift(value);
		// 		this.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite", data);
		// 		this.getView().getModel("PurchaseLiteModel").setProperty("/title", data.length);
		// 		debugger;
		// 		MessageToast.show("Data Copied Successful");
		// 	}
		// 	oEvent.getSource().getParent().close();
		// },
		onPressTemplateDownload: function () {
			debugger;
			var aCols, aMessages, oSettings;
			// if (Array.isArray(exportData) && exportData.length) {
			aCols = this._createExcelColumns();
			var reportExcel = [];
			for (var i = 1; i < 11; i++) {
				reportExcel.push({
					ItemCode: 100 + i,
					TagNo: "T-" + i,
					GWt: i * 10,
					Amount: (i * 10) + (i * 5),
					PCS: i,
					Size: i,
					Remark: i,
					LessWt: 2,
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
		// onSuggestionItemSelected:function(oEvent){debugger;},
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
					label: 'LessWt',
					property: 'LessWt'

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
			debugger;
			var ssPath = oEvent.getSource().getParent().getParent().getRowBindingContext().getPath().split("/");
			var sPath = parseInt(ssPath[ssPath.length - 1]);
			var data = this.getView().getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
			data.splice(sPath, 1);
			this.getView().getModel("PurchaseLiteModel").setProperty("/PurchaseLite", data);
			this.getTotalItem();
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