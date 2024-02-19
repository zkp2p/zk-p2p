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
    uint256 constant deltax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant deltax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant deltay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant deltay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;

    
    uint256 constant IC0x = 11918704493560870359339869750083267392221147470880133874543153878837786897782;
    uint256 constant IC0y = 15161974226813911432419916816491609726295225025786437075201201172755518828182;
    
    uint256 constant IC1x = 13665755384899360552877203114175834283421097640688521747651823803472989375685;
    uint256 constant IC1y = 14847007012606049986211912341602818063521298074878165889836491882641007395600;
    
    uint256 constant IC2x = 16720164163472987611836075616269664973847209604318712719160393305367498616346;
    uint256 constant IC2y = 3489828421269900883137681402742640677499613872169099355877576780637453742164;
    
    uint256 constant IC3x = 14558298043475844541520007167363255612725576760241957545718404100781650127949;
    uint256 constant IC3y = 15827980841718554159652757799932083357335483916263611575706087766680469651947;
    
    uint256 constant IC4x = 13201011300897010201001590664151254844477678205448718640405556853500239777903;
    uint256 constant IC4y = 10976754124460894032321927390477397804021611650152531805692096512959680417110;
    
    uint256 constant IC5x = 17725559456513958623868449508995063180702860519478570433606786989013613533257;
    uint256 constant IC5y = 5282634710825799398434226410303234712146380709479209605240606173690898720881;
    
    uint256 constant IC6x = 2561540656327358704113746515046922292940295415863957484371475364089020643965;
    uint256 constant IC6y = 19218419979850889020611273632001162120558781218886749252016399660295936898264;
    
    uint256 constant IC7x = 17723209310846681949291225968545097509030461103648822938472796004512802005426;
    uint256 constant IC7y = 5718484149276317153826533837707156514233036683853963895647781806910725855858;
    
    uint256 constant IC8x = 783044918828942932275525908306266844335240080600971979855168057163302026678;
    uint256 constant IC8y = 18447269270863826749143412433480742678819423706772408193179567063357139465360;
    
    uint256 constant IC9x = 16049984073390941852010778396462468165485665560460676610134942137842952743999;
    uint256 constant IC9y = 15393040922675188294679505110508163983932454488776787150669263903376602047870;
    
    uint256 constant IC10x = 21125750843355309436473118206333966870553534016068333984322339808429643650253;
    uint256 constant IC10y = 1388902711102559040778790749771561221829222806159420342405519265013296277752;
    
    uint256 constant IC11x = 19451435438252918374923767680024934268265775690378432323564087009218616237596;
    uint256 constant IC11y = 534921572148514404387545234871751568705565212738511061685263838000951032722;
    
    uint256 constant IC12x = 8263995977855665848774867357840246930150174491009535478277470874735452365096;
    uint256 constant IC12y = 1655385700491387278846078412984894962129598138810856393141715830150868139744;
    
    uint256 constant IC13x = 13520388001036369389275060582837105073084445245064453911237034497387576373062;
    uint256 constant IC13y = 1766916818866956249388975206414701656942832242964583426969209907294719772118;
    
    uint256 constant IC14x = 17217931269923407163010649237359883027652233584519021444671498861237631376523;
    uint256 constant IC14y = 19190525396365214192710704436752391953675071679906179182829113058669528379863;
    
    uint256 constant IC15x = 12242496014978580178340128070355981740045767793884726318004970073555940068018;
    uint256 constant IC15y = 13098434079204223402323561863157204411193956812693453429895207372864198000155;
    
    uint256 constant IC16x = 4001352047900289334727090211167875937109330122521001869621639382014983536171;
    uint256 constant IC16y = 3432890718044552716632801763816123741792159445286294957136890276672995908833;
    
    uint256 constant IC17x = 16899920902741007422289562125142938030293706759565740338237316648891964139981;
    uint256 constant IC17y = 17616406002473481518828151189335306050952124803974366703688707967897134891879;
    
    uint256 constant IC18x = 3889480375859910074207432273239179719017168556888168893608437146859831971223;
    uint256 constant IC18y = 13792559472567917456799704316284529551932527631603015992754353550076137339029;
    
    uint256 constant IC19x = 18519385024245093430496171791924309054590860480949453157396411229704064953759;
    uint256 constant IC19y = 10284513062981777572495660392785224663715889292762978413036918659706325829769;
    
    uint256 constant IC20x = 2237870082354442582199988083243057805129808510004096340084504621290628431915;
    uint256 constant IC20y = 11768373176564305414414902584692864597270725738409090589603128496683774725220;
    
    uint256 constant IC21x = 16717708081161789319648912656529094528397449630467712280098836947430605393742;
    uint256 constant IC21y = 5911478691985790484268863050874051399865970225324297669226558757293238205832;
    
    uint256 constant IC22x = 12723811598401794707247684525422676492656072516661637656132113143553132808211;
    uint256 constant IC22y = 14899356093971893677262610802286675063697076564293385804242986729500119366901;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[22] calldata _pubSignals) public view returns (bool) {
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
                
                g1_mulAccC(_pVk, IC16x, IC16y, calldataload(add(pubSignals, 480)))
                
                g1_mulAccC(_pVk, IC17x, IC17y, calldataload(add(pubSignals, 512)))
                
                g1_mulAccC(_pVk, IC18x, IC18y, calldataload(add(pubSignals, 544)))
                
                g1_mulAccC(_pVk, IC19x, IC19y, calldataload(add(pubSignals, 576)))
                
                g1_mulAccC(_pVk, IC20x, IC20y, calldataload(add(pubSignals, 608)))
                
                g1_mulAccC(_pVk, IC21x, IC21y, calldataload(add(pubSignals, 640)))
                
                g1_mulAccC(_pVk, IC22x, IC22y, calldataload(add(pubSignals, 672)))
                

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
            
            checkField(calldataload(add(_pubSignals, 512)))
            
            checkField(calldataload(add(_pubSignals, 544)))
            
            checkField(calldataload(add(_pubSignals, 576)))
            
            checkField(calldataload(add(_pubSignals, 608)))
            
            checkField(calldataload(add(_pubSignals, 640)))
            
            checkField(calldataload(add(_pubSignals, 672)))
            
            checkField(calldataload(add(_pubSignals, 704)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
