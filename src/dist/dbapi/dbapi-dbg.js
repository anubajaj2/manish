//The method callCRUD will be used to communicate to the backend returns the JS promise
//You can use the jQuery ajax or some other framework dependency to make REST Call
sap.ui.define([
	"jquery.sap.global"
], function(jQuery) {
	"use strict";

	return {
		callOData: function(oModel, sUrl, sMethod, oParameters, oPayload, BaseController) {
			return new Promise(function(resolve, reject) {

				var currentDate = new Date();
				// var currentUser = BaseController.getView().getModel("local").getProperty("/CurrentUser");
				var currentUser = BaseController.getModel("local").getProperty("/CurrentUser");
				if(sMethod === "POST"){
					oPayload.CreatedBy = currentUser;
					oPayload.ChangedBy = currentUser;
					oPayload.CreatedOn = currentDate;
					oPayload.ChangedOn = currentDate;
				}
				else if(sMethod === "PUT"){
					oPayload.ChangedBy = currentUser;
					oPayload.ChangedOn = currentDate;
				}

				if (!(oModel && sUrl && sMethod)) {
					reject("Invalid parameters passed");
				}
				if (!oParameters) {
					oParameters = {};
				}

				// oModel.setHeaders({
				// 	"Authorization": "14t3G2vnQPEfBFWxZ7IBN73AxH3kgGjvnu4bDjQAGxD5o0zWD6FjytNABDxo36i0"
				// });

				oModel.setUseBatch(false);
				switch (sMethod.toUpperCase()) {
					case "GET":
						oModel.read(sUrl, {
							async: true,
							filters: oParameters.filters,
							sorters: oParameters.sorters,
							success: function(oData, oResponse) {
								resolve(oData);
							},
							error: function(oError) {
								reject(oError);
							}
						});
						break;
					case "POST":
						oModel.create(sUrl, oPayload, {
							async: true,
							filters: oParameters.filters,
							sorters: oParameters.sorters,
							success: function(oData, oResponse) {
								resolve(oData);
							},
							error: function(oError) {
								reject(oError);
							}
						});
						break;
					case "PUT":
						oModel.update(sUrl, oPayload, {
							async: true,
							filters: {},
							sorters: {},
							success: function(oData, oResponse) {
								debugger;
								resolve(oData);
							},
							error: function(oError) {
								debugger;
								reject(oError);
							}
						});
						break;
					case "DELETE":
						oModel.remove(sUrl, {
							async: true,
							filters: oParameters.filters,
							sorters: oParameters.sorters,
							success: function(oData, oResponse) {
								resolve(oData);
							},
							error: function(oError) {
								reject(oError);
							}
						});
						break;
					default:
						jQuery.sap.log.error("No case matched");
						break;
				}
			});
		}
	};
});
