sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/demo/cart/models/formatter"
], function(BaseController, UIComponent, JSONModel,
  MessageToast, formatter) {
  "use strict";

  return BaseController.extend("sap.ui.demo.cart.controller.ProductCategory", {
      onInit: function() {
        var oViewModel = new JSONModel({
          "Category": "",
          "SubCategory": "",
          "Type": ""
        });
        this.setModel(oViewModel, "ProductModel");
        // this._router = UIComponent.getRouterFor(this);
        var oViewDetailModel = new JSONModel({
          "buttonText": "Save",
          "deleteEnabled": false
        });
        this.setModel(oViewDetailModel, "viewModel");
        var oRouter = this.getRouter();
        oRouter.getRoute("ProductCategory").attachMatched(this._onRouteMatched, this);
      },
      _onRouteMatched: function() {
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
        this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
            "/ProductCategories", "GET", {}, {}, this)
          .then(function(oData) {
            var oModelGroup = new JSONModel();
            oModelGroup.setData(oData);
            that.getView().setModel(oModelGroup, "ProductCatsModel");
          }).catch(function(oError) {
            MessageToast.show("cannot fetch the data");
          });
        this.clearScreen();
      },
      clearScreen: function(oEvent) {
        var productCategory = this.getView().getModel("local").getProperty("/ProductCategories");
        var viewModel = this.getView().getModel("viewModel");
        var dataModel = this.getView().getModel("dataModel");
        productCategory.Category = "";
        productCategory.SubCategory = "";
        productCategory.Type = "";
        viewModel.setProperty("/codeEnabled", true);
        viewModel.setProperty("/buttonText", "Save");
        viewModel.setProperty("/deleteEnabled", false);
        dataModel.setProperty("/groupCodeState", "None");
        dataModel.setProperty("/emailState", "None");
        this.getView().getModel("local").setProperty("ProductCategories", productCategory);
      },
      toggleFullScreen: function() {
        // debugger;
        // var btnId = "idFullScreenBtn";
        // var headerId = "__component0---idGroup--GroupHeader";
        // this.toggleUiTable(btnId,headerId)
      },
      CodeCheck: function(oEvent) {
        var input_source = oEvent.getSource();
        // input_source.setValue(oEvent.getParameter("newValue").toUpperCase());
        if (input_source.getValue()) {
          var dataModel = this.getView().getModel("dataModel");
          dataModel.setProperty("/groupCodeState", "None");
        }
        debugger;
        var category = input_source.getValue().split("-")[0];
        var subCatergory = input_source.getValue().split("-")[1];
        this.getView().getModel("local").setProperty("/ProductCategories/Category", category);
        this.getView().getModel("local").setProperty("/ProductCategories/SubCategory", subCatergory);
        this.productCheck(category, subCatergory);
      },
      subCodeCheck: function(oEvent) {
        var input_source = oEvent.getSource();
        // input_source.setValue(oEvent.getParameter("newValue").toUpperCase());
        var subCatergory = input_source.getValue().split("-")[0];
        this.getView().getModel("local").setProperty("/ProductCategories/SubCategory", subCatergory);
      },
      productCheck: function(category, subCatergory) {
        var productJson = this.getView().getModel("ProductCatsModel").getData().results;

        function getProductDetail(category, subCatergory) {
          return productJson.filter(
            function(data) {
              return (data.Category === category &&
                data.SubCategory === subCatergory);
            });
        }
        var found = getProductDetail(category, subCatergory);
        if (found) {
          var viewModel = this.getView().getModel("viewModel");
          var productCategory = this.getView().getModel("local").getProperty("/ProductCategories");
          productCategory.Category = found[0].Category;
          productCategory.SubCategory = found[0].SubCategory;
          productCategory.Type = found[0].Type;
          productCategory.NumberOfProducts = found[0].NumberOfProducts;
          this.getView().getModel("local").setProperty("/ProductCategories", productCategory);
          viewModel.setProperty("/buttonText", "Update");
          viewModel.setProperty("/deleteEnabled", true);
          viewModel.setProperty("/codeEnabled", false);
          this.getView().byId("idSubCategory").focus();
          // groupModel.refresh();
          return found[0].id;
        } else {
          // return false;
        }
      },
      saveData: function(oEvent) {
        debugger;
        var that = this;
        var screenData = this.getView().getModel("local").getProperty("/ProductCategories");
        if (screenData.Category !== "") {
          var category = screenData.Category.split("-")[0];
          var subCatergory = screenData.SubCategory;
          var id = this.productCheck(category, subCatergory)
          var oSaveData = JSON.parse(JSON.stringify(screenData));
          if (id) {
            debugger;
            this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/ProductCategories('" + id + "')", "PUT", {},
                oSaveData, this)
              .then(function(oData) {
                MessageToast.show("Data saved successfully");
                that._onRouteMatched();
              }).catch(function(oError) {
                MessageToast.show("Data could not be saved");
              });

          } else {
            this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/Category", "POST", {}, oSaveData, this)
              .then(function(oData) {
                MessageToast.show("Data saved successfully");
                that._onRouteMatched();
              })
              .catch(function(oError) {
                MessageToast.show("Data could not be saved");
              });
          } //found else
        } else {
          var required = this.getView().byId("idCategory");
          required.setValueState("Error");
          required.setValueStateText("Please enter a Category!");
        }
      },
      typeCheck: function(oEvent) {
        var oValidatedComboBox = oEvent.getSource(),
          sSelectedKey = oValidatedComboBox.getSelectedKey(),
          sValue = oValidatedComboBox.getValue();

        if (!sSelectedKey && sValue) {
          oValidatedComboBox.setValueState("Error");
          oValidatedComboBox.setValueStateText("Please enter a Type!");
        } else {
          oValidatedComboBox.setValueState("None");
        }
      },
      deleteProduct: function(oEvent) {
        var that = this;
        var screenData = this.getView().getModel("local").getProperty("/ProductCategories");
        if (screenData.Category !== "") {
          var category = screenData.Category.split("-")[0];
          var subCatergory = screenData.SubCategory;
          var id = this.productCheck(category, subCatergory)
          var oSaveData = JSON.parse(JSON.stringify(screenData));
          if (id) {
            this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
                "/ProductCategories('" + id + "')", "DELETE", {}, {}, this)
              .then(function(oData) {
                MessageToast.show("Deleted successfully");
                that._onRouteMatched();
              })
              .catch(function(oError) {
                that._onRouteMatched();
                MessageToast.show("Could not delete the entry");
              });
          } else {
            MessageToast.show("Product already in use.Cannot be deleted");
          }
        }
      }

    });
});
