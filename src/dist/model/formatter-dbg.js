sap.ui.define([
	"sap/ui/core/format/NumberFormat"
], function (NumberFormat) {
	"use strict";

	var mStatusState = {
		"A": "Success",
		"O": "Warning",
		"D": "Error"
	};
	var mStatusStateT = {
		"A": "Available",
		"O": "Out of Stock",
		"D": "Discntinued"
	};
	var mStatusStateC = {
		"A": "greenClass",
		"O": "orangeClass",
		"D": "redClass"
	};
	var mProdState = {
		"A": "Success",
		"N": "Error",
		"R": "Error",
		"D":"Success"
	};
	var mProdStateT = {
		"A": "Approved",
		"N": "Not Approved",
		"R": "Rejected",
		"D" : "Delevered"
	};
	var mProdStateC = {
		"A": "greenClass",
		"N": "orangeClass"
	};
	var formatter = {
		/**
		 * Formats the price
		 * @param {string} sValue model price value
		 * @return {string} formatted price
		 */
		price: function (sValue) {
			var numberFormat = NumberFormat.getFloatInstance({
				maxFractionDigits: 2,
				minFractionDigits: 2,
				groupingEnabled: true,
				groupingSeparator: ".",
				decimalSeparator: ","
			});
			return numberFormat.format(sValue);
		},
		getCartIcon: function(selected) {
			if (!selected) {
				return 'sap-icon://cart-3';
			}else{
				return 'sap-icon://delete';
			}
		},
		lessWeightChecks: function(inp){
			if(inp){
				if(inp.length > 0){
					return true;
				}else{
					return false;
				}
			}else{
				return false;
			}

		},
		getImageUrlFromContent: function(base64Stream){
			if(base64Stream){
				var b64toBlob = function(dataURI) {
				    var byteString = atob(dataURI.split(',')[1]);
				    var ab = new ArrayBuffer(byteString.length);
				    var ia = new Uint8Array(ab);
				    for (var i = 0; i < byteString.length; i++) {
				        ia[i] = byteString.charCodeAt(i);
				    }
				    return new Blob([ab], { type: 'image/jpeg' });
				};
				var x = b64toBlob(base64Stream);
				return URL.createObjectURL(x);
			}

		},
		// getExcelUrlFromContent: function(base64Stream){
		// 	if(base64Stream){
		// 		var b64toBlob = function(dataURI) {
		// 		    var byteString = atob(dataURI.split(',')[1]);
		// 		    var ab = new ArrayBuffer(byteString.length);
		// 		    var ia = new Uint8Array(ab);
		// 		    for (var i = 0; i < byteString.length; i++) {
		// 		        ia[i] = byteString.charCodeAt(i);
		// 		    }
		// 		    return new Blob([ab], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
		// 		};
		// 		var x = b64toBlob(base64Stream);
		// 		return URL.createObjectURL(x);
		// 	}
		//
		// },
		/**
		 * Sums up the price for all products in the cart
		 * @param {object} oCartEntries current cart entries
		 * @return {string} string with the total value
		 */
		 getFormattedDate: function(monthInc) {
 			var dateObj = new Date();
 			dateObj.setDate(dateObj.getDate());
 			var dd = dateObj.getDate();
 			dateObj.setMonth(dateObj.getMonth() + monthInc);
 			var mm = dateObj.getMonth() + 1;
 			var yyyy = dateObj.getFullYear();
 			if (dd < 10) {
 				dd = '0' + dd;
 			}
 			if (mm < 10) {
 				mm = '0' + mm;
 			}
 			return dd + '.' + mm + '.' + yyyy;
 		},
 		getDateDDMMYYYYFormat: function(date){
 			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
 											  pattern: "dd.mm.yyyy"});

 		var oNow = date;
 		return oDateFormat.format(oNow); //string in the same format as "Thu, Jan 29, 2017"
 		},
 		getIndianCurr: function(value){
 			if(value){
 				var x=value;
 				x=x.toString();
 				var lastThree = x.substring(x.length-3);
 				var otherNumbers = x.substring(0,x.length-3);
 				if(otherNumbers != '')
 				    lastThree = ',' + lastThree;
 				var res = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + lastThree;
 				return res;
 			}
 		},
		dateAndTime : function(date){
			date = date.toString();
			return date.slice(4,15)+", Time : "+date.slice(16,24)+" IST";
		},
		getItemName : function(key){
			switch (key) {
				case "CST": return "Color Stone";
				case "DMD": return "Diamond";
				case "MLW": return "Mala Weight";
				case "MTW": return "Moti";
				case "POL": return "Polki";
				case "STW": return "Stone";
				case "SRM": return "Surma";
				default : return "Others";
			}
		},
 		checkPhotoStat: function(value){
 			if(value){
 				if(value === "X"){
 					return "Accept";
 				}else{
 					return "Reject";
 				}
 			}else{
 				return "Reject";
 			}

 		},
 		sortByProperty: function(array, property) {
 			var lol = function dynamicSort(property) {
 				var sortOrder = 1;
 				if (property[0] === "-") {
 					sortOrder = -1;
 					property = property.substr(1);
 				}
 				return function(a, b) {
 					var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
 					return result * sortOrder;
 				}
 			};

 			return array.sort(lol(property));
 		},
 		getIncrementDate: function(dateObj, monthInc) {
 			debugger;
 			//	var dd = dateObj.getDate();
 			dateObj.setMonth(dateObj.getMonth() + monthInc);
 			var dd = dateObj.getDate();
 			var mm = dateObj.getMonth() + 1;
 			var yyyy = dateObj.getFullYear();
 			if (dd < 10) {
 				dd = '0' + dd;
 			}
 			if (mm < 10) {
 				mm = '0' + mm;
 			}
 			return dd + '.' + mm + '.' + yyyy;
 		},
 		getDateCheck: function(dateObj) {
 			var dd = dateObj.getDate();
 			var mm = dateObj.getMonth();
 			var yyyy = dateObj.getFullYear();

 			var ddToday = new Date();

 			var dd1 = ddToday.getDate();
 			var mm1 = ddToday.getMonth();
 			var yyyy1 = ddToday.getFullYear();

 			debugger;
 			if (yyyy > yyyy1) {
 				return true;
 			} else {
 				if (yyyy == yyyy1) {
 					if (mm > mm1) {
 						return true;
 					} else {
 						if (mm == mm1) {
 							if (dd > dd1) {
 								return true;
 							} else {
 								return false;
 							}
 						} else {
 							return false;
 						}
 					}
 				} else { //(yyyy < yyyy1)
 					return false;
 				}
 			}
 		},

 		formatIconColor: function(bValue) {
 			if (bValue === true) {
 				return "red";
 			} else {
 				return "green";
 			}
 		},

 		formatRowHighlight: function(bValue) {
 			if (bValue === true) {
 				return "Error";
 			} else {
 				return "Success";
 			}
 		},

 		formatStatusValue: function(sValue) {
 			switch (sValue) {
 				case "L": return "Live";
 				case "V": return "Video";
 				case "A": return "Live and Video";
 			}
 		},
 		formatCurrency: function (a,b){
 			var oCurrencyFormat = NumberFormat.getCurrencyInstance();
 			return oCurrencyFormat.format(a,b);
 		},

		noSpace: function(oInput) {
			debugger;
			if (oInput) {
 			var Pattern = oInput.getValue();
 			var regex = "[ \t]";
 			if (Pattern.match(regex)) {
 				oInput.setValueState("Error");
 				return false;
 			} else {
 				oInput.setValueState("None");
 				return true;
 			}
 		 }

		},

 		checkEmail: function(oInput) {
 			debugger;
 			if (oInput) {
 			var email = oInput.getValue();
 			var mailregex = /^\w+[\w-+\.]*\@\w+([-\.]\w+)*\.[a-zA-Z]{2,}$/;
 			if (!email.match(mailregex)) {
 				//alert("Invalid Email");
 				oInput.setValueState("Error");
 				return false;
 			} else {
 				oInput.setValueState("None");
 				return true;
 			}
 		 }
 	 },
		totalPrice: function (oCartEntries) {
			var oBundle = this.getResourceBundle(),
				fTotalPrice = 0;

			Object.keys(oCartEntries).forEach(function (sProductId) {
				var oProduct = oCartEntries[sProductId];
				fTotalPrice += parseFloat(oProduct.Price) * oProduct.Quantity;
			});

			return oBundle.getText("cartTotalPrice", [formatter.price(fTotalPrice)]);
		},

		/**
		 * Returns the status text based on the product status
		 * @param {string} sStatus product status
		 * @return {string} the corresponding text if found or the original value
		 */
		statusText: function (sStatus) {
			var oBundle = this.getResourceBundle();

			var mStatusText = {
				"A": oBundle.getText("statusA"),
				"O": oBundle.getText("statusO"),
				"D": oBundle.getText("statusD")
			};

			return mStatusText[sStatus] || sStatus;
		},

		/**
		 * Returns the product state based on the status
		 * @param {string} sStatus product status
		 * @return {string} the state text
		 */
		statusState: function (sStatus) {
			return mStatusState[sStatus] || "None";
		},
		statusStateC: function (sStatus) {
			return mStatusStateC[sStatus] || "None";
		},
		statusText: function (sStatus) {
			return mStatusStateT[sStatus] || "None";
		},
		prodState: function (sStatus) {
			return mProdState[sStatus] || "None";
		},
		prodStateC: function (sStatus) {
			return mProdStateC[sStatus] || "None";
		},
		prodText: function (sStatus) {
			return mProdStateT[sStatus] || "None";
		},
		/**
		 * Returns the relative URL to a product picture
		 * @param {string} sUrl image URL
		 * @return {string} relative image URL
		 */
	/*	pictureUrl: function (sUrl) {
			debugger;
			if (sUrl){
				return  sap.ui.require.toUrl(sUrl);
			} else {
				return undefined;
			}
		},*/

		/**
		 * Returns the footer text for the cart based on the amount of products
		 * @param {object} oSavedForLaterEntries the entries in the cart
		 * @return {string} "" for no products, the i18n text for >0 products
		 */
		footerTextForCart: function (oSavedForLaterEntries) {
			var oBundle = this.getResourceBundle();

			if (Object.keys(oSavedForLaterEntries).length === 0) {
				return "";
			}
			return oBundle.getText("cartSavedForLaterFooterText");
		},

		/**
		 * Checks if one of the collections contains items.
		 * @param {object} oCollection1 First array or object to check
		 * @param {object} oCollection2 Second array or object to check
		 * @return {boolean} true if one of the collections is not empty, otherwise - false.
		 */
		hasItems: function (oCollection1) {
			var bCollection1Filled = !!(oCollection1 && Object.keys(oCollection1).length);
			return bCollection1Filled;
		}
	};

	return formatter;
});
