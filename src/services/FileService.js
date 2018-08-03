import IpfsApi from 'ipfs-api';
import buffer from 'buffer';
import bs58 from 'bs58';

class FileService {
    
    static uploadToIpfs(documentToUpload) {
        return new Promise((resolve, reject) => {
            try {
                let ipfsApi = IpfsApi(process.env.REACT_APP_IPFS_API, 5001, { protocol: 'http' });
                const arrayBuffer = buffer.Buffer(documentToUpload);
                ipfsApi.files.add(arrayBuffer, (err, result) => { // Upload buffer to IPFS
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                });
            }
            catch (e) {
                reject(e)
            }
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