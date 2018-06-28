class DateService {

    static dateDiffAsString(d1, d2) {

        const months = this.monthDiff(d1, d2);
        const years = Math.floor(months / 12);
        const remainingMonths = months % 12;

        let dateString = '';

        if (years > 0) {
            dateString += `${years} year${years > 1 ? 's ' : ' '}`;
            if (remainingMonths > 0) {
                dateString += 'and '; 
            }
        }
        dateString += `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`; 
        return dateString;
    }

    static monthDiff(d1, d2) {
        let months = (d2.getFullYear() - d1.getFullYear()) * 12;
        months -= d1.getMonth() + 1;
        months += d2.getMonth();
        return months;
    }

    static getMonthYearDate(d) {
        let month = (d.getMonth() + 1).toString();
        month = ('0' + month.substring(0, 2));
        return month + '/' + (d.getFullYear()).toString();
    }
}

export default DateService;