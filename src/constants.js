const primaryColor = '#1eaadc';
const secondaryColor = '#11cb5f';
const accent1Color = '#ffdc05';
const accent2Color = '#007d50';
const accent3Color = '#232d55';
const accent4Color = '#919191';
const greyColor = '#919191';
const lightAccent1Color = '#fff19b';
const lightAccent2Color = '#00c07b';
const lightAccent3Color = '#8290cc';
const lightAccent4Color = '#000000';
const lightGreyColor = '#f2f2f2';

var constants = {
    colors: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent1: accent1Color,
        accent2: accent2Color,
        accent3: accent3Color,
        accent4: accent4Color,
        grey: greyColor,
        lightAccent1: lightAccent1Color,
        lightAccent2: lightAccent2Color,
        lightAccent3: lightAccent3Color,
        lightAccent4: lightAccent4Color,
        lightGrey: lightGreyColor, 
    },
    fontSize: {
        small: '80%',
        large: '130%',
        extraLarge: '160%',
    },
    padding: {
        default: '20px'
    },
    theme: {
        palette: {
            primary: {
                main: primaryColor,
            },
            secondary: {
                main: secondaryColor,
            },
            background: {
                default: lightGreyColor,
            },
        },
        overrides: {
            MuiCard: {
                root: {
                    borderRadius: '5px',
                },
            },
        },
    },
};

export { constants };