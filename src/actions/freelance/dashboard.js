import ExperienceService from '../../api/freelance/experience';
import OrganizationService from '../../api/freelance/organization';
import CertificateService from '../../api/freelance/certificate';

export const GET_DASHBOARD_BEGIN   = 'GET_DASHBOARD_BEGIN';
export const GET_DASHBOARD_SUCCESS = 'GET_DASHBOARD_SUCCESS';
export const GET_DASHBOARD_ERROR   = 'GET_DASHBOARD_ERROR';
export const DELETE_ASYNC_BEGIN    = 'DELETE_ASYNC_BEGIN';
export const DELETE_ASYNC_SUCCESS  = 'DELETE_ASYNC_SUCCESS';
export const DELETE_ASYNC_ERROR    = 'DELETE_ASYNC_ERROR';
export const SHARE_CERTIFICATE_BEGIN = 'SHARE_CERTIFICATE_BEGIN';
export const SHARE_CERTIFICATE_SUCCESS = 'SHARE_CERTIFICATE_SUCCESS';
export const SHARE_CERTIFICATE_ERROR = 'SHARE_CERTIFICATE_ERROR';

export const getDashboardBegin = () => ({
  type: GET_DASHBOARD_BEGIN
});

export const getDashboardSuccess = (experiences, organizations, certificates) => ({
  type: GET_DASHBOARD_SUCCESS,
  experiences,
  organizations,
  certificates
});

export const getDashboardError = error => ({
  type: GET_DASHBOARD_ERROR,
  error
});

export const deleteAsyncBegin = () => ({
  type: DELETE_ASYNC_BEGIN
});

export const deleteAsyncSuccess = certificates => ({
  type: DELETE_ASYNC_SUCCESS,
  certificates
});

export const deleteAsyncError = error => ({
  type: DELETE_ASYNC_ERROR,
  error
});

export const shareCertificateInit = certificate => ({
  type: 'SHARE_CERTIFICATE_INIT',
  certificate
});

export const shareCertificateBegin = () => ({
  type: SHARE_CERTIFICATE_BEGIN,
});

export const shareCertificateSuccess = (certificate, certificates) => ({
  type: SHARE_CERTIFICATE_SUCCESS,
  certificates,
  certificate
});

export const shareCertificateError = error => ({
  type: SHARE_CERTIFICATE_ERROR,
  error
});

export function deleteAsync(id, certificates) {
  return dispatch => {
    dispatch(deleteAsyncBegin());
    CertificateService.getService().delete(id).then(res => {
      const index = certificates.findIndex(x => x.id === id);
      certificates.splice(index, 1);
      dispatch(deleteAsyncSuccess(certificates));
    }).catch((error) => {
      dispatch(deleteAsyncError(error));
    });
  };
}

export function getDashboardDatas(userEthAddress) {
  return dispatch => {
    dispatch(getDashboardBegin());
    Promise.all([
      get(ExperienceService.getService()),
      get(OrganizationService.getService()),
      get(CertificateService.getService())
    ])
    .then(([experiences, organizations, certificates]) => {
      dispatch(getDashboardSuccess(experiences, organizations, certificates));
    }).catch(error => {
      dispatch(getDashboardError(error));
    });
  };
}

function get(service) {
  return new Promise((resolve, reject) => {
    service.get().then(response => {
      response.error ? reject(response.error) : resolve(response)
    }).catch(error => {
      reject(error);
    });
  });
}

export function shareCertificate(id, certificates) {
  return dispatch => {
    const index = certificates.findIndex(x => x.id === id);
    dispatch(shareCertificateBegin());
    CertificateService.getService().share(id)
    .then(certificate => {
      certificates[index] = certificate;
      dispatch(shareCertificateSuccess(certificate, certificates));
    }).catch((error) => {
      dispatch(shareCertificateError(error));
    });
  };
}