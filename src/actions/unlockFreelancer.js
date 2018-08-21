import { transactionHash, transactionReceipt, transactionError } from '../actions/transactions'
import { transactionBegin } from '../actions/transactions';
import { changeMenu } from './menu';

export const UNLOCK_BEGIN      = 'UNLOCK_BEGIN';
export const UNLOCK_SUCCESS    = 'UNLOCK_SUCCESS';
export const UNLOCK_ERROR      = 'UNLOCK_ERROR';

export const unlockBegin = () => ({
    type: UNLOCK_BEGIN
  });

export const unlockSuccess = () => ({
    type: UNLOCK_SUCCESS
});

export const unlockError = error => ({
    type: UNLOCK_ERROR,
    error
});

export function unlockFreelancerClicked(user, history) {
    return dispatch => {
        dispatch(transactionBegin("This freelancer is being unlock..."));
        dispatch(unlockBegin());   
        user.talaoContract.methods.getVaultAccess(user.searchedFreelancers.ethAddress).send({from: user.ethAddress})
        .once('transactionHash', (hash) => { 
            dispatch(transactionHash(hash));
        })      
        .once('receipt', (receipt) => { 
            dispatch(transactionReceipt(receipt));
        })
        .on('error', (error) => { 
            dispatch(transactionError(error));
        })
        .then(() => {
            dispatch(unlockSuccess());
            dispatch(changeMenu('/chronology'));
            history.push('/chronology?' + user.searchedFreelancers.ethAddress);
        })
        .catch((error) => {
            dispatch(unlockError(error));
        });
    };
}