import Experience from '../../models/Experience';
import Competency from '../../models/Competency';

import ExperienceService from '../../api/freelance/experience';
import OrganizationService from '../../api/freelance/organization';

import { fetchUserSuccess } from '../../actions/public/user'
import { changeMenu } from '../../actions/public/menu';
import {
  transactionHash,
  transactionReceipt,
  transactionError,
  transactionBegin
} from '../../actions/public/transaction';
import { setSnackbar } from '../../actions/public/snackbar';

import FileService from '../../services/FileService';

export const ASYNC_CALL_BEGIN            = 'ASYNC_CALL_BEGIN';
export const ASYNC_CALL_SUCCESS          = 'ASYNC_CALL_SUCCESS';
export const ASYNC_CALL_ERROR            = 'ASYNC_CALL_ERROR';
export const GET_ORGANIZATIONS           = 'GET_ORGANIZATIONS';
export const SET_EXPERIENCE_FORM_INPUT   = 'SET_EXPERIENCE_FORM_INPUT';
export const SET_ORGANIZATION_FORM_INPUT = 'SET_ORGANIZATION_FORM_INPUT';
export const EXPAND_PROFIL               = 'EXPAND_PROFIL';
export const NEW_EXPERIENCE_CLICKED      = 'NEW_EXPERIENCE_CLICKED';
export const GET_BACKEND_EXPERIENCE_SUCCESS = 'GET_BACKEND_EXPERIENCE_SUCCESS';
export const SET_EXPERIENCE_SKILLS = 'SET_EXPERIENCE_SKILLS';

export const asyncCallBegin = () => ({
  type: ASYNC_CALL_BEGIN
});

export const asyncCallSuccess = success => ({
  type: ASYNC_CALL_SUCCESS,
  success
});

export const asyncCallError = error => ({
  type: ASYNC_CALL_ERROR,
  error
});

export const setExperienceFormInput = (property, value) => ({
  type: SET_EXPERIENCE_FORM_INPUT,
  property,
  value
});

export const setOrganizationFormInput = (property, value) => ({
  type: SET_ORGANIZATION_FORM_INPUT,
  property,
  value
});

export const newExperience = value => ({
  type: NEW_EXPERIENCE_CLICKED,
  value
});

export const expandProfil = expandProfil => ({
  type: EXPAND_PROFIL,
  expandProfil
});

export const getOrganizations = organizations => ({
  type: GET_ORGANIZATIONS,
  organizations
});

export const getBackendExperienceSuccess = (experience, skills) => ({
  type: GET_BACKEND_EXPERIENCE_SUCCESS,
  experience,
  skills
});

export const setExperienceSkills = skills => ({
  type: SET_EXPERIENCE_SKILLS,
  skills
});

export function fetchOrganizations() {
  return dispatch => {
    dispatch(asyncCallBegin());
    let organizationService = OrganizationService.getService();
    organizationService.get({
      validated: true
    })
    .then(response => {
      if (response.error)
      dispatch(asyncCallError(response.error));
      else {
        // if the API send success
        dispatch(asyncCallSuccess());

        dispatch(getOrganizations(response));
      }
    }).catch(error => {
      // if an error is not handle
      dispatch(asyncCallError(error));
    });
  };
}

export function getBackendExperience(id) {
  return dispatch => {
    dispatch(asyncCallBegin());
    let experienceService = ExperienceService.getService();
    experienceService.get({
      id: id
    })
    .then(response => {
      if (response.error)
      dispatch(asyncCallError(response.error));
      else {
        const experience = response[0];
        let skills = [];
        for (let i = 1; i <= 10; i++) {
          if (experience['skill' + i] !== '') {
            skills.push({
              id: i,
              title: experience['skill' + i]
            });
          }
        }
        dispatch(getBackendExperienceSuccess(experience, skills));
      }
    }).catch(error => {
      dispatch(asyncCallError(error));
    });
  };
}

export function setExperienceSkill(id, value, skills) {
  return dispatch => {
    if (value === '') {
    }
    else {
      const index = skills.findIndex(x => x.id === id);
      skills[index] = {
        id: id,
        title: value
      };
    }
    dispatch(setExperienceSkills(skills));
  }
}

