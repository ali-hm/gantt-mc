import JDate from './jdate/jdate-class';
const YEAR = 'year';
const MONTH = 'month';
const DAY = 'day';
const HOUR = 'hour';
const MINUTE = 'minute';
const SECOND = 'second';
const MILLISECOND = 'millisecond';

export default {
    parse(date, date_separator = '-', time_separator = /[.:]/) {
        if (date instanceof Date) { 
            return new JDate(date);
        }
        if (typeof date === 'string') {
            var jd= new JDate(date);
            jd.setHours(0,0,0,0);
            return jd;
        }
    },

    to_string(date, with_time = false) {
        if (!(date instanceof Date)) {
            throw new TypeError('Invalid argument type');
        }
        const vals = this.get_date_values(date).map((val, i) => {
            if (i === 1) {
                // add 1 for month
                val = val + 1;
            }

            if (i === 6) {
                return padStart(val + '', 3, '0');
            }

            return padStart(val + '', 2, '0');
        });
        const date_string = `${vals[0]}-${vals[1]}-${vals[2]}`;
        const time_string = `${vals[3]}:${vals[4]}:${vals[5]}.${vals[6]}`;

        return date_string + (with_time ? ' ' + time_string : '');
    },
    dateTimeFormatters:{},
    getDateTimeFormatter: function(lang){
        if(this.dateTimeFormatters[lang]) return this.dateTimeFormatters[lang];
        var f = new Intl.DateTimeFormat(lang, {
            month: 'long'
        });
        this.dateTimeFormatters[lang] = f;
        return f;
    },
    format(date, format_string = 'YYYY-MM-DD HH:mm:ss.SSS', lang = 'en') {
        const dateTimeFormat = this.getDateTimeFormatter(lang);
        const month_name = dateTimeFormat.format(date._d);
        const month_name_capitalized =
            month_name.charAt(0).toUpperCase() + month_name.slice(1);

        const values = this.get_date_values(date).map(d => padStart(d, 2, 0));
        const format_map = {
            YYYY: values[0],
            MM: padStart(+values[1] + 1, 2, 0),
            DD: values[2],
            HH: values[3],
            mm: values[4],
            ss: values[5],
            SSS: values[6],
            D: values[2],
            MMMM: month_name_capitalized,
            MMM: month_name_capitalized,
        };

        let str = format_string;
        const formatted_values = [];

        Object.keys(format_map)
            .sort((a, b) => b.length - a.length) // big string first
            .forEach((key) => {
                if (str.includes(key)) {
                    str = str.replace(key, `$${formatted_values.length}`);
                    formatted_values.push(format_map[key]);
                }
            });

        formatted_values.forEach((value, i) => {
            str = str.replace(`$${i}`, value);
        });

        return str;
    },

    diff(date_a, date_b, scale = DAY) {
        var d_a = date_a;
        var d_b = date_b;
        if(d_a instanceof JDate){
            d_a = d_a._d;
        } 
        if(d_b instanceof JDate){
            d_b = d_b._d;
        } 
        let milliseconds, seconds, hours, minutes, days, months, years;

        milliseconds = d_a - d_b;
        seconds = milliseconds / 1000;
        minutes = seconds / 60;
        hours = minutes / 60;
        days = hours / 24;
        months = days / 30;
        years = months / 12;

        if (!scale.endsWith('s')) {
            scale += 's';
        }

        return Math.floor(
            {
                milliseconds,
                seconds,
                minutes,
                hours,
                days,
                months,
                years,
            }[scale]
        );
    },

    today() {
        const vals = this.get_date_values(new JDate()).slice(0, 3);
        var jd = new JDate(...vals);
        jd.setHours(0,0,0,0);
        return jd;
    },

    now() {
        return new JDate();
    },

    add(date, qty, scale) {
        qty = parseInt(qty, 10);
        const vals = [
            date.getFullYear() + (scale === YEAR ? qty : 0),
            date.getMonth() + (scale === MONTH ? qty : 0),
            date.getDate() + (scale === DAY ? qty : 0),
            date.getHours() + (scale === HOUR ? qty : 0),
            date.getMinutes() + (scale === MINUTE ? qty : 0),
            date.getSeconds() + (scale === SECOND ? qty : 0),
            date.getMilliseconds() + (scale === MILLISECOND ? qty : 0),
        ];
        return new JDate(...vals);
    },

    start_of(date, scale) {
        const scores = {
            [YEAR]: 6,
            [MONTH]: 5,
            [DAY]: 4,
            [HOUR]: 3,
            [MINUTE]: 2,
            [SECOND]: 1,
            [MILLISECOND]: 0,
        };

        function should_reset(_scale) {
            const max_score = scores[scale];
            return scores[_scale] <= max_score;
        }

        const vals = [
            date.getFullYear(),
            should_reset(YEAR) ? 0 : date.getMonth(),
            should_reset(MONTH) ? 1 : date.getDate(),
            should_reset(DAY) ? 0 : date.getHours(),
            should_reset(HOUR) ? 0 : date.getMinutes(),
            should_reset(MINUTE) ? 0 : date.getSeconds(),
            should_reset(SECOND) ? 0 : date.getMilliseconds(),
        ];

        var jd= new JDate(...vals);
        jd.setHours(0,0,0,0);
        return jd;
    },

    clone(date) {
        var jd= new JDate(...this.get_date_values(date));
        jd.setHours(0,0,0,0);
        return jd;
    },

    get_date_values(date) {
        return [
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            date.getHours(),
            date.getMinutes(),
            date.getSeconds(),
            date.getMilliseconds(),
        ];
    },

    get_days_in_month(date) {
        const no_of_days = [31,31,31,31,31,31,30,30,30,30,30];

        const month = date.getMonth();

        if (month !== 12) {
            return no_of_days[month];
        }

        // Esfand
        const year = date.getFullYear();
        if (this.isLeapYearJalali(year)) {
            return 30;
        }
        return 29;
    },
    isLeapYearJalali(year) {
        const matches = [1, 5, 9, 13, 17, 22, 26, 30];
        const modulus = year % 33;
        return matches.includes(modulus)
     }
};

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
function padStart(str, targetLength, padString) {
    str = str + '';
    targetLength = targetLength >> 0;
    padString = String(typeof padString !== 'undefined' ? padString : ' ');
    if (str.length > targetLength) {
        return String(str);
    } else {
        targetLength = targetLength - str.length;
        if (targetLength > padString.length) {
            padString += padString.repeat(targetLength / padString.length);
        }
        return padString.slice(0, targetLength) + String(str);
    }
}
