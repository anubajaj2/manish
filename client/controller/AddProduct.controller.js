sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/demo/cart/model/formatter",
  "sap/ui/core/UIComponent",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/HTML",
  "sap/m/MessageToast",
  "sap/m/MessageBox"
], function(BaseController, formatter, UIComponent, JSONModel, HTML, MessageToast, MessageBox) {
  "use strict";

  return BaseController.extend("sap.ui.demo.cart.controller.AddProduct", {
    formatter: formatter,
    onInit: function() {


      this._oRouter = UIComponent.getRouterFor(this);

      var oC = new JSONModel({
        "images": []
      });
      this.getView().setModel(oC, "C");
      this.a = [];
      this._oRouter.getRoute("AddProduct").attachMatched(this._routePatternMatched, this);
      this._oLocalModel = this.getOwnerComponent().getModel("local");
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
      that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
          "/Products/$count", "GET", {
            filters: [oFilter1]
          }, {}, that)
        .then(function(count) {
          count = parseInt(count) + 1;
          that.getView().byId("idName").setValue(that.pattern + "_" + count.toString());
        });

    },
    _routePatternMatched: function() {
      //remove categories not set for Manufacturers
      this.loadCategories(this.getView().getModel("local").getProperty("/ManufacturerData/Categories"));
      //pattern to set
      if (this.getOwnerComponent().getModel('local').getProperty('/Authorization') === "") {
        this.logOutApp();
      }
      this.lastTwoDisplay();
      this.createdBy = this.getView().getModel("local").getProperty("/CurrentUser");
      this.setAvailableProductCode();
    },
    onDelete: function() {
      var that = this;
      var productId = this.getView().byId("idName").getValue();
      $.post('/DeleteProduct', {
          "productCode": productId
        })
        .done(function(result, status) {
          if (result.startsWith("id")) {
            var prodWeights = that.getView().getModel("local").getProperty("/ProdWeights");
    				prodWeights.forEach((item)=>{
              that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/ProdWeights('" + item.id + "')",
                "DELETE", {}, {}, that);
    				});
            var allImages = that.getView().getModel("local").getProperty("/allImages");
    				allImages.forEach((item)=>{
              that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Photos('" + item.id + "')",
                "DELETE", {}, {}, that);
    				});
            var id = result.split(":")[1];
            var that2 = that;
            that.ODataHelper.callOData(that.getOwnerComponent().getModel(), "/Products('" + id + "')",
              "DELETE", {}, {}, that)
              .then(function(result){
                that2.onCancel();
                MessageToast.show("Product deleted successfully");
                that2.ProductsearchPopup = null;
              });

          } else {
            MessageToast.show(result);
            that2.ProductsearchPopup = null;
          }
        })
        .fail(function(xhr, status, error) {

        });
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
          "Gender": "F",
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
        this.setAvailableProductCode();
      }

    },
    onChange: function() {
      this.getView().getModel("local").setProperty("/checkChange", true);
    },
    onSave: function() {
      var that = this;
      var productPayload = this._oLocalModel.getProperty("/Product");
      var a = productPayload.ProductId;
      var result = that.validateProductData();
      if (result.status === false) {
        MessageBox.error(result.error);
        return;
      }
      productPayload.ProductId = a.toUpperCase();
      productPayload.Tunch = parseFloat(productPayload.Tunch).toFixed(2);
      productPayload.Wastage = parseFloat(productPayload.Wastage).toFixed(0);
      productPayload.GrossWeight = this.getView().getModel("local").getProperty("/ProdWeights")[0].GrossWeight;
      //		Product Id Cannot be Duplicated
      var Filter1 = new sap.ui.model.Filter("ProductId", "EQ", this.getView().byId("idName").getValue());
      if (this.mode === "Edit") {
        delete productPayload.ToChangedBy;
        delete productPayload.ToCreatedBy;
        delete productPayload.ToOrder;
        delete productPayload.ToPhotos;
        delete productPayload.ToWeights;
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
              that.ODataHelper.callOData(that.getOwnerComponent().getModel(),
                  "/Products", "POST", {}, productPayload, that)
                .then(function(data) {
                  that2.performCameraSave(data.id);
                  MessageToast.show("Product Created Successfully");
                  that2.getView().getModel("local").setProperty("/Product", data);
                  that2.getView().getModel("local").setProperty("/checkChange", false);
                  setTimeout(() => {
                    that2.onCancel();
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
            title: "{ProductId}",
            description: "{Category} / {SubCategory} / {Name}"
          })
        });
        setTimeout(()=>{
          this.counter(this.ProductsearchPopup);
        },4000);
        this.ProductsearchPopup.open();
      }
      else{
        this.counter(this.ProductsearchPopup);
        this.ProductsearchPopup.open();
      }
    },

    onConfirm: function(oEvent) {
      var that = this;
      //Push the selected product id to the local model
      var myData = this.getView().getModel("local").getProperty("/Product");
      var selProd = oEvent.getParameter("selectedItem").getTitle();
      myData.ProductId = selProd;
      this.getView().byId("idName").fireSubmit();
    },
    onEnter: function(oEvent) {
      var that = this;
      var sValue = this.getView().byId("idName").getValue().toUpperCase();
      this.getView().byId("idName").setValue(sValue);
      var Filter1 = new sap.ui.model.Filter("ProductId", "EQ", sValue);
      this.ODataHelper.callOData(this.getOwnerComponent().getModel(), "/Products", "GET", {
          filters: [Filter1]
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
      this.getView().getParent().getParent().getCurrentMidColumnPage().byId("idTab").getItems()[0].getCells()[0].focus();
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
      this.getView().byId("idGender").focus();
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
    }

  });
});
