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

    
    uint256 constant IC0x = 17640777620932857759307091437175547581778879406982027368721392599482381784948;
    uint256 constant IC0y = 18409288510423545628522344539130737160865208053853563122902840404247323946213;
    
    uint256 constant IC1x = 15734980427207664753472611828616446367703555674373620880037421233056070166612;
    uint256 constant IC1y = 11420513743522143151377301098304810792348547744209595613631020749516392642342;
    
    uint256 constant IC2x = 20206989081470746310672123544122707720574955238463970985663026464400827138781;
    uint256 constant IC2y = 17536828880717279010672697695707601433903618309647394264704888895616366692367;
    
    uint256 constant IC3x = 18807816043303753935598188331434884354695594420707582329688426191084075643067;
    uint256 constant IC3y = 13723807697659646153298385571872420568997025211873512555051292986988110452655;
    
    uint256 constant IC4x = 4160692254702347370728816277604768544354706709643350068863691825494522230280;
    uint256 constant IC4y = 5861557055706394453322139344971781968164198497142923646923602042986626399271;
    
    uint256 constant IC5x = 19735201672922161947462634782265109964906504922846437786093384557646628154195;
    uint256 constant IC5y = 8116207015731102149063766895748575605498767997188349698357463805428914856156;
    
    uint256 constant IC6x = 3372117803002908885484012311117920230244693902509682458293301821572507756961;
    uint256 constant IC6y = 10489519863553599755522674575658032331852065422038165743389893925975118082810;
    
    uint256 constant IC7x = 8087932252418998699799003713433258300964834479557543005240202840991623253957;
    uint256 constant IC7y = 3242897887198859471448408268553909575128849550106616495840889806169822734905;
    
    uint256 constant IC8x = 15832478877456038716024355322572193673870144236957993647739679939291302916381;
    uint256 constant IC8y = 14737589963450912381993667094592919987629134469557079956209109406559268266209;
    
    uint256 constant IC9x = 10073539244017600839202206351532768599219266732462947590179619974040725626005;
    uint256 constant IC9y = 18716716908492821091543155230681072041256875020439432350371364883646069071889;
    
    uint256 constant IC10x = 1143634666379239286651265804043192852138927173823077917001559424462701724048;
    uint256 constant IC10y = 15372237912972883229937485736859519967742113952277651696247083929551942208411;
    
    uint256 constant IC11x = 15505817244379383181810670529804071063452452394001966623260844626797716664198;
    uint256 constant IC11y = 8646442696280947493178616456204394483530553591485317294094477582552056379777;
    
    uint256 constant IC12x = 10650272850360933037649499836721767085419980734162841444048117655129439169010;
    uint256 constant IC12y = 4073187108146554662518264558751215000038504839872879619667397248815317324927;
    
    uint256 constant IC13x = 3133385314024011637808167768954165179426315237475902969897345792315314415532;
    uint256 constant IC13y = 14911712798644704537995491720913724631872251850103181068854370724956565886657;
    
    uint256 constant IC14x = 18923935711881852404371862681727192175862841802975273418865509355082832362868;
    uint256 constant IC14y = 8811989342857702650287710332067461681996834901844591607134639660372084495457;
    
    uint256 constant IC15x = 13688549064823493937791234461856232809583900579738601928005585358911969424266;
    uint256 constant IC15y = 7831676534692536492899360470726402245053719719354598970979156590842105434944;
    
    uint256 constant IC16x = 18818683221799936692513265859212540767696077349514985436644662198313910572679;
    uint256 constant IC16y = 10367027976964888085041780554506547698922400632329005003381472501447888335169;
    
    uint256 constant IC17x = 15439359095163212974762653469622522673678869989509188697517631174467417636175;
    uint256 constant IC17y = 14303878012420316114128118349619840759290254634542859838373220001130053070929;
    
    uint256 constant IC18x = 5346932245719383767576804708008341863834257017516005655256457853408194652159;
    uint256 constant IC18y = 3695005128586765569948408587826388974704572200169562551619187879901541831511;
    
    uint256 constant IC19x = 11576916012971934420045117843820678476040062225540080614295260204084326584856;
    uint256 constant IC19y = 92605651216329987740362757604343244454245693966379085230129140374567524120;
    
    uint256 constant IC20x = 901942440734517288729684485700272976575234719079288471389735055668032213086;
    uint256 constant IC20y = 18724096103858399651691530723945510014774003241609626987118477518283764511982;
    
    uint256 constant IC21x = 21122915542003914121483909132841502930420010887361675833829047577295169353848;
    uint256 constant IC21y = 5143817336684114279822407152094021714508256358287838011492816483898279144845;
    
    uint256 constant IC22x = 1854078861963302641901673218520148338743227580975115155570804456453790025230;
    uint256 constant IC22y = 7692938526694715491673267741049456758047912248887096715800700751594308375922;
    
 
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
