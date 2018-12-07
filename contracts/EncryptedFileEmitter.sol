pragma solidity ^0.4.24;

contract EncryptedFileEmitter is Ownable {

    event NewEncryptedFile (
        bytes32 recipientPublicEncryptionKey,
        bytes32 fileHash,
        uint16 fileEngine
    );

    function emitEncryptedFile
    (
        bytes32 _recipientPublicEncryptionKey,
        bytes32 _fileHash,
        uint16 _fileEngine
    )
        internal
        onlyOwner
    {
        emit NewEncryptedFile(
            _recipientPublicEncryptionKey,
            _fileHash,
            _fileEngine
        );
    }
}
