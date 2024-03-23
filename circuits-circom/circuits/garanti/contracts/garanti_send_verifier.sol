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
    uint256 constant deltax1 = 16343044642992925849324144222241208767090826466619068823722193270756586862401;
    uint256 constant deltax2 = 10314194466904948834262239669041981907722654474458582136706961656951325286580;
    uint256 constant deltay1 = 18870959210104009605384605724613549900634110254044850171595460926756475612559;
    uint256 constant deltay2 = 20925792905154616635554201642170069367235560764483397919960492041377193399415;

    
    uint256 constant IC0x = 16279736454292033378580080582261180344588543377812411740103484792347015356622;
    uint256 constant IC0y = 803733000626129867641117797978078317549395205362063131280860756724996638023;
    
    uint256 constant IC1x = 5619211177410198973702607025162236734773579252262834151760411624196842318554;
    uint256 constant IC1y = 15681435570112682455420063796287496568176754470688920089793013849736514435508;
    
    uint256 constant IC2x = 5717814455265966580691161694191686582106132906777222823293831790775696595822;
    uint256 constant IC2y = 7288198057139032054533375522924224835499925739466115677964293122948640493060;
    
    uint256 constant IC3x = 11719874491549074336746418596127831936593847863714866444448223031713643812414;
    uint256 constant IC3y = 3896921643091289790188930365771248018546305504721622929270212144308780835428;
    
    uint256 constant IC4x = 16934638514464830968323332218909199124530296213903795969456913426832964661346;
    uint256 constant IC4y = 19219084029045271363030542000358821303054800197657303997612890875588511097378;
    
    uint256 constant IC5x = 21433322676719947948419816354200354171932787369257885135630906528192815911568;
    uint256 constant IC5y = 15498974494399429179225623039072826422890776979301626083872919197439857331783;
    
    uint256 constant IC6x = 19791360312577802765870043762144676029009513261081081551634408233199622166897;
    uint256 constant IC6y = 19833757387208994290140152520904701847141710351997160555863681935452894633990;
    
    uint256 constant IC7x = 11812987319798762911565293502198240965361030266171903511793751983047671339267;
    uint256 constant IC7y = 3362118538113056304065427216001833533279308090045141448508689267731951424922;
    
    uint256 constant IC8x = 3657617595416795675551564184500064160630109848673253434901020037985236883321;
    uint256 constant IC8y = 7212064867888157055116070351675888907682605134292867650646453862420866384926;
    
    uint256 constant IC9x = 2751759577697788291515493518584254550958879092432516239681454344732308836675;
    uint256 constant IC9y = 17395718658677435768781780150392352856658297249604860622676183225242767693766;
    
    uint256 constant IC10x = 11558057052303902400059702043280340777083666103888311295557744738942786146876;
    uint256 constant IC10y = 21030565793076706653087540750237162719144743600115243962610282019181365614469;
    
    uint256 constant IC11x = 211290016040205171000789973300768147213249959649767730538575620641807752262;
    uint256 constant IC11y = 14074251329913641447383549058545049618774236675214643503129059817355211685945;
    
    uint256 constant IC12x = 5007882212908576436870074686757285949917671554669174089445073689337366116032;
    uint256 constant IC12y = 8210959292191381885861754575475610556426433048220439915161269333131257813130;
    
    uint256 constant IC13x = 13293719279090013504236450573751283305572177027415191811669599490547722825726;
    uint256 constant IC13y = 8394737425044468237637593002772009401923423400600154508468919657373196692829;
    
    uint256 constant IC14x = 17849795851187379032917708589772528668451956196405749334825448419860699439305;
    uint256 constant IC14y = 20196166092660826205542664729835753060825163009279265243562561763561842525422;
    
    uint256 constant IC15x = 17368992658991284229859666999462406799966588789284178471226211727121441855077;
    uint256 constant IC15y = 19638423699585201994958334447594876287044896849536887922062219468095291438511;
    
    uint256 constant IC16x = 19654713907060319277441312033604826926154173819497970431557465349988247571915;
    uint256 constant IC16y = 3817298700918036836886147395996118992183906216420518826507097883667875267292;
    
    uint256 constant IC17x = 7715044101419724963760869030711123766888906257960572330606070125777728578096;
    uint256 constant IC17y = 2749100633169600021571256078032739990539406582409355713895084604499131892503;
    
    uint256 constant IC18x = 1173364949775522746248454406902101588760396247931949401978732835369488287447;
    uint256 constant IC18y = 9162940134343148423841367568602434228374502231432445416424257085827811468306;
    
    uint256 constant IC19x = 8575038783593555420096523497046480724134527603142091243347577907184483020590;
    uint256 constant IC19y = 3995032950668712745213557428894999127778473468206002684518315008696369722974;
    
    uint256 constant IC20x = 16279031557779536503297581695798771201855657790427788979382231118751393888831;
    uint256 constant IC20y = 11912095810291450993597456027203060366509629970620014777813772359854497244336;
    
    uint256 constant IC21x = 497943037882247940402571514635505206539213343750949867327216752909870789343;
    uint256 constant IC21y = 14079819629540574449052320474177348262506545728548218346242372754966492347379;
    
    uint256 constant IC22x = 2466234520097193073740775906158395638512443576205561976749084142029636175391;
    uint256 constant IC22y = 106854436093524765859901864629893863994296607336300054760758587613638113109;
    
    uint256 constant IC23x = 10223460436131205976086221904034407754257122156968155547422280250210902765374;
    uint256 constant IC23y = 10646352474369269228971861663558957719664548073963349507349868931039896494345;
    
    uint256 constant IC24x = 7262802786186402103264187138606829015445409360219261120109243327566500881725;
    uint256 constant IC24y = 18331284185744023511439764643398593091927871820445384971993219024493909818118;
    
    uint256 constant IC25x = 13551021044771273396960595497281785961547884026117011307870286500103178948328;
    uint256 constant IC25y = 4186342654966538951118943039446911387678070729114812060402041727621399406368;
    
    uint256 constant IC26x = 15441069578651304978207067953794626204821594755773027544683951205991389396614;
    uint256 constant IC26y = 17560455184568150998457976400911956640491317398464001157951114666917781447625;
    
    uint256 constant IC27x = 7943633557899190383766787269575005363322575426463196731233157476227666177399;
    uint256 constant IC27y = 4879497724217437831661729305237201086591299485711452428791616388363643489471;
    
    uint256 constant IC28x = 76528467087185644481693720110962395284170988413766942453585983860142660820;
    uint256 constant IC28y = 14004039488612212499780635126224013900123007327247416988670721391551869445987;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

    function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[28] calldata _pubSignals) public view returns (bool) {
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
                
                g1_mulAccC(_pVk, IC23x, IC23y, calldataload(add(pubSignals, 704)))
                
                g1_mulAccC(_pVk, IC24x, IC24y, calldataload(add(pubSignals, 736)))
                
                g1_mulAccC(_pVk, IC25x, IC25y, calldataload(add(pubSignals, 768)))
                
                g1_mulAccC(_pVk, IC26x, IC26y, calldataload(add(pubSignals, 800)))
                
                g1_mulAccC(_pVk, IC27x, IC27y, calldataload(add(pubSignals, 832)))
                
                g1_mulAccC(_pVk, IC28x, IC28y, calldataload(add(pubSignals, 864)))
                

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
            
            checkField(calldataload(add(_pubSignals, 736)))
            
            checkField(calldataload(add(_pubSignals, 768)))
            
            checkField(calldataload(add(_pubSignals, 800)))
            
            checkField(calldataload(add(_pubSignals, 832)))
            
            checkField(calldataload(add(_pubSignals, 864)))
            
            checkField(calldataload(add(_pubSignals, 896)))
            

            // Validate all evaluations
            let isValid := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)

            mstore(0, isValid)
             return(0, 0x20)
         }
     }
 }
