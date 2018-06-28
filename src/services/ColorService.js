import { constants } from '../constants';

class ColorService {

    static getCompetencyColorName(competencyName, confidenceIndex) {
        if (competencyName === "Education") return "grey";
        if (confidenceIndex > 80) return "accent1";
        if (confidenceIndex > 60) return "accent2";
        if (confidenceIndex > 40) return "accent3";
        return "accent4";
    }

    static getLightColorName(colorName) {
        return "light" + colorName[0].toUpperCase() + colorName.substring(1);
    }

    static getTextColorName(colorName) {
        return "text" + colorName[0].toUpperCase() + colorName.substring(1);
    }

    static getColorFromName(colorName) {
        return constants.colors[colorName];
    }
}

export default ColorService;