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
	$.fn.fdatepicker.language['nl'] = {
		days: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'],
		daysShort: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
		daysMin: ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za'],
		months: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
		monthsShort: ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
		today: 'Vandaag',
		clear: 'Legen',
		dateFormat: 'd-m-Y',
		timeFormat: 'G:i',
		firstDay: 1
	};
}));
