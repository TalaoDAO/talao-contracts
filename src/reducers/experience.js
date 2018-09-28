import {
    ADD_DOC_BEGIN,     
    ADD_DOC_SUCCESS,   
    ADD_DOC_ERROR,     
    REMOVE_DOC_BEGIN,  
    REMOVE_DOC_SUCCESS,
    REMOVE_DOC_ERROR,
    CHANGE_FROM,
    CHANGE_TO,
    CHANGE_DESCRIPTION_EXP,
    CHANGE_TITLE_EXP,
    CHANGE_TYPE,
    NEW_EXPERIENCE_CLICKED,
    ADD_CERTIFICAT_CLICKED,
    ADD_CERTIFICAT_SUCCESS,
    UPLOAD_SUCCESS,
    UPLOAD_BEGIN,
    EXPAND_PROFIL,
    UPLOAD_ERROR
  } from '../actions/experience'
  
  const initialState = {
    user: null,
    experienceToDelete: null,
    experienceToAdd: null,
    to: '',
    toEmpty: true,
    toBeforeFrom: false,
    from: '',
    fromEmpty: true,
    title: '',
    titleError: false,
    titleEmpty: true,
    type: '4',
    description: '',
    loading: false,
    success: null,
    error: null,
    helperTextTooLong: 'Maximum length: 30 characters',
    helperTextEmpty: 'This field is required',
    newExperience: false,
    confidenceIndex: null,
    certificat: null,
    competencies: [],
    uploadLoading: false,
    expandProfil: false,
    showTalaoButton: true
  };
  
  export default function experienceReducer(state = initialState, action) {
    switch(action.type) {
  
        case REMOVE_DOC_BEGIN:
            return {
                ...state,
                user: action.user,
                loading: true,
                experienceToAdd: null,
                experienceToDelete: action.experience,
                success: null
            };

        case REMOVE_DOC_SUCCESS:
            return {
                ...state,
                loading: false,
                user: action.user,
                success: action.success
            };
  
        case REMOVE_DOC_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error,
                uploadLoading: false
            };

        case ADD_DOC_BEGIN:
            return {
                ...state,
                user: action.user,
                loading: true,
                experienceToAdd: action.experience,
                experienceToDelete: null,
                success: null
            };

        case ADD_DOC_SUCCESS:
            return {
                ...state,
                loading: false,
                user: action.user,
                success: action.success
            };
  
        case ADD_DOC_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error
            };

        case CHANGE_FROM:
            return {
                ...state,
                from: action.from,
                fromEmpty: action.errorEmpty,
                toBeforeFrom: action.toBeforeFrom
            };   

        case CHANGE_TO:
            return {
                ...state,
                to: action.to,
                toEmpty: action.errorEmpty,
                toBeforeFrom: action.toBeforeFrom
            };

        case CHANGE_TITLE_EXP:
            return {
                ...state,
                title: action.title,
                titleError: action.error,
                titleEmpty: action.errorEmpty
            };

        case CHANGE_DESCRIPTION_EXP:
            return {
                ...state,
                description: action.description
            };

        case CHANGE_TYPE:
            return {
                ...state,
                type: action.typeExp
            };

        case NEW_EXPERIENCE_CLICKED:
            return {
                ...state,
                newExperience: action.value,
                to: '',
                toEmpty: true,
                from: '',
                fromEmpty: true,
                title: '',
                titleError: false,
                titleEmpty: true,
                type: '4',
                description: '',
                formData: null,
                confidenceIndex: null,
                certificat: null,
                competencies: []
            };

        case ADD_CERTIFICAT_CLICKED:
            return {
                ...state
            };

        case UPLOAD_SUCCESS:
            return {
                ...state,
                newExperience: false,
                to: '',
                toEmpty: true,
                from: '',
                fromEmpty: true,
                title: '',
                titleError: false,
                titleEmpty: true,
                type: '4',
                description: '',
                formData: null,
                confidenceIndex: null,
                certificat: null,
                competencies: [],
                uploadLoading: false
            };

        case UPLOAD_BEGIN:
            return {
                ...state,
                uploadLoading: true
            };

        case UPLOAD_ERROR:
            return {
                ...state,
                uploadLoading: false
            };

        case ADD_CERTIFICAT_SUCCESS:
            return {
                ...state,
                formData: action.formData,
                confidenceIndex: action.confidenceIndex,
                certificat: action.certificat,
                competencies: action.competencies,
                showTalaoButton: false
            };

        case EXPAND_PROFIL:
            return {
                ...state,
                expandProfil: action.expandProfil
            };

        default:
            return state;
        }
  }
    
  