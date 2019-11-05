(function (factory) {
        if (typeof define === "function" && define.amd) {
                // AMD. Register as an anonymous module.
                define([
                        "jquery",
                ], factory);
        } else {
                // Browser globals
                factory(jQuery);
        }
}(function ($) {
	$.fn.datepicker.language['sv'] = {
		days: ['Söndag', 'Måndag', 'Tisdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lördag'],
		daysShort: ['Sön', 'Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör'],
		daysMin: ['Sö', 'Må', 'Ti', 'On', 'To', 'Fr', 'Lö'],
		months: ['Januari','Februari','Mars','April','Maj','Juni', 'Juli','Augusti','September','Oktober','November','December'],
		monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
		today: 'Idag',
		clear: 'Rensa',
		dateFormat: 'Y-m-d',
		timeFormat: 'G:i',
		firstDay: 1
	};
}));
