// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

contract LUdoGame {
    uint8 constant SIZE = 20;
    address public admin;
    address[] public participants;
    mapping(address => uint) public positions;
    mapping(address => bool) public registered;
    uint public rollResult;

    enum State { Inactive, Active }
    State public status;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized");
        _;
    }

    modifier onlyParticipants() {
        require(registered[msg.sender], "Not a participant");
        _;
    }

    constructor() {
        admin = msg.sender;
        status = State.Inactive;
    }

    function join() external {
        require(participants.length < 4, "Max 4 participants");
        require(!registered[msg.sender], "Already registered");

        participants.push(msg.sender);
        registered[msg.sender] = true;
        positions[msg.sender] = 0;

        if (participants.length >= 2) {
            status = State.Active;
        }
    }

    function roll() external onlyParticipants {
        require(status == State.Active, "Game not active");

        rollResult = (uint(keccak256(abi.encodePacked(block.timestamp, msg.sender))) % 6) + 1;
        positions[msg.sender] = (positions[msg.sender] + rollResult) % SIZE;
    }

    function getPosition(address _addr) external view returns (uint) {
        return positions[_addr];
    }

    function getParticipants() external view returns (address[] memory) {
        return participants;
    }
}
