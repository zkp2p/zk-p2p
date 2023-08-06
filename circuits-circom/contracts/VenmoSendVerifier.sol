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
            11590471946930478213341526265591290288174155111037377927106582384581769641011,
            8107498444189407704363756452908797753986607246605994456576420293063254363599
        );                                      
        
        vk.IC[1] = Pairing.G1Point( 
            7860226032157886846572753343239346676492630885246776367929328617305912263512,
            19755518429084113714397809303268418615305504464093418146518144531638082872000
        );                                      
        
        vk.IC[2] = Pairing.G1Point( 
            9077094595724922163795300779652288632530679245450866380722851977945929420974,
            7678051512107515843222595755193953098455364622442063555836626304713245502744
        );                                      
        
        vk.IC[3] = Pairing.G1Point( 
            11148208381496188070270705103917686410227554770311873758963684664424287288661,
            2207554375426793936465526633534681962348758679838606953357747372592189694532
        );                                      
        
        vk.IC[4] = Pairing.G1Point( 
            3960762597728110968167678296337024214550788783672293420873414852461969345037,
            10700216728015782854987101414132134677546627473827574162988381217950689659815
        );                                      
        
        vk.IC[5] = Pairing.G1Point( 
            12322924138836484624016822466008403664600325828150027847553354162820409987928,
            2105911170646678179932386818955286166378379529451034625024411988420329759675
        );                                      
        
        vk.IC[6] = Pairing.G1Point( 
            21688774034837778466142703526483979016020443537448476919512451793362959795647,
            8065132970952177542421138615932955867364726101812275158574440983931612612830
        );                                      
        
        vk.IC[7] = Pairing.G1Point( 
            18428043535487773669188070195300247136874708848128182143714251372748624509986,
            16042916050982691735000884559078895035773699932087827368825553104303505937750
        );                                      
        
        vk.IC[8] = Pairing.G1Point( 
            19427144414396161398627224566468720289841060626855467330582590418443100050565,
            338228213191363013846575772004095928667170382106721403320016347639840454362
        );                                      
        
        vk.IC[9] = Pairing.G1Point( 
            8956437493076925926388418628494725948066607898029241546536054716864830120927,
            10129739160626140380688226351297308089616469472905738762682994543902716411854
        );                                      
        
        vk.IC[10] = Pairing.G1Point( 
            15748720785375885303760301462815816241084669703458604832912296249423242944901,
            16510311216730982599673128896434726185626169191096182207696799436980730089968
        );                                      
        
        vk.IC[11] = Pairing.G1Point( 
            10486893846578427340760707057471537071812727967132477813531382276359388578102,
            2517390791239884807359277223081262423598029148624532328164477926663685553483
        );                                      
        
        vk.IC[12] = Pairing.G1Point( 
            6985465677717716779531867659593833128413047269889785732924831978901645685611,
            11302748602092641976271030654404454552835383620492032972146012410878357413809
        );                                      
        
        vk.IC[13] = Pairing.G1Point( 
            5886229987813922223488904995172740539041567647384024707441650905927291247679,
            3789674545005935652625462227398205484491906324930050662839758801446879556357
        );                                      
        
        vk.IC[14] = Pairing.G1Point( 
            10508645181031444619746252502952832414992210204215493970486951650946021421162,
            5603189358669540998393860961013466358387629200565910020239607475497099916622
        );                                      
        
        vk.IC[15] = Pairing.G1Point( 
            16957220590345994234040409833055651552938531317213982578844489166366094946744,
            13306033058213082611042464050559484306776968260795145864769999944508169821073
        );                                      
        
        vk.IC[16] = Pairing.G1Point( 
            18779510276334411166370463770208357626288482797070528422356889893283738735929,
            16457526112303114733211199666553914668564863445073865810912881980611410823672
        );                                      
        
        vk.IC[17] = Pairing.G1Point( 
            7777182093452935257340121098213319981952230552531916211739093168662802109738,
            18584457485579741379613124310996390314926957053872468049063431512448915634014
        );                                      
        
        vk.IC[18] = Pairing.G1Point( 
            8575593630091360560388039839824936752873871134882366424361090364446265535302,
            2482077040585186765722700771998976237530327351313405621176262600412477029571
        );                                      
        
        vk.IC[19] = Pairing.G1Point( 
            1750340015646939707659120964986077343900868809708983246699735982913885432485,
            14310617312723238518763833058373846751030688276351200439169535179377651408727
        );                                      
        
        vk.IC[20] = Pairing.G1Point( 
            503942163073266014176594973453996045988666406828177669676088377857234258397,
            12699478274720136075089704283582584123465436800607980710905702340042411997752
        );                                      
        
        vk.IC[21] = Pairing.G1Point( 
            3860458820352086965168387544063401789708002735568532034655789545678869171793,
            11010637221773707077538478677155093324925486044855959581987433019472647181291
        );                                      
        
        vk.IC[22] = Pairing.G1Point( 
            12627971450737327006297001864887697121277554448445111382893529731116538108803,
            21663600537641732892898519330114445591318283016616918062731561220090222040270
        );                                      
        
        vk.IC[23] = Pairing.G1Point( 
            4961020215240942323290664577334531065786779494774976074588555976484044007276,
            2534704148359328061600633045368402628817157460828841544008886773862550283034
        );                                      
        
        vk.IC[24] = Pairing.G1Point( 
            17204273120014192744306527987684143133304690088838092155956088773564871189672,
            7847735125412544401526961042269124759018768224959770443496070883234419589428
        );                                      
        
        vk.IC[25] = Pairing.G1Point( 
            19974643981648799954812955817088857254305054339242522934476139671566448754135,
            12833086558163918540782710689894898461199345045205195393940692668057460856477
        );                                      
        
        vk.IC[26] = Pairing.G1Point( 
            4196577451480753665001215018872448375082472565020740320453866951425550981439,
            7902966805155799360074090562223392582820214462101819063200809637651642293684
        );                                      
        
        vk.IC[27] = Pairing.G1Point( 
            14916017199982662480190047760394038732410222666447132137154031356075766135053,
            5229438278049561536596171169254710026527087479382401297323600426515897049665
        );                                      
        
        vk.IC[28] = Pairing.G1Point( 
            5294273418440592130436052276368623778646663352183578787924953744065974110982,
            4493148715694454720358970568770436423325536154574800895709265024107032248980
        );                                      
        
        vk.IC[29] = Pairing.G1Point( 
            158095632263760566930615784460695728352865770410176079454110089609206304835,
            3404334344378693284429125183003831208970925573811440836935383193189797869802
        );                                      
        
        vk.IC[30] = Pairing.G1Point( 
            5618178066678728082357709253072523096408091467757014548308284314707220023217,
            10752583845255729770155038744448759327653659912828608099276952215921649154076
        );                                      
        
        vk.IC[31] = Pairing.G1Point( 
            4643233001686172416012627259630645272356431005145397703653564051755416242142,
            20415825799616415940060206804745419669109186831353816668144022044554207095975
        );                                      
        
        vk.IC[32] = Pairing.G1Point( 
            5462629799008956310609814715533556531573704864935152308485908533252460601810,
            4522936300822022534737240816847520933486199776041039898347844779209364208979
        );                                      
        
        vk.IC[33] = Pairing.G1Point( 
            12561582053223852693326638304016717073939979675866960768485520007084490508738,
            17926085881953096570499510133394176530982958288781171011559755836743331857115
        );                                      
        
        vk.IC[34] = Pairing.G1Point( 
            18242666547320471842247956639013086950650501184459570966080961615851098530851,
            15048002913642149600360097818393203093085780277325181924561825007332561202378
        );                                      
        
        vk.IC[35] = Pairing.G1Point( 
            18816713277315176751048832707019153216599414469470999220351022491837646907254,
            7162632847705554113694704897339011325250068512736239235308453453154204016467
        );                                      
        
        vk.IC[36] = Pairing.G1Point( 
            2385771043341430048051325004890889020346597455021109999053361658647880947061,
            13704699081677332985141094926974570544355629015575929081227550093752436547737
        );                                      
        
        vk.IC[37] = Pairing.G1Point( 
            9161192065866506761536100036860400528841965280149423806089709039721509398386,
            14037473882385242865130749410630619032898494219160802673561324154720379613748
        );                                      
        
        vk.IC[38] = Pairing.G1Point( 
            10669682410882191584806243250382520058690398413469394387998939664583384179985,
            14876761069630098391744458449525616417080796382941085090155569606323908417531
        );                                      
        
        vk.IC[39] = Pairing.G1Point( 
            14737914226402455193808585011835456492424996765816546585610593600725847963366,
            8263965092872015787423732556810010871919810599259578475838505607283829255729
        );                                      
        
        vk.IC[40] = Pairing.G1Point( 
            16589684062204580041599258759210936722362483123920991009586136002958525659288,
            6343597739531115719342153357574463944520450995345948907069762599032355022748
        );                                      
        
        vk.IC[41] = Pairing.G1Point( 
            15188216318918486460304429925558726697283643674913155024551982055919245764430,
            4456281758059438415770317514307440036576867715567623612288673424070688278026
        );                                      
        
        vk.IC[42] = Pairing.G1Point( 
            14183578850538950686548361304676518024434561061027513773324183956686297443171,
            8191887335938011463887111393489943738813315176919934724452706698725914740559
        );                                      
        
        vk.IC[43] = Pairing.G1Point( 
            13066863502807740462895427584070437070245990213395379356042141581225460068171,
            3823980765778023351529306513932326823710113035567467606309079165232723042637
        );                                      
        
        vk.IC[44] = Pairing.G1Point( 
            9469214792874006202747218714676077772044512507712749790494785066032440405026,
            2508916674271271258636414685842698773413950468387434641031505572633774224957
        );                                      
        
        vk.IC[45] = Pairing.G1Point( 
            6019475149274030633167787610033632553814695497679355726806560577238534702344,
            8830572090904350554239371655899523289830636489537883067131532235111017377292
        );                                      
        
        vk.IC[46] = Pairing.G1Point( 
            8302556369849431414742766698189297891073674722173042644716963852551351854215,
            11414954717388067717619813999757732342959397119564548836319279257960989497955
        );                                      
        
        vk.IC[47] = Pairing.G1Point( 
            9195421052750383858240876855128899206464818687613905659287181853701027355132,
            19556501704072739158926767701689127135060683601519563358380953547514228773450
        );                                      
        
        vk.IC[48] = Pairing.G1Point( 
            12493169209740560967068084205423700396039869922047016404310673030940986251003,
            9691901703364558360788701694956084062312913041086295454064334755019927959672
        );                                      
        
        vk.IC[49] = Pairing.G1Point( 
            13793751862024327645314228917219067736140264112027827990138354017459005315855,
            3215878477337756607862331435917771543604560109679977677306889843221506459788
        );                                      
        
        vk.IC[50] = Pairing.G1Point( 
            6931804615362513088685828502384432310157873193352049895558001714535556345435,
            21201037813135589443888778365163400336222121635651797189467309929329324669743
        );                                      
        
        vk.IC[51] = Pairing.G1Point( 
            14187397168249908700903498805652662618033591965757329410316605945746369887726,
            17671399667070393686100147863827567758943339235897861588267024460027246314895
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
