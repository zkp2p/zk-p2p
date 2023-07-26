//
// Copyright 2017 Christian Reitwiessner
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
// 2019 OKIMS
//      ported to solidity 0.6
//      fixed linter warnings
//      added requiere error messages
//
//
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.12;
library Pairing {
    struct G1Point {
        uint X;
        uint Y;
    }
    // Encoding of field elements is: X[0] * z + X[1]
    struct G2Point {
        uint[2] X;
        uint[2] Y;
    }
    /// @return the generator of G1
    function P1() internal pure returns (G1Point memory) {
        return G1Point(1, 2);
    }
    /// @return the generator of G2
    function P2() internal pure returns (G2Point memory) {
        // Original code point
        return G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );

/*
        // Changed by Jordi point
        return G2Point(
            [10857046999023057135944570762232829481370756359578518086990519993285655852781,
             11559732032986387107991004021392285783925812861821192530917403151452391805634],
            [8495653923123431417604973247489272438418190587263600148770280649306958101930,
             4082367875863433681332203403145435568316851327593401208105741076214120093531]
        );
*/
    }
    /// @return r the negation of p, i.e. p.addition(p.negate()) should be zero.
    function negate(G1Point memory p) internal pure returns (G1Point memory r) {
        // The prime q in the base field F_q for G1
        uint q = 21888242871839275222246405745257275088696311157297823662689037894645226208583;
        if (p.X == 0 && p.Y == 0)
            return G1Point(0, 0);
        return G1Point(p.X, q - (p.Y % q));
    }
    /// @return r the sum of two points of G1
    function addition(G1Point memory p1, G1Point memory p2) internal view returns (G1Point memory r) {
        uint[4] memory input;
        input[0] = p1.X;
        input[1] = p1.Y;
        input[2] = p2.X;
        input[3] = p2.Y;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 6, input, 0xc0, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success,"pairing-add-failed");
    }
    /// @return r the product of a point on G1 and a scalar, i.e.
    /// p == p.scalar_mul(1) and p.addition(p) == p.scalar_mul(2) for all points p.
    function scalar_mul(G1Point memory p, uint s) internal view returns (G1Point memory r) {
        uint[3] memory input;
        input[0] = p.X;
        input[1] = p.Y;
        input[2] = s;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 7, input, 0x80, r, 0x60)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require (success,"pairing-mul-failed");
    }
    /// @return the result of computing the pairing check
    /// e(p1[0], p2[0]) *  .... * e(p1[n], p2[n]) == 1
    /// For example pairing([P1(), P1().negate()], [P2(), P2()]) should
    /// return true.
    function pairing(G1Point[] memory p1, G2Point[] memory p2) internal view returns (bool) {
        require(p1.length == p2.length,"pairing-lengths-failed");
        uint elements = p1.length;
        uint inputSize = elements * 6;
        uint[] memory input = new uint[](inputSize);
        for (uint i = 0; i < elements; i++)
        {
            input[i * 6 + 0] = p1[i].X;
            input[i * 6 + 1] = p1[i].Y;
            input[i * 6 + 2] = p2[i].X[0];
            input[i * 6 + 3] = p2[i].X[1];
            input[i * 6 + 4] = p2[i].Y[0];
            input[i * 6 + 5] = p2[i].Y[1];
        }
        uint[1] memory out;
        bool success;
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            success := staticcall(sub(gas(), 2000), 8, add(input, 0x20), mul(inputSize, 0x20), out, 0x20)
            // Use "invalid" to make gas estimation work
            switch success case 0 { invalid() }
        }
        require(success,"pairing-opcode-failed");
        return out[0] != 0;
    }
    /// Convenience method for a pairing check for two pairs.
    function pairingProd2(G1Point memory a1, G2Point memory a2, G1Point memory b1, G2Point memory b2) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](2);
        G2Point[] memory p2 = new G2Point[](2);
        p1[0] = a1;
        p1[1] = b1;
        p2[0] = a2;
        p2[1] = b2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for three pairs.
    function pairingProd3(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](3);
        G2Point[] memory p2 = new G2Point[](3);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        return pairing(p1, p2);
    }
    /// Convenience method for a pairing check for four pairs.
    function pairingProd4(
            G1Point memory a1, G2Point memory a2,
            G1Point memory b1, G2Point memory b2,
            G1Point memory c1, G2Point memory c2,
            G1Point memory d1, G2Point memory d2
    ) internal view returns (bool) {
        G1Point[] memory p1 = new G1Point[](4);
        G2Point[] memory p2 = new G2Point[](4);
        p1[0] = a1;
        p1[1] = b1;
        p1[2] = c1;
        p1[3] = d1;
        p2[0] = a2;
        p2[1] = b2;
        p2[2] = c2;
        p2[3] = d2;
        return pairing(p1, p2);
    }
}
contract Verifier {
    using Pairing for *;
    struct VerifyingKey {
        Pairing.G1Point alfa1;
        Pairing.G2Point beta2;
        Pairing.G2Point gamma2;
        Pairing.G2Point delta2;
        Pairing.G1Point[] IC;
    }
    struct Proof {
        Pairing.G1Point A;
        Pairing.G2Point B;
        Pairing.G1Point C;
    }
    function verifyingKey() internal pure returns (VerifyingKey memory vk) {
        vk.alfa1 = Pairing.G1Point(
            20491192805390485299153009773594534940189261866228447918068658471970481763042,
            9383485363053290200918347156157836566562967994039712273449902621266178545958
        );

        vk.beta2 = Pairing.G2Point(
            [4252822878758300859123897981450591353533073413197771768651442665752259397132,
             6375614351688725206403948262868962793625744043794305715222011528459656738731],
            [21847035105528745403288232691147584728191162732299865338377159692350059136679,
             10505242626370262277552901082094356697409835680220590971873171140371331206856]
        );
        vk.gamma2 = Pairing.G2Point(
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );
        vk.delta2 = Pairing.G2Point(
            [8066561655044560634365666448599667317530925532536787307993020148183833202384,
             16372209556323536560222545773808002952598333364045093145229567227625994279701],
            [13400108281562789018216566592839238965022672841019221272291817170670341153011,
             15087318503444337452551687837600865124435008935893614336858189593940834642696]
        );
        vk.IC = new Pairing.G1Point[](24);
        
        vk.IC[0] = Pairing.G1Point( 
            15006106271914578710342981961528052467570588177139645817084815984301737928717,
            10584966475651196545722824714682744493722124398454351935904492079285425720843
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            2801522496613763873191762138578275267258370107065546928479006737249429628467,
            5153017880733159811719838563469025111314694173605546739386004645550272680645
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            16431069947044053740273491005468604640505491260890100335960967747386110839674,
            2738161626108923674267852527639308876920225052178497108974122876414801836798
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            16191096124475604942637281147172341173439338410387484820578951871503994162939,
            1247625512220232298594469600903231276258716611209606700516236683047425015880
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            14164369144119527471690683261720560491560983383129946317911638879811802770016,
            662187003866504111087025674617860251691937495390820330963143685520865864788
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            9496896195864596748575206343753497754626703443027089790631278109023408547278,
            13570642895683443058410376968019053229291786162917286106638309986630847507835
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            3376600581100093285457441442132070419310752537597363314597276669839554717565,
            20613465164497981770665800739374444828283599725011629596524466596340800617307
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            17886358025879864637865115517720726842195199416771168564770239406442043092436,
            12358481037015845337575382498295535656044501341983691084696334490904863506110
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            6985949682615708507633395583892615026076842244572753991473174242294197759522,
            18751278656512138301306183204491916069353541231320786357305320403572733546307
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            13765817051841524421095606725350267138206586884325256318709080491031851551553,
            91259059372426663365871757893531752988241669532092595547621507060961263625
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            21694750339284570389298549459919088094291526070523488563186258070874968856453,
            4011458052789050419390031517826983515962369077043743408528263931184218952063
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            16125024474518273581525966136860917322921193013487042592522800453091244736869,
            8149680412203584464802990005397087199170729602775009414526708134113243323450
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            337086515396337607236284179071164113010096244850192252567599571678506695516,
            19387052051387901885337470934310264543486852829823282852169871689751539471888
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            17487125454136604541242966603957612978635809555054562144651580294890248665699,
            5302700436367085437197054349855290276471250956273499686912141664690846602426
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            5111855178463296882313069949344866951969985305568877291127069214300273821800,
            5457000692436625916594451515530263490852513087473132565441991441367024558100
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            3952828747221336532294971773035925402745102491999204021699454514145420973578,
            18935104344528421915031617181062570545763727696309850942799232616929374178954
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            18926288826533742114143556307564440233230772420178630692698625072835672964923,
            1316354882164149799498186629135804706695354862217631482232910141139030629462
        );                                      
        
        vk.IC[17] = Pairing.G1Point( 
            6352173566336483221796450824633223574511833038171880184956755051305707728007,
            19084294617103007042211271544921889805508827892607928764642169017757820755437
        );                                      
        
        vk.IC[18] = Pairing.G1Point( 
            16022945038750742395937054528187694815541734797934208396500628690306740816783,
            18599760470089338514119910248770764611730992798626583512174298125292239615746
        );                                      
        
        vk.IC[19] = Pairing.G1Point( 
            21422578701991080017242289154602084816049398338253965199218796676929289257614,
            8756236006288032675846138112869861609393174693326099191939334285580849889409
        );                                      
        
        vk.IC[20] = Pairing.G1Point( 
            1878526762426557626377458911530335724883722664201822173855884185087765313059,
            10454711681888162115532774589855681601441060302439920339206986186092498589208
        );                                      
        
        vk.IC[21] = Pairing.G1Point( 
            4360554476947899038851285632718373322745712467138950529265854330983482168502,
            1872763590180910298476067089392779482391035575033088367432040951992825490142
        );                                      
        
        vk.IC[22] = Pairing.G1Point( 
            12088358827858106813119772952177084093941266752979311886460259978630212386636,
            6956619949507554902795157329182920368137323649436621994713227274971114534954
        );                                      
        
        vk.IC[23] = Pairing.G1Point( 
            2861421644956494786929593255805905819758355697166658394301357075763657748589,
            20406082517759500996739142067601267474301645960189257803925863448070683149384
        );                                      
        
    }
    function verify(uint[] memory input, Proof memory proof) internal view returns (uint) {
        uint256 snark_scalar_field = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
        VerifyingKey memory vk = verifyingKey();
        require(input.length + 1 == vk.IC.length,"verifier-bad-input");
        // Compute the linear combination vk_x
        Pairing.G1Point memory vk_x = Pairing.G1Point(0, 0);
        for (uint i = 0; i < input.length; i++) {
            require(input[i] < snark_scalar_field,"verifier-gte-snark-scalar-field");
            vk_x = Pairing.addition(vk_x, Pairing.scalar_mul(vk.IC[i + 1], input[i]));
        }
        vk_x = Pairing.addition(vk_x, vk.IC[0]);
        if (!Pairing.pairingProd4(
            Pairing.negate(proof.A), proof.B,
            vk.alfa1, vk.beta2,
            vk_x, vk.gamma2,
            proof.C, vk.delta2
        )) return 1;
        return 0;
    }
    /// @return r  bool true if proof is valid
    function verifyProof(
            uint[2] memory a,
            uint[2][2] memory b,
            uint[2] memory c,
            uint[23] memory input
        ) public view returns (bool r) {
        Proof memory proof;
        proof.A = Pairing.G1Point(a[0], a[1]);
        proof.B = Pairing.G2Point([b[0][0], b[0][1]], [b[1][0], b[1][1]]);
        proof.C = Pairing.G1Point(c[0], c[1]);
        uint[] memory inputValues = new uint[](input.length);
        for(uint i = 0; i < input.length; i++){
            inputValues[i] = input[i];
        }
        if (verify(inputValues, proof) == 0) {
            return true;
        } else {
            return false;
        }
    }
}