export function removeExpFromBackend(exp, user) {
  return dispatch => {
    dispatch(asyncCallBegin());
    let experienceService = ExperienceService.getService();
    experienceService.delete(exp.idBack).then(response => {
      if (response.error)
      dispatch(asyncCallError(response.error));
      else {
        let itemToRemove = user.freelancerDatas.experiences.findIndex(x => x.idBack === exp.idBack && !x.idBlockchain && x.certificatAsked === false);
        user.freelancerDatas.experiences.splice(itemToRemove, 1);
        dispatch(fetchUserSuccess(user));
        dispatch(asyncCallSuccess());
      }
    }).catch(() => {
      dispatch(asyncCallError());
    });
  };
}

export function fetchExperience(experience, organization, user) {
  return dispatch => {
    dispatch(asyncCallBegin());
    let experienceService = ExperienceService.getService();
    let organizationService = OrganizationService.getService();
    // Add a new organization if the user asked for it.
    if (organization) {
      organization.createdByFree = experience.freelanceEthereumAddress;
      organizationService.add(organization).then(response => {
        if (response.error) {
          dispatch(asyncCallError(response.error));
        }
        const createdOrganization = response;
        dispatch(
          setSnackbar(
            'Your client request has been sent. Talao takes care of the mechanics. You can also follow this process in your dashboard.',
            'success'
          )
        );
        // Add new organization to experience.
        experience.organizationId = createdOrganization.id;
        // Add new experience.
        experienceService.add(experience).then(response => {
          if (response.error)
          dispatch(asyncCallError(response.error));
          else {
            // Set the success & reset the state.
            dispatch(asyncCallSuccess());
            // Add the new experience to the user.
            let competencies = [];
            for (let i = 1; i <= 10; i++) {
              if (experience['skill' + i]) {
                competencies.push(new Competency(experience['skill' + i], 0, null, 0));
              }
            }
            user.freelancerDatas.addExperience(
              new Experience(
                experience.job_title,
                experience.job_description,
                new Date(experience.date_start),
                new Date(experience.date_end),
                competencies,
                null,
                null,
                0,
                experience.job_duration,
                experience.certificatAsked,
                experience.postedOnBlockchain,
                response.id,
                1,
                null
              )
            );
            dispatch(fetchUserSuccess(user));
            // Reset the state.
            dispatch({type:'RESET_EXPERIENCE_REDUCER'});
          }
        }).catch(error => {
          dispatch(asyncCallError(error));
        });
      }).catch(() => {
        dispatch(asyncCallError('Failed to create the organization'));
      });
    }
    else {
      // No new organization, just adds experience.
      experienceService.add(experience).then(response => {
        if (response.error)
        dispatch(asyncCallError(response.error));
        else {
          // Set the success & reset the state.
          dispatch(asyncCallSuccess());
          // Add the new experience to the user.
          let competencies = [];
          for (let i = 1; i <= 10; i++) {
            if (experience['skill' + i]) {
              competencies.push(new Competency(experience['skill' + i], 0, null, 0));
            }
          }
          user.freelancerDatas.addExperience(
            new Experience(
              experience.job_title,
              experience.job_description,
              new Date(experience.date_start),
              new Date(experience.date_end),
              competencies,
              null,
              null,
              0,
              experience.job_duration,
              experience.certificatAsked,
              experience.postedOnBlockchain,
              response.id,
              1,
              null
            )
          );
          dispatch(fetchUserSuccess(user));
          // Reset the state.
          dispatch({type:'RESET_EXPERIENCE_REDUCER'});
        }
      }).catch(error => {
        dispatch(asyncCallError(error));
      });
    }
  };
}

export function askForCertificate(experienceId, user) {
  return dispatch => {
    dispatch(asyncCallBegin());
    const experience = {
      status: 2,
      certificatAsked: true
    };
    const experienceService = ExperienceService.getService();
    experienceService.update(experienceId, experience).then(response => {
      if (response.error) {
        dispatch(asyncCallError(response.error));
      }
      else {
        dispatch(asyncCallSuccess());
        const index = user.freelancerDatas.experiences.findIndex(x => x.idBack === experienceId && x.certificatAsked === false);
        user.freelancerDatas.experiences[index].status = 2;
        user.freelancerDatas.experiences[index].certificatAsked = true;
        dispatch(fetchUserSuccess(user));
        dispatch(
          setSnackbar(
            'Your certificate has been requested. You can follow the process in your dashboard.',
            'success'
          )
        );
      }
    })
    .catch(error => {
      dispatch(asyncCallError(error));
    });
  };
}

