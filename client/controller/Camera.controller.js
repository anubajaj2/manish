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
	"sap/m/Dialog",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"
], function(BaseController, deepExtend, syncStyleClass, Controller, ObjectMarker, MessageToast, UploadCollectionParameter, MobileLibrary, JSONModel, FileSizeFormat, Device, formatter, Dialog,
Fragment, MessageBox) {
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
			 this.mode = "Create";
			 this.setMode();
			 this.lastTwoDisplay();
		},
		getAllItems: function(oGrid, sBool){
			var getSelectedItems = oGrid.getSelectedItems();
			var paths = [];
			if(sBool){
				for (var i = 0; i < getSelectedItems.length; i++) {
					paths.push(getSelectedItems[i].getBindingContext().getPath());
				}
			}else{
				for (var i = 0; i < getSelectedItems.length; i++) {
					paths.push(getSelectedItems[i].getBindingContext("local").getPath());
				}
			}
			return paths;
		},
		fixedDialog: {},
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
									var allImages = that3.getModel("local").getProperty("/allImages");
									allImages.push({
										"Stream": Stream,
										"Content": reader.result
									});
									that3.getModel("local").setProperty("/allImages", allImages);
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
		onDelete: function(oEvent){
			var sPaths = this.getAllItems(oEvent.getSource().getParent().getParent(),false);
			sPaths = this.reverseSort(sPaths,"allImages");
			var that = this;
			for (var i = 0; i < sPaths.length; i++) {
				var toBeDeleted = this.getView().getModel("local").getProperty(sPaths[i]);
				if(toBeDeleted.id){
					//To be deleted from server also
					if (toBeDeleted.id !== "") {
						that._deletedImages.push({id: toBeDeleted.id});
						that.getView().getModel("local").setProperty("/deleteImages", that._deletedImages);
						that.getView().getModel("local").setProperty("/checkChange", true);
					}
				}else{
					//this.deleteImage(toBeDeleted.Stream);
				}
				this.deleteImage(toBeDeleted.Stream);
			}
			oEvent.getSource().getParent().getParent().removeSelections();
		},
		deleteImage: function (Stream) {
			var _allImages = this.getView().getModel("local").getProperty("/allImages");
			for (var j = 0; j < _allImages.length; j++) {
				if(_allImages[j].Stream === Stream){
					_allImages.splice(j,1);
					break;
				}
			}
			this.getView().getModel("local").setProperty("/allImages",_allImages);
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
					reader.onload = function(e){
						var _allImages = that.getView().getModel("local").getProperty("/allImages");
						try {
							var vContent = e.currentTarget.result; //.result.replace("data:image/jpeg;base64,", "");
							for (var i = 0; i < _allImages.length; i++) {
								if(!_allImages[i].Content){
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

		getRouter: function () {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},
		_bindView : function (sObjectPath) {

		},
		_onBindingChange : function () {

		},
		onDeleteRow: function() {
			var oTable = this.getView().byId("idTab");
			var sPaths = this.getAllItems(oTable);
			var oModel = oTable.getModel("local");
			sPaths = this.reverseSort(sPaths,"ProdWeights");
			var Values = oModel.getProperty("/ProdWeights");
			for (var i = 0; i < sPaths.length; i++) {
				var sIdx = parseInt(sPaths[i].split("/")[2]);
				Values.splice(sIdx,1);
			}
			oModel.setProperty("/ProdWeights",Values);

			this.getView().getModel("local").setProperty("/checkChange", true);

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
			var ProdWeights = oModel.getProperty("/ProdWeights");
			ProdWeights.push(props);
			oModel.setProperty("/ProdWeights", ProdWeights);
			this.getView().getModel("local").setProperty("/checkChange", true);
			this.getView().byId("td1").focus();
			this.getView().byId("__component0---Camera--td1").focus();

      this.add = 'X';

			var oTable = this.getView().byId("idTab");
			var that = this;
			oTable.addEventDelegate({
				onAfterRendering : function(oEvent) {
						that.setupTabHandling(oTable);
				}
			}, oTable);
		},
		setupTabHandling : function(oTable) {
		//oTable.addEventDelegate({
		//	onAfterRendering : function(oEvent) {
				var oTableID = oTable.getId();
				var oRows = this.getView().byId(oTableID).getItems()
				var noOfoRows = oRows.length;
				var lastItemRow = this.getView().byId(oTableID).getItems()[noOfoRows-1];
        var cells = lastItemRow.getAggregation("cells");
				//var oRows = this.getRows();
				var that = this;
				if (this.add === 'X') {
					cells[0].focus();

					// jump to new row firstInput
				//	thisRow = oRows.indexOf(oRows.filter(function(entry) {
					//	return entry.getId() === oRow.getId();
					//})[0]);
				}
		/*		$("#" + oTableID).focusin(function() {
					// remember current focused cell
					jQuery.sap.delayedCall(100, null, function() {
						var oBody = $('#' + oTableID).find('tbody');
						// find the focused input field
						var oField = oBody.find('.sapMInputFocused')[0];
						if (oField) {
							// store ID of focused cell
							that._FieldID = oField.id;
						}
					});
				}); */

		/*		var oBody = $('#' + oTableID).find('tbody');
				// find the focused input field
				var oField = oBody.find('.sapMInputFocused')[0];
				if (oField) {
					// store ID of focused cell
					this._FieldID = oField.id;
				}

				$('#' + oTableID).on('keyup', function(e) {
var cellID = cells[0].getId();
					var oSelectedField = sap.ui.getCore().byId(that._FieldID);
				//	var oRow = oSelectedField.getParent();
				//	var oCells = oRow.getCells();
					var aInputs = []; // all input fields per row
					var firstInput = 0; // first input field in row
					var lastInput = 0; // last input field in row

					// get index of first and last input fields of table row
					for (var i = 0; i < oCells.length; i++) {
						if (oCells[i]._$input) {
							aInputs.push(i);
							if (!firstInput) {
								firstInput = i;
							}
							lastInput = i;
						}
					} */

					var oTargetCell, thisInput, thisRow, targetIndex;

					// on TAB press - navigate one field forward
				/*	if (e.which == 13 && !e.shiftKey) {
						// get index of currently focused field
						thisInput = oCells.indexOf(oCells.filter(function(entry) {
							return entry.getId() === that._FieldID;
						})[0]);

						// is field last input in row?
						if (thisInput === lastInput) {
							// jump to next row
							thisRow = oRows.indexOf(oRows.filter(function(entry) {
								return entry.getId() === oRow.getId();
							})[0]);

							// is row last visible row on screen?
							if (thisRow === oTable.getRows().length - 1) {
								// last visible row - scroll one row down and keep focus
								oTable._scrollNext();
								jQuery.sap.delayedCall(100, null, function() {
									var oTargetCell = oRows[thisRow].getCells()[firstInput];
									oTargetCell.function () {

									}ocus();
								});
							} else {
								// not last visible row - set focus in next row
								oTargetCell = oRows[thisRow + 1].getCells()[firstInput];
								oTargetCell.focus();
							}

						} else {
							// no row jump - focus next input cell in this row
							targetIndex = 0;
							for (i = 0; i < aInputs.length; i++) {
								if (aInputs[i] === thisInput) {
									// next entry is target cell
									targetIndex = aInputs[i + 1];
								}
							}
							oTargetCell = oRow.getCells()[targetIndex];
							oTargetCell.focus();
						}
					}
					// On SHIFT + TAB press - navigate one field backward
					if (e.which == 13 && e.shiftKey) {
						// get index of currently focused field
						thisInput = oCells.indexOf(oCells.filter(function(entry) {
							return entry.getId() === that._FieldID;
						})[0]);

						// is field first input in row?
						if (thisInput === firstInput) {
							// jump to previous row
							thisRow = oRows.indexOf(oRows.filter(function(entry) {
								return entry.getId() === oRow.getId();
							})[0]);

							// is row first visible row on screen?
							if (thisRow === 0) {
								// first visible row - scroll one row up and keep focus
								oTable._scrollPrevious();
								jQuery.sap.delayedCall(100, null, function() {
									var oTargetCell = oRows[thisRow].getCells()[lastInput];
									oTargetCell.focus();
								});
							} else {
								// not last visible row - set focus in previous row
								oTargetCell = oRows[thisRow - 1].getCells()[lastInput];
								oTargetCell.focus();
							}

						} else {
							// no row jump - focus previous input cell in this row
							targetIndex = 0;
							for (i = 0; i < aInputs.length; i++) {
								if (aInputs[i] === thisInput) {
									// next entry is target cell
									targetIndex = aInputs[i - 1];
								}
							}
							oTargetCell = oRow.getCells()[targetIndex];
							oTargetCell.focus();
						} */
				//	}

			//	});
		//	}
	//	}, oTable);
	},
	ontd1:function(){
		//this.getView().byId("td2").focus();
		//this.setupTabHandling(oTable);
	},


		weightPopup: null,
		oModelStone : {},
		itemPath: "",
		AllValues: [],
		onLessPopup: function(oEvent){
			var nVal = oEvent.getSource().getValue();
			var sPath = oEvent.getSource().getBindingContext("local").getPath();
			var nIndex = sPath.split("/")[sPath.split("/").length - 1];
			var oModel = this.getView().getModel("local");
			this.AllValues = [];
			var AllValues = oModel.getProperty("/ProdWeights/" + nIndex + "/Values");
			if(AllValues === undefined){
				AllValues = [];
			}
			if(AllValues.length > 0){
				this.AllValues = JSON.parse(JSON.stringify(AllValues));
			}
			this.itemPath = "/ProdWeights/" + nIndex + "/Values";
			var that = this;
			if(!this.weightPopup){
				Fragment.load({
					name: 'sap.ui.demo.cart.fragments.stones',
					controller: this
				}).then(function(oDialog){
					that.weightPopup =	oDialog;
					that.oModelStone = new sap.ui.model.json.JSONModel({
						"items": AllValues
					});
					that.oModelStone.setDefaultBindingMode("TwoWay");
					that.weightPopup.setModel(that.oModelStone);
					that.weightPopup.setTitle("Less Weights");
					that.getView().addDependent(that.weightPopup);
					that.weightPopup.open();
				});
			}else{
				that.oModelStone.setProperty("/items", AllValues);
				that.weightPopup.open();
			}
		},
		onStoneDeleteRow: function() {
			var oTable = this.getView().getDependents()[0].getContent()[0];
			var sPaths = this.getAllItems(oTable,true);
			var oModel = oTable.getModel();
			sPaths = this.reverseSort(sPaths,"items");
			var Values = oModel.getProperty("/items");
			for (var i = 0; i < sPaths.length; i++) {
				var sIdx = parseInt(sPaths[i].split("/")[2]);
				Values.splice(sIdx,1);
			}
			oModel.setProperty("/items",Values);
			this.getView().getModel("local").setProperty("/checkChange", true);
		},
		onOKStone: function(){
			var oModel = this.getView().getModel("local");
			var items = this.oModelStone.getProperty("/items");
			var TotalAmount = 0, LessWeight = 0, Fine = 0;
			for (var i = 0; i < items.length; i++) {
				if(items[i].MoreAmount <= 0 && items[i].Net <= 0){
						MessageBox.error("Please enter valid values");
						return;
				}
				TotalAmount = TotalAmount + parseInt(items[i].MoreAmount);
				LessWeight = LessWeight + parseFloat(items[i].Net);
			}
		  oModel.setProperty(this.itemPath,	items);
			var sPathMain = this.itemPath.replace("/Values", "");
			var allMain = oModel.getProperty(sPathMain);
			oModel.setProperty(sPathMain + "/LessWeight", LessWeight);

			allMain.NetWeight = allMain.GrossWeight - LessWeight;
			if(allMain.NetWeight){
				allMain.NetWeight = allMain.NetWeight.toFixed(3)

				var tunch = oModel.getProperty("/Product/Tunch");
				var Wastage = oModel.getProperty("/Product/Wastage");
				tunch = parseFloat(tunch) + parseFloat(Wastage);
				var Quantity = allMain.Quantity;
				Fine = allMain.NetWeight * Quantity;
				Fine = Fine * tunch / 100;
				Fine = Fine.toFixed(3);
				oModel.setProperty(sPathMain + "/NetWeight", allMain.NetWeight);
				oModel.setProperty(sPathMain + "/Fine", Fine);

				oModel.setProperty(sPathMain + "/MoreAmount", TotalAmount);
				var Making = parseFloat(oModel.getProperty("/Product/Making"));
				var MakingCharges = 0;
				if(Making > 0){
					TotalAmount =  ( Making * allMain.GrossWeight ) + TotalAmount;
				}
				oModel.setProperty(sPathMain + "/Amount", TotalAmount);
			}

			this.weightPopup.close();
		},
		onCloseStone: function(){
			this.getView().getModel("local").setProperty(this.itemPath,	this.AllValues);
			this.weightPopup.close();
		},
		onItemChange: function(oEvent){
			var sName = oEvent.getSource().getName();
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			var oModel = oEvent.getSource().getParent().getModel();
			var rowValues = oModel.getProperty(sPath);
			switch (rowValues.Item) {
				case "CST" :
						rowValues.Type = "Gm";
						break;
				case "MLW" :
						rowValues.Type = "Gm";
						break;
				case "MTW" :
						rowValues.Type = "Gm";
						break;
				case "SRM":
						rowValues.Type = "Gm";
						break;
				case "OTH":
						rowValues.Type = "Pc";
						break;
				case "STW":
						rowValues.Type = "Pc";
						break;
				case "DMD" :
						rowValues.Type = "Ct";
						break;
				case "POL" :
						rowValues.Type = "Ct";
						break;
				default:
			}
			oModel.setProperty( sPath + "/Type", rowValues.Type);
			this.onStChange(oEvent);
		},
		onStChange: function(oEvent){
			debugger;
			var sName = oEvent.getSource().getName();
			var sPath = oEvent.getSource().getParent().getBindingContextPath();
			var oModel = oEvent.getSource().getParent().getModel();
			var rowValues = oModel.getProperty(sPath);
			var Val = 0, Rate = 0, Weight = 0, Amount = 0, Net = 0, Pc = 0;
			Weight = parseFloat(rowValues.Weight);
			Rate = parseFloat(rowValues.Rate);
			Pc = parseFloat(rowValues.Pc);
			switch (sName) {
				case "Weight":
					Weight = parseFloat(oEvent.getParameter("newValue"));
					break;
				case "Rate":
					Rate = parseFloat(oEvent.getParameter("newValue"));
						break;
				case "Pc":
						Pc = parseFloat(oEvent.getParameter("newValue"));
						break;
				default:
			}
			switch (rowValues.Type) {
				case "Gm":
						Amount = Rate * Weight;
						Net = Weight;
						break;
				case "Pc":
						Amount = Pc * Rate;
						Net = Weight;
						break;
				case "Ct":
						Amount = Rate * Weight;
						Net = Weight / 5;
						break;
			}
			if(isNaN(Amount)){
				Amount = 0;
			}else{
				Amount = Amount.toFixed(0);
			}
			if(isNaN(Net)){
				Net = 0;
			}else{
				Net = Net.toFixed(3);
			}
			oModel.setProperty(sPath + "/MoreAmount", Amount);
			oModel.setProperty(sPath + "/Net", Net);
			this.getView().getModel("local").setProperty("/checkChange", true);
		},
		onStoneInsert: function(oEvent) {
			var props = {
				"Item": "OTH",
				"Type": "Pc",
				"Pc": 0,
				"Weight": 0,
				"Rate": 0,
				"MoreAmount":0,
				"Amount": 0,
				"Size": "",
				"Labor": "",
				"Tunch": 0,
				"Extra1": "",
				"Extra2": 0
			};
			var oTable = this.getView().getDependents()[0].getContent()[0];
			var aData = oTable.getModel().getProperty("/items");
			aData.push(props);
			oTable.getModel().setProperty("/items",aData);
			this.getView().getModel("local").setProperty("/checkChange", true);
		},
		onFocus: function() {
			MessageToast.show("ye");
		},
		onChange: function(oEvent) {

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
		}
	});
});
