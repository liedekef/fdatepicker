# fDatepicker

## Description

Lightweight customizable cross-browser jQuery datepicker, built with es5 and css-flexbox. Works in all modern desktop and mobile browsers (tested on Android 4.4+ and iOS8+).

![fdatepicker image](https://github.com/liedekef/fdatepicker/raw/master/docs/img/promo-img-time.png)

## Installation

Use one of the releases on github or download the files [directly](https://github.com/liedekef/fdatepicker/tree/master/dist)

## Usage

Include styles and scripts from `/dist` directory:

```
<html>
    <head>
        <link href="dist/css/fdatepicker.min.css" rel="stylesheet" type="text/css">
        <script src="dist/js/fdatepicker.min.js"></script>

        <!-- Include English language -->
        <script src="dist/js/i18n/fdatepicker.en.js"></script>
    </head>
</html>
```

Datepicker will automatically initialize on elements with class `.fdatepicker-here`, options may be sent via `data` attributes.

```
<input type='text' class="fdatepicker-here" data-position="right top" />
```

### Manual initialization

```
// Initialization
$('#my-element').fdatepicker([options]);
// Access instance of plugin
$('#my-element').data('fdatepicker');
```

## Examples

### Initialization with default options

```
<input type='text' class='fdatepicker-here' data-language='en' />
```

### Selecting multiple dates

Pass parameter `{multipleDates: true}`for selection of multiple dates. If you want to limit the number of selected dates, pass the desired number `{multipleDates: 3}`.

```
<input type="text"
       class="fdatepicker-here"
       data-language='en'
       data-multiple-dates="3"
       data-multiple-dates-separator=", "
       data-position='top left'/>
```

### Permanently visible calendar

Initialize plugin on non text input element, such as `<div> ... </div>`,or pass the parameter `{inline: true}`.

```
<div class="fdatepicker-here" data-language='en'></div>
```

### Month selection

```
<input type="text"
       class="fdatepicker-here"
       data-language='en'
       data-min-view="months"
       data-view="months"
       data-date-format="M Y" />
```

### Minimum and maximum dates

To limit date selection, use `minDate`and `maxDate`, they must receive JavaScript Date object.

```
$('#minMaxExample').fdatepicker({
    language: 'en',
    minDate: new Date() // Now can select only dates, which goes after today
});
```

### Range of dates

Use `{range: true}`for choosing range of dates. As dates separator `multipleDatesSeparator`will be used.

For possibility to select same date two times, you should set `{toggleSelected: false}`.

```
<input type="text"
    data-range="true"
    data-multiple-dates-separator=" - "
    data-language="en"
    class="fdatepicker-here"/>

```

### Disable days of week

For disabling days, use `onRenderCell`.

```
// Make Sunday and Saturday disabled
var disabledDays = [0, 6];

$('#disabled-days').fdatepicker({
    language: 'en',
    onRenderCell: function (date, cellType) {
        if (cellType == 'day') {
            var day = date.getDay(),
                isDisabled = disabledDays.indexOf(day) != -1;

            return {
                disabled: isDisabled
            }
        }
    }
});
```

### Custom cells content

Air Datepicker allows you to change contents of cells like you want. You could use `onRenderCell`for this purpose.
Lets add extra elements to several dates, and show `lorem` text when selecting them.

```
var eventDates = [1, 10, 12, 22],
    $picker = $('#custom-cells'),
    $content = $('#custom-cells-events'),
    sentences = [ &#x2026; ];

$picker.fdatepicker({
    language: 'en',
    onRenderCell: function (date, cellType) {
        var currentDate = date.getDate();
        // Add extra element, if `eventDates` contains `currentDate`
        if (cellType == 'day' && eventDates.indexOf(currentDate) != -1) {
            return {
                html: currentDate + '<span class="dp-note"></span>'
            }
        }
    },
    onSelect: function onSelect(fd, date) {
        var title = '', content = ''
        // If date with event is selected, show it
        if (date && eventDates.indexOf(date.getDate()) != -1) {
            title = fd;
            content = sentences[Math.floor(Math.random() * eventDates.length)];
        }
        $('strong', $content).html(title)
        $('p', $content).html(content)
    }
});

// Select initial date from `eventDates`
var currentDate = currentDate = new Date();
$picker.data('fdatepicker').selectDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), 10))
```

### Showing and hiding calendar

For adding some actions while datepicker is showing or hiding, use `onShow`and `onHide`callbacks.

```
$('#example-show-hide-callbacks').fdatepicker({
    language: 'en',
    onShow: function(dp, animationCompleted){
        if (!animationCompleted) {
            log('start showing')
        } else {
            log('finished showing')
        }
    },
    onHide: function(dp, animationCompleted){
        if (!animationCompleted) {
            log('start hiding')
        } else {
            log('finished hiding')
        }
    }
});
```

## Timepicker

To enable timepicker use option `{timepicker: true}`- it will add current time and a couple of range sliders by which one can pick time.

By default current user time will be set. This value can be changed by `startDate`parameter.

```
<div class="fdatepicker-here" data-timepicker="true" data-language='en'></div>
```

<i>More detailed info about timepicker parameters you can find in [Options](#options).</i>

### Time format

Time format is defined in localization object or in `timeFormat`parameter. By default (in English language) 12 hours format is used. For enabling 12 hours mode you must add `a`or `A` symbol in `timeFormat`. After what 'AM' and 'PM' sings will appear in timepicker widget.

As an example, lets use 24 hours mode in English language:

```
<div class="fdatepicker-here" data-timepicker="true" data-time-format='G:i'></div>
```

### Actions with time

For setting max/min hours or minutes values use `maxHours`, `minHours`, `maxMinutes`, `minMinutes`. You also could set time in `minDate`and `maxDate`. For setting hours you must use values between 0 and 23, event if 12 hours mode is on. Plugin will automatically transform given values to 12 hours format.

Lets create a calendar where the user can choose the time between 09:00 am and 06:00 pm on working days and on Saturday and Sunday between 10:00 am and 04:00 pm.

```
<input type='text' id='timepicker-actions-exmpl' />
<script>
    // Create start date
    var start = new Date(),
        prevDay,
        startHours = 9;

    // 09:00 AM
    start.setHours(9);
    start.setMinutes(0);

    // If today is Saturday or Sunday set 10:00 AM
    if ([6, 0].indexOf(start.getDay()) != -1) {
        start.setHours(10);
        startHours = 10
    }

    $('#timepicker-actions-exmpl').fdatepicker({
        timepicker: true,
        language: 'en',
        startDate: start,
        minHours: startHours,
        maxHours: 18,
        onSelect: function (fd, d, picker) {
            // Do nothing if selection was cleared
            if (!d) return;

            var day = d.getDay();

            // Trigger only if date is changed
            if (prevDay != undefined && prevDay == day) return;
            prevDay = day;

            // If chosen day is Saturday or Sunday when set
            // hour value for weekends, else restore defaults
            if (day == 6 || day == 0) {
                picker.update({
                    minHours: 10,
                    maxHours: 16
                })
            } else {
                picker.update({
                    minHours: 9,
                    maxHours: 18
                })
            }
        }
    });
</script>
```

## Localization

You can add your localization to object `$.fn.datepicker.language["my-lang"]`and pass it name to parameter `language`

```
// Add custom localization
$.fn.fdatepicker.language['my-lang'] = {...}

// Initialize datepicker with it
$('.my-datepicker').fdatepicker({
    language: 'my-lang'
});
```

You can also pass localization object directly in `language`

```
$('.my-datepicker').fdatepicker({
    language: {
        days: [...]
        ...
    }
});
```

If some fields are missing, they will be taken from default localization object ('English').

### Example of localization object

```
$.fn.fdatepicker.language['en'] = {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    months: ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    today: 'Today',
    clear: 'Clear',
    dateFormat: 'm/d/Y',
    timeFormat: 'H:i A'
    firstDay: 0
};
```

Available localizations located in `dist/js/i18n` directory.

## Options

### altField

Type `string|jQuery`

Default `""`

Alternative text input field (example: `altField='#my-alt-field-id'`). Use `altFieldDateFormat` for date formatting.

### altFieldDateFormat

Type `string`

Default `"u"`

Date format for alternative field. Use [php date format](https://www.php.net/manual/en/function.date.php) notation.

### altFieldMultipleDatesSeparator

Type `string`

Default `","`

Alternative field dates separator, which will be used when concatenating dates to string.

### autoClose

Type `boolean`

Default `false`

If true, then after date selection, datepicker will be closed.

### classes

Type `string`

Default `""`

Extra css classes for datepicker.

### clearButton

Type `boolean`

Default `false`

If true, then button "Clear" will be visible.

### dateFormat

Type `string`

Default `""`

Desirable date format. Use [php date format](https://www.php.net/manual/en/function.date.php) notation.

### dateTimeSeparator

Type `string`

Default `" "`

Separator between date and time

### disableNavWhenOutOfRange

Type `boolean`

Default `true`

If true, then at the date, which would be less than minimum possible or more then maximum possible, navigation buttons ('forward', 'back') will be deactivated.

### firstDay

Type `number`

Default `""`

Day index from which week will be started. Possible values are from 0 to 6, where 0 - Sunday and 6 - Saturday.
By default value is taken from current localization, but if it passed here then it will have higher priority.

### hoursStep

Type `number`

Default `1`

Hours step in slider.

### inline

Type `boolean`

Default `false`

If true, then datepicker will be always visible.

### keyboardNav

Type `boolean`

Default `true`

If true, then one can navigate through calendar by keyboard.

Hot keys:

* **Ctrl + → | ↑** move one month forwards
* **Ctrl + ← | ↓** move one month backwards
* **Shift + → | ↑** move one year forwards
* **Shift + ← | ↓** move one year backwards
* **Alt + → | ↑** move 10 years forwards
* **Alt + ← | ↓** move 10 years backwards
* **Ctrl + Shift + ↑** move to next view
* **Esc** hides datepicker

### language

Type `string|object`

Default `"en"`

Datepicker's language. If string is passed, then language will be searched in `Datepicker.language`object.
If object is passed, then data will be taken from this object directly.

If some fields are missing, they will be taken from default localization object ('English').

### maxDate

Type `Date`

Default `""`

The maximum date for selection. All dates which comes after it cannot be selected.

### maxHours

Type `number`

Default `23`

Maximum hours value, must be between 0 and 23. You will not be able to choose value higher than this.

### maxMinutes

Type `number`

Default `59`

Maximum minutes value, must be between 0 and 59. You will not be able to choose value higher than this.

### minDate

Type `Date`

Default `""`

The minimum date for selection. All dates, running before it can't be activated.

### minHours

Type `number`

Default `0`

Minimal hours value, must be between 0 and 23. You will not be able to choose value lower than this.

### minMinutes

Type `number`

Default `0`

Minimal minutes value, must be between 0 and 59. You will not be able to choose value lower than this.

### minView

Type `string`

Default `"days"`

Minimal datepicker's view, on that view selecting cells will not trigger rendering next view, instead it will activate it.
Possible values are the same as in `view`.

### minutesStep

Type `number`

Default `1`

Minutes step in slider.

### monthsField

Type `string`

Default `"monthsShort"`

Field name from localization object which should be used as months names, when view is 'months'.

### moveToOtherMonthsOnSelect

Type `boolean`

Default `true`

If true, then selecting days from other month, will cause transition to that month.

### moveToOtherYearsOnSelect

Type `boolean`

Default `true`

If true, then selecting year from other decade, will cause transition to that decade.

### multipleDates

Type `boolean|number`

Default `false`

If true, then one can select unlimited dates. If number is passed, then amount of selected dates will be limited by it.

### multipleDatesSeparator

Type `string`

Default `","`

Dates separator, which will be used when concatenating dates to string.

### navTitles

Type `object`

Default

```
navTitles = {
      days: 'M, <i>Y</i>',
      months: 'Y',
      years: 'Y1 - Y2'
  };
```

Content of datepicker's title depending on current view, can use same notation as in parameter `dateFormat`. Missing fields will be taken from default values. Html tags are also possible. The notation `Y1 - Y2` will show a decade selection (eg. `2010-2019`).

```
$('#my-datepicker').fdatepicker({
       navTitles: {
           days: '<h3>Check in date:</h3> M, Y'
       }
   })
```

### nextHtml

Type `string`

Default `<svg><path d="M 14,12 l 5,5 l -5,5"></path></svg>`

Contents of 'prev' button.

### offset

Type `number`

Default `12`

Offset from the main positioning axes.

### prevHtml

Type `string`

Default `<svg><path d="M 17,12 l -5,5 l 5,5"></path></svg>`

Contents of 'next' button.

### position

Type `string`

Default `"bottom left"`

Position of datepicker relative to text input. First value is name of main axis, and second is position on that axis.
For example `{position: "right top"}`- will set datepicker's position from right side on top of text input.

### range

Type `boolean`

Default `false`

For selecting dates range, turn this option to true. `multipleDatesSeparator`will be used as dates separator.

### selectOtherMonths

Type `boolean`

Default `true`

If true, then one can select days form other months.

### selectOtherYears

Type `boolean`

Default `true`

If true, then on can select years from other decades

### showEvent

Type `string`

Default `"focus"`

Event type on which the datepicker should be shown.

### showOtherMonths

Type `boolean`

Default `true`

If true, then days from other months will be visible.

### showOtherYears

Type `boolean`

Default `true`

If true, then years from other decades will be visible.

### startDate

Type `Date`

Default `new Date()`

This date will be shown at first initialization.

### timeFormat

Type `string`

Default `null`

Desirable time format. Use [php date format](https://www.php.net/manual/en/function.date.php) notation.

### timepicker

Type `boolean`

Default `false`

If `true`, when timepicker widget will be added.

### todayButton

Type `boolean|Date`

Default `false`

If true, then button "Today" will be visible. If Date is passed then click event will also select passed date.

```
// Select today
$('.fdatepicker').fdatepicker({
    todayButton: new Date()
})
```

### toggleSelected

Type `boolean`

Default `true`

If true, then clicking on selected cell will remove selection.

### view

Type `string`

Default `"days"`

Start datepicker view. Possible values are:

* `days` display days of one month
* `months` display months of one year
* `years` display years of one decade

### weekends

Type `array`

Default `[6, 0]` (Saturday and Sunday)

Array of day's indexes which will be considered as weekends. Class `.-weekend-` will be added to relevant cells.

## Events

### onSelect(formattedDate, date, inst)

Type `function`

Default `null`

Callback when selecting date

* **formattedDate** <i>string</i> - formatted date.
* **date** <i>Date|array</i> - JavaScript Date objectif `{multipleDates: true}`, then it will be an array of js dates.
* **inst** <i>object</i> - plugin instance.

### onShow(inst, animationCompleted)

Type `function`

Default `null`

Callback when calendar is showing.

* **inst** <i>Object</i> - plugin instance.
* **animationCompleted** <i>boolean</i> - animation indicator. If its `false`, when animation has just begun, if `true`- already ended.

### onHide(inst, animationCompleted)

Type `function`

Default `null`

Callback when calendar is hiding.

* **inst** <i>Object</i> - plugin instance.
* **animationCompleted** <i>boolean</i> - animation indicator. If its `false`, when animation has just begun, if `true`- already ended.

### onChangeMonth(month, year)

Type `function`

Default `null`

Callback when months are changed.

* **month** <i>number</i> - month number (from 0 to 12), to which transition is done.
* **year** <i>number</i> - year, to which transition is done.

### onChangeYear(year)

Type `function`

Default `null`

Callback when year is changed

* **year** <i>number</i> - year, to which transition is done.

### onChangeDecade(decade)

Type `function`

Default `null`

Callback when decade is changed

* **decade** <i>array</i> - array which consists of two years: first year in decade and last year in decade.

### onChangeView(view)

Type `function`

Default `null`

Callback when datepicker's view is changed

* **view** <i>string</i> - view name, to which transition is done (days, months, years).

### onRenderCell(date, cellType)

Type `function`

Default `null`

Callback when datepicker's cell is rendered.

* **date** <i>Date</i> - current cell date
* **cellType** <i>string</i> - current cell type (day, month, year).

The callback must return object which may consists of three fields:

```
{
    html: '', // Custom cell content
    classes: '', // Extra css classes to cell
    disabled: '' // true/false, if true, then cell will be disabled
}
```

#### Example

```
$('#my-datepicker').fdatepicker({
    // Let's make a function which will add class 'my-class' to every 11 of the month
    // and make these cells disabled.
    onRenderCell: function(date, cellType) {
        if (cellType == 'day' && date.getDate() == 11) {
            return {
                classes: 'my-class',
                disabled: true
            }
        }
    }
})
```

## API

Plugin instance is accessible through `data`attribute.

```
var myDatepicker = $('#my-elem').fdatepicker().data('fdatepicker');
myDatepicker.show();
```

### show()

Shows datepicker.

### hide()

Hides datepicker.

### destroy()

Destroys datepicker.

### next()

Renders next month, year or decade, depending on current view.

### prev()

Renders previous month, year or decade, depending on current view.

### selectDate(date)

* **date** <i>Date|Array|CSV</i> - JavaScript `Date()`, or array of dates, or CSV list of dates (easier than arrays).

Activates passed date or multiple dates if array is passed. If `{multipleDates: false}`and date is already active, then it will be deactivated. If `{multipleDates: true}`then another active date will be added.

### removeDate(date)

* **date** <i>Date</i> - JavaScript `Date()`

Removes selection from passed date.

### clear()

Clears all selected dates.

### update(field[, value])

* **field** <i>string|object</i> - field name which must be updated.
* **field** <i>string|*</i> - new value.

This method updates datepicker's options. After calling this method, datepicker will be redrawn.
You can update several parameters at one time, just pass in object with necessary fields.

```
var mydatepicker = $('#my-elem').fdatepicker().data('fdatepicker');
// Single parameter update
mydatepicker.update('minDate', new Date())
// Multiple parameters
mydatepicker.update({
    position: "top right",
    maxDate: new Date(),
    todayButton: true
})
```

### view

Sets new view for datepicker.

```
fdatepicker.view = 'months';
```

### date

Sets new viewing date for datepicker, must pass a JavaScript Date object `Date()`

```
fdatepicker.date = new Date();
```

### $el

Datepicker's DOM element

### selectedDates

Array of selected dates
