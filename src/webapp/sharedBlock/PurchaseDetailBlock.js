sap.ui.define(["sap/ui/core/library", 'sap/uxap/BlockBase'], function(coreLibrary, BlockBase) {
	"use strict";

	var ViewType = coreLibrary.mvc.ViewType;

	var PurchaseDetailBlock = BlockBase.extend("studentportal.sharedBlock.PurchaseDetailBlock", {
		metadata: {
			views: {
				// Collapsed: {
				// 	viewName: "sap.ui.demo.cart.view.PurchaseDetail",
				// 	type: ViewType.XML
				// },
				// Expanded: {
				// 	viewName: "sap.ui.demo.cart.view.PurchaseDetail",
				// 	type: ViewType.XML
				// }
			}
		}
	});
	return PurchaseDetailBlock;
});
