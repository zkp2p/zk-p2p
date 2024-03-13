//SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

interface ITLSData {
    struct TLSParams {
        address verifier;
        string endpoint;
        string host;
    }
}
