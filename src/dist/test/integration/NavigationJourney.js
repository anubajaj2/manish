sap.ui.define(["sap/ui/test/opaQunit","./pages/Home","./pages/Category","./pages/Welcome","./pages/Product","./pages/Cart"],function(e){"use strict";QUnit.module("Navigation Journey");e("Should start the app and go to the speaker category view",function(e,o,t){e.iStartMyApp();o.onHome.iPressOnTheSpeakerCategory();t.onTheCategory.iShouldBeTakenToTheSpeakerCategory()});e("Should see the product Blaster Extreme",function(e,o,t){o.onTheCategory.iPressOnTheProductBlasterExtreme();t.onTheProduct.iShouldSeeTheBlasterExtremeDetailPage()});e("Should navigate back to home",function(e,o,t){o.onTheCategory.iPressTheBackButtonInCategory();t.onHome.iShouldSeeTheCategoryList();t.onTheWelcomePage.iShouldSeeTheWelcomePage()});e("Should navigate to cart",function(e,o,t){o.onTheWelcomePage.iToggleTheCart();t.onTheCart.iShouldSeeTheCart();t.onTheWelcomePage.iShouldSeeTheWelcomePage()});e("Should navigate from welcome to product view",function(e,o,t){o.onTheWelcomePage.iToggleTheCart();o.onTheWelcomePage.iPressOnTheProductSmartphoneAlphaTitle();t.onTheProduct.iShouldSeeTheSmartphoneAlphaDetailPage()});e("Should navigate back to home",function(e,o,t){o.onTheCategory.iPressTheBackButtonInCategory();t.onHome.iShouldSeeTheCategoryList();t.onTheWelcomePage.iShouldSeeTheWelcomePage()});e("Should navigate to product view via pressing product image",function(e,o,t){o.onTheWelcomePage.iPressTheProductImage();t.onTheProduct.iShouldSeeTheProductPage();t.onTheCategory.iShouldSeeSomeEntriesInTheProductList();t.iTeardownMyApp()})});