export function cancelCertificateRequest(experienceId, user) {
  return dispatch => {
    dispatch(asyncCallBegin());
    const experience = {
      status: 1,
      certificatAsked: false
    };
    const experienceService = ExperienceService.getService();
    experienceService.update(experienceId, experience).then(response => {
      if (response.error) {
        dispatch(asyncCallError(response.error));
      }
      else {
        dispatch(asyncCallSuccess());
        const index = user.freelancerDatas.experiences.findIndex(x => x.idBack === experienceId);
        user.freelancerDatas.experiences[index].status = 1;
        user.freelancerDatas.experiences[index].certificatAsked = false;
        dispatch(fetchUserSuccess(user));
        dispatch(
          setSnackbar(
            'Your certificate request has been canceled. You can now edit or remove the experience.',
            'success'
          )
        );
      }
    })
    .catch(error => {
      dispatch(asyncCallError(error));
    });
  };
}

export function newExperienceClicked(value, user) {
  return dispatch => {
    if(value) {
      dispatch(setExperienceFormInput('freelanceName', user.freelancerDatas.firstName + ' ' + user.freelancerDatas.lastName));
      dispatch(setExperienceFormInput('freelanceEmail', user.freelancerDatas.email));
      dispatch(setExperienceFormInput('freelanceEthereumAddress', user.freelancerDatas.ethAddress));
      dispatch(fetchOrganizations());
    }
    dispatch(newExperience(value));
  }
}

export function moveToNewExp(history) {
  return dispatch => {
    dispatch(newExperience(true));
    dispatch(changeMenu('/chronology', false));
    history.push('/chronology');
  }
}

export function postExperience(experience, user) {
  return dispatch => {
    //Submit to blockchain
    let keywords = [];
    for (let i = 0; i < experience.competencies.length; i++) {
      keywords.push(window.web3.utils.fromAscii(experience.competencies[i].name));
    }
    dispatch(transactionBegin("Close your computer, take a coffee...this transaction can last several minutes !"));
    user.freelancerDatas.addDocument(
      window.web3.utils.fromAscii(experience.title),
      window.web3.utils.fromAscii(experience.description),
      new Date(experience.from).getTime(),
      new Date(experience.to).getTime(),
      experience.jobDuration,
      keywords,
      4,
      window.web3.utils.fromAscii('')
    ).once('transactionHash', (hash) => {
      dispatch(transactionHash(hash));
    })
    .once('receipt', (receipt) => {
      dispatch(transactionReceipt(receipt));
    })
    .on('error', (error) => {
      dispatch(transactionError(error));
    })
    .then(value => {
      //get the id from the event
      let idFromBlockchain = parseInt(value.events.NewDocument.returnValues[0], 10);

      //complete the exp with blockchain infos
      let index = user.freelancerDatas.experiences.findIndex(x => x.idBack === experience.idBack && !x.idBlockchain);
      user.freelancerDatas.experiences[index].idBlockchain = idFromBlockchain;

      //Set the flag on the back
      let experienceModified = { idBlockchain: idFromBlockchain };
      let experienceService = ExperienceService.getService();
      experienceService.update(experience.idBack, experienceModified).then(response => {
        if (response.error)
        dispatch(asyncCallError(response.error));
        else {
          dispatch(asyncCallSuccess());
          dispatch(fetchUserSuccess(user));
        }
      }).catch(error => {
        // if an error is not handle
        dispatch(asyncCallError(error));
      });
    })
    .catch((error) => {
      dispatch(asyncCallError(error));
    });
  };
}

export function unPostExperience(experience, user) {
  return dispatch => {

    //Submit to blockchain
    dispatch(transactionBegin("Close your computer, take a coffee...this transaction can last several minutes !"));
    user.freelancerDatas.removeDocument(
      experience.idBlockchain
    ).once('transactionHash', (hash) => {
      dispatch(transactionHash(hash));
    })
    .once('receipt', (receipt) => {
      dispatch(transactionReceipt(receipt));
    })
    .on('error', (error) => {
      dispatch(transactionError(error));
    })
    .then(() => {
      //remove the blockchain exp and replace it by the back one
      let index = user.freelancerDatas.experiences.findIndex(x => x.idBack === experience.idBack && x.idBlockchain === experience.idBlockchain);
      user.freelancerDatas.experiences[index].idBlockchain = null;

      //Set the flag on the back
      let experienceModified = { idBlockchain: null };
      let experienceService = ExperienceService.getService();
      experienceService.update(experience.idBack, experienceModified).then(response => {
        if (response.error)
        dispatch(asyncCallError(response.error));
        else {
          dispatch(asyncCallSuccess());
          dispatch(fetchUserSuccess(user));
        }
      }).catch(error => {
        // if an error is not handle
        dispatch(asyncCallError(error));
      });
    })
    .catch((error) => {
      dispatch(asyncCallError(error));
    });
  };
}

