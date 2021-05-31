sap.ui.define(
	["sap/m/Input"],
	function(Input){

		return Input.extend("sap.ui.demo.cart.controls.InputFocus",{
			metadata: {
				events: {
					"focus" : {}
				}
			},
			renderer: {},
			onfocus : function(){
				this.fireFocus();
			}
		});

});
