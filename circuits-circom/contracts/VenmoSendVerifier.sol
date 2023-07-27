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
pragma solidity ^0.6.11;
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
        vk.IC = new Pairing.G1Point[](33);
        
        vk.IC[0] = Pairing.G1Point( 
            20882297198112419691108907113595312592079619999588489858344436124722600514083,
            8606315208664420817048298880753649714876524686617042277568403106181358397421
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            8677962493641882220740452403442020521623274608422606783487377869165448628720,
            11404862199146772182419516276943549916340695633925891182306049214085219740796
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            11942974801740284205582038775262101395467222648269758193417566924695168358734,
            2865656454474302412600278107107257571674702024917361714488021076232510731562
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            10074684974386079684688351076355067698377872699909811607819055481838977153861,
            251854061241528468890766091012843818941062307325972112624107732717760856378
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            12404752946813000039342570605068867672187571279503248112297267922136251862402,
            17250232825177173740398500871306814056907743034216707024134648466167644964521
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            13493903581763773887009524615396398421036311905483426297227765637310083595270,
            15772648509855352120773444137471874417736042198831770621691940140050823331523
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            17833347617262278395920956714177971581953834516623575568477348844104391970957,
            19616728024555991937127679361622538971797088969617005701548109519417833622425
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            15346807319341758627060626365834602943183521353040257529305611564602760955447,
            7325577072089594595461374105991678013408571974923629851188966515562602886828
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            9868166199221185512452557599233140082606793134150922917201718458555675164430,
            15929046946800123069340503130114201582487469756633654700699653437642220039013
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            3624953142623249595881779523887284605907359873586031909693500095305581408673,
            596235829146858832217057100252918499559670235211575215827493659816701395417
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            18594025997830921219599679394324248190809816672287918687418963071568471194097,
            16520532695405708638937130113225495347381614997726103336716281696604837319567
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            17270221184092704012072654205246970288968124167297654891788520087767933116290,
            20625892731571883930675898843098578445609500863438672005459982730003032444981
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            16691016703438960199885077362271611683138247476184486733667642172406268904079,
            3225401906216992630982989708287527080034821299456092652155918628161361576092
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            18648154769932683490238911188358295921375022482542095735497766685079833198244,
            20345294911833620089520395775945995607619163894841737661283950941289089386236
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            20249106994479023607294444217918003774328855579385058479647523891097438468409,
            7240269591638940164523219296337480055724194832897473213279781239868416578849
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            20424880782309450683985918092060441849821545573095344250542193831110187322630,
            16613803012611892949754944765181642156527240155635180603449636736176605173391
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            17866855907941384228307267942998307327123552935143285882849053115777156292888,
            18100424995803978465115244002349685048267270574842276627692013950958059098125
        );                                      
        
        vk.IC[17] = Pairing.G1Point( 
            4674934742622074621443442020985811163652262186397548143930170739833463842746,
            11536597754565438095362562733853382048284516630890322087046146832598930955991
        );                                      
        
        vk.IC[18] = Pairing.G1Point( 
            21561752668366477916173120246297698234421716406737417754476644274440595822182,
            4135028580956907432492110314217461602162418924858799029139457740289268772581
        );                                      
        
        vk.IC[19] = Pairing.G1Point( 
            1971105510949684144997865993843846690449759326649856034480568338682522980098,
            6571733463917911647289154391595396201179489734028633817063264717616392963874
        );                                      
        
        vk.IC[20] = Pairing.G1Point( 
            11585669331800054657242992968945608500101149088830162983371215075373469285475,
            1702313236083067444269157914958951025575729775647847869627966846649660974189
        );                                      
        
        vk.IC[21] = Pairing.G1Point( 
            2476751512746707846015578339947645746075247025275793954848646143260454719537,
            995636618049696072127518045430261942244582949062332918115837966354110200182
        );                                      
        
        vk.IC[22] = Pairing.G1Point( 
            5638199219864611750310569964998385355203158028170633694133531452866082970009,
            12667438608606748283184928592635442145256414631105614529372096381527845718190
        );                                      
        
        vk.IC[23] = Pairing.G1Point( 
            6874473469049721675680954899208190734913788790402133539605158157171593628073,
            2781260119923236967290970858077983222866369755135575274411998738836018328831
        );                                      
        
        vk.IC[24] = Pairing.G1Point( 
            1816091575166336128163191306184936075730942604075835432694416800144465685632,
            20601369800765152826311825140248836865291135735064942016923484892362270605982
        );                                      
        
        vk.IC[25] = Pairing.G1Point( 
            4857759212266750054343448209527729065028413237807930419582814662589851590047,
            13316529832671762142824856428986037802566201121837928326149081813015742718789
        );                                      
        
        vk.IC[26] = Pairing.G1Point( 
            2129880781817155413660544974622238955956261783075786771591457903695934655501,
            10929082475367414382855167726516663450492432630746256813378317260164148825814
        );                                      
        
        vk.IC[27] = Pairing.G1Point( 
            5618963140731860727976009791984680854643074976269168500167590645525295418008,
            6222900670583412652283556575609860824211572328601177176929500100734024367516
        );                                      
        
        vk.IC[28] = Pairing.G1Point( 
            8170751523530199009029343155155110212801409714607598386703491675485893219782,
            2616666510488270523351589638153922788708257518409774916650328460543963349920
        );                                      
        
        vk.IC[29] = Pairing.G1Point( 
            13656526159079808170606730419121397911123932391347187689802221070856303631701,
            7401913698332343753898054052171373654237863172218295086244992647228481154371
        );                                      
        
        vk.IC[30] = Pairing.G1Point( 
            2380774837991659208863209657297788840284007325243073110999765415019407601443,
            9373849467806532572103396130754493309509837507727718988334505358658594480911
        );                                      
        
        vk.IC[31] = Pairing.G1Point( 
            15046299671817102244034624602420563475343512795055632902117393218368473757922,
            10630215557599631682584535566141764974787713709692561026273003293509985575002
        );                                      
        
        vk.IC[32] = Pairing.G1Point( 
            13663588733116868099617307651246831394323535650882893413278869435443021630740,
            13065399494911962523930221649675860071107506435915868991050922220475218893225
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
            uint[32] memory input
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
