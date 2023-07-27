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
            [11559732032986387107991004021392285783925812861821192530917403151452391805634,
             10857046999023057135944570762232829481370756359578518086990519993285655852781],
            [4082367875863433681332203403145435568316851327593401208105741076214120093531,
             8495653923123431417604973247489272438418190587263600148770280649306958101930]
        );
        vk.IC = new Pairing.G1Point[](32);
        
        vk.IC[0] = Pairing.G1Point( 
            674642946638883205222688327934183787415430177557244140297584404153731293572,
            1279059736530834414007954543680539499982445580728608281641594229876158446712
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            5976338739070863125655386008322045523511719571844796155858843050714938743902,
            19471692182518620925013191251154498055505239415862085710009684387136259223362
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            9776249042003530517812006134788137511113055807294687348886147049826747045635,
            7555895386279512392722428434447468162582976888111648038726714718768921273454
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            5363443798229106998749196729512787114439306297633612454461853156663589047543,
            18598563788861333964308011958560053291760800856522203693890968235755087128758
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            10835010499060633977944036817440781398368083495660775683092401140571653529910,
            14372183499560581457248724005456937367599265760932608024132222868204268081047
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            18719451939193486508174640800225422593674859801722381700726232739352865199337,
            14753189647360981724381217328075813583999573690305102505103147162504188918745
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            13312323663347567014781100535486733979603222847158590380843933186164658358494,
            7795412231832571037932080046273327319205705386901313809576906549220458557288
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            13403632158495411463182301025990315654817080437977414694658911502905222040188,
            12286096661387346512476009468490681476374870553341961239367572347539674571278
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            7557636128691423976531666150359834581327926169918875407617961428812063620029,
            20337417043189575906773810524577436171620437802186692782737566394612025630955
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            8350868032930796705579501327155739159834000741972066653111410725759821166352,
            3103625472683993023213265990330284418050972081992441191468937047536171657686
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            15113267092946523716319047703640847459084842594894833026356925606694310482107,
            18838146557092568888235496224242220212090898118902610950432756656451572278834
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            18002737058552981120734528640503552206373183073789975746317921105158621698914,
            16468619139241361470506941786558897546601614081641122844471116176409616024969
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            15529873561313228423028987898511407963260647014806879058929819313516847025613,
            1609585157384701061013235161022253187165063194166345745093674442628198450448
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            6596392952973023174909228658586145261128901713010401622824008922244020437874,
            1869073325315126747451088533310718545822215892311742539740535203809423661625
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            20542632454261286128855942419000727519448345911645364653974908557650610578543,
            10737685607506987106354741324737938506325097845307840528437060307157056523173
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            13260305712250392812581114611206086268177601770122934345097985157662629175719,
            7754058544628252788357211631364094507584825786812000666677345943804194007540
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            8239494302575849421661310258120705812637066651445183999088549969229210548795,
            15730190537235750695817483673386806303866405122228804346782120253876158928273
        );                                      
        
        vk.IC[17] = Pairing.G1Point( 
            10250160729768721389230355096785110359107817849998713663788814452091526551631,
            2607359452671208712603396607593902509686447990868311456033441053012874518281
        );                                      
        
        vk.IC[18] = Pairing.G1Point( 
            9712844036404046121810631752338745677633619315240863007822521730622075285743,
            10176331483453702641627029521173359007038551892135314017935260900382645041098
        );                                      
        
        vk.IC[19] = Pairing.G1Point( 
            19637500061210963125964330134326365959805404907183520293413188010637510709143,
            13982230344238047778220298768717432818398559729107676833765879866858772905221
        );                                      
        
        vk.IC[20] = Pairing.G1Point( 
            9230979893976716839471794656927510369833415361762050833503456339095810411947,
            15174483265566975080095430841454965207910561825951386752618076790556085224214
        );                                      
        
        vk.IC[21] = Pairing.G1Point( 
            4426881334796808298346242831009456607107790620546038582674088569461468895474,
            9581436311389187020213608955702243213975956460118159001706054605125812415761
        );                                      
        
        vk.IC[22] = Pairing.G1Point( 
            15475294583950438306989738042789916723923589868608823907845260260314260040411,
            20828381937368850234885335048140004435098376144955292835118875451197075245625
        );                                      
        
        vk.IC[23] = Pairing.G1Point( 
            19751295685949234769668254216479371537260565796431173460904763792876061851437,
            11054162488145044056059590196960700834888839345715150510604360052677390346322
        );                                      
        
        vk.IC[24] = Pairing.G1Point( 
            6904830685010082014972548050977634330311363735544363876776472983502208016686,
            20489638554782442479603724023241295552311304999640183057039141059477628041943
        );                                      
        
        vk.IC[25] = Pairing.G1Point( 
            11748793591875359330755278616561378235645285921523395654945664201311319704019,
            14259414129042138896443875262756349846238223184619631725116661057437670012634
        );                                      
        
        vk.IC[26] = Pairing.G1Point( 
            10747777341692308259301912140046729874539356326326617440381164188452660367944,
            20886615455689584046428488783490811313334843588996308327878405954202756290618
        );                                      
        
        vk.IC[27] = Pairing.G1Point( 
            15777710062372180741480816061936500623224810409582733959011988735604465575280,
            21522093806195535446386912577941774734106100250881536461652599950254001875817
        );                                      
        
        vk.IC[28] = Pairing.G1Point( 
            16940794619366539742999994967293692061687776017767558961644813525946683547513,
            13986227869346929280741296445881240901490151506343841496263247442104132962802
        );                                      
        
        vk.IC[29] = Pairing.G1Point( 
            3967063655787720239119439656771304424088283849391235859938128175839216598454,
            3764518521667304610711877415841961770349059933935049916637827005608295203736
        );                                      
        
        vk.IC[30] = Pairing.G1Point( 
            13603529732201232279845375279828368824208680126211722199176496345710995778801,
            15328893090876402089437558863644477962912879992269203252842204597724492285218
        );                                      
        
        vk.IC[31] = Pairing.G1Point( 
            14855483835723083682553249362862976692692742451185259765358626148140669710775,
            15401799327991368870228616710050342713033331641818055148094017916249429377226
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
            uint[31] memory input
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
