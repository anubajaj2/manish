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
  "sap/ui/unified/FileUploader",
  "sap/ui/demo/cart/controller/PurchaseLite.controller"
], function (BaseController, UIComponent, JSONModel,
  MessageToast, Formatter, MessageBox, Filter, FilterOperator, SelectDialog, exportLibrary, Spreadsheet, Fragment, Dialog, FileUploader, pLite) {
  "use strict";
  var manufacturerId;
  var changeCheck = 'false';
  var groupID = [];
  var EdmType = exportLibrary.EdmType;
  return BaseController.extend("sap.ui.demo.cart.controller.Maker", {
    formatter: Formatter,
    onInit: function () {
      var oViewDetailModel = new JSONModel({
        "buttonText": "Save",
        "deleteEnabled": false,
        "blockStatus": false
      });
      this.setModel(oViewDetailModel, "viewModel");

      var oRouter = this.getRouter();
      oRouter.getRoute("Maker").attachMatched(this._onRouteMatched, this);
    },
    _onRouteMatched: function (oEvent) {
      debugger;
      var that = this;
      var auth = this.getView().getModel("local").getProperty("/Authorization");
      if (!auth) {
        this.logOutApp();
      }
      this.loadCategories(this.getView().getModel("local").getProperty("/ManufacturerData/Categories"));
      this.getView().setBusy(true);
      this.getView().getModel("local").setProperty("/sKeyType", 'PURCHASESLITE');
      var viewModel = this.getView().getModel("viewModel");
      viewModel.setProperty("/codeEnabled", true);
      viewModel.setProperty("/buttonText", "Save");
      viewModel.setProperty("/deleteEnabled", false);
      viewModel.setProperty("/blockStatus", false);
      viewModel.setProperty("/emailStatus", true);
      viewModel.setProperty("/PatternStatus", true);
      var odataModel = new JSONModel({
        "groupCodeState": "None",
        "emailState": "None",
        "PatternState": "None"
      });
      this.setModel(odataModel, "dataModel");
      var oModelManufacturer = new JSONModel();
      var oModelGroup = new JSONModel();
      var oCategoies = new JSONModel();

      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
        "/Categories", "GET", {}, {}, this)
        .then(function (oData) {
          
          that.getView().getModel("local").setProperty("/Categories",oData.results);
          that.getView().setBusy(false);
        }).catch(function (oError) {
          that.getView().setBusy(false);
          MessageToast.show("cannot fetch the data");
        });

        this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
        "/Manufacturers", "GET", {}, {}, this)
        .then(function (oData) {
          oModelManufacturer.setData(oData);
          that.getView().setModel(oModelManufacturer, "manufactureModelInfo");
          that.getView().setBusy(false);
        }).catch(function (oError) {
          that.getView().setBusy(false);
          MessageToast.show("cannot fetch the data");
        });  

      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
        "/CustomCalculations", "GET", {}, {}, this)
        .then(function (oData) {
          var myData = that.getView().getModel("local").setProperty("/CustomCalculation", oData.results[0]);
        }).catch(function (oError) {
          MessageToast.show("cannot fetch the data");
        });
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
        "/Categories", "GET", {}, {}, this)
        .then(function (oData) {
          oCategoies.setData(oData);
          that.getView().setModel(oCategoies, "categories");
          // that.getView().setBusy(false);
        }).catch(function (oError) {
          // that.getView().setBusy(false);
          MessageToast.show("cannot fetch the data");
        });
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
        "/Groups", "GET", {}, {}, this)
        .then(function (oData) {
          oModelGroup.setData(oData);
          that.getView().setModel(oModelGroup, "groupModelInfo");
        }).catch(function (oError) {
          MessageToast.show("cannot fetch the data");
        });
      //this.clearScreen();
    },

    onTabSelect1: function (oEvent) {
      debugger;
      var sKey = oEvent.getParameter("selectedItem").getProperty("key");
      this.getOwnerComponent().getModel("local").setProperty("/sKeyType", sKey);

    },
    onMasterSave: function () {
      debugger;
      var oPurchaseView = sap.ui.getCore().byId("__component0---idMaker--PurchaseLiteBlock-Collapsed");
      if (oPurchaseView.getModel("PurchaseLiteModel").getProperty("/visible") === false) {
        MessageToast.show("data is already saved");
        return;
      }
      var payload = oPurchaseView.getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
      if (!payload) {
        MessageToast.show("Please enter a data");
        return;
      }
      if(!oPurchaseView.byId("idPurityInput").getValue()){
        MessageToast.show("Please enter/select the Purity");
        return;
      }
      if(oPurchaseView.byId("idTypeStudded").getType()==="Default" && oPurchaseView.byId("idTypePlain").getType()==="Default"){
        MessageToast.show("Please select the Type");
        return;
      }
      if(parseFloat(oPurchaseView.byId("idFixInput").getValue())<0){
        MessageToast.show("Please enter the positive number or zero Tick Mark/Rate");
        return;
      }
      
      if(!oPurchaseView.byId("idPurchaseStyle").getSelectedKey()){
        MessageToast.show("Please select the Style");
        return;
      }
      if(!oPurchaseView.byId("idStonePrice").getValue()){
        MessageToast.show("Please enter the Stone Price");
        return;
      }
      sap.ui.core.BusyIndicator.show();
      oPurchaseView.getModel("PurchaseLiteModel").setProperty("/visible", false);
      var CreatedBy = this.getView().getModel("local").getProperty("/CurrentUser");
      // var oFilter1 = new sap.ui.model.Filter("CreatedBy", sap.ui.model.FilterOperator.EQ, "'" + CreatedBy + "'");
      var that = this;
      // that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
      //   "/Products/$count", "GET", {
      //   filters: [oFilter1]
      // }, {}, that)
      $.get("/getpattern?Createdby=" + CreatedBy)
        .then(async function (count) {
          debugger;
          count = parseInt(count) + 1;
          var pattern = that.getView().getModel("local").getProperty("/ManufacturerData/Pattern");
          var batch_Id = that.create_UUID();
          // var Product = [];
          // var ProdWeight = [];
          // var Photo = [];
          var payload = oPurchaseView.getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
          var fPayload = [];
          var pCount = that.getView().getModel("local").getProperty("/PurchaseLiteCount");
          if (!pCount) {
            MessageBox.error("Blank data can not be saved");
            oPurchaseView.getModel("PurchaseLiteModel").setProperty("/visible", true);
            sap.ui.core.BusyIndicator.hide();
            return;
          }
          for (var i = 0; i < pCount; i++){
            if(payload[i].sAmount==="Error"||payload[i].sGWt==="Error"||payload[i].sItemCode==="Error"||payload[i].sLessWt==="Error"||payload[i].sNetWt==="Error"||payload[i].sPCS==="Error"||payload[i].sRate==="Error"||payload[i].sSize==="Error"||payload[i].sTagNo==="Error"||payload[i].sTunch==="Error"){
              MessageToast.show("Please remove the Error's from the table before save");
              oPurchaseView.getModel("PurchaseLiteModel").setProperty("/visible", true);
              sap.ui.core.BusyIndicator.hide();
              return;
            }
            if(payload[i].GWt==="0"||payload[i].GWt===0||payload[i].Tunch==="0"||!payload[i].Tunch||!payload[i].GWt){
              MessageToast.show("GWt,Tunch should not be zero/blank");
              oPurchaseView.getModel("PurchaseLiteModel").setProperty("/visible", true);
              sap.ui.core.BusyIndicator.hide();
              return;
            }
            if(payload[i].ItemCode===""){
              MessageToast.show("Please enter Item code");
              oPurchaseView.getModel("PurchaseLiteModel").setProperty("/visible", true);
              sap.ui.core.BusyIndicator.hide();
              return;
            }
          }

          for (var i = 0; i < pCount; i++) {
            payload[i].ProductId = pattern + "_" + count.toString();
            payload[i].BatchId = batch_Id;
            payload[i].CreatedBy = that.getView().getModel("local").getProperty("/CurrentUser");
            payload[i].Count = count;
            count = parseInt(count) + 1;
            fPayload.push(payload[i]);
            // var pdt={
            // 	"ProductId":payload[i].ItemCode,
            // 	"TagNo":payload[i].TagNo,
            // 	"Name":payload[i].Remark,
            // 	"Category":"HardCode",
            // 	"Tunch":0,
            // 	"Wastage":0,
            // 	"GrossWeight":0,
            // 	"AlertQuantity":0,
            // 	"BatchId":batch_Id
            // };
            // Product.push(pdt);
            // var wgt={
            // 	"ProductId":"",
            // 	"Amount":payload[i].Amount,
            // 	"GrossWeight":payload[i].GWt,
            // 	"PairSize":payload[i].Size,
            // 	"Remarks":payload[i].Remark,
            // 	"Piece":payload[i].PCS
            // };
            // ProdWeight.push(wgt);
            // if(payload[i].Photo.length>0){
            // 	var seq=0;
            // 	for(var j=0;j<payload[i].Photo.length;j++){
            // 		var pht={
            // 			"Product":"",
            // 			"FileName":payload[i].Photo[j].Name,
            // 			"Stream":payload[i].Photo[j].Stream,
            // 			"Content":payload[i].Photo[j].Content,
            // 			"SeqNo":seq
            // 		};
            // 		seq=seq+1;
            // 		Photo.push(pht);
            // 	}
            // }

          }
          var that2 = that;
          if (fPayload.length <= 20) {
            var result = that.batchPostFun(fPayload, 0, fPayload.length);
            if (result === "error") {
              oPurchaseView.getModel("PurchaseLiteModel").setProperty("/visible", true);
              sap.ui.core.BusyIndicator.hide();
              return;

            }
            else {
              // sap.ui.core.BusyIndicator.hide();
              sap.ui.core.BusyIndicator.hide();
              MessageToast.show("data has been saved successfully");


            }
          }
          else {
            var j = 0;
            var result;
            for (var i = 0; i < fPayload.length; i = j) {
              debugger;
              j = j + 20;
              if (j < fPayload.length) {

                result = await that.batchPostFun(fPayload, i, j);
              }
              else {
                debugger;
                j = fPayload.length;
                result = await that.batchPostFun(fPayload, i, j);
              }
              if (result === "error") {
                oPurchaseView.getModel("PurchaseLiteModel").setProperty("/visible", true);
                sap.ui.core.BusyIndicator.hide();
                break;

              }
              else {
                // sap.ui.core.BusyIndicator.hide();


              }
              oPurchaseView.byId("PurchaseLiteTable").getBinding("rows").refresh();

            }
            debugger;
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("data has been saved successfully");
          }

          // var SData={
          // 	"Product":Product,
          // 	"ProdWeight":ProdWeight,
          // 	"Photo":Photo
          // };

          //   debugger;
          //  var poData=await $.post('/PurchaseLiteSave', {
          //     "allData": fPayload,
          //   }).then();
          //   debugger;
          //     .done(function (data, status) {
          //       debugger;
          //       sap.ui.core.BusyIndicator.hide();
          //       if(typeof(data)==="string"){
          //       MessageToast.show("data has been saved successfully");}
          //       else{
          //         MessageBox.error(data.message);
          //         oPurchaseView.getModel("PurchaseLiteModel").setProperty("/visible", true);
          //       }

          //       oPurchaseView.byId("PurchaseLiteTable").getBinding("rows").refresh();
          //     })
          //     .fail(function (xhr, status, error) {
          //       sap.ui.core.BusyIndicator.hide();
          //       MessageBox.error(error);
          //       debugger;
          //     });
          //   // that.getView().byId("idName").setValue(that.pattern + "_" + count.toString());
        });


    },
    batchPostFun: async function (payload, startIndex, endIndex) {
      var fPayload = [];
      var oPurchaseView = sap.ui.getCore().byId("__component0---idMaker--PurchaseLiteBlock-Collapsed");
      for (var i = startIndex; i < endIndex; i++) {
        fPayload.push(payload[i]);
      }
      debugger;
      var poData = await $.post('/PurchaseLiteSave', {
        "allData": fPayload,
      }).then();
      if (typeof (poData) === "string") {
        MessageToast.show(endIndex+" data has been saved successfully");
        return "success";
      }
      else {
        MessageBox.error(poData.message);
        oPurchaseView.getModel("PurchaseLiteModel").setProperty("/visible", true);
        return "error"
      }
    },
    create_UUID: function () {
      var dt = new Date().getTime();
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (dt + Math.random() * 16) % 16 | 0;
        dt = Math.floor(dt / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
      return uuid;
    },
    onClear() {
      debugger;
      var oPurchaseView = sap.ui.getCore().byId("__component0---idMaker--PurchaseLiteBlock-Collapsed");
      // var payload = oPurchaseView.getModel("PurchaseLiteModel").getProperty("/PurchaseLite");
      oPurchaseView.getModel("PurchaseLiteModel").setProperty("/title", 0);
      oPurchaseView.getModel("PurchaseLiteModel").setProperty("/titleGW", 0);
      oPurchaseView.getModel("PurchaseLiteModel").setProperty("/titleTF", 0);
      oPurchaseView.getModel("PurchaseLiteModel").setProperty("/titleTA", 0);
      oPurchaseView.getModel("PurchaseLiteModel").setProperty("/visible", true);
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
				PhotoCheck: false,
				sItemCode: "None",
				sTagNo: "None",
				sGWt: "None",
				sAmount: "None",
				sRate: "None",
				sPCS: "None",
				sSize: "None",
				sTunch: "None",
				sNetWt: "None",
				sLessWt: "None"
      };
      for (var i = 0; i < 50; i++) {
        Purc.push(JSON.parse(JSON.stringify(oNew)));
      }
      oPurchaseView.getModel("PurchaseLiteModel").setProperty("/PurchaseLite", Purc);
    }



  });
});
