// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/*********************************************************************************************************** */

/*
NOTES : 
This is a general smart contract template for managing environmental assets, such as renewable energy certificates, 
carbon credits, water rights, biodiversity offsets, conservation easements, and sustainable agriculture certificates.
This is a simplified and generalized template that can be customized for specific use cases. 
Please consult with legal experts to ensure regulatory compliance and tailor the contract to your needs.
*/

/*********************************************************************************************************** */

// Define the environmental asset contract
contract EnvironmentalAsset {
    string public assetName;
    string public assetType;
    uint256 public totalSupply;
    uint256 public availableSupply;
    uint256 public assetPrice;
    uint256 public expirationDate;
    address public issuer;

    mapping(address => uint256) public balances;

    event AssetMinted(address indexed holder, uint256 amount);
    event AssetTransferred(address indexed from, address indexed to, uint256 amount);
    event CheckBalance(uint amount);

    constructor(
        string memory _name,
        string memory _type,
        uint256 _initialSupply,
        uint256 _price,
        uint256 _expirationDate
    ) {
        assetName = _name;
        assetType = _type;
        totalSupply = _initialSupply;
        availableSupply = _initialSupply;
        assetPrice = _price;
        expirationDate = _expirationDate;
        issuer = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == issuer, "only issuer can call this function");
        _;
    }

    function mintAsset(address recipient, uint256 amount) external onlyOwner {
        require(recipient != address(0), "Invalid address");
        require(availableSupply >= amount, "Insufficient available supply");

        balances[recipient] += amount;
        availableSupply -= amount;

        emit AssetMinted(recipient, amount);
    }

    function transferAsset(address to, uint256 amount) external {
        require(to != address(0), "Invalid address");
        require(balances[msg.sender] >= amount, "Insufficient balance");

        balances[msg.sender] -= amount;
        balances[to] += amount;

        emit AssetTransferred(msg.sender, to, amount);
    }

    function revokeAsset() external onlyOwner {
        require(block.timestamp >= expirationDate, "Asset cannot be revoked before expiration");
        selfdestruct(payable(issuer));
    }

    function getBalance(address user_account) external returns (uint){
       uint user_bal = user_account.balance;
       emit CheckBalance(user_bal);
       return (user_bal);

    }
}
