sap.ui.define(["sap/ui/demo/cart/controller/BaseController"],function(o){"use strict";return o.extend("sap.ui.demo.cart.controller.OrderCompleted",{onInit:function(){this._oRouter=sap.ui.core.UIComponent.getRouterFor(this)},onReturnToShopButtonPress:function(){this._setLayout("Two");this._oRouter.navTo("home")}})});