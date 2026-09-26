// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;
interface IReward {
    function claim(uint8 character) external returns(uint256);
    function characterOf(uint256 tokenId) external view returns(uint8);
    function tokenURI(uint256 tokenId) external view returns(string memory);
    function balanceOfCharacter(address owner,uint8 character) external view returns(uint256);
}
contract ReceiverProbe {
    IReward private target;
    bool public rejectReward;
    bool public nestedClaimSucceeded;
    uint8 public observedCharacter;
    string public observedURI;
    uint256 public observedBalance;
    constructor(address reward) { target=IReward(reward); }
    function setReject(bool value) external { rejectReward=value; }
    function claim(uint8 character) external { target.claim(character); }
    function onERC721Received(address,address,uint256 tokenId,bytes calldata) external returns(bytes4) {
        require(msg.sender==address(target));
        require(!rejectReward,"Reject test");
        observedCharacter=target.characterOf(tokenId);
        observedURI=target.tokenURI(tokenId);
        observedBalance=target.balanceOfCharacter(address(this),observedCharacter);
        try target.claim((observedCharacter+1)%4) { nestedClaimSucceeded=true; } catch {}
        return this.onERC721Received.selector;
    }
}
