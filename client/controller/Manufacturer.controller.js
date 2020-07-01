sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/demo/cart/models/formatter"
], function(BaseController, UIComponent, JSONModel,
  MessageToast, formatter) {
  "use strict";

  return BaseController.extend("sap.ui.demo.cart.controller.Manufacturer", {
    formatter: formatter,
    onInit: function() {
      debugger;
      var oViewDetailModel = new JSONModel({
        "buttonText": "Save",
        "deleteEnabled": false
      });
      this.setModel(oViewDetailModel, "viewModel");

      var oRouter = this.getRouter();
      oRouter.getRoute("Manufacturer").attachMatched(this._onRouteMatched, this);
      // this._router = UIComponent.getRouterFor(this);
    },
    _onRouteMatched: function(oEvent) {
      debugger;
      var that = this;
      var viewModel = this.getView().getModel("viewModel");
      viewModel.setProperty("/codeEnabled", true);
      viewModel.setProperty("/buttonText", "Save");
      viewModel.setProperty("/deleteEnabled", false);
      var odataModel = new JSONModel({
        "groupCodeState": "None",
        "emailState": "None"
      });
      this.setModel(odataModel, "dataModel");
      debugger;
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/Manufacturers", "GET", {}, {}, this)
        .then(function(oData) {
          debugger;
          var oModelManufacturer = new JSONModel();
          oModelManufacturer.setData(oData);
          that.getView().setModel(oModelManufacturer, "manufactureModelInfo");
        }).catch(function(oError) {
          MessageToast.show("cannot fetch the data");
        });

      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/Groups", "GET", {}, {}, this)
        .then(function(oData) {
          var oModelGroup = new JSONModel();
          oModelGroup.setData(oData);
          that.getView().setModel(oModelGroup, "groupModelCode");
        }).catch(function(oError) {
          MessageToast.show("cannot fetch the data");
        });
      //
      // this.clearScreen();
    },

    clearScreen: function(oEvent) {
      var manufacturerModel = this.getView().getModel("local").getProperty("/Manufacturer");
      var viewModel = this.getView().getModel("viewModel");
      var dataModel = this.getView().getModel("dataModel");
      manufacturerModel.Code = "";
      manufacturerModel.Group = "";
      manufacturerModel.Name = "";
      manufacturerModel.Address = "";
      manufacturerModel.City = "";
      manufacturerModel.Contact = "";
      manufacturerModel.Email = "";
      manufacturerModel.Block = false;
      viewModel.setProperty("/codeEnabled", true);
      viewModel.setProperty("/buttonText", "Save");
      viewModel.setProperty("/deleteEnabled", false);
      dataModel.setProperty("/groupCodeState", "None");
      dataModel.setProperty("/emailState", "None");
      this.getView().setModel("local").setProperty("Manufacturer" , manufacturerModel);
    },
    _validateInput: function(oInput) {
      var oBinding = oInput.getBinding("value");
      var sValueState = "None";
      var bValidationError = false;

      try {
        oBinding.getType().validateValue(oInput.getValue());
      } catch (oException) {
        sValueState = "Error";
        bValidationError = true;
      }
      oInput.setValueState(sValueState);
      return bValidationError;
    },
    saveData: function(oEvent) {
      debugger;
      var dataModel = this.getView().getModel("dataModel");
      var oSaveData = JSON.parse(JSON.stringify(this.getView().getModel("local").getProperty("/Manufacturer")));
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
       "/Manufacturer", "POST", {},oSaveData , this)
        .then(function(oData) {
        MessageToast.show("Data saved successfully");
        that._onRouteMatched();
        }).catch(function(oError) {
            MessageToast.show("Data could not be saved");
        });
    },
    onSwitch:function(oEvent){
      var status = oEvent.getParameters("Selected").state;
      this.getView().getModel("local").setProperty("/Manufacturer/Block", status);
    },
    checkEmail: function(oInput) {
			debugger;
			if (oInput) {
			var email = oInput.getParameter("newValue");
      var dataModel = this.getView().getModel("dataModel");
			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
			if (!email.match(mailregex)) {
        dataModel.setProperty("/emailState", "Error");
			} else {
				dataModel.setProperty("/emailState", "None");
        this.getView().getModel("local").setProperty("/Manufacturer/Email", email);
			}
		 }
   },
    groupCodeCheck: function(oEvent) {
      var oValidatedComboBox = oEvent.getSource(),
        sSelectedKey = oValidatedComboBox.getSelectedKey(),
        sValue = oValidatedComboBox.getValue();

      if (!sSelectedKey && sValue) {
        oValidatedComboBox.setValueState("Error");
        oValidatedComboBox.setValueStateText("Please enter a valid code!");
      } else {
        oValidatedComboBox.setValueState("None");
      }
    }
  });
});