export function removeBlockchainExp(experience, user) {
  return dispatch => {

    //Submit to blockchain
    dispatch(transactionBegin("Close your computer, take a coffee...this transaction can last several minutes !"));
    user.freelancerDatas.removeDocument(
      experience.idBlockchain
    ).once('transactionHash', (hash) => {
      dispatch(transactionHash(hash));
    })
    .once('receipt', (receipt) => {
      dispatch(transactionReceipt(receipt));
    })
    .on('error', (error) => {
      dispatch(transactionError(error));
    })
    .then(() => {
      //remove the blockchain exp and replace it by the back one
      let index = user.freelancerDatas.experiences.findIndex(x => x.idBlockchain === experience.idBlockchain);
      user.freelancerDatas.experiences.splice(index, 1);
      dispatch(asyncCallSuccess());
      dispatch(fetchUserSuccess(user));
    })
    .catch((error) => {
      dispatch(asyncCallError(error));
    });
  };
}

export function postOnBlockchainExperienceWithCertificate(file, user) {
  return dispatch => {
    if (typeof file === 'undefined') {
      return;
    }
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        // Upload the file.
        FileService.uploadToIpfs(file).then(result => {
          // Check if the file is already uploaded.
          // TODO: fix.
          let alreadyUploaded = false;
          user.freelancerDatas.experiences.forEach(experience => {
            if (experience.postedOnBlockchain === 1 && FileService.getIpfsHashFromBytes32(experience.docId) === result) {
              alreadyUploaded = true;
              dispatch(transactionError(new Error('You have already uploaded this certificate.')));
              dispatch(asyncCallError(new Error('You have already uploaded this certificate.')));
            }
          });
          if (!alreadyUploaded) {
            // Parse the JSON.
            const json = JSON.parse(event.target.result);
            // Parse the skills.
            let keywords = [];
            for (let i = 1; i <= 10; i++) {
              if (json['jobSkill' + i]) {
                keywords.push(window.web3.utils.fromAscii(json['jobSkill' + i]));
              }
            }
            // Parse ratings.
            const ratings = [
              json.jobRating1,
              json.jobRating2,
              json.jobRating3,
              json.jobRating4,
              json.jobRating5
            ];
            // Submit to blockchain.
            dispatch(transactionBegin('Close your computer, take a coffee...this transaction can last several minutes !'));
            user.freelancerDatas.addDocument(
              window.web3.utils.fromAscii(json.jobTitle),
              window.web3.utils.fromAscii(json.jobDescription),
              new Date(json.jobStart).getTime(),
              new Date(json.jobEnd).getTime(),
              json.jobDuration,
              keywords,
              4,
              FileService.getBytes32FromIpfsHash(result)
            ).once('transactionHash', (hash) => {
              dispatch(transactionHash(hash));
            })
            .once('receipt', (receipt) => {
              dispatch(transactionReceipt(receipt));
            })
            .on('error', (error) => {
              dispatch(transactionError(error));
            })
            .then(value => {
              // Get the blockchain Document id from the event.
              let idFromBlockchain = parseInt(value.events.NewDocument.returnValues[0], 10);
              // Build competencies.
              let competencies = [];
              // Rating of each competency is determined by answer to question 2.
              const competencyRating = json.jobRating2;
              for (let i = 1; i <= 10; i++) {
                if (json['jobSkill' + i]) {
                  competencies.push(
                    new Competency(
                      json['jobSkill' + i],
                      competencyRating,
                      null,
                      json.jobDuration
                    )
                  );
                }
              }
              // Build experience.
              let experienceToAdd = new Experience(
                json.jobTitle,
                json.jobDescription,
                new Date(json.jobStart),
                new Date(json.jobEnd),
                competencies,
                'https://gateway.ipfs.io/ipfs/' + result,
                json,
                ratings,
                json.jobDuration,
                false,
                idFromBlockchain,
                null,
                undefined,
                null
              );
              // Add it to the others.
              user.freelancerDatas.experiences.push(experienceToAdd);
              // Refresh the competencies & update the user.
              user.freelancerDatas.getCompetencies().then(resolve => {
                if (resolve) {
                  user.freelancerDatas.getGlobalConfidenceIndex().then(resolve => {
                    if (resolve) {
                      dispatch(fetchUserSuccess(user));
                    }
                  });
                }
              });
            })
            .catch((error) => {
              dispatch(asyncCallError(error));
            });
          }
        }, err => dispatch(asyncCallError(err)));
      } catch (e) {
        let error = {};
        error.message = 'Invalid JSON';
        dispatch(transactionError(error));
      }
    }
    reader.readAsText(file);
  };
}

