import {
  ASYNC_CALL_BEGIN,
  ASYNC_CALL_SUCCESS,
  ASYNC_CALL_ERROR,
  GET_ORGANIZATIONS,
  SET_EXPERIENCE_FORM_INPUT,
  SET_ORGANIZATION_FORM_INPUT,
  EXPAND_PROFIL,
  NEW_EXPERIENCE_CLICKED
} from '../../actions/freelance/experience';

const initialState = {
  formData: {
    date_start: '',
    date_end: '',
    job_title: '',
    job_description: '',
    job_duration: '',
    organizationId: 1,
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
    skill10: '',
    status: 1,
    certificatAsked: false,
    postedOnBlockchain: null
  },
  newOrganizationData: {
    name: '',
    responsible_first_name: '',
    responsible_last_name: '',
    responsible_job_title: '',
    email: '',
    phone: ''
  },
  user: null,
  loading: false,
  success: null,
  error: null,
  newExperience: false,
  expandProfil: false,
  organizations: []
};

export default function experienceReducer(state = initialState, action) {
  switch(action.type) {

    case 'RESET_EXPERIENCE_REDUCER':
    return {
      ...state,
      formData: initialState.formData,
      newExperience: false
    };

    case 'RESET_ORGANIZATION_REDUCER':
    return {
      ...state,
      newOrganizationData: initialState.newOrganizationData,
    };

    case ASYNC_CALL_BEGIN:
    return {
      ...state,
      loading: true
    };

    case ASYNC_CALL_ERROR:
    return {
      ...state,
      loading: false,
      error: action.error
    };

    case ASYNC_CALL_SUCCESS:
    return {
      ...state,
      loading: false
    };

    case GET_ORGANIZATIONS:
    return {
      ...state,
      organizations: action.organizations
    };

    case SET_EXPERIENCE_FORM_INPUT: {
      var newForm = state.formData;
      newForm[action.property] = action.value;
      return {
        ...state,
        formData: Object.assign({}, newForm)
      };
    }

    case SET_ORGANIZATION_FORM_INPUT: {
      var newOrgaForm = state.newOrganizationData;
      newOrgaForm[action.property] = action.value;
      return {
        ...state,
        newOrganizationData: Object.assign({}, newOrgaForm)
      };
    }

    case NEW_EXPERIENCE_CLICKED:
    return {
      ...state,
      newExperience: action.value
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
