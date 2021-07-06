sap.ui.define(["sap/ui/core/library", 'sap/uxap/BlockBase'], function(coreLibrary, BlockBase) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var PurchaseLeingthBlock = BlockBase.extend("studentportal.sharedBlock.PurchaseLeingthBlock", {
		metadata: {
			views: {
				// Collapsed: {
				// 	viewName: "sap.ui.demo.cart.view.PurchaseLeingth",
				// 	type: ViewType.XML
				// },
				// Expanded: {
				// 	viewName: "sap.ui.demo.cart.view.PurchaseLeingth",
				// 	type: ViewType.XML
				// }
			}
		}
	});
	return PurchaseLeingthBlock;
});
