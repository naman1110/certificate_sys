pragma solidity ^0.8.0;



contract issueverify{

    mapping(string=>bool) private mp;
    mapping(address=>bool) private allowed_organization; // adds organization address to issue the certificate
    address public deployer;

    constructor() {
           deployer = msg.sender;
    }
   // checks if organization is allowed
    modifier organization(address _adr){
       require(allowed_organization[_adr],"Not allowed");
      _;
    }
   
   // adds organization function
    function allow_org(address _adrr) public {
      require(deployer==msg.sender,"err");
      allowed_organization[_adrr]=true;
    }



    function issue(uint _ceriid,string memory _hash) organization(msg.sender) public{
       mp[_hash] =true;
       require(mp[_hash],"Not found");
       
    }
    
    function verify(string memory _hash) public  view returns(bool){
       require(mp[_hash],"Not found");
       return true;

    }

    }