export function addCertificateToExperienceDraftAndPostOnBlockchain(file, experience, user) {
  return dispatch => {
    if (typeof file === 'undefined') {
      return;
    }
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        // Upload the file.
        FileService.uploadToIpfs(file).then(result => {
          // Check if the file is already uploaded.
          let alreadyUploaded = false;
          user.freelancerDatas.experiences.forEach(experience => {
            if (experience.postedOnBlockchain === 1 && FileService.getIpfsHashFromBytes32(experience.docId) === result) {
              alreadyUploaded = true;
              dispatch(transactionError(new Error('You have already uploaded this certificate.')));
              dispatch(asyncCallError(new Error('You have already uploaded this certificate.')));
            }
          });
          if (!alreadyUploaded) {
            // Parse the JSON.
            const json = JSON.parse(event.target.result);
            // Parse the skills.
            let keywords = [];
            for (let i = 1; i <= 10; i++) {
              if (json['jobSkill' + i]) {
                keywords.push(window.web3.utils.fromAscii(json['jobSkill' + i]));
              }
            }
            // Parse ratings.
            const ratings = [
              json.jobRating1,
              json.jobRating2,
              json.jobRating3,
              json.jobRating4,
              json.jobRating5
            ];
            // Submit to blockchain.
            dispatch(transactionBegin('Close your computer, take a coffee...this transaction can last several minutes !'));
            user.freelancerDatas.addDocument(
              window.web3.utils.fromAscii(json.jobTitle),
              window.web3.utils.fromAscii(json.jobDescription),
              new Date(json.jobStart).getTime(),
              new Date(json.jobEnd).getTime(),
              json.jobDuration,
              keywords,
              4,
              FileService.getBytes32FromIpfsHash(result)
            ).once('transactionHash', (hash) => {
              dispatch(transactionHash(hash));
            })
            .once('receipt', (receipt) => {
              dispatch(transactionReceipt(receipt));
            })
            .on('error', (error) => {
              dispatch(transactionError(error));
            })
            .then(value => {
              // Get the blockchain Document id from the event.
              let idFromBlockchain = parseInt(value.events.NewDocument.returnValues[0], 10);
              // Remove the Experience fetched from the backend.
              const index = user.freelancerDatas.experiences.findIndex(x => x.idBack === experience.idBack && !x.postedOnBlockchain);
              user.freelancerDatas.experiences.splice(index, 1);
              // Remove the Experience from the backend.
              const experienceService = ExperienceService.getService();
              experienceService.delete(experience.idBack).then(response => {
                if (response.error) {
                  dispatch(asyncCallError(response.error));
                }
                else {
                  dispatch(asyncCallSuccess());
                }
              }).catch(error => {
                dispatch(asyncCallError(error));
              });
              // Build competencies.
              let competencies = [];
              // Rating of each competency is determined by answer to question 2.
              const competencyRating = json.jobRating2;
              for (let i = 1; i <= 10; i++) {
                if (json['jobSkill' + i]) {
                  competencies.push(
                    new Competency(
                      json['jobSkill' + i],
                      competencyRating,
                      null,
                      json.jobDuration
                    )
                  );
                }
              }
              // Build experience.
              let experienceToAdd = new Experience(
                json.jobTitle,
                json.jobDescription,
                new Date(json.jobStart),
                new Date(json.jobEnd),
                competencies,
                'https://gateway.ipfs.io/ipfs/' + result,
                json,
                ratings,
                json.jobDuration,
                null,
                idFromBlockchain,
                null,
                undefined,
                null
              );
              // Add it to the others.
              user.freelancerDatas.experiences.push(experienceToAdd);
              // Refresh the competencies & update the user.
              user.freelancerDatas.getCompetencies().then(resolve => {
                if (resolve) {
                  user.freelancerDatas.getGlobalConfidenceIndex().then(resolve => {
                    if (resolve) {
                      dispatch(fetchUserSuccess(user));
                    }
                  });
                }
              });
            })
            .catch((error) => {
              dispatch(asyncCallError(error));
            });
          }
        }, err => dispatch(asyncCallError(err)));
      } catch (e) {
        let error = {};
        error.message = 'Invalid JSON';
        dispatch(transactionError(error));
      }
    }
    reader.readAsText(file);
  };
}

