### 2025-08-02
- Total rewrite in plain Vanilla JS

### 2025-07-20
- some DOM fixes and correct change triggering

### 2025-07-11
- the datepicker field is readonly, input is not working (currently)
- exposed formatDate: $.fn.fdatepicker.formatDate(date, displayFormat);
- close a memory leak

### Wed 15 Jan 2025
- Add a new fieldSizing option, allowing firefox to act as if CSS field-sizing=content was set and supported
  On a browser where CSS field-sizing=content is supported, this option will use the css-method

### Fri Feb 28 2020
- Add a new closeButton option

### Tue Nov 23 2019
- If a date is is set as a full ecma datestring (YYYY-MM-DDTHH:MM:SS) and
  it doesn't include the timezone, add the local timezone to it
  This results in a consistent datetime representation in all browsers

### Tue Nov 15 2019
- Allow altField selector to be used without "#", and it will get escaped too

### Tue Nov 05 2019
- Changed the supported format to PHP format

### Fri Nov 01 2019 
- scope data-action to fdatapicker alone, to avoid conflict with other plugins
- Renamed datepicker to fdatepicker
- selectDate accepts a string now too (it will convert to Date internally if so)
- selectDate accepts a csv-string of dates too for ranges or multiple dates
- default language is en
- added option altFieldMultipleDatesSeparator
- added more languages
- Fixed some deprecated jquery calls (blur and focus)
- Increased CSS width a bit to accomodate the slider on firefox
- AMD support added
- Other fixes incorporated from other branches
