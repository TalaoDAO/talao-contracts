import bs58 from 'bs58';

export const IPFSAPI = 'https://ipfs.infura.io:5001/api/';
export const IPFSADD = IPFSAPI + 'v0/add'

class FileService {
    static uploadToIpfs(formData) {
        let form_data = new FormData();
        form_data.append("data", formData);
        
        return new Promise((resolve, reject) => {
            (async () => {
                const rawResponse = await fetch(IPFSADD, {
                  method: 'POST',
                  body: form_data
                });
                const content = await rawResponse.json();
                if (content) {
                    resolve(content.Hash)
                } else {
                    reject('Upload fail');
                }
              })();
        });
    }

    static getBytes32FromIpfsHash(ipfsAddress) {
        return "0x" + bs58.decode(ipfsAddress).slice(2).toString('hex')
    }

    static getIpfsHashFromBytes32(bytes32Hex) {
        // Add our default ipfs values for first 2 bytes:
        // function:0x12=sha2, size:0x20=256 bits
        // and cut off leading "0x"
        const hashHex = "1220" + bytes32Hex.slice(2)
        const hashBytes = Buffer.from(hashHex, 'hex');
        const hashStr = bs58.encode(hashBytes)
        return hashStr
    }
}

export default FileService;