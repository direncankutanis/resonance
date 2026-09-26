// SPDX-License-Identifier: MIT
pragma solidity 0.8.30;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Sepolia test collectible. Does NOT attest to verified gameplay.
/// @dev Claims are limited per caller and character; holdings follow transfers.
contract ReactiveMaster is ERC721, ReentrancyGuard {
    error WrongChain();
    error AlreadyClaimed();
    error InvalidCharacter();
    error EmptyMetadata();
    mapping(address => mapping(uint8 => bool)) public hasClaimed;
    mapping(address => mapping(uint8 => uint256)) public balanceOfCharacter;
    mapping(uint256 => uint8) private tokenCharacters;
    string[4] private characterURIs;
    uint256 public totalClaimed;
    event RewardClaimed(address indexed player, uint256 indexed tokenId, uint8 character);

    constructor(string[4] memory uris) ERC721("Resonance - Chapter Rewards", "RSONTEST") {
        if (block.chainid != 11155111) revert WrongChain();
        for (uint256 i; i < 4; ++i) {
            if (bytes(uris[i]).length == 0) revert EmptyMetadata();
            characterURIs[i] = uris[i];
        }
    }

    // Nonpayable: no mint sale price. Network gas is separate.
    function claim(uint8 character) external nonReentrant returns (uint256 tokenId) {
        if (block.chainid != 11155111) revert WrongChain();
        if (character >= 4) revert InvalidCharacter();
        if (hasClaimed[msg.sender][character]) revert AlreadyClaimed();
        hasClaimed[msg.sender][character] = true;
        tokenId = ++totalClaimed;
        tokenCharacters[tokenId] = character;
        _safeMint(msg.sender, tokenId);
        emit RewardClaimed(msg.sender, tokenId, character);
    }

    function characterOf(uint256 tokenId) public view returns (uint8) {
        _requireOwned(tokenId);
        return tokenCharacters[tokenId];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        return characterURIs[characterOf(tokenId)];
    }

    // Includes mint and transfer, so claim history is never mistaken for access.
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        uint8 character = tokenCharacters[tokenId];
        if (from != address(0)) balanceOfCharacter[from][character]--;
        if (to != address(0)) balanceOfCharacter[to][character]++;
        return from;
    }
}
