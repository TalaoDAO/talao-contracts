import ExperienceService from '../api/experiences';

export const GET_DASHBOARD_BEGIN   = 'GET_DASHBOARD_BEGIN';
export const GET_DASHBOARD_SUCCESS = 'GET_DASHBOARD_SUCCESS';
export const GET_DASHBOARD_ERROR   = 'GET_DASHBOARD_ERROR';

export const getDashboardBegin = () => ({
    type: GET_DASHBOARD_BEGIN
});

export const getDashboardSuccess = (experiences) => ({
    type: GET_DASHBOARD_SUCCESS,
    experiences
});

export const getDashboardError = (error) => ({
    type: GET_DASHBOARD_ERROR,
    error
});

export function getExperiences() {
    return dispatch => {
        dispatch(getDashboardBegin());
        let experiencesService = ExperienceService.getExperienceService();
        experiencesService.getAll().then(response => {
            //if the API send back an error
            if (response.error) 
                dispatch(getDashboardError(response.error));
            else
                // if the API send success
                dispatch(getDashboardSuccess(response.experiences));
        }).catch(error => {
            // if an error is not handle
            dispatch(getDashboardError(error));
        });
    };
}