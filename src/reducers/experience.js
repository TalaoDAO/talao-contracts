import {
    ADD_DOC_BEGIN,     
    ADD_DOC_SUCCESS,   
    ADD_DOC_ERROR,     
    REMOVE_DOC_BEGIN,  
    REMOVE_DOC_SUCCESS,
    REMOVE_DOC_ERROR,
    CHANGE_FROM,
    CHANGE_TO,
    CHANGE_DESCRIPTION,
    CHANGE_TITLE,
    CHANGE_TYPE,
    NEW_EXPERIENCE_CLICKED,
    ADD_CERTIFICAT_CLICKED,
    ADD_CERTIFICAT_SUCCESS,
    UPLOAD_SUCCESS
  } from '../actions/experience'
  
  const initialState = {
    user: null,
    experienceToDelete: null,
    experienceToAdd: null,
    to: '',
    toEmpty: true,
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
    uploadedDocument: null,
    confidenceIndex: null,
    certificat: null,
    competencies: []
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
                error: action.error
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
                fromEmpty: action.errorEmpty
            };   

        case CHANGE_TO:
            return {
                ...state,
                to: action.to,
                toEmpty: action.errorEmpty
            };

        case CHANGE_TITLE:
            return {
                ...state,
                title: action.title,
                titleError: action.error,
                titleEmpty: action.errorEmpty
            };

        case CHANGE_DESCRIPTION:
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
                uploadedDocument: null,
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
                uploadedDocument: null,
                confidenceIndex: null,
                certificat: null,
                competencies: []
            };

        case ADD_CERTIFICAT_SUCCESS:
            return {
                ...state,
                uploadedDocument: action.uploadedDocument,
                confidenceIndex: action.confidenceIndex,
                certificat: action.certificat,
                competencies: action.competencies
            };

        default:
            return state;
        }
  }
    
  