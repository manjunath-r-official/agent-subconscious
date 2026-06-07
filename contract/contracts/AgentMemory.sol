// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract AgentMemory {
    
    struct Thought {
        string content;
        uint256 timestamp;
        string dataSource;
    }

    Thought[] public thoughts;
    address public owner;

    event ThoughtRecorded(uint256 indexed index, string content, uint256 timestamp);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can record thoughts");
        _;
    }

    function recordThought(string memory _content, string memory _dataSource) public onlyOwner {
        thoughts.push(Thought({
            content: _content,
            timestamp: block.timestamp,
            dataSource: _dataSource
        }));
        emit ThoughtRecorded(thoughts.length - 1, _content, block.timestamp);
    }

    function getRecentThoughts(uint256 _count) public view returns (Thought[] memory) {
        uint256 total = thoughts.length;
        if (total == 0) return new Thought[](0);

        uint256 count = _count > total ? total : _count;
        Thought[] memory recent = new Thought[](count);

        for (uint256 i = 0; i < count; i++) {
            recent[i] = thoughts[total - count + i];
        }
        return recent;
    }

    function getTotalThoughts() public view returns (uint256) {
        return thoughts.length;
    }
}