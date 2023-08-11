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
contract VenmoRegistrationVerifier {
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
            [15695702420863389948046515169612249848186092865907756225279041343867868555752,
             3004340101584599570883652912072606808170387132260878149748110064316146822815],
            [3428427988576535537712143271268809977477824131265969138099575107601697342984,
             20493387451473925665202697883874106993937112535245878267122557576528946945137]
        );
        vk.IC = new Pairing.G1Point[](46);
        
        vk.IC[0] = Pairing.G1Point( 
            991358399915582764882114900742597040374413300688509109670714037525899137548,
            21265893382541193909654556965707086760997421043487961103361967950786770715157
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            12537297025269434115694766320729267930675157613371580387949190790766114268749,
            12791853463086606551986388763027433368617298166794814156827804181888557001432
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            12801537828509397558382522991003223702854462312187964296546309911069166226857,
            4753430675783047401173094283421091106397807160672365095572724263007678496696
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            21055825638325163560685240783285023326890795288899967163990553174195627565315,
            5949168462872777047923099249284118262227316114392188656209479040982401718006
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            15566238070852368213240057864314386216609820493451587973064691622714347493197,
            5237161494278850284018354576794030154767398928860869094390023893831878322491
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            15833538634779980421428790975856283294620654729665468922119564091834852023930,
            21607088190404728674127442916571883858069511596221990326520238947878249367796
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            4463135541984533668266690721735636296384268745646529127963212750674256120681,
            17016137412461923309203156149298773452058939640460720421351362633056075642785
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            2548810771866286927655120639489781840042869924211393034173399234908879427131,
            17693863193254558670521546959260181183284075323261496603185319165245112546451
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            18872129875740885816403439476710476861867645071411274973970399006127292228134,
            11571828486237758117739941592188057169646866693232295211990138168720171615261
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            15189331793307724054132008778095276003131514472348169658716025552358410800319,
            663463307644925348354814198668705059820802163101931693747086365783690942012
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            21193882413487354116395868876680077017940985977165689111792131948088576539260,
            19281147051653271719810512786699369473419471175547079348424092702379521282215
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            20648902003583445138870192577751214796132807750527536485581592627342670332550,
            21311760317073018844756825860756262656800209171710743408664695650742829732724
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            9493613766316395164769525958959358404109020666487349810615854310438727472522,
            8920845588636378813270771207620548270659784883593862358034113537386923133603
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            8662462479263987696492539205716716892341082554407766537145648586247161322866,
            11082640929709493917009859178013540360332459675932560451951235069301635689001
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            2095677264591775081512875893262664826508981720807414918970931378987207700347,
            8023305177274919756051045706675074688292806503828863082842541588562587023892
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            4913842987731488653549650310172833001690748525784282086243960806673162108970,
            8185964943968298521314974779347170218591029499765163176187786758659224779394
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            974932253180065517572421755194101673127022137415851178035987099133925678161,
            21527969485259779350331742094515599117090067356732059152215786441413788780376
        );                                      
        
        vk.IC[17] = Pairing.G1Point( 
            18907092433637047353108631886028528976854419804337513651992453213017241548107,
            14672905243123510223399514830111227825742960804761461802364877690928351733822
        );                                      
        
        vk.IC[18] = Pairing.G1Point( 
            3963989220744058400242425365901560794415970591870891624336928354871177043151,
            13957103660497045645805550201593600798139972178705507254029796176042129801654
        );                                      
        
        vk.IC[19] = Pairing.G1Point( 
            2244106984713986658196817699451754487525956827686937407290805842890717521390,
            2400367106270659663178202980505767074391083449573916386379707819627159953308
        );                                      
        
        vk.IC[20] = Pairing.G1Point( 
            15656402101752917350864348154647426307152135662258213565477610877334771061767,
            16324881257747612031522892684579841000452858885624104663153964551927685961006
        );                                      
        
        vk.IC[21] = Pairing.G1Point( 
            6138665248992723901855291354099228168485404778873612035889125496411931815743,
            14734804208052966009346588027278504695855785367047824557188962900507272682113
        );                                      
        
        vk.IC[22] = Pairing.G1Point( 
            10775589062009616257396458966332213174691148913793927942279986786283402561287,
            15860491833955923785055512025006406558965972762394347270630567371230916077742
        );                                      
        
        vk.IC[23] = Pairing.G1Point( 
            10919223279698962035508936613649297649575385050619013052793598404572765668434,
            12731589474357190055105769245271227175413912592195946757178407255902218428076
        );                                      
        
        vk.IC[24] = Pairing.G1Point( 
            20431472598049556675096661182598570344329931999776329150037946146299158305324,
            10082165051700329743950357084634463510796097180841940253749739503228981001194
        );                                      
        
        vk.IC[25] = Pairing.G1Point( 
            7742310120804949192760364236920299049370470151679456162992691018666135622087,
            10287016876759892038426310418318910950434930800469496723716469835450237100018
        );                                      
        
        vk.IC[26] = Pairing.G1Point( 
            18325420831065492676714224429598036418806208816361277778566580418362893728650,
            11743207270881905563050581473929502684463143801356701685795926561829680784261
        );                                      
        
        vk.IC[27] = Pairing.G1Point( 
            7311307162899672666609441742693918740412585573385635769636644140968668305048,
            18353895912172761806892363874789129969791102612600143882431649337274240444345
        );                                      
        
        vk.IC[28] = Pairing.G1Point( 
            18275873603276144220293485573024931934235191186315178033327168411501235831248,
            10682326940369768494054648573275098875883748367207329918953430494946534186664
        );                                      
        
        vk.IC[29] = Pairing.G1Point( 
            18735836839016325649617545881002642566948279915543901964819674385129328977100,
            5478871252290233241197109150843937306478601761858116275274462682235756982882
        );                                      
        
        vk.IC[30] = Pairing.G1Point( 
            2190750469229620230274772701362122685218332555232538759983193243406047556856,
            1476622429819137765495588072818514711050614444126245886221126447361657714456
        );                                      
        
        vk.IC[31] = Pairing.G1Point( 
            3537737456504089623505261037822245006791574177433698946356553423437646206157,
            14861490582194004567287789576299443345205333533077340850239912603000429553274
        );                                      
        
        vk.IC[32] = Pairing.G1Point( 
            8104625145967293671692835882756500866337987121535660900144284654803552100942,
            16997374532905289642074639503697228775537635992802007037136450222859951986425
        );                                      
        
        vk.IC[33] = Pairing.G1Point( 
            14474462782137656567724355542778535762055569254215741109790757336995828674286,
            8536983747837096326666394443459687051751631772350539864987965739898148318439
        );                                      
        
        vk.IC[34] = Pairing.G1Point( 
            19523333309041154922504360818964233577533990635142188524705262722647544143777,
            11459170967052678419526365034560932061134139012711273092919048739120810049779
        );                                      
        
        vk.IC[35] = Pairing.G1Point( 
            19019325811339054914254168575640052378657557261747737104908005186615784133358,
            11111368769528495129719043250743661165437138854290894424417305860342061369203
        );                                      
        
        vk.IC[36] = Pairing.G1Point( 
            14718317124594536727787747404998932800771130993771602734001208763241574334045,
            15530680190756043834618479374278076948801796440453767664438087922607520637679
        );                                      
        
        vk.IC[37] = Pairing.G1Point( 
            16955953684664039604992637933227569422024049124133000843777381689989130380302,
            19723590921553023515001522669144479282363939522266474962295255831526092398109
        );                                      
        
        vk.IC[38] = Pairing.G1Point( 
            15306866631718549522921897683360571974576414584491662707318898756067446788684,
            4035534830884605691030793740031532408094628645658041067980496692839624958452
        );                                      
        
        vk.IC[39] = Pairing.G1Point( 
            15895306367579837256106514177645038604431716681411794611255734195268736173245,
            12363840319232526396157022604749313330983945495217424261600113438514883552046
        );                                      
        
        vk.IC[40] = Pairing.G1Point( 
            10990158792792047452494091220629330193159921335569270368721971885123317717036,
            20825811377635762465377387319550865916926026812957567360310201106563560593336
        );                                      
        
        vk.IC[41] = Pairing.G1Point( 
            9333005911259738115375024109761395710408251311164193495909890686963949137114,
            18246469469921722335147113622281566115212409735169740470985749853226970941798
        );                                      
        
        vk.IC[42] = Pairing.G1Point( 
            551107119916632384679834134516544309044376375475774808300550398410940223717,
            7771500837321367764565941835853029298778253074315727813159815998412743631379
        );                                      
        
        vk.IC[43] = Pairing.G1Point( 
            21434651921330397954603306474822434798911064129878903862132648936017535651247,
            21216067810725544489481019080923496869491212600191531869206973852391229063893
        );                                      
        
        vk.IC[44] = Pairing.G1Point( 
            17126044420041826883948957790147531001605284497202184210746225412319042063298,
            17516308544464433041218026698007042795251952241103546293595830982966383166147
        );                                      
        
        vk.IC[45] = Pairing.G1Point( 
            8383552978716350979312488018761667866120304990122551008169100150270828075165,
            10384320277419928089287725364394229794456234926497809203567433094577295588846
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
            uint[45] memory input
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
