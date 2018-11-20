import Freelancer from '../../models/Freelancer';
import { fetchUserSuccess } from '../public/user';
import { resetGuard } from '../public/guard';

export const INIT_FREELANCER_BEGIN = 'INIT_FREELANCER_BEGIN';
export const INIT_FREELANCER_ERROR = 'INIT_FREELANCER_ERROR';

export const initFreelancerBegin = () => ({
  type: INIT_FREELANCER_BEGIN
});

export const initFreelancerError = error => ({
  type: INIT_FREELANCER_ERROR,
  error
});

export function initFreelancer(user, auth) {
  return dispatch => {
    dispatch(initFreelancerBegin());
    user.freelancerDatas = new Freelancer(auth.freelancerVaultAddress, auth.freelancerAddress);
    user.freelancerDatas.getFreelanceData().then((resolve, reject) => {
      if (reject) {
        dispatch(initFreelancerError(reject))
      }
      if (resolve) {
        // Get docs from the backend.
        user.freelancerDatas.getAllDraftDocumentsFromBackend().then(resolve => {
          if (resolve) {
            // Get docs from blockchain.
            user.freelancerDatas.getAllDocsId().then(resolve => {
              if (resolve) {
                user.freelancerDatas.getAllDocuments(resolve).then(resolve => {
                  if (resolve) {
                    // Get competencies.
                    user.freelancerDatas.getCompetencies().then(resolve => {
                      if (resolve) {
                        // Get confidence index.
                        user.freelancerDatas.getGlobalConfidenceIndex().then(resolve => {
                          if (resolve) {
                            dispatch(fetchUserSuccess(user));
                            dispatch(resetGuard());
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  };
}
