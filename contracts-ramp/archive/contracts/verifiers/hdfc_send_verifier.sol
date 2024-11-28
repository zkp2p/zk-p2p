// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 20491192805390485299153009773594534940189261866228447918068658471970481763042;
    uint256 constant alphay  = 9383485363053290200918347156157836566562967994039712273449902621266178545958;
    uint256 constant betax1  = 4252822878758300859123897981450591353533073413197771768651442665752259397132;
    uint256 constant betax2  = 6375614351688725206403948262868962793625744043794305715222011528459656738731;
    uint256 constant betay1  = 21847035105528745403288232691147584728191162732299865338377159692350059136679;
    uint256 constant betay2  = 10505242626370262277552901082094356697409835680220590971873171140371331206856;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 4702324236483749359376242949045822465319116726958430523945202749659299908356;
    uint256 constant deltax2 = 3208360273321841799729262863226982899406813453791710733556183670543714948331;
    uint256 constant deltay1 = 20522417867108599823821076712059869373887669366867675744686285826246555872195;
    uint256 constant deltay2 = 12670660525148580266180384698238910692596142688879851786303352145688714106072;


    uint256 constant IC0x = 8030280747517387687084877954234429976549976554414160216395914656104281510226;
    uint256 constant IC0y = 17104142844454039490663032536549076577086340484025562888729760759694808607073;

    uint256 constant IC1x = 8772237536144360869027888991210947226074582978952325102593968904821952496262;
    uint256 constant IC1y = 3122625119048240212134605236752638202088112691321561361183603728052095638860;

    uint256 constant IC2x = 9866912783934848269401547176895297308112639832209806585476829119584997553683;
    uint256 constant IC2y = 18902285702690262680512478183614519704432813846276579831365492715033962922088;

    uint256 constant IC3x = 16438843084767575186842465721500270558254188834133860009416059973276198912687;
    uint256 constant IC3y = 19637681743089590686621664763467973754245190088097969027495488201226096932201;

    uint256 constant IC4x = 16244957609429507716576008270804128279750543290646474514068167892102606186532;
    uint256 constant IC4y = 16583611018934211828874350883177026517224756607611408661470436361325164178493;

    uint256 constant IC5x = 1880231857260586659536997649990861400508081010769531584628586338531085366147;
    uint256 constant IC5y = 3722839973812376181715232865179709729667208171660553266886579036419738778905;

    uint256 constant IC6x = 1270409441163088899313281517456149544998439975345678595006767836844214411555;
    uint256 constant IC6y = 10860874768269047281776646019661374802388524425936615586287903660208564296932;

    uint256 constant IC7x = 8434045441105599576935866859120453521448783233787069448109618000861402242607;
    uint256 constant IC7y = 21026011281811734411736486883798620858743532933669000129465844405873540372296;

    uint256 constant IC8x = 16444826603046727982676650569240181121009190318002859965831975618430480163200;
    uint256 constant IC8y = 13330479436133799576954496017456751243468101156567577943444875506883800747485;

    uint256 constant IC9x = 10555698792423422968534735611731058731769401972428000627056129295681285141769;
    uint256 constant IC9y = 16920701552148154082888907960678652530790355790484478529127070630322055182590;

    uint256 constant IC10x = 560745557010411154560455562795570257381559403111495489793631749127360454692;
    uint256 constant IC10y = 1810559313890482073038275535517759684260573040004038901411592861530654003553;

    uint256 constant IC11x = 16290647924331362744847363177877456121951933254859466501497770055360811608170;
    uint256 constant IC11y = 7357664199131242056460365154843603175601302622408068632904637798809388576439;

    uint256 constant IC12x = 18752167508011332686902609807404507911733917202367475123738963433802316522501;
    uint256 constant IC12y = 18915834728830385178845869536888475042275783085177607701559012212414153432990;

    uint256 constant IC13x = 510508922566750460861825255921948971141871467672055616177326398295988211346;
    uint256 constant IC13y = 897537967901588078181449387398733392563087304136250554173225523551061601615;

    uint256 constant IC14x = 12705726630718483467144829385938528127462379446304491139120491926133440095304;
    uint256 constant IC14y = 17721913697683987271820073115272158306375363130125429582329456762454201602835;

    uint256 constant IC15x = 5311519503957019671658191600270827412585500467097722438446167059198229906675;
    uint256 constant IC15y = 18882610836190640499297283067779602696308349987082087123526913107849320426311;


    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[15] calldata _pubSignals) public view returns (bool) {
        assembly {
            function checkField(v) {
                if iszero(lt(v, q)) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            // G1 function to multiply a G1 value(x,y) to value in an address
            function g1_mulAccC(pR, x, y, s) {
                let success
                let mIn := mload(0x40)
                mstore(mIn, x)
                mstore(add(mIn, 32), y)
                mstore(add(mIn, 64), s)

                success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }

                mstore(add(mIn, 64), mload(pR))
                mstore(add(mIn, 96), mload(add(pR, 32)))

                success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

                if iszero(success) {
                    mstore(0, 0)
                    return(0, 0x20)
                }
            }

            function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
                let _pPairing := add(pMem, pPairing)
                let _pVk := add(pMem, pVk)

                mstore(_pVk, IC0x)
                mstore(add(_pVk, 32), IC0y)

                // Compute the linear combination vk_x

                g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))

                g1_mulAccC(_pVk, IC2x, IC2y, calldataload(add(pubSignals, 32)))

                g1_mulAccC(_pVk, IC3x, IC3y, calldataload(add(pubSignals, 64)))

                g1_mulAccC(_pVk, IC4x, IC4y, calldataload(add(pubSignals, 96)))

                g1_mulAccC(_pVk, IC5x, IC5y, calldataload(add(pubSignals, 128)))

                g1_mulAccC(_pVk, IC6x, IC6y, calldataload(add(pubSignals, 160)))

                g1_mulAccC(_pVk, IC7x, IC7y, calldataload(add(pubSignals, 192)))

                g1_mulAccC(_pVk, IC8x, IC8y, calldataload(add(pubSignals, 224)))

                g1_mulAccC(_pVk, IC9x, IC9y, calldataload(add(pubSignals, 256)))

                g1_mulAccC(_pVk, IC10x, IC10y, calldataload(add(pubSignals, 288)))

                g1_mulAccC(_pVk, IC11x, IC11y, calldataload(add(pubSignals, 320)))

                g1_mulAccC(_pVk, IC12x, IC12y, calldataload(add(pubSignals, 352)))

                g1_mulAccC(_pVk, IC13x, IC13y, calldataload(add(pubSignals, 384)))

                g1_mulAccC(_pVk, IC14x, IC14y, calldataload(add(pubSignals, 416)))

                g1_mulAccC(_pVk, IC15x, IC15y, calldataload(add(pubSignals, 448)))


                // -A
                mstore(_pPairing, calldataload(pA))
                mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

                // B
                mstore(add(_pPairing, 64), calldataload(pB))
                mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
                mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
                mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

                // alpha1
                mstore(add(_pPairing, 192), alphax)
                mstore(add(_pPairing, 224), alphay)

                // beta2
                mstore(add(_pPairing, 256), betax1)
                mstore(add(_pPairing, 288), betax2)
                mstore(add(_pPairing, 320), betay1)
                mstore(add(_pPairing, 352), betay2)

                // vk_x
                mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
                mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))


                // gamma2
                mstore(add(_pPairing, 448), gammax1)
                mstore(add(_pPairing, 480), gammax2)
                mstore(add(_pPairing, 512), gammay1)
                mstore(add(_pPairing, 544), gammay2)

                // C
                mstore(add(_pPairing, 576), calldataload(pC))
                mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

                // delta2
                mstore(add(_pPairing, 640), deltax1)
                mstore(add(_pPairing, 672), deltax2)
                mstore(add(_pPairing, 704), deltay1)
                mstore(add(_pPairing, 736), deltay2)


                let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)

                isOk := and(success, mload(_pPairing))
            }

            let pMem := mload(0x40)
            mstore(0x40, add(pMem, pLastMem))

            // Validate that all evaluations ∈ F

            checkField(calldataload(add(_pubSignals, 0)))

            checkField(calldataload(add(_pubSignals, 32)))

            checkField(calldataload(add(_pubSignals, 64)))

            checkField(calldataload(add(_pubSignals, 96)))

            checkField(calldataload(add(_pubSignals, 128)))

            checkField(calldataload(add(_pubSignals, 160)))

            checkField(calldataload(add(_pubSignals, 192)))

            checkField(calldataload(add(_pubSignals, 224)))

            checkField(calldataload(add(_pubSignals, 256)))

            checkField(calldataload(add(_pubSignals, 288)))

            checkField(calldataload(add(_pubSignals, 320)))

            checkField(calldataload(add(_pubSignals, 352)))

            checkField(calldataload(add(_pubSignals, 384)))

            checkField(calldataload(add(_pubSignals, 416)))

            checkField(calldataload(add(_pubSignals, 448)))

            checkField(calldataload(add(_pubSignals, 480)))


            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }