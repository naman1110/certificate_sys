// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract CertificateIssuer {
    enum CertificateStatus { NotIssued, Issued }

    mapping(string => CertificateStatus) private certificateStatus;
    mapping(string => uint256) private certificateData;
    address private owner;

    event CertificateIssued(string indexed hash, uint256 certificateId);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the contract owner can perform this operation");
        _;
    }

    function issueCertificate(uint256 _certificateId, string memory _hash) public onlyOwner {
        require(certificateStatus[_hash] == CertificateStatus.NotIssued, "Certificate already issued");
        certificateStatus[_hash] = CertificateStatus.Issued;
        certificateData[_hash] = _certificateId;
        emit CertificateIssued(_hash, _certificateId);
    }

    function verifyCertificate(string memory _hash) public view returns (bool) {
        if (certificateStatus[_hash] == CertificateStatus.Issued) {
            return true;
        } else {
            return false;
        }
    }
}

