sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/ui/demo/cart/model/formatter"
], function(BaseController, UIComponent, JSONModel,
  MessageToast, formatter) {
  "use strict";

  return BaseController.extend("sap.ui.demo.cart.controller.ProductCategory", {
    onInit: function() {
      var oViewModel = new JSONModel({
        // "Category": "",
        // "SubCategory": "",
        // "Type": ""
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
      // this.getProductEntry();
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          "/ProductCategories", "GET", {}, {}, this)
        .then(function(oData) {
          var oModelGroup = new JSONModel();
          oModelGroup.setData(oData);
          var a = [];
          var b = [];
          for (var i = 0; i < oData.results.length; i++) {
            if (a.indexOf(oData.results[i].Category) === -1) {
              a.push(oData.results[i].Category);
            }
          }

          for (var j = 0; j < a.length; j++) {
            var object = {};
            object.Category = a[j];
            b.push(object);
          }
          //SubCategory
          var c = [];
          var d = [];
          for (var i = 0; i < oData.results.length; i++) {
            if (c.indexOf(oData.results[i].SubCategory) === -1) {
              c.push(oData.results[i].SubCategory);
            }
          }

          for (var j = 0; j < c.length; j++) {
            var object = {};
            object.SubCategory = c[j];
            d.push(object);
          }
          var oModel = new sap.ui.model.json.JSONModel({
            category: b,
            subCatergory: d
          });
          that.getView().setModel(oModel, "ProductCatsModel");
          that.getView().setModel(oModelGroup, "ProductModel");
        })
        .catch(function(oError) {
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
      var btnId = "idFullScreenBtn";
      var headerId = "__component0---idProduct--ProductHeader";
      this.toggleUiTable(btnId,headerId)
    },
    CodeCheck: function(oEvent) {
      var input_source = oEvent.getSource();
      // input_source.setValue(oEvent.getParameter("newValue").toUpperCase());
      // if (input_source.getValue()) {
      //   var dataModel = this.getView().getModel("dataModel");
      //   dataModel.setProperty("/groupCodeState", "None");
      // }
      // var category = input_source.getValue().split("-")[0];
      // var subCatergory = input_source.getValue().split("-")[1];
      // this.getView().getModel("local").setProperty("/ProductCategories/Category", category);
      // this.getView().getModel("local").setProperty("/ProductCategories/SubCategory", subCatergory);
      // this.productCheck(category, subCatergory);
    },
    productCheck: function(category, subCatergory, type) {
      var productJson = this.getView().getModel("ProductModel").getData().results;

      function getProductDetail(category, subCatergory, type) {
        return productJson.filter(
          function(data) {
            return (data.Category === category &&
              data.SubCategory === subCatergory &&
              data.Type === type);
          });
      }
      if (productJson && productJson.length > 0) {
        var found = getProductDetail(category, subCatergory, type);
        if (found.length > 0) {
          var viewModel = this.getView().getModel("viewModel");
          var productCategory = this.getView().getModel("local").getProperty("/ProductCategories");
          productCategory.Category = found[0].Category;
          productCategory.SubCategory = found[0].SubCategory;
          productCategory.Type = found[0].Type;
          productCategory.NumberOfProducts = found[0].NumberOfProducts;
          this.getView().getModel("local").setProperty("/ProductCategories", productCategory);
          // viewModel.setProperty("/buttonText", "Update");
          viewModel.setProperty("/deleteEnabled", true);
          viewModel.setProperty("/codeEnabled", false);
          this.getView().byId("idSubCategory").focus();
          // groupModel.refresh();
          return found[0].id;
        } else {
          // return false;
        }
      }
    },
    saveData: function(oEvent) {
      debugger;
      var that = this;
      var screenData = this.getView().getModel("local").getProperty("/ProductCategories");
      if (screenData.Category !== "") {
        var category = screenData.Category = screenData.Category.toUpperCase();
        var subCatergory = screenData.SubCategory = screenData.SubCategory.toUpperCase();
        var type = screenData.Type = screenData.Type.toUpperCase();
        var id = this.productCheck(category, subCatergory, type)
        var oSaveData = JSON.parse(JSON.stringify(screenData));
        if (id) {
          debugger;
          MessageToast.show("Data Already Exists");
          // this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
          //     "/ProductCategories('" + id + "')", "PUT", {},
          //     oSaveData, this)
          //   .then(function(oData) {
          //     MessageToast.show("Data saved successfully");
          //     that._onRouteMatched();
          //   }).catch(function(oError) {
          //     MessageToast.show("Data could not be saved");
          //   });

        } else {
          this.ODataHelper.callOData(this.getOwnerComponent().getModel(),
              "/ProductCategories", "POST", {}, oSaveData, this)
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
        var category = screenData.Category = screenData.Category.toUpperCase();
        var subCatergory = screenData.SubCategory = screenData.SubCategory.toUpperCase();
        var type = screenData.Type = screenData.Type.toUpperCase();
        var id = this.productCheck(category, subCatergory, type)
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
