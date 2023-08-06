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
        vk.IC = new Pairing.G1Point[](52);
        
        vk.IC[0] = Pairing.G1Point( 
            2366296185836353738561036116781899059082859467873075275458600422748800259655,
            11441332546024268507417819506380846755392570318914252171082466211893437266388
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            12682225844252163721842685880146568629356385643617551159363679757358342197974,
            19197241803903361486971061400409175915532670470790347657476076725930952785722
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            15346928502543789366791631086526048690282895117342744950836690068923172005037,
            21508582051138561391754278210164628353709427318245533989015507195438104126744
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            21360500740367237691944704700353939157336276722162072237190196072303616050994,
            13127786336974229187926587083208864333229611814718174007024987878634278504557
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            2178466196843815057132111252202725728065376925738852298902410568398308776995,
            4378087415594255667448828351229248185870333690045917148308519206997710282406
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            9885046903254494314748470111018093158028470990549316592800010685978874128167,
            14784495013316024360475232501450369108529977066165581335924026205223362174036
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            6581064321761342072573717776282684612875953542740515148252691533941822308352,
            10170327850603243120910413560940587404176456431833247338338242823330391460291
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            5286362877299514466850898366648489516650613224578716084885875187678815172522,
            14411956084580138943050886887853233143041624027611995383485206926720610745258
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            3390128230476439710266901200071826665048059187859620277707388323678720681060,
            15261674782823920723731292288730488269542483239245969705233567507254209332794
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            2559306027267608044355211505290884207629188189556629235404602356053953582820,
            782548787369939444538759847486940457369518719408246732061921450011484743189
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            5217540881454020683007387178001131991329296541802583606316762925057808384951,
            15581330747535340449287843701630246030215023631973771883238911437475916685353
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            1527502969464332199040104769580374275007777240540054515447888451273705813385,
            18025374051638167555818321698367531653878997569888762047076424175304486496817
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            2653171991422385271029162132067607335857434359660327970117871898377967218344,
            7386054310313042157301224674038432222324685344305876246715616426845518482500
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            10124416118009226006468199618073611240065610348786287593698018989072181876667,
            8612137417519008624725797358437583210431692071531939309545488954704047299557
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            12693145640655639276948832882767110489402817695520462743580013072841530149762,
            21526749927693922847784661576543414445078798252581726127635868563836872960222
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            5980295151171064383600633116140716661592791106493894343996263419695344929863,
            11661924744691554637043289547694281254715291382996316590220422917436029277886
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            2507523307538560539311638313372802699199853150652711320443317144827463183018,
            7053171438722085239733101806265847886800931512900636876194544631110815955616
        );                                      
        
        vk.IC[17] = Pairing.G1Point( 
            14921481722068825948342381009693586819671460750032238457616294154497498381791,
            4046726437854880243197176568667450571356899285312636484013155886636589485315
        );                                      
        
        vk.IC[18] = Pairing.G1Point( 
            15586763712608000310627923110262063016721656095110648607681754589171404992988,
            14876517921026219147323433834228734450048096491737013131750390884366864690891
        );                                      
        
        vk.IC[19] = Pairing.G1Point( 
            9831979718523709251727828435457888357248234335947729628418498147659616443462,
            10322468583785382543862540204454076434328246877368698411224538971092873503128
        );                                      
        
        vk.IC[20] = Pairing.G1Point( 
            17676304606328922987858223207030057901916150760448983038853251760087079283389,
            16764773884625906399080185013091106602467621325549621641332761083859995831406
        );                                      
        
        vk.IC[21] = Pairing.G1Point( 
            15786231843328175829743348055857879140830429136105723818403801584263147839400,
            21432152481261230762453386495823960645024948525470153664907389550039479721102
        );                                      
        
        vk.IC[22] = Pairing.G1Point( 
            18097627153424064247003101299511967840158168414201211016660939895191700856465,
            7175791390697910658498560300404573568105063544583226834950658981376555164022
        );                                      
        
        vk.IC[23] = Pairing.G1Point( 
            6412832089633413361633573797288362633719113195361678933197956512147012142212,
            7121392348309877663613854362193925309776635480464197003490436630865491138908
        );                                      
        
        vk.IC[24] = Pairing.G1Point( 
            1673441443394155843799113417602750968836659998480343772028270824197548276783,
            10537187848701762770731836978675469797856742989767066974493479579643039139321
        );                                      
        
        vk.IC[25] = Pairing.G1Point( 
            14626939299008516237070868438211670122824941333814125898804431569813917577025,
            15852383636271961318660683132376549554636325423761701024322010736003038646386
        );                                      
        
        vk.IC[26] = Pairing.G1Point( 
            19309512134433180552620578644613910112172889979653677834755091272948118909802,
            3269755367358713129655002277448749862345110614811741992599287558249101509324
        );                                      
        
        vk.IC[27] = Pairing.G1Point( 
            11855304676818780798927987604246383966407774361514892025233651997444372034265,
            16258561768718245872710577452754996496098248639528806961633858798727842920872
        );                                      
        
        vk.IC[28] = Pairing.G1Point( 
            3596307698681201250089713347060337625499673888349026664735022333256767025862,
            13662737559079841390570132649575203651469076986719206525601449539822803504974
        );                                      
        
        vk.IC[29] = Pairing.G1Point( 
            16919462339452442697375675763420761388597751175233944043194852530952184389328,
            16723323994931311077640537393439343186162867835069848403321864331156410817918
        );                                      
        
        vk.IC[30] = Pairing.G1Point( 
            18842016867948202531801922624047433698499111183126831435806496216560821520897,
            8177677178585727416799933514643201166007185298641012626704771295564058852362
        );                                      
        
        vk.IC[31] = Pairing.G1Point( 
            163804239432716568639352992009188107785200555946927653682073035901858335093,
            17391046232107345756572299783923985551650876414457928694706962605225271466911
        );                                      
        
        vk.IC[32] = Pairing.G1Point( 
            9773822814731232575190260950084057624620700270707316530467934057869028139096,
            21307991176325365479440298265079827552850848776771578119703079544763203971799
        );                                      
        
        vk.IC[33] = Pairing.G1Point( 
            8502080777800777610807841968506687937897557496631287672039826066289216034197,
            18966426893150181734957758015291919947617928223895186304180968723974015067143
        );                                      
        
        vk.IC[34] = Pairing.G1Point( 
            3881964269435762561666591229405107164238357144821846720050841718661711829974,
            13263756989621103924192498982565171752315002610160653831486828561685989826637
        );                                      
        
        vk.IC[35] = Pairing.G1Point( 
            18701128584562604937720745588431289319269464188814226308628225502119622644981,
            7664785415263158007393481063479555650366624732475458372678398857841454867551
        );                                      
        
        vk.IC[36] = Pairing.G1Point( 
            7268833374973498304948497312319015328626571617174649666366871032719070812608,
            16665746802342016150658259274054192132947825024880998985931503485326185633249
        );                                      
        
        vk.IC[37] = Pairing.G1Point( 
            18609098437250342275105676631152876585316933673978671305692355497059014463871,
            19101770862648301236704173306961129111387803784582633977674002875110596841753
        );                                      
        
        vk.IC[38] = Pairing.G1Point( 
            12230619558288339050017960317748971706172135752582357085353302176001552544736,
            375764127538116443318290311044989926903682468331708559250034743439057322886
        );                                      
        
        vk.IC[39] = Pairing.G1Point( 
            6773977997112174467829879512128045384913814260142565072309655797466600620139,
            15868430719657851420219756045990754922600471829978278598066937807015988030200
        );                                      
        
        vk.IC[40] = Pairing.G1Point( 
            18546505456868600807028490648987922875489553779219501656221854742332964959634,
            16319653165423415505534936539019803394363291976551009610515493436640170150565
        );                                      
        
        vk.IC[41] = Pairing.G1Point( 
            13063942024007436963825192113417733457163812466318744225411992669780412509758,
            15253513031302199128605025633552861991381502160273730160471610654799125434164
        );                                      
        
        vk.IC[42] = Pairing.G1Point( 
            8033444619935305627054057734099360643528960190178424239523781056709875877646,
            12507042349071732510064596810747888681215152863621864411557966989769591754467
        );                                      
        
        vk.IC[43] = Pairing.G1Point( 
            712461619252217111337471832285699163845712711078299584617248562055836316082,
            8071665019353423680357062296859618640593532837651688681672287101800431333653
        );                                      
        
        vk.IC[44] = Pairing.G1Point( 
            14727902130319986428561707725761469703547972769540277754203984976814522002003,
            9891784555371694162226207629134581529859529178596984638573876044790692864102
        );                                      
        
        vk.IC[45] = Pairing.G1Point( 
            1865473229766010259070739821263325611619369941627392158231272397735678496054,
            4532782542809809783485093583115026131823004248903795944634769215707599383865
        );                                      
        
        vk.IC[46] = Pairing.G1Point( 
            5354391050072253692219517611759685435705754846179857036232776000491113468635,
            13030693438944887069549852262157081033584489258375789758302613481218526985010
        );                                      
        
        vk.IC[47] = Pairing.G1Point( 
            406735678143573973820120339292601780470613636525789606428708911786456924503,
            6997046432150763226864969325672617672915135323722597269803951615144055653146
        );                                      
        
        vk.IC[48] = Pairing.G1Point( 
            16896308936715636130861657160437675810891971836478307439800801623894281613131,
            11162312889620140857890352731047391108845071484718357587585888622315178902659
        );                                      
        
        vk.IC[49] = Pairing.G1Point( 
            9524442507562104894195695196678087271399271916613648609349941249924353852742,
            13664705411748275003488773245898233412390239887457097462445993335725384025064
        );                                      
        
        vk.IC[50] = Pairing.G1Point( 
            15955465425193070725595240124204637589771969731605354543190072115179613619309,
            15939899037346016031549989576173133484298600528020273465237167800126411536379
        );                                      
        
        vk.IC[51] = Pairing.G1Point( 
            20078358606528352895454574883589731444544723089506992519551177047397222553564,
            21209231470065041710077552728113207189039621334210056813260767189012926578808
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
            uint[51] memory input
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
