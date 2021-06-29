sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/ui/demo/cart/model/formatter"
], function(
  BaseController,
  formatter) {
  "use strict";

  return BaseController.extend("sap.ui.demo.cart.controller.Product", {
    formatter: formatter,

    onInit: function() {
      var oComponent = this.getOwnerComponent();
      this._router = oComponent.getRouter();
      this._router.getRoute("product").attachPatternMatched(this._routePatternMatched, this);
      // this._router.getTarget("product").attachDisplay(function(oEvent) {
      //   this.fnUpdateProduct(oEvent.getParameter("data").productId); // update the binding based on products cart selection
      // }, this);
    },
    _routePatternMatched: function(oEvent) {
      var sPath = "/Products" + oEvent.getParameter("arguments").key
      this.sPath = sPath;
      var oDataModel = this.getView().getModel();
      var cartBtn = this.getOwnerComponent().getModel("local").getProperty("/oCartBtns")[oEvent.getParameter("arguments").key.split("'")[1]];
      if (cartBtn.getType() === "Emphasized") {
        this.getView().byId("idAddtoCartBtn").setType(cartBtn.getType());
        this.getView().byId("idAddtoCartBtn").setText("Added to Cart");
        this.getView().byId("idAddtoCartBtn").setEnabled(false);
      } else {
        this.getView().byId("idAddtoCartBtn").setType(cartBtn.getType());
        this.getView().byId("idAddtoCartBtn").setText("Add to Cart");
        this.getView().byId("idAddtoCartBtn").setEnabled(true);
      }
      this.getView().byId("prodImg1").setSrc(this.allImageURLs[sPath + "/ToPhotos/0/Content"])
      var itemPics = [{
        ImageUrl: this.allImageURLs[sPath + "/ToPhotos/0/Content"]
      }];
      if (this.allImageURLs[sPath + "/ToPhotos/1/Content"]) {
        itemPics.push({
          ImageUrl: this.allImageURLs[sPath + "/ToPhotos/1/Content"]
        });
      }
      if (this.allImageURLs[sPath + "/ToPhotos/2/Content"]) {
        itemPics.push({
          "ImageUrl": this.allImageURLs[sPath + "/ToPhotos/2/Content"]
        });
      }
      if (this.allImageURLs[sPath + "/ToPhotos/3/Content"]) {
        itemPics.push({
          "ImageUrl": this.allImageURLs[sPath + "/ToPhotos/3/Content"]
        });
      }
      this.getView().getModel("local").setProperty("/ItemPics", itemPics);
      this.getView().getModel("local").setProperty("/ItemPicsCount", itemPics.length);
      // var productDetails = oDataModel.getProperty(sPath);
      var that = this;
      this.loadProdWeights(sPath.split("'")[sPath.split("'").length - 2]).
      then(function(data) {
        debugger;
      });
      // var sId = oEvent.getParameter("arguments").productId,
      var oView = this.getView();
      //   oModel = oView.getModel();
      // // the binding should be done after insuring that the metadata is loaded successfully
      // oModel.metadataLoaded().then(function() {
      //   var sPath = "/" + this.getModel().createKey("Products", {
      //     ProductId: sId
      //   });
      oView.bindElement({
        path: sPath,
        events: {
          dataRequested: function() {
            oView.setBusy(true);
          },
          dataReceived: function() {
            oView.setBusy(false);
          }
        }
      });
      if (that.zoomedImg) {
        that.zoomedImg.kill();
      }
      setTimeout(function() {
        var options = {
          width: 750,
          height: 550,
          // zoomWidth: 550,
          zoomStyle: 'z-index: 2;border-style: none none none solid;border-width: 15px;border-color: black;'
        };
        that.zoomedImg = new ImageZoom(document.getElementById("__component0---Product--img-container"), options);
      }, 500);
      //   var oData = oModel.getData(sPath);
      //   //if there is no data the model has to request new data
      //   if (!oData) {
      //     oView.setBusyIndicatorDelay(0);
      //     oView.getElementBinding().attachEventOnce("dataReceived", function() {
      //       // reset to default
      //       oView.setBusyIndicatorDelay(null);
      //       this._checkIfProductAvailable(sPath);
      //     }.bind(this));
      //   }
      // }.bind(this));
    },
    // onImageIn: function(oEvent) {
    //   this.getView().byId("productDetailsArea").setBackgroundDesign("Transparent");
    // },
    // onImageOut: function(oEvent) {
    //   this.getView().byId("productDetailsArea").setBackgroundDesign("Solid");
    // },
    onProductPic: function(oEvent) {
      this.getView().byId("prodImg1").setSrc(oEvent.getSource().getSrc());
    },
    onAddToCart: function(oEvent) {
      var oBtn = oEvent.getSource();
      var that = this,
        sPath = this.sPath;
      this.loadProdWeights(sPath.split("'")[sPath.split("'").length - 2]).
      then(function(data) {
        // that.loadedWeights[sPath] = data.ProdWeights;
        that.getView().getModel("local").setProperty("/ProdWeights", data.ProdWeights);
        oBtn.setType("Emphasized");
        oBtn.setEnabled(false);
        var allSelectedWeights = [data.ProdWeights[0]];
        var mainProduct = oBtn.getParent().getModel().getProperty(that.sPath);
        var addedWeights = that.getOwnerComponent().getModel("local").getProperty("/addedWeights");
        addedWeights.push(allSelectedWeights[0]);
        that.getOwnerComponent().getModel("local").setProperty("/addedWeights", addedWeights);
        that.addProductToCart(mainProduct, allSelectedWeights, that.allImageURLs[that.sPath + "/ToPhotos/0/Content"], oBtn);
        sap.m.MessageToast.show("Added to cart");
      });
    },
    addProductToCart: function(productRec, allSelectedWeights, PictureUrl, oBtn) {
      var cartItems = this.getOwnerComponent().getModel("local").getProperty("/cartItems");
      var cartItem = {};
      cartItem.Name = productRec.Name;
      cartItem.ProductId = productRec.id;
      cartItem.Tunch = productRec.Tunch;
      cartItem.Category = productRec.Category;
      cartItem.SubCategory = productRec.SubCategory;
      cartItem.PictureUrl = PictureUrl;
      for (var i = 0; i < allSelectedWeights.length; i++) {
        cartItem.GrossWeight = allSelectedWeights[i].GrossWeight;
        cartItem.NetWeight = allSelectedWeights[i].NetWeight;
        cartItem.Amount = allSelectedWeights[i].Amount;
        cartItem.WeightId = allSelectedWeights[i].id;
        // this.getOwnerComponent().getModel("local").getProperty("/oCartBtns")[cartItem.ProductId] ;
        cartItems.push(JSON.parse(JSON.stringify(cartItem)));
      }
      this.getOwnerComponent().getModel("local").getProperty("/oCartBtns")[cartItem.ProductId].setType("Emphasized");
      this.getOwnerComponent().getModel("local").setProperty("/cartItems", cartItems);
      this.calculateOrderEstimate();
    },
    onCartClick: function(oEvent) {
      this.getRouter().navTo("checkout");
    }
    // fnUpdateProduct: function(productId) {
    //   var sPath = "/Products('" + productId + "')",
    //     fnCheck = function() {
    //       this._checkIfProductAvailable(sPath);
    //     };
    //
    //   this.getView().bindElement({
    //     path: sPath,
    //     events: {
    //       change: fnCheck.bind(this)
    //     }
    //   });
    // },

    // _checkIfProductAvailable: function(sPath) {
    //   var oModel = this.getModel();
    //   var oData = oModel.getData(sPath);
    //
    //   // show not found page
    //   if (!oData) {
    //     this._router.getTargets().display("notFound");
    //   }
    // },

    /**
     * Navigate to the generic cart view
     * @param {sap.ui.base.Event} @param oEvent the button press event/
     */
    // onToggleCart: function(oEvent) {
    //   var bPressed = oEvent.getParameter("pressed");
    //   var oEntry = this.getView().getBindingContext().getObject();
    //
    //   this._setLayout(bPressed ? "Three" : "Two");
    //   this.getRouter().navTo(bPressed ? "productCart" : "product", {
    //     id: oEntry.Category,
    //     productId: oEntry.ProductId
    //   });
    // }
  });
});
