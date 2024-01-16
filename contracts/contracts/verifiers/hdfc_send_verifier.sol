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
    uint256 constant deltax1 = 13715093910953477444594932613394637161592645326267490952383773258932680530785;
    uint256 constant deltax2 = 6917355939685380899148753334446963866296679557559265300195124805902372568736;
    uint256 constant deltay1 = 10027537635408556375640886021174498274338207339803607940642263434646237658144;
    uint256 constant deltay2 = 19825314797083105356154821733414236732602675829642895849779157432388025780748;

    
    uint256 constant IC0x = 7948712917874849781328365661027367011398916994267746344840851439625837578323;
    uint256 constant IC0y = 14445610336427827969214783890094209349619216720637343095223018572693254280923;
    
    uint256 constant IC1x = 3654976868371838169631577898462947005550108125685649400186026683210975806547;
    uint256 constant IC1y = 7383470632301847779131345725687431208414525939319998905342796582584383932784;
    
    uint256 constant IC2x = 15960136517117002583905099076229506420678130465330836605642076667698312488907;
    uint256 constant IC2y = 10981003641590459938830276725941498612829685925850889415515039958666798745545;
    
    uint256 constant IC3x = 18064147597098347735634254758923927729758051955626895483758091493962336324910;
    uint256 constant IC3y = 14561976814062079545004557051651175882415454473414826337411715544694691078488;
    
    uint256 constant IC4x = 5479872440797886105045613557892343574379959348291323344571145668056905130790;
    uint256 constant IC4y = 19816668883377774512316396795679515122358992446677555233530823190449668202575;
    
    uint256 constant IC5x = 9764995418164291848924916053122788044578670279004409359935206951759326535751;
    uint256 constant IC5y = 11151240738595525109186562114546767429226785384258075837825604200334229399893;
    
    uint256 constant IC6x = 8592289604370662283816667811371636409851377122184258261984779162566069289701;
    uint256 constant IC6y = 14924863702174947616504138427154175911132478861008643941575632275190130139352;
    
    uint256 constant IC7x = 18144310048336844926716356091507529474953804436633311455291234260603469939801;
    uint256 constant IC7y = 20695654519010539727518673528536864282905304035588394263484365314168181698771;
    
    uint256 constant IC8x = 6502380984206062082509747555585722773109086149921002084837192664976139632635;
    uint256 constant IC8y = 20559694265554344023542679863623632229239552087994730960172389697388976005511;
    
    uint256 constant IC9x = 20112907151747105787761530796573701791334087761671369712034010592321424588594;
    uint256 constant IC9y = 7868275330531868976088552522626764067554872392097431803379373791917043873429;
    
    uint256 constant IC10x = 21738568466342470712305504479308744377477421607586657477021567762815751353985;
    uint256 constant IC10y = 15899136431442502164449286654852349998271141738582178828650897248716421930967;
    
    uint256 constant IC11x = 8797574036872579022038442307145559829777119719185174358600414786794648200526;
    uint256 constant IC11y = 19158045316273481821441527564745598208594831388291307046183673615092116714767;
    
    uint256 constant IC12x = 1856159710792583584076099033562199824825551035760525968182870506068750338922;
    uint256 constant IC12y = 5431689035393664841658365783566955093050903672278814147361678362199701787106;
    
    uint256 constant IC13x = 1326184215165888620491943578175089960460457074386949049899809721605475868360;
    uint256 constant IC13y = 19798068085286831236096103256261325470985925228876029833389405086405680467005;
    
    uint256 constant IC14x = 21303925226345182261601479972988106925149727015068245014063996271014722518363;
    uint256 constant IC14y = 13822581075918761258491041321378418848172590182506086615070972333032971332948;
    
    uint256 constant IC15x = 7601301681882298785665130103217482061846330487834337423048688553591898089998;
    uint256 constant IC15y = 16353595650180105876268966027044363473882857313997670459546834066677499432092;
    
 
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
