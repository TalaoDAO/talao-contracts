class User {

    constructor() {

        //get a ref to the vaultfactory
        this.vaultFactoryContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_VAULTFACTORY_ABI),
            process.env.REACT_APP_VAULTFACTORY_ADDRESS
        );

        this.tokenContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_TALAOTOKEN_ABI),
            process.env.REACT_APP_TALAOTOKEN_ADDRESS
        );
        
        //if the user is a freelancer, we store his datas
        this.freelancerDatas = null;
        
        //store the address of the current user
        this.ethAddress = window.account;

        //store the researched freelancers
        this.searchedFreelancers = [];
    }

    isFreelancer() {
        return new Promise((resolve, reject) => {
            //Check if the current user is a freelancer
            this.vaultFactoryContract.methods.FreelanceVault(this.ethAddress).call().then(vaultAddress => {
                this.vaultAddress = (vaultAddress === '0x0000000000000000000000000000000000000000') ? false : vaultAddress;
                resolve(this.vaultAddress);
            }).catch(error => {
                reject(error);
            });
        });
    }
}

export default User;