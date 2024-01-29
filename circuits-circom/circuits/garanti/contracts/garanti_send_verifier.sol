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

    
    uint256 constant IC0x = 4393116572138095780416191323818893446780266464760894658691722412077014577358;
    uint256 constant IC0y = 20676847476782564024400907306682312030110520470599896282638394192449936599319;
    
    uint256 constant IC1x = 15243707889204978734002079483192577164385672888417341795244794887998135027152;
    uint256 constant IC1y = 4247089740199994842350073618868572966237708160399130807330481947784757609219;
    
    uint256 constant IC2x = 45521788303508500772539477835461566626958077102140745633421804598826321572;
    uint256 constant IC2y = 17942724379387810702022126856823768141884880610107288848065156977038476764897;
    
    uint256 constant IC3x = 3504504513044458197106935939552423843119516268285776951858715334388150390775;
    uint256 constant IC3y = 13757491968111710508189249401256987231023995028781662990287563869079057921378;
    
    uint256 constant IC4x = 14105149652620249497002528387450136197141794287456628299787225689773655326624;
    uint256 constant IC4y = 7589569592368096782268642894836809376835874513687150054657148816400970538752;
    
    uint256 constant IC5x = 6497140222030711851476668607918820175011285916106580996148901828609371324515;
    uint256 constant IC5y = 9038960103432623798707646237376143959225616504463875692046719262281056331215;
    
    uint256 constant IC6x = 6065783679076778169846704465978805095211054727113774222349383622314062017084;
    uint256 constant IC6y = 11573075306376824356678439400529916444097151157979557365654001775949248916429;
    
    uint256 constant IC7x = 3780919793950362952126356152236340616644476705461738632998564423599397828709;
    uint256 constant IC7y = 11571572135265460573634534274091571626451307824417282138435027846304968734370;
    
    uint256 constant IC8x = 19069886616640328308223122861790988535601548086188222123786608502121997421309;
    uint256 constant IC8y = 8947161863824720899641102172685163559884724890296339870580468629808192559415;
    
    uint256 constant IC9x = 20832504447220263080212412653195517703303729883035373690749749847711172916935;
    uint256 constant IC9y = 5330470064091563108053611347798093546916645366154811608222493042700778373980;
    
    uint256 constant IC10x = 725402300289085550886986677732276397003491553968930749714406687237663974023;
    uint256 constant IC10y = 8238699504347114688934160365805532608838382546815859971999996712799534730498;
    
    uint256 constant IC11x = 8598576819841699364112388159025190729544965578901181899430508531869700656718;
    uint256 constant IC11y = 15966246860724293817001878236927903046400711159991765931404938001695674332773;
    
    uint256 constant IC12x = 16810465116852105101321787565032025110951980165285006322715728182494118962145;
    uint256 constant IC12y = 11809367485941844589526168052577062950351981510159859701386886160873486760010;
    
    uint256 constant IC13x = 7626901982970496267204047751943927019685741745114369765671017042953980268859;
    uint256 constant IC13y = 10936744833911387386689978675123018039340057848725784812491700507418466481620;
    
    uint256 constant IC14x = 10473998238644666735120597606491703366492974681271634299983089635425368885406;
    uint256 constant IC14y = 12838073180033009827169502747180483115275805476073919488784259469619919431329;
    
    uint256 constant IC15x = 1653310767697784194347326599284187520374552193807625692963980356037926409712;
    uint256 constant IC15y = 13881912300237116331569337798524052569299948795610823819507087584839789632965;
    
    uint256 constant IC16x = 7715736037143390274418684979397482915996059596713268279318261861411635696334;
    uint256 constant IC16y = 6521075255491909150935490240121565448479379771305973701386171410529474250614;
    
    uint256 constant IC17x = 3607118884250010614123618864639758340646656436186808078356968295921170783939;
    uint256 constant IC17y = 8994471594834890052599308881421932711987121619079988594683751318516203955729;
    
    uint256 constant IC18x = 13550385100090977590944940699718214819067932149524997839916125267819750032339;
    uint256 constant IC18y = 21801012782050064676328673482103974996535661925675951923833216749698897835026;
    
    uint256 constant IC19x = 2325230840594742197952351741753141211636996339121403191415895861559549260729;
    uint256 constant IC19y = 12949296777226729433834884987080034424291126741751795045179854646452588616064;
    
    uint256 constant IC20x = 2788009696671231892697201829417679465410338619383153465247055931338952541133;
    uint256 constant IC20y = 10111147914548112804301803919173163453607458711587231463104707718837034289691;
    
    uint256 constant IC21x = 14133870497421488648303582880519267480326797699413809959098239135440306266697;
    uint256 constant IC21y = 21739432719222043105114015921805084642415298030479557979036939133525470683589;
    
    uint256 constant IC22x = 7116795669876275463636629325643532175345775628579202823633979942777573132647;
    uint256 constant IC22y = 12196558435467412405696744355680266355056091197074814367834970525420963731746;
    
 
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
