//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface ITLSData {
    struct TLSParams {
        address verifierSigningKey;
        string endpoint;
        string host;
    }
}
