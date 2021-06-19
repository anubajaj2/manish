sap.ui.define(["sap/ui/core/library", 'sap/uxap/BlockBase'], function(coreLibrary, BlockBase) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var PurchaseLiteBlock = BlockBase.extend("studentportal.sharedBlock.PurchaseLiteBlock", {
		metadata: {
			views: {
				Collapsed: {
					viewName: "sap.ui.demo.cart.view.PurchaseLite",
					type: ViewType.XML
				},
				Expanded: {
					viewName: "sap.ui.demo.cart.view.PurchaseLite",
					type: ViewType.XML
				}
			}
		}
	});
	return PurchaseLiteBlock;
});
