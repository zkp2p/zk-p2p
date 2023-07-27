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
            142253825250045388775238340903612853125814866727122848282804476133401303064,
            1449027626209791926698609414131771961263236985791258706224146920930346191380
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            11183491457765442687255864942304503810801871497130131118027629544068615637129,
            8061252743102107844590920790741384024147223503563012263511036652063559656899
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            7521355943628058337149296605191181887116295826823294930438023784230185939448,
            16394737794458539490135763809352866424146069965712610015918712035729675292056
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            5539681532353003838809805424234212090381069086486207320258806266058962946690,
            561985873640783502780480768191234665202914569277214667573316149289417574116
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            4047880664909980228155746359434024980358347882659208792278513180209783415325,
            14840382670088373128940396599202565326786071087181766682796250464791062818153
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            7286637402184946899579922682016583137317401791062457335021890355272555393855,
            1579190529476159167859685898725998154990108677044443115217726550643352018411
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            8787151382851350982359232596743864639067442657127098035283416898609952363208,
            365266238390256383113552539835736473728801464965142839945051864125979634276
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            21154321121707835601016553528178972543114738445711225278561540322548298788543,
            7215755914419840410755172116854259445566741364750545184925184213456818722073
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            21698330956823907370038023656313876212709660049843045599879574671308132818280,
            15414405448442052709077372127389428249990274046189761844667115482725182807199
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            19558572412412804798927796352007055718286689029099453650494657036281471540202,
            5651333736326437784666688160097615128659671172142600937679341265509703146232
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            7880720352558010288074254627240222333090875833427619674024293054302981819166,
            19099692724026832685704225638056362336672666142938544161572730913270125934749
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            4550864678496624280609441386996229818177682941120075655316615037382281925041,
            3376899922463472473344165876879348297528826835992734532025012564194820116012
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            12264578644411298473646438613524843436785352862595444911581669184968846595776,
            20337918053573540595301057636269405220361368764978839563885032671759301245290
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            3475703959529793605914286004331854120593795199525007212744490250257426516073,
            1572884731390253418588580112861985378963247100648553139601593858290458120634
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            2828654865839855232797614275316936589209843107056033527599527366625881327414,
            2370212363496624205691399330921853964518050731321698379243922354181232530724
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            17794343319342759559125268369318592198039252091310962895044863076846676158380,
            3256806466304505416226509180132179861045760736693124766308025554286204611610
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            5159091988626110057279706285582951272979685887417053688566434676039846758727,
            19455069389648588863141875886630487750560648236564178116801349299754634214520
        );                                      
        
        vk.IC[17] = Pairing.G1Point( 
            3396621234402913397761498574838764750669832677592151485065958971822659838003,
            17160001391701668902662997687614638174127493878488747514766389877056413929852
        );                                      
        
        vk.IC[18] = Pairing.G1Point( 
            1676412561620513730093651839808147794153949021167121876654762170869147126422,
            1466387509286856999541596890825993341588645889181565852645600537171783090423
        );                                      
        
        vk.IC[19] = Pairing.G1Point( 
            6941573816933449083398052239267805419498868096933451678311869788534829744670,
            15306926703485002975371297944645636304314990851221899526188537382661195531083
        );                                      
        
        vk.IC[20] = Pairing.G1Point( 
            16819641582526435859908561810476646498819567264705427435416780724863192964134,
            1791554790001966133333234189833144784459512173294173188147556827259416077176
        );                                      
        
        vk.IC[21] = Pairing.G1Point( 
            14963252137008322991181862320425776315411802891158713838493038639709990409671,
            10197917154535365823731551090047252309503997544399279327393837783013556371454
        );                                      
        
        vk.IC[22] = Pairing.G1Point( 
            1609843818929514160371675348242167238116329373145168611874369431793553359631,
            16025943278293528954683579488770607626468106826357091381787058984944144197830
        );                                      
        
        vk.IC[23] = Pairing.G1Point( 
            2692491930459787818168478420960975148070458669065867648715239393662848528979,
            13169810128834980934399626570385345636917609620641773220930092800931182629475
        );                                      
        
        vk.IC[24] = Pairing.G1Point( 
            16996404991901208674566534375306324783257145564086564083652232090489939904970,
            12407197184947739490182426196586022126672736838977956633737527168226713640512
        );                                      
        
        vk.IC[25] = Pairing.G1Point( 
            7741895975805668010681960531740574222672428323243754311887041525207441630320,
            9867802556475393803349630778787011402030155428839558795800875067496833620734
        );                                      
        
        vk.IC[26] = Pairing.G1Point( 
            7869642341033804060581430938057940004481806248816542571317701042297421925184,
            11039271869098707669921531129964484359325040908895038669763167857767628760859
        );                                      
        
        vk.IC[27] = Pairing.G1Point( 
            14020995373570675880439918113412728696146315632301002145173966406170026262996,
            16201921894215678028912277486654180117287779110642922905834513073634961371569
        );                                      
        
        vk.IC[28] = Pairing.G1Point( 
            20085705459565034508850285120012828096569011077863602541927519682327619526662,
            16335746044131976604067471701118912943148699520574734438184949106151587870607
        );                                      
        
        vk.IC[29] = Pairing.G1Point( 
            9111777037240529597338600892355107960422134692739737470408325775574527559129,
            16426013774087101112039486040207370453143594373963337258634070005381721313194
        );                                      
        
        vk.IC[30] = Pairing.G1Point( 
            13071420105800000268394101596139686014001995138710109496875285784135932721914,
            17552120794176915579818188273101966765006320046351068468132638242401103603739
        );                                      
        
        vk.IC[31] = Pairing.G1Point( 
            7802610884229480109985183046274326116510067255075345552157173394951880425623,
            16513845813614719623253294428729386795085475559677837916793647493666954312336
        );                                      
        
        vk.IC[32] = Pairing.G1Point( 
            488874976923627850003018370393361069930410855397452629610169099113235890047,
            3494504821227286422708629143977311113687480128378087691292211604845207350444
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
