sap.ui.define(
	["sap/m/Image"],
	function(Image){

		return Image.extend("sap.ui.demo.cart.controls.ImageHover",{
			metadata: {
				events: {
					"mIn" : {},
					"mOut" : {}
				}
			},
			renderer: {},
			onmouseout: function(){
				this.fireMOut();
			},
			onmouseover: function(){
				this.fireMIn();
			}
		});

});
