sap.ui.define(["sap/ui/core/format/NumberFormat"], function(NumberFormat) {
	return {
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
			debugger;
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
			debugger;
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
		}




	};
});
