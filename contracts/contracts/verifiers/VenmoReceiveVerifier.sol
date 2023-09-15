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

contract VenmoReceiveVerifier {
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


    uint256 constant IC0x = 11770744552252420388205381347019837339479072222766406648280743656652993713221;
    uint256 constant IC0y = 12372270348902944425600466466300402834909145493239571750899350173005342460986;

    uint256 constant IC1x = 12622897347978674105058201573806809181722575663155026023524814478528806223117;
    uint256 constant IC1y = 16609968153262990423060835719253896019700800820200895443112740213193497570321;

    uint256 constant IC2x = 14267724873929825170514259614585908026718434323284398368604952447712417777051;
    uint256 constant IC2y = 18141237525070646568177514830985727767960924349267157999901250193380311068406;

    uint256 constant IC3x = 3504517577584901499331961221543999644912445387258269212357438067778369040636;
    uint256 constant IC3y = 2494859602748833246802560707576307515153002625267355214855687335302152249143;

    uint256 constant IC4x = 7307843688367315784905879456515930353317120738842278601503124327269656626560;
    uint256 constant IC4y = 617901859446163155054396812343135259100508181636273171677774830905872721262;

    uint256 constant IC5x = 8589960371232275842728402140178518171169437445653902702842093286552806022875;
    uint256 constant IC5y = 10065826999544020279218617160391406797740211267953787570694827621190877528049;

    uint256 constant IC6x = 5661183576356821582141341750586609253483572414933470336527185566595100809722;
    uint256 constant IC6y = 11234400122958068726027322793968681414392111279070796698498165135565298656336;

    uint256 constant IC7x = 7823546491428309163406271327704046081232832922396303627412870742714549481595;
    uint256 constant IC7y = 9336636798625584356870907983489610430048257652955428270792014099662511452392;

    uint256 constant IC8x = 7055494022311244124404192092031329147060862294691479485687952779003546899270;
    uint256 constant IC8y = 21620116748895409522646457686956873192144136430597526718796601438844635383214;

    uint256 constant IC9x = 10396277783863172688925616695711754046655591851239929453334735415001653056107;
    uint256 constant IC9y = 15614239785472657313520391627036950646164177174836557283793772133993014999410;

    uint256 constant IC10x = 9698541861561611158457764630670487245468780396951120856521559554811909406683;
    uint256 constant IC10y = 15206104132382025530838816070884825344684011656350389879850761396367821397658;

    uint256 constant IC11x = 4794864161516582755141571559731367855329979199862135273935397679574350587731;
    uint256 constant IC11y = 10790655113377476817399850509841765810055670416850805520772981744874218127714;

    uint256 constant IC12x = 1566342270145317082851455780448388853276176289138307110587224671066822572702;
    uint256 constant IC12y = 20921192096602151166975530112002936784601056606644115880788126148845684703137;

    uint256 constant IC13x = 849215014366312828760978748651880021742012517342521231566447821679910151400;
    uint256 constant IC13y = 21263121916365599809017511937734955406053964818029007206712813383742912539064;

    uint256 constant IC14x = 8169881071570191088511739810347504694260553927766364710480797103704975710595;
    uint256 constant IC14y = 6964531712644435719699714541201719201314975518383821899001713599962724699138;

    uint256 constant IC15x = 11114320559813234210764353917711369991062388612901864988927752623991483601552;
    uint256 constant IC15y = 11351619519126377164910909750916021680804336336656812221551896684577023583995;

    uint256 constant IC16x = 6991531014436854087952110766942466030552601565893692296060872207752550933326;
    uint256 constant IC16y = 15251754600121503390214496430957120553284630322018748459686138711177864144972;

    uint256 constant IC17x = 14190182694247012570066072167425009996673684610018381531683244191909856191996;
    uint256 constant IC17y = 6774759390174683818096894361002855179063053522201209447056486507701385145401;

    uint256 constant IC18x = 21549342050820550760193773032112999585245944947674017046923779478841181849846;
    uint256 constant IC18y = 12877277464540435938157362354105322564362905245099514992091227575871594803363;

    uint256 constant IC19x = 9594771250228530622901255337882484306207201443916278300758718270670373846287;
    uint256 constant IC19y = 10375026971688559322093457862049039979416798208883865721572578526361798141661;


    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[19] calldata _pubSignals) public view returns (bool) {
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


            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
