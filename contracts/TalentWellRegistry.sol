// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TalentWellRegistry
 * @dev Smart contract para registrar check-ins emocionales de forma anónima
 * Los datos personales nunca se almacenan en blockchain, solo hashes verificables
 */
contract TalentWellRegistry {

    struct CheckInRecord {
        bytes32 checkInHash;
        uint256 timestamp;
        uint8 score;
        bool exists;
    }

    mapping(bytes32 => CheckInRecord) public records;

    bytes32[] public recordHashes;

    address public owner;
    uint256 public totalCheckIns;

    event CheckInRegistered(
        bytes32 indexed recordHash,
        uint256 timestamp,
        uint8 score
    );

    event CheckInVerified(
        bytes32 indexed recordHash,
        bool isValid
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
        totalCheckIns = 0;
    }

    /**
     * @dev Registra un nuevo check-in emocional
     * @param _checkInHash Hash anonimizado del check-in (SHA-256)
     * @param _score Puntuacion emocional (0-100)
     */
    function registerCheckIn(
        bytes32 _checkInHash,
        uint8 _score
    ) external {
        require(_score <= 100, "Score must be between 0 and 100");
        require(!records[_checkInHash].exists, "Check-in already registered");

        records[_checkInHash] = CheckInRecord({
            checkInHash: _checkInHash,
            timestamp: block.timestamp,
            score: _score,
            exists: true
        });

        recordHashes.push(_checkInHash);
        totalCheckIns++;

        emit CheckInRegistered(_checkInHash, block.timestamp, _score);
    }

    /**
     * @dev Verifica si un check-in existe en el registro
     * @param _checkInHash Hash del check-in a verificar
     * @return exists Si el check-in existe
     * @return timestamp Timestamp del registro
     * @return score Puntuacion registrada
     */
    function verifyCheckIn(bytes32 _checkInHash)
        external
        view
        returns (
            bool exists,
            uint256 timestamp,
            uint8 score
        )
    {
        CheckInRecord memory record = records[_checkInHash];
        return (
            record.exists,
            record.timestamp,
            record.score
        );
    }

    /**
     * @dev Obtiene el total de check-ins registrados
     */
    function getTotalCheckIns() external view returns (uint256) {
        return totalCheckIns;
    }

    /**
     * @dev Obtiene un registro por indice
     * @param _index Indice del registro en el array
     */
    function getRecordByIndex(uint256 _index)
        external
        view
        returns (
            bytes32 checkInHash,
            uint256 timestamp,
            uint8 score
        )
    {
        require(_index < recordHashes.length, "Index out of bounds");
        bytes32 hash = recordHashes[_index];
        CheckInRecord memory record = records[hash];

        return (
            record.checkInHash,
            record.timestamp,
            record.score
        );
    }

    /**
     * @dev Obtiene estadisticas agregadas (ultimos N registros)
     * @param _count Cantidad de registros a analizar
     */
    function getAggregatedStats(uint256 _count)
        external
        view
        returns (
            uint256 averageScore,
            uint256 recordCount
        )
    {
        require(_count > 0, "Count must be greater than 0");

        uint256 startIndex = recordHashes.length > _count
            ? recordHashes.length - _count
            : 0;

        uint256 sum = 0;
        uint256 count = 0;

        for (uint256 i = startIndex; i < recordHashes.length; i++) {
            bytes32 hash = recordHashes[i];
            sum += records[hash].score;
            count++;
        }

        uint256 avg = count > 0 ? sum / count : 0;

        return (avg, count);
    }

    /**
     * @dev Obtiene registros recientes
     * @param _count Cantidad de registros a retornar
     */
    function getRecentCheckIns(uint256 _count)
        external
        view
        returns (
            bytes32[] memory hashes,
            uint256[] memory timestamps,
            uint8[] memory scores
        )
    {
        require(_count > 0, "Count must be greater than 0");

        uint256 actualCount = _count > recordHashes.length
            ? recordHashes.length
            : _count;

        hashes = new bytes32[](actualCount);
        timestamps = new uint256[](actualCount);
        scores = new uint8[](actualCount);

        uint256 startIndex = recordHashes.length - actualCount;

        for (uint256 i = 0; i < actualCount; i++) {
            bytes32 hash = recordHashes[startIndex + i];
            CheckInRecord memory record = records[hash];

            hashes[i] = record.checkInHash;
            timestamps[i] = record.timestamp;
            scores[i] = record.score;
        }

        return (hashes, timestamps, scores);
    }

    /**
     * @dev Transferir ownership del contrato
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "New owner cannot be zero address");
        owner = newOwner;
    }
}