export function addCertificateToPostedExperienceOnBlockchain(file, experience, user) {
  return dispatch => {
    if (typeof file === 'undefined') {
      return;
    }
    const reader = new FileReader();
    reader.onload = function (event) {
      try {
        // Upload the file.
        FileService.uploadToIpfs(file).then(result => {
          // Check if the file is already uploaded.
          let alreadyUploaded = false;
          user.freelancerDatas.experiences.forEach(experience => {
            if (experience.postedOnBlockchain === 1 && FileService.getIpfsHashFromBytes32(experience.docId) === result) {
              alreadyUploaded = true;
              dispatch(transactionError(new Error('You have already uploaded this certificate.')));
              dispatch(asyncCallError(new Error('You have already uploaded this certificate.')));
            }
          });
          if (!alreadyUploaded) {
            // Parse the JSON.
            const json = JSON.parse(event.target.result);
            // Parse the skills and ratings.
            let keywords = [], ratings = [];
            for (let i = 1; i <= 10; i++) {
              if (json['jobSkill' + i]) {
                keywords.push(window.web3.utils.fromAscii(json['jobSkill' + i]));
              }
              if (i <= 6 && json['jobRating' + i]) {
                ratings.push(json['jobRating' + i]);
              }
            }
            // Submit to blockchain.
            dispatch(transactionBegin('Close your computer, take a coffee...this transaction can last several minutes !'));
            user.freelancerDatas.setDocIpfs(
              experience.idBlockchain,
              FileService.getBytes32FromIpfsHash(result)
            ).once('transactionHash', (hash) => {
              dispatch(transactionHash(hash));
            })
            .once('receipt', (receipt) => {
              dispatch(transactionReceipt(receipt));
            })
            .on('error', (error) => {
              dispatch(transactionError(error));
            })
            .then(value => {
              // Remove the Experience from the backend.
              const experienceService = ExperienceService.getService();
              experienceService.delete(experience.idBack).then(response => {
                if (response.error) {
                  dispatch(asyncCallError(response.error));
                }
                else {
                  dispatch(asyncCallSuccess());
                }
              }).catch(error => {
                dispatch(asyncCallError(error));
              });
              // Remove the Experience get from the backend.
              let index = user.freelancerDatas.experiences.findIndex(x => x.idBack === experience.idBack && !x.postedOnBlockchain);
              // Build the new experience.
              let competencies = [];
              for (let i = 1; i <= 10; i++) {
                if (json['jobSkill' + i]) {
                  competencies.push(new Competency(json['jobSkill' + i], ratings[1], null, json.jobDuration));
                }
              }
              let experienceToAdd = new Experience(
                json.jobTitle,
                json.jobDescription,
                new Date(json.jobStart),
                new Date(json.jobEnd),
                competencies,
                'https://gateway.ipfs.io/ipfs/' + result,
                json,
                ratings,
                json.jobDuration,
                false,
                experience.idBlockchain,
                null,
                undefined,
                null
              );
              // Remove the Experience fetch from the back.
              user.freelancerDatas.experiences.splice(index, 1);
              // Add it to the others.
              user.freelancerDatas.experiences.push(experienceToAdd);
              // Refresh the competencies & update the user.
              user.freelancerDatas.getCompetencies().then(resolve => {
                if (resolve) {
                  user.freelancerDatas.getGlobalConfidenceIndex().then(resolve => {
                    if (resolve) {
                      dispatch(fetchUserSuccess(user));
                    }
                  });
                }
              });
            })
            .catch((error) => {
              dispatch(asyncCallError(error));
            });
          }
        }, err => dispatch(asyncCallError(err)));
      } catch (e) {
        let error = {};
        error.message = 'Invalid JSON';
        dispatch(transactionError(error));
      }
    }
    reader.readAsText(file);
  };
}