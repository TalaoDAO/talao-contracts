import {
    GET_ORGANIZATIONS_BEGIN,
    GET_ORGANIZATIONS_SUCCESS,
    GET_ORGANIZATIONS_ERROR,
    SET_EXPERIENCE_FORM_INPUT,

    ADD_DOC_BEGIN,     
    ADD_DOC_SUCCESS,   
    ADD_DOC_ERROR,     
    REMOVE_DOC_BEGIN,  
    REMOVE_DOC_SUCCESS,
    REMOVE_DOC_ERROR,
    NEW_EXPERIENCE_CLICKED,
    ADD_CERTIFICAT_CLICKED,
    ADD_CERTIFICAT_SUCCESS,
    UPLOAD_SUCCESS,
    UPLOAD_BEGIN,
    EXPAND_PROFIL,
    UPLOAD_ERROR,
    SET_SKILLS
  } from '../actions/experience'
  
  const initialState = {
    formData: {
        date_start: '',
        date_end: '',
        job_title: '',
        job_description: '',
        job_duration: 0,
        companyId: 0,
        contactLastName: '',
        contactFirstName: '',
        contactJobTitle: '',
        finalClientCompany: '',
        freelanceName: '',
        freelanceEmail: '',
        freelanceEthereumAddress: '',
        partner_text: '',
        skill1: '',
        skill2: '',
        skill3: '',
        skill4: '',
        skill5: '',
        skill6: '', 
        skill7: '',
        skill8: '',
        skill9: '',
        skill10:'',
        status: 1
    },
    user: null,
    experienceToDelete: null,
    experienceToAdd: null,
    loading: false,
    success: null,
    error: null,
    newExperience: false,
    confidenceIndex: null,
    certificat: null,
    competencies: [],
    uploadLoading: false,
    expandProfil: false,
    organizations: []
  };

  export default function experienceReducer(state = initialState, action) {
    switch(action.type) {

        case 'RESET_EXPERIENCE_REDUCER': 
            return {
                state: initialState
        };

        case GET_ORGANIZATIONS_BEGIN:
            return {
                ...state,
                loading: true
        };

        case GET_ORGANIZATIONS_SUCCESS:
            return {
                ...state,
                loading: false,
                organizations: action.organizations
        };

        case GET_ORGANIZATIONS_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error
        };

        case SET_EXPERIENCE_FORM_INPUT: {
            var newForm = state.formData;
            newForm[action.property] = action.value;
            return {
                ...state,
                formData: Object.assign({}, newForm)
            }; 
        }
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

        case SET_SKILLS:
            return {
                ...state,
                skill1: (!action.skills.skill1) ? state.skill1 : (action.skills.skill1 === '#del') ? null : action.skills.skill1,
                skill2: (!action.skills.skill2) ? state.skill2 : (action.skills.skill2 === '#del') ? null : action.skills.skill2,
                skill3: (!action.skills.skill3) ? state.skill3 : (action.skills.skill3 === '#del') ? null : action.skills.skill3,
                skill4: (!action.skills.skill4) ? state.skill4 : (action.skills.skill4 === '#del') ? null : action.skills.skill4,
                skill5: (!action.skills.skill5) ? state.skill5 : (action.skills.skill5 === '#del') ? null : action.skills.skill5,
                skill6: (!action.skills.skill6) ? state.skill6 : (action.skills.skill6 === '#del') ? null : action.skills.skill6,
                skill7: (!action.skills.skill7) ? state.skill7 : (action.skills.skill7 === '#del') ? null : action.skills.skill7,
                skill8: (!action.skills.skill8) ? state.skill8 : (action.skills.skill8 === '#del') ? null : action.skills.skill8,
                skill9: (!action.skills.skill9) ? state.skill9 : (action.skills.skill9 === '#del') ? null : action.skills.skill9,
                skill10: (!action.skills.skill10) ? state.skill10 : (action.skills.skill10 === '#del') ? null : action.skills.skill10
        };

        default:
            return state;
        }
  }
    
  