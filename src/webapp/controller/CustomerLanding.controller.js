sap.ui.define([
  "sap/ui/demo/cart/controller/BaseController",
  "sap/m/MessageToast",
  "sap/m/Dialog",
  "sap/m/DialogType",
  "sap/m/Button",
  "sap/m/ButtonType",
], function(Controller, MessageToast, Dialog, DialogType, Button, ButtonType) {
  "use strict";

  return Controller.extend("sap.ui.demo.cart.controller.CustomerLanding", {

    /**
     * Called when a controller is instantiated and its View controls (if available) are already created.
     * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
     * @memberOf victoria.view.App
     */
    onInit: function() {
      this.oRouter = this.getOwnerComponent().getRouter();
      this.oRouter.getRoute("CustomerLanding").attachMatched(this._onRouteMatched, this);

      var oTodayDealData = [{
          "ImageUrl": "https://images-na.ssl-images-amazon.com/images/I/71ILFcQ7NhL._UX569_.jpg",
          "Price": "11,000"
        },
        {
          "ImageUrl": "https://rukminim1.flixcart.com/image/714/857/k0sgl8w0/ring/r/f/d/free-size-rg00448-11-ring-shi-jewellery-original-imafkhqnxmcfqs4y.jpeg?q=50",
          "Price": "15,000"
        },
        {
          "ImageUrl": "https://images-na.ssl-images-amazon.com/images/I/9127fkG4uaL._UL1500_.jpg",
          "Price": "25,000"
        },
        {
          "ImageUrl": "https://images.naptol.com/usr/local/csp/staticContent/product_images/horizontal/750x750/2-Gold-Jewellery-Sets-with-Free-Payal-2.jpg",
          "Price": "30,000"
        },
        {
          "ImageUrl": "https://www.kindpng.com/picc/m/10-101167_earring-png-free-download-earring-gold-jewellery-png.png",
          "Price": "10,000"
        },
        {
          "ImageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKZubGFg5OFh0QT-BELj7eFKvY81kLJ3S8ZEU-gly_Bx4j5V5JxaUxK5sFODNDy3bLtF4&usqp=CAU",
          "Price": "20,000"
        },
        {
          "ImageUrl": "https://images-eu.ssl-images-amazon.com/images/I/41ujGjbKqWL._SR600%2C315_PIWhiteStrip%2CBottomLeft%2C0%2C35_PIStarRatingTHREE%2CBottomLeft%2C360%2C-6_SR600%2C315_SCLZZZZZZZ_FMpng_BG255%2C255%2C255.jpg",
          "Price": "8,000"
        },
        {
          "ImageUrl": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTn-xtc8axJZYlaexrhPMfm6xvkqCXTUQLNNELMDWWK_CPtbWu1E5iyfhOX49ufxqmm9TM&usqp=CAU",
          "Price": "13000"
        },
        {
          "ImageUrl": "https://www.pngjewelers.com/onlinestore/data/ProductImages/img_1668.jpg",
          "Price": "16,000"
        },
        {
          "ImageUrl": "https://1dayprice.com/wp-content/uploads/2018/06/Stainless-Jewellery.jpg",
          "Price": "22,000"
        },
        {
          "ImageUrl": "https://images.naptol.com/usr/local/csp/staticContent/product_images/horizontal/750x750/Shubh-Muhurat-Jewellery-Collection-1.jpg",
          "Price": "40,000"
        },
        {
          "ImageUrl": "https://media.vogue.fr/photos/5c3619d92818ac394465a5aa/master/w_400%2Cc_limit/aur_lie_bidermann1_jpg_3970.jpg%3Flang%3Deng",
          "Price": "15,000"
        },
        {
          "ImageUrl": "https://cdn.shopify.com/s/files/1/0034/4329/4275/products/product-image-778300819_300x.jpg?v=1571960825",
          "Price": "11,000"
        },
        {
          "ImageUrl": "https://imshopping.rediff.com/imgshop/800-1280/shopping/pixs/16405/p/prnk24._pourni-antique-design-and-gorgeous-golden-finish-necklace-with-stunning-earring-for-bridal-jewellery-set-prnk24.jpg",
          "Price": "29,000"
        },
        {
          "ImageUrl": "https://images-na.ssl-images-amazon.com/images/I/61g8WaOsBiL._UL1100_.jpg",
          "Price": "17,000"
        }
      ];
      this.getOwnerComponent().getModel("local").setProperty("/TodayDeal", oTodayDealData);
    },
    _onRouteMatched: function() {
      setInterval(function() {
        sap.ui.getCore().byId("__component0---idCustomerLanding--caro").next()
      }, 4000);
      var oDeviceModel = this.getOwnerComponent().getModel("device");
      var oSystem = oDeviceModel.getData().system;
      if (oSystem.desktop) {
        this.getView().getModel("local").setProperty("/GridItemCount", 10);
      } else if (oSystem.tablet) {
        this.getView().getModel("local").setProperty("/GridItemCount", 5);
      } else if (oSystem.phone) {
        this.getView().getModel("local").setProperty("/GridItemCount", 2);
      } else {
        this.getView().getModel("local").setProperty("/GridItemCount", 2);
      }
      this.loadCustomCalculation();
    },
    onMen: function() {
      this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      this.oRouter.navTo("categories");
      this.getView().getModel("local").setProperty("/CategoryType", "GENTS");
    }
    /**
     * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
     * (NOT before the first rendering! onInit() is used for that one!).
     * @memberOf victoria.view.App
     */
    //	onBeforeRendering: function() {
    //
    //	},

    /**
     * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
     * This hook is the same one that SAPUI5 controls get after being rendered.
     * @memberOf victoria.view.App
     */
    //	onAfterRendering: function() {
    //
    //	},

    /**
     * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
     * @memberOf victoria.view.App
     */
    //	onExit: function() {
    //
    //	}

  });

});
