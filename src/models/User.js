class User {

    constructor(address) {

        //get a ref to the vaultfactory
        this.vaultFactoryContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_VAULTFACTORY_ABI),
            process.env.REACT_APP_VAULTFACTORY_ADDRESS
        );

        this.tokenContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_TALAOTOKEN_ABI),
            process.env.REACT_APP_TALAOTOKEN_ADDRESS
        );

        this.talaoContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_TALAOTOKEN_ABI),
            process.env.REACT_APP_TALAOTOKEN_ADDRESS
        );

        this.freelancerContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_FREELANCER_ABI),
            process.env.REACT_APP_FREELANCER_ADDRESS
        );
        
        //if the user is a freelancer, we store his datas
        this.freelancerDatas = null;
        
        //store the address of the current user
        this.ethAddress = address;

        //store the researched freelancers
        this.searchedFreelancers = null;

        //TalaoToken balance
        this.talaoBalance = null;
    }

    isFreelancer() {
        return new Promise((resolve, reject) => {
            //Check if the current user is a freelancer
            this.vaultFactoryContract.methods.HasVault(this.ethAddress).call().then(hasVault => {
                if (hasVault) {
                    this.vaultFactoryContract.methods.GetVault(this.ethAddress).call({from: this.ethAddress}).then(vaultAddress => {
                        resolve(vaultAddress);
                    });
                } else {
                    resolve(false);
                }
            }).catch(error => {
                reject(error);
            });
        });
    }
}

export default User;