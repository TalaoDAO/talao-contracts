import ExperienceService from '../api/experiences';
import OrganizationService from '../api/organization';
import CertificatService from '../api/certificats';

export const GET_DASHBOARD_BEGIN   = 'GET_DASHBOARD_BEGIN';
export const GET_DASHBOARD_SUCCESS = 'GET_DASHBOARD_SUCCESS';
export const GET_DASHBOARD_ERROR   = 'GET_DASHBOARD_ERROR';
export const DELETE_ASYNC_BEGIN    = 'DELETE_ASYNC_BEGIN';
export const DELETE_ASYNC_SUCCESS  = 'DELETE_ASYNC_SUCCESS';
export const DELETE_ASYNC_ERROR    = 'DELETE_ASYNC_ERROR';

export const getDashboardBegin = () => ({
  type: GET_DASHBOARD_BEGIN
});

export const getDashboardSuccess = (experiences, organizations, certificats) => ({
  type: GET_DASHBOARD_SUCCESS,
  experiences,
  organizations,
  certificats
});

export const getDashboardError = (error) => ({
  type: GET_DASHBOARD_ERROR,
  error
});

export const deleteAsyncBegin = () => ({
  type: DELETE_ASYNC_BEGIN
});

export const deleteAsyncSuccess = (certificats) => ({
  type: DELETE_ASYNC_SUCCESS,
  certificats
});

export const deleteAsyncError = (error) => ({
  type: DELETE_ASYNC_ERROR,
  error
});

export function deleteAsync(id, certificats) {
  return dispatch => {
    dispatch(deleteAsyncBegin());
    CertificatService.getCertificatService().delete(id).then(res => {
      const index = certificats.findIndex(x => x.id === id);
      certificats.splice(index, 1);
      dispatch(deleteAsyncSuccess(certificats));
    }).catch((error) => {
      dispatch(deleteAsyncError(error));
    });
  };
}

export function getDashboardDatas(userEthAddress) {
  return dispatch => {
    dispatch(getDashboardBegin());

    Promise.all([
      getFromEth(ExperienceService.getExperienceService(), userEthAddress),
      getFromEth(OrganizationService.getOrganizationService(), userEthAddress),
      getFromEth(CertificatService.getCertificatService(), userEthAddress)
    ])
    .then(([experiences, organizations, certificats]) => {
      dispatch(getDashboardSuccess(experiences, organizations, certificats));
    }).catch(error => {
      dispatch(getDashboardError(error));
    });
  };
}

function getFromEth(service, ethAddress) {
  return new Promise((resolve, reject) => {
    service.getAllFromEth(ethAddress).then(response => {
      response.error ? reject(response.error) : resolve(response)
    }).catch(error => {
      reject(error);
    });
  });
}
