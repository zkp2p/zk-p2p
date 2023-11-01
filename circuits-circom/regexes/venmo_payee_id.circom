pragma circom 2.1.5;

include "@zk-email/circuits/regexes/regex_helpers.circom";

template VenmoPayeeIdRegex(msg_bytes) {
	signal input msg[msg_bytes];
	signal output out;

	var num_bytes = msg_bytes+1;
	signal in[num_bytes];
	in[0]<==255;
	for (var i = 0; i < msg_bytes; i++) {
		in[i+1] <== msg[i];
	}

	component eq[60][num_bytes];
	component lt[2][num_bytes];
	component and[334][num_bytes];
	component multi_or[6][num_bytes];
	signal states[num_bytes+1][331];
	component state_changed[num_bytes];

	states[0][0] <== 1;
	for (var i = 1; i < 331; i++) {
		states[0][i] <== 0;
	}

	for (var i = 0; i < num_bytes; i++) {
		state_changed[i] = MultiOR(330);
		// 32 = ` `
		eq[0][i] = IsEqual();
		eq[0][i].in[0] <== in[i];
		eq[0][i].in[1] <== 32;
		and[0][i] = AND();
		and[0][i].a <== states[i][330];
		and[0][i].b <== eq[0][i].out;
		states[i+1][1] <== and[0][i].out;
		state_changed[i].in[0] <== states[i+1][1];
		// Catch all except `\r` `\n`
		lt[0][i] = LessEqThan(8);
		lt[0][i].in[0] <== 14;
		lt[0][i].in[1] <== in[i];
		lt[1][i] = LessEqThan(8);
		lt[1][i].in[0] <== in[i];
		lt[1][i].in[1] <== 254;
		and[1][i] = AND();
		and[1][i].a <== lt[0][i].out;
		and[1][i].b <== lt[1][i].out;
		eq[1][i] = IsEqual();
		eq[1][i].in[0] <== in[i];
		eq[1][i].in[1] <== 0;
		eq[2][i] = IsEqual();
		eq[2][i].in[0] <== in[i];
		eq[2][i].in[1] <== 1;
		eq[3][i] = IsEqual();
		eq[3][i].in[0] <== in[i];
		eq[3][i].in[1] <== 2;
		eq[4][i] = IsEqual();
		eq[4][i].in[0] <== in[i];
		eq[4][i].in[1] <== 3;
		eq[5][i] = IsEqual();
		eq[5][i].in[0] <== in[i];
		eq[5][i].in[1] <== 4;
		eq[6][i] = IsEqual();
		eq[6][i].in[0] <== in[i];
		eq[6][i].in[1] <== 5;
		eq[7][i] = IsEqual();
		eq[7][i].in[0] <== in[i];
		eq[7][i].in[1] <== 6;
		eq[8][i] = IsEqual();
		eq[8][i].in[0] <== in[i];
		eq[8][i].in[1] <== 7;
		eq[9][i] = IsEqual();
		eq[9][i].in[0] <== in[i];
		eq[9][i].in[1] <== 8;
		eq[10][i] = IsEqual();
		eq[10][i].in[0] <== in[i];
		eq[10][i].in[1] <== 9;
		eq[11][i] = IsEqual();
		eq[11][i].in[0] <== in[i];
		eq[11][i].in[1] <== 11;
		eq[12][i] = IsEqual();
		eq[12][i].in[0] <== in[i];
		eq[12][i].in[1] <== 12;
		and[2][i] = AND();
		and[2][i].a <== states[i][2];
		multi_or[0][i] = MultiOR(13);
		multi_or[0][i].in[0] <== and[1][i].out;
		multi_or[0][i].in[1] <== eq[1][i].out;
		multi_or[0][i].in[2] <== eq[2][i].out;
		multi_or[0][i].in[3] <== eq[3][i].out;
		multi_or[0][i].in[4] <== eq[4][i].out;
		multi_or[0][i].in[5] <== eq[5][i].out;
		multi_or[0][i].in[6] <== eq[6][i].out;
		multi_or[0][i].in[7] <== eq[7][i].out;
		multi_or[0][i].in[8] <== eq[8][i].out;
		multi_or[0][i].in[9] <== eq[9][i].out;
		multi_or[0][i].in[10] <== eq[10][i].out;
		multi_or[0][i].in[11] <== eq[11][i].out;
		multi_or[0][i].in[12] <== eq[12][i].out;
		and[2][i].b <== multi_or[0][i].out;
		and[3][i] = AND();
		and[3][i].a <== states[i][313];
		and[3][i].b <== multi_or[0][i].out;
		multi_or[1][i] = MultiOR(2);
		multi_or[1][i].in[0] <== and[2][i].out;
		multi_or[1][i].in[1] <== and[3][i].out;
		states[i+1][2] <== multi_or[1][i].out;
		state_changed[i].in[1] <== states[i+1][2];
		and[4][i] = AND();
		and[4][i].a <== states[i][1];
		and[4][i].b <== eq[0][i].out;
		states[i+1][3] <== and[4][i].out;
		state_changed[i].in[2] <== states[i+1][3];
		and[5][i] = AND();
		and[5][i].a <== states[i][3];
		and[5][i].b <== eq[0][i].out;
		states[i+1][4] <== and[5][i].out;
		state_changed[i].in[3] <== states[i+1][4];
		and[6][i] = AND();
		and[6][i].a <== states[i][4];
		and[6][i].b <== eq[0][i].out;
		states[i+1][5] <== and[6][i].out;
		state_changed[i].in[4] <== states[i+1][5];
		// 10 = `\n`
		eq[13][i] = IsEqual();
		eq[13][i].in[0] <== in[i];
		eq[13][i].in[1] <== 10;
		and[7][i] = AND();
		and[7][i].a <== states[i][325];
		and[7][i].b <== eq[13][i].out;
		states[i+1][6] <== and[7][i].out;
		state_changed[i].in[5] <== states[i+1][6];
		and[8][i] = AND();
		and[8][i].a <== states[i][6];
		and[8][i].b <== eq[0][i].out;
		states[i+1][7] <== and[8][i].out;
		state_changed[i].in[6] <== states[i+1][7];
		and[9][i] = AND();
		and[9][i].a <== states[i][7];
		and[9][i].b <== eq[0][i].out;
		states[i+1][8] <== and[9][i].out;
		state_changed[i].in[7] <== states[i+1][8];
		and[10][i] = AND();
		and[10][i].a <== states[i][8];
		and[10][i].b <== eq[0][i].out;
		states[i+1][9] <== and[10][i].out;
		state_changed[i].in[8] <== states[i+1][9];
		and[11][i] = AND();
		and[11][i].a <== states[i][9];
		and[11][i].b <== eq[0][i].out;
		states[i+1][10] <== and[11][i].out;
		state_changed[i].in[9] <== states[i+1][10];
		and[12][i] = AND();
		and[12][i].a <== states[i][10];
		and[12][i].b <== eq[0][i].out;
		states[i+1][11] <== and[12][i].out;
		state_changed[i].in[10] <== states[i+1][11];
		and[13][i] = AND();
		and[13][i].a <== states[i][11];
		and[13][i].b <== eq[0][i].out;
		states[i+1][12] <== and[13][i].out;
		state_changed[i].in[11] <== states[i+1][12];
		and[14][i] = AND();
		and[14][i].a <== states[i][12];
		and[14][i].b <== eq[0][i].out;
		states[i+1][13] <== and[14][i].out;
		state_changed[i].in[12] <== states[i+1][13];
		and[15][i] = AND();
		and[15][i].a <== states[i][13];
		and[15][i].b <== eq[0][i].out;
		states[i+1][14] <== and[15][i].out;
		state_changed[i].in[13] <== states[i+1][14];
		and[16][i] = AND();
		and[16][i].a <== states[i][14];
		and[16][i].b <== eq[0][i].out;
		states[i+1][15] <== and[16][i].out;
		state_changed[i].in[14] <== states[i+1][15];
		and[17][i] = AND();
		and[17][i].a <== states[i][15];
		and[17][i].b <== eq[0][i].out;
		states[i+1][16] <== and[17][i].out;
		state_changed[i].in[15] <== states[i+1][16];
		and[18][i] = AND();
		and[18][i].a <== states[i][16];
		and[18][i].b <== eq[0][i].out;
		states[i+1][17] <== and[18][i].out;
		state_changed[i].in[16] <== states[i+1][17];
		and[19][i] = AND();
		and[19][i].a <== states[i][17];
		and[19][i].b <== eq[0][i].out;
		states[i+1][18] <== and[19][i].out;
		state_changed[i].in[17] <== states[i+1][18];
		and[20][i] = AND();
		and[20][i].a <== states[i][18];
		and[20][i].b <== eq[0][i].out;
		states[i+1][19] <== and[20][i].out;
		state_changed[i].in[18] <== states[i+1][19];
		and[21][i] = AND();
		and[21][i].a <== states[i][19];
		and[21][i].b <== eq[0][i].out;
		states[i+1][20] <== and[21][i].out;
		state_changed[i].in[19] <== states[i+1][20];
		and[22][i] = AND();
		and[22][i].a <== states[i][20];
		and[22][i].b <== eq[0][i].out;
		states[i+1][21] <== and[22][i].out;
		state_changed[i].in[20] <== states[i+1][21];
		and[23][i] = AND();
		and[23][i].a <== states[i][5];
		and[23][i].b <== eq[0][i].out;
		states[i+1][22] <== and[23][i].out;
		state_changed[i].in[21] <== states[i+1][22];
		and[24][i] = AND();
		and[24][i].a <== states[i][21];
		and[24][i].b <== eq[0][i].out;
		states[i+1][23] <== and[24][i].out;
		state_changed[i].in[22] <== states[i+1][23];
		// 60 = `<`
		eq[14][i] = IsEqual();
		eq[14][i].in[0] <== in[i];
		eq[14][i].in[1] <== 60;
		and[25][i] = AND();
		and[25][i].a <== states[i][23];
		and[25][i].b <== eq[14][i].out;
		states[i+1][24] <== and[25][i].out;
		state_changed[i].in[23] <== states[i+1][24];
		// 47 = `/`
		eq[15][i] = IsEqual();
		eq[15][i].in[0] <== in[i];
		eq[15][i].in[1] <== 47;
		and[26][i] = AND();
		and[26][i].a <== states[i][24];
		and[26][i].b <== eq[15][i].out;
		states[i+1][25] <== and[26][i].out;
		state_changed[i].in[24] <== states[i+1][25];
		// 97 = `a`
		eq[16][i] = IsEqual();
		eq[16][i].in[0] <== in[i];
		eq[16][i].in[1] <== 97;
		and[27][i] = AND();
		and[27][i].a <== states[i][25];
		and[27][i].b <== eq[16][i].out;
		states[i+1][26] <== and[27][i].out;
		state_changed[i].in[25] <== states[i+1][26];
		// 62 = `>`
		eq[17][i] = IsEqual();
		eq[17][i].in[0] <== in[i];
		eq[17][i].in[1] <== 62;
		and[28][i] = AND();
		and[28][i].a <== states[i][26];
		and[28][i].b <== eq[17][i].out;
		states[i+1][27] <== and[28][i].out;
		state_changed[i].in[26] <== states[i+1][27];
		// 13 = `\r`
		eq[18][i] = IsEqual();
		eq[18][i].in[0] <== in[i];
		eq[18][i].in[1] <== 13;
		and[29][i] = AND();
		and[29][i].a <== states[i][27];
		and[29][i].b <== eq[18][i].out;
		states[i+1][28] <== and[29][i].out;
		state_changed[i].in[27] <== states[i+1][28];
		and[30][i] = AND();
		and[30][i].a <== states[i][28];
		and[30][i].b <== eq[13][i].out; // 10 = `\n`
		states[i+1][29] <== and[30][i].out;
		state_changed[i].in[28] <== states[i+1][29];
		and[31][i] = AND();
		and[31][i].a <== states[i][29];
		and[31][i].b <== eq[0][i].out;
		states[i+1][30] <== and[31][i].out;
		state_changed[i].in[29] <== states[i+1][30];
		and[32][i] = AND();
		and[32][i].a <== states[i][30];
		and[32][i].b <== eq[0][i].out;
		states[i+1][31] <== and[32][i].out;
		state_changed[i].in[30] <== states[i+1][31];
		and[33][i] = AND();
		and[33][i].a <== states[i][31];
		and[33][i].b <== eq[0][i].out;
		states[i+1][32] <== and[33][i].out;
		state_changed[i].in[31] <== states[i+1][32];
		and[34][i] = AND();
		and[34][i].a <== states[i][32];
		and[34][i].b <== eq[0][i].out;
		states[i+1][33] <== and[34][i].out;
		state_changed[i].in[32] <== states[i+1][33];
		and[35][i] = AND();
		and[35][i].a <== states[i][33];
		and[35][i].b <== eq[0][i].out;
		states[i+1][34] <== and[35][i].out;
		state_changed[i].in[33] <== states[i+1][34];
		and[36][i] = AND();
		and[36][i].a <== states[i][34];
		and[36][i].b <== eq[0][i].out;
		states[i+1][35] <== and[36][i].out;
		state_changed[i].in[34] <== states[i+1][35];
		and[37][i] = AND();
		and[37][i].a <== states[i][35];
		and[37][i].b <== eq[0][i].out;
		states[i+1][36] <== and[37][i].out;
		state_changed[i].in[35] <== states[i+1][36];
		and[38][i] = AND();
		and[38][i].a <== states[i][36];
		and[38][i].b <== eq[0][i].out;
		states[i+1][37] <== and[38][i].out;
		state_changed[i].in[36] <== states[i+1][37];
		and[39][i] = AND();
		and[39][i].a <== states[i][37];
		and[39][i].b <== eq[0][i].out;
		states[i+1][38] <== and[39][i].out;
		state_changed[i].in[37] <== states[i+1][38];
		and[40][i] = AND();
		and[40][i].a <== states[i][38];
		and[40][i].b <== eq[0][i].out;
		states[i+1][39] <== and[40][i].out;
		state_changed[i].in[38] <== states[i+1][39];
		and[41][i] = AND();
		and[41][i].a <== states[i][39];
		and[41][i].b <== eq[0][i].out;
		states[i+1][40] <== and[41][i].out;
		state_changed[i].in[39] <== states[i+1][40];
		and[42][i] = AND();
		and[42][i].a <== states[i][40];
		and[42][i].b <== eq[0][i].out;
		states[i+1][41] <== and[42][i].out;
		state_changed[i].in[40] <== states[i+1][41];
		and[43][i] = AND();
		and[43][i].a <== states[i][41];
		and[43][i].b <== eq[0][i].out;
		states[i+1][42] <== and[43][i].out;
		state_changed[i].in[41] <== states[i+1][42];
		and[44][i] = AND();
		and[44][i].a <== states[i][42];
		and[44][i].b <== eq[0][i].out;
		states[i+1][43] <== and[44][i].out;
		state_changed[i].in[42] <== states[i+1][43];
		and[45][i] = AND();
		and[45][i].a <== states[i][43];
		and[45][i].b <== eq[0][i].out;
		states[i+1][44] <== and[45][i].out;
		state_changed[i].in[43] <== states[i+1][44];
		// 61 = `=`
		eq[19][i] = IsEqual();
		eq[19][i].in[0] <== in[i];
		eq[19][i].in[1] <== 61;
		and[46][i] = AND();
		and[46][i].a <== states[i][44];
		and[46][i].b <== eq[19][i].out;
		states[i+1][45] <== and[46][i].out;
		state_changed[i].in[44] <== states[i+1][45];
		// 50 = `2`
		eq[20][i] = IsEqual();
		eq[20][i].in[0] <== in[i];
		eq[20][i].in[1] <== 50;
		and[47][i] = AND();
		and[47][i].a <== states[i][45];
		and[47][i].b <== eq[20][i].out;
		states[i+1][46] <== and[47][i].out;
		state_changed[i].in[45] <== states[i+1][46];
		// 48 = `0`
		eq[21][i] = IsEqual();
		eq[21][i].in[0] <== in[i];
		eq[21][i].in[1] <== 48;
		and[48][i] = AND();
		and[48][i].a <== states[i][46];
		and[48][i].b <== eq[21][i].out;
		states[i+1][47] <== and[48][i].out;
		state_changed[i].in[46] <== states[i+1][47];
		and[49][i] = AND();
		and[49][i].a <== states[i][47];
		and[49][i].b <== eq[18][i].out; // 13 = `\r`
		states[i+1][48] <== and[49][i].out;
		state_changed[i].in[47] <== states[i+1][48];
		and[50][i] = AND();
		and[50][i].a <== states[i][22];
		and[50][i].b <== eq[0][i].out;
		states[i+1][49] <== and[50][i].out;
		state_changed[i].in[48] <== states[i+1][49];
		and[51][i] = AND();
		and[51][i].a <== states[i][48];
		and[51][i].b <== eq[13][i].out; // 10 = `\n`
		states[i+1][50] <== and[51][i].out;
		state_changed[i].in[49] <== states[i+1][50];
		and[52][i] = AND();
		and[52][i].a <== states[i][50];
		and[52][i].b <== eq[0][i].out;
		states[i+1][51] <== and[52][i].out;
		state_changed[i].in[50] <== states[i+1][51];
		and[53][i] = AND();
		and[53][i].a <== states[i][51];
		and[53][i].b <== eq[0][i].out;
		states[i+1][52] <== and[53][i].out;
		state_changed[i].in[51] <== states[i+1][52];
		and[54][i] = AND();
		and[54][i].a <== states[i][52];
		and[54][i].b <== eq[0][i].out;
		states[i+1][53] <== and[54][i].out;
		state_changed[i].in[52] <== states[i+1][53];
		and[55][i] = AND();
		and[55][i].a <== states[i][53];
		and[55][i].b <== eq[0][i].out;
		states[i+1][54] <== and[55][i].out;
		state_changed[i].in[53] <== states[i+1][54];
		and[56][i] = AND();
		and[56][i].a <== states[i][54];
		and[56][i].b <== eq[0][i].out;
		states[i+1][55] <== and[56][i].out;
		state_changed[i].in[54] <== states[i+1][55];
		and[57][i] = AND();
		and[57][i].a <== states[i][55];
		and[57][i].b <== eq[0][i].out;
		states[i+1][56] <== and[57][i].out;
		state_changed[i].in[55] <== states[i+1][56];
		and[58][i] = AND();
		and[58][i].a <== states[i][56];
		and[58][i].b <== eq[0][i].out;
		states[i+1][57] <== and[58][i].out;
		state_changed[i].in[56] <== states[i+1][57];
		and[59][i] = AND();
		and[59][i].a <== states[i][57];
		and[59][i].b <== eq[0][i].out;
		states[i+1][58] <== and[59][i].out;
		state_changed[i].in[57] <== states[i+1][58];
		and[60][i] = AND();
		and[60][i].a <== states[i][58];
		and[60][i].b <== eq[0][i].out;
		states[i+1][59] <== and[60][i].out;
		state_changed[i].in[58] <== states[i+1][59];
		and[61][i] = AND();
		and[61][i].a <== states[i][59];
		and[61][i].b <== eq[0][i].out;
		states[i+1][60] <== and[61][i].out;
		state_changed[i].in[59] <== states[i+1][60];
		and[62][i] = AND();
		and[62][i].a <== states[i][60];
		and[62][i].b <== eq[0][i].out;
		states[i+1][61] <== and[62][i].out;
		state_changed[i].in[60] <== states[i+1][61];
		and[63][i] = AND();
		and[63][i].a <== states[i][61];
		and[63][i].b <== eq[0][i].out;
		states[i+1][62] <== and[63][i].out;
		state_changed[i].in[61] <== states[i+1][62];
		and[64][i] = AND();
		and[64][i].a <== states[i][62];
		and[64][i].b <== eq[14][i].out; // 60 = `<`
		states[i+1][63] <== and[64][i].out;
		state_changed[i].in[62] <== states[i+1][63];
		and[65][i] = AND();
		and[65][i].a <== states[i][63];
		and[65][i].b <== eq[15][i].out;
		states[i+1][64] <== and[65][i].out;
		state_changed[i].in[63] <== states[i+1][64];
		// 100 = `d`
		eq[22][i] = IsEqual();
		eq[22][i].in[0] <== in[i];
		eq[22][i].in[1] <== 100;
		and[66][i] = AND();
		and[66][i].a <== states[i][64];
		and[66][i].b <== eq[22][i].out;
		states[i+1][65] <== and[66][i].out;
		state_changed[i].in[64] <== states[i+1][65];
		// 105 = `i`
		eq[23][i] = IsEqual();
		eq[23][i].in[0] <== in[i];
		eq[23][i].in[1] <== 105;
		and[67][i] = AND();
		and[67][i].a <== states[i][65];
		and[67][i].b <== eq[23][i].out;
		states[i+1][66] <== and[67][i].out;
		state_changed[i].in[65] <== states[i+1][66];
		// 118 = `v`
		eq[24][i] = IsEqual();
		eq[24][i].in[0] <== in[i];
		eq[24][i].in[1] <== 118;
		and[68][i] = AND();
		and[68][i].a <== states[i][66];
		and[68][i].b <== eq[24][i].out;
		states[i+1][67] <== and[68][i].out;
		state_changed[i].in[66] <== states[i+1][67];
		and[69][i] = AND();
		and[69][i].a <== states[i][67];
		and[69][i].b <== eq[17][i].out; // 62 = `>`
		states[i+1][68] <== and[69][i].out;
		state_changed[i].in[67] <== states[i+1][68];
		and[70][i] = AND();
		and[70][i].a <== states[i][68];
		and[70][i].b <== eq[18][i].out; // 13 = `\r`
		states[i+1][69] <== and[70][i].out;
		state_changed[i].in[68] <== states[i+1][69];
		and[71][i] = AND();
		and[71][i].a <== states[i][69];
		and[71][i].b <== eq[13][i].out;
		states[i+1][70] <== and[71][i].out;
		state_changed[i].in[69] <== states[i+1][70];
		and[72][i] = AND();
		and[72][i].a <== states[i][70];
		and[72][i].b <== eq[0][i].out;
		states[i+1][71] <== and[72][i].out;
		state_changed[i].in[70] <== states[i+1][71];
		and[73][i] = AND();
		and[73][i].a <== states[i][71];
		and[73][i].b <== eq[0][i].out;
		states[i+1][72] <== and[73][i].out;
		state_changed[i].in[71] <== states[i+1][72];
		and[74][i] = AND();
		and[74][i].a <== states[i][72];
		and[74][i].b <== eq[0][i].out;
		states[i+1][73] <== and[74][i].out;
		state_changed[i].in[72] <== states[i+1][73];
		and[75][i] = AND();
		and[75][i].a <== states[i][73];
		and[75][i].b <== eq[0][i].out;
		states[i+1][74] <== and[75][i].out;
		state_changed[i].in[73] <== states[i+1][74];
		and[76][i] = AND();
		and[76][i].a <== states[i][74];
		and[76][i].b <== eq[0][i].out;
		states[i+1][75] <== and[76][i].out;
		state_changed[i].in[74] <== states[i+1][75];
		and[77][i] = AND();
		and[77][i].a <== states[i][49];
		and[77][i].b <== eq[0][i].out;
		states[i+1][76] <== and[77][i].out;
		state_changed[i].in[75] <== states[i+1][76];
		and[78][i] = AND();
		and[78][i].a <== states[i][75];
		and[78][i].b <== eq[0][i].out;
		states[i+1][77] <== and[78][i].out;
		state_changed[i].in[76] <== states[i+1][77];
		and[79][i] = AND();
		and[79][i].a <== states[i][77];
		and[79][i].b <== eq[0][i].out;
		states[i+1][78] <== and[79][i].out;
		state_changed[i].in[77] <== states[i+1][78];
		and[80][i] = AND();
		and[80][i].a <== states[i][78];
		and[80][i].b <== eq[0][i].out;
		states[i+1][79] <== and[80][i].out;
		state_changed[i].in[78] <== states[i+1][79];
		and[82][i] = AND();
		and[82][i].a <== states[i][79];
		and[82][i].b <== eq[0][i].out;
		states[i+1][80] <== and[82][i].out;
		state_changed[i].in[79] <== states[i+1][80];
		and[83][i] = AND();
		and[83][i].a <== states[i][80];
		and[83][i].b <== eq[0][i].out;
		states[i+1][81] <== and[83][i].out;
		state_changed[i].in[80] <== states[i+1][81];
		and[84][i] = AND();
		and[84][i].a <== states[i][81];
		and[84][i].b <== eq[0][i].out;
		states[i+1][82] <== and[84][i].out;
		state_changed[i].in[81] <== states[i+1][82];
		and[85][i] = AND();
		and[85][i].a <== states[i][82];
		and[85][i].b <== eq[0][i].out;
		states[i+1][83] <== and[85][i].out;
		state_changed[i].in[82] <== states[i+1][83];
		and[86][i] = AND();
		and[86][i].a <== states[i][83];
		and[86][i].b <== eq[14][i].out; // 60 = `<`
		states[i+1][84] <== and[86][i].out;
		state_changed[i].in[83] <== states[i+1][84];
		// 33 = `!`
		eq[25][i] = IsEqual();
		eq[25][i].in[0] <== in[i];
		eq[25][i].in[1] <== 33;
		and[87][i] = AND();
		and[87][i].a <== states[i][84];
		and[87][i].b <== eq[25][i].out;
		states[i+1][85] <== and[87][i].out;
		state_changed[i].in[84] <== states[i+1][85];
		// 45 = `-`
		eq[26][i] = IsEqual();
		eq[26][i].in[0] <== in[i];
		eq[26][i].in[1] <== 45;
		and[88][i] = AND();
		and[88][i].a <== states[i][85];
		and[88][i].b <== eq[26][i].out;
		states[i+1][86] <== and[88][i].out;
		state_changed[i].in[85] <== states[i+1][86];
		and[89][i] = AND();
		and[89][i].a <== states[i][86];
		and[89][i].b <== eq[26][i].out; // 45 = `-`
		states[i+1][87] <== and[89][i].out;
		state_changed[i].in[86] <== states[i+1][87];
		and[90][i] = AND();
		and[90][i].a <== states[i][87];
		and[90][i].b <== eq[0][i].out;
		states[i+1][88] <== and[90][i].out;
		state_changed[i].in[87] <== states[i+1][88];
		// 110 = `n`
		eq[27][i] = IsEqual();
		eq[27][i].in[0] <== in[i];
		eq[27][i].in[1] <== 110;
		and[91][i] = AND();
		and[91][i].a <== states[i][88];
		and[91][i].b <== eq[27][i].out;
		states[i+1][89] <== and[91][i].out;
		state_changed[i].in[88] <== states[i+1][89];
		// 111 = `o`
		eq[28][i] = IsEqual();
		eq[28][i].in[0] <== in[i];
		eq[28][i].in[1] <== 111;
		and[92][i] = AND();
		and[92][i].a <== states[i][89];
		and[92][i].b <== eq[28][i].out;
		states[i+1][90] <== and[92][i].out;
		state_changed[i].in[89] <== states[i+1][90];
		// 116 = `t`
		eq[29][i] = IsEqual();
		eq[29][i].in[0] <== in[i];
		eq[29][i].in[1] <== 116;
		and[93][i] = AND();
		and[93][i].a <== states[i][90];
		and[93][i].b <== eq[29][i].out;
		states[i+1][91] <== and[93][i].out;
		state_changed[i].in[90] <== states[i+1][91];
		// 101 = `e`
		eq[30][i] = IsEqual();
		eq[30][i].in[0] <== in[i];
		eq[30][i].in[1] <== 101;
		and[94][i] = AND();
		and[94][i].a <== states[i][91];
		and[94][i].b <== eq[30][i].out;
		states[i+1][92] <== and[94][i].out;
		state_changed[i].in[91] <== states[i+1][92];
		and[95][i] = AND();
		and[95][i].a <== states[i][92];
		and[95][i].b <== eq[0][i].out;
		states[i+1][93] <== and[95][i].out;
		state_changed[i].in[92] <== states[i+1][93];
		and[96][i] = AND();
		and[96][i].a <== states[i][93];
		and[96][i].b <== eq[26][i].out; // 45 = `-`
		states[i+1][94] <== and[96][i].out;
		state_changed[i].in[93] <== states[i+1][94];
		and[97][i] = AND();
		and[97][i].a <== states[i][94];
		and[97][i].b <== eq[26][i].out; // 45 = `-`
		states[i+1][95] <== and[97][i].out;
		state_changed[i].in[94] <== states[i+1][95];
		and[98][i] = AND();
		and[98][i].a <== states[i][95];
		and[98][i].b <== eq[17][i].out; // 62 = `>`
		states[i+1][96] <== and[98][i].out;
		state_changed[i].in[95] <== states[i+1][96];
		and[99][i] = AND();
		and[99][i].a <== states[i][96];
		and[99][i].b <== eq[18][i].out; // 13 = `\r`
		states[i+1][97] <== and[99][i].out;
		state_changed[i].in[96] <== states[i+1][97];
		and[100][i] = AND();
		and[100][i].a <== states[i][97];
		and[100][i].b <== eq[13][i].out; // 10 = `\n`
		states[i+1][98] <== and[100][i].out;
		state_changed[i].in[97] <== states[i+1][98];
		and[101][i] = AND();
		and[101][i].a <== states[i][76];
		and[101][i].b <== eq[0][i].out;
		states[i+1][99] <== and[101][i].out;
		state_changed[i].in[98] <== states[i+1][99];
		and[102][i] = AND();
		and[102][i].a <== states[i][99];
		and[102][i].b <== eq[0][i].out;
		states[i+1][100] <== and[102][i].out;
		state_changed[i].in[99] <== states[i+1][100];
		and[103][i] = AND();
		and[103][i].a <== states[i][100];
		and[103][i].b <== eq[0][i].out;
		states[i+1][101] <== and[103][i].out;
		state_changed[i].in[100] <== states[i+1][101];
		and[104][i] = AND();
		and[104][i].a <== states[i][101];
		and[104][i].b <== eq[0][i].out;
		states[i+1][102] <== and[104][i].out;
		state_changed[i].in[101] <== states[i+1][102];
		and[105][i] = AND();
		and[105][i].a <== states[i][102];
		and[105][i].b <== eq[0][i].out;
		states[i+1][103] <== and[105][i].out;
		state_changed[i].in[102] <== states[i+1][103];
		and[106][i] = AND();
		and[106][i].a <== states[i][103];
		and[106][i].b <== eq[0][i].out;
		states[i+1][104] <== and[106][i].out;
		state_changed[i].in[103] <== states[i+1][104];
		and[107][i] = AND();
		and[107][i].a <== states[i][104];
		and[107][i].b <== eq[0][i].out;
		states[i+1][105] <== and[107][i].out;
		state_changed[i].in[104] <== states[i+1][105];
		and[108][i] = AND();
		and[108][i].a <== states[i][105];
		and[108][i].b <== eq[0][i].out;
		states[i+1][106] <== and[108][i].out;
		state_changed[i].in[105] <== states[i+1][106];
		and[109][i] = AND();
		and[109][i].a <== states[i][106];
		and[109][i].b <== eq[0][i].out;
		states[i+1][107] <== and[109][i].out;
		state_changed[i].in[106] <== states[i+1][107];
		and[110][i] = AND();
		and[110][i].a <== states[i][107];
		and[110][i].b <== eq[14][i].out; // 60 = `<`
		states[i+1][108] <== and[110][i].out;
		state_changed[i].in[107] <== states[i+1][108];
		and[111][i] = AND();
		and[111][i].a <== states[i][108];
		and[111][i].b <== eq[16][i].out; // 97 = `a`
		states[i+1][109] <== and[111][i].out;
		state_changed[i].in[108] <== states[i+1][109];
		and[112][i] = AND();
		and[112][i].a <== states[i][109];
		and[112][i].b <== eq[0][i].out;
		states[i+1][110] <== and[112][i].out;
		state_changed[i].in[109] <== states[i+1][110];
		// 115 = `s`
		eq[31][i] = IsEqual();
		eq[31][i].in[0] <== in[i];
		eq[31][i].in[1] <== 115;
		and[113][i] = AND();
		and[113][i].a <== states[i][110];
		and[113][i].b <== eq[31][i].out;
		states[i+1][111] <== and[113][i].out;
		state_changed[i].in[110] <== states[i+1][111];
		and[114][i] = AND();
		and[114][i].a <== states[i][111];
		and[114][i].b <== eq[29][i].out; // 116 = `t`
		states[i+1][112] <== and[114][i].out;
		state_changed[i].in[111] <== states[i+1][112];
		// 121 = `y`
		eq[32][i] = IsEqual();
		eq[32][i].in[0] <== in[i];
		eq[32][i].in[1] <== 121;
		and[115][i] = AND();
		and[115][i].a <== states[i][112];
		and[115][i].b <== eq[32][i].out;
		states[i+1][113] <== and[115][i].out;
		state_changed[i].in[112] <== states[i+1][113];
		// 108 = `l`
		eq[33][i] = IsEqual();
		eq[33][i].in[0] <== in[i];
		eq[33][i].in[1] <== 108;
		and[116][i] = AND();
		and[116][i].a <== states[i][113];
		and[116][i].b <== eq[33][i].out;
		states[i+1][114] <== and[116][i].out;
		state_changed[i].in[113] <== states[i+1][114];
		and[117][i] = AND();
		and[117][i].a <== states[i][114];
		and[117][i].b <== eq[30][i].out; // 101 = `e`
		states[i+1][115] <== and[117][i].out;
		state_changed[i].in[114] <== states[i+1][115];
		and[118][i] = AND();
		and[118][i].a <== states[i][115];
		and[118][i].b <== eq[19][i].out; // 61 = `=`
		states[i+1][116] <== and[118][i].out;
		state_changed[i].in[115] <== states[i+1][116];
		// 51 = `3`
		eq[34][i] = IsEqual();
		eq[34][i].in[0] <== in[i];
		eq[34][i].in[1] <== 51;
		and[119][i] = AND();
		and[119][i].a <== states[i][116];
		and[119][i].b <== eq[34][i].out;
		states[i+1][117] <== and[119][i].out;
		state_changed[i].in[116] <== states[i+1][117];
		and[120][i] = AND();
		and[120][i].a <== states[i][0];
		and[120][i].b <== eq[14][i].out; // 60 = `<`
		states[i+1][118] <== and[120][i].out;
		state_changed[i].in[117] <== states[i+1][118];
		// 68 = `D`
		eq[35][i] = IsEqual();
		eq[35][i].in[0] <== in[i];
		eq[35][i].in[1] <== 68;
		and[121][i] = AND();
		and[121][i].a <== states[i][117];
		and[121][i].b <== eq[35][i].out;
		states[i+1][119] <== and[121][i].out;
		state_changed[i].in[118] <== states[i+1][119];
		// 34 = `"`
		eq[36][i] = IsEqual();
		eq[36][i].in[0] <== in[i];
		eq[36][i].in[1] <== 34;
		and[122][i] = AND();
		and[122][i].a <== states[i][119];
		and[122][i].b <== eq[36][i].out;
		states[i+1][120] <== and[122][i].out;
		state_changed[i].in[119] <== states[i+1][120];
		// 99 = `c`
		eq[37][i] = IsEqual();
		eq[37][i].in[0] <== in[i];
		eq[37][i].in[1] <== 99;
		and[123][i] = AND();
		and[123][i].a <== states[i][120];
		and[123][i].b <== eq[37][i].out;
		states[i+1][121] <== and[123][i].out;
		state_changed[i].in[120] <== states[i+1][121];
		and[124][i] = AND();
		and[124][i].a <== states[i][121];
		and[124][i].b <== eq[28][i].out; // 111 = `o`
		states[i+1][122] <== and[124][i].out;
		state_changed[i].in[121] <== states[i+1][122];
		and[125][i] = AND();
		and[125][i].a <== states[i][122];
		and[125][i].b <== eq[33][i].out; // 108 = `l`
		states[i+1][123] <== and[125][i].out;
		state_changed[i].in[122] <== states[i+1][123];
		and[126][i] = AND();
		and[126][i].a <== states[i][123];
		and[126][i].b <== eq[28][i].out; // 111 = `o`
		states[i+1][124] <== and[126][i].out;
		state_changed[i].in[123] <== states[i+1][124];
		// 114 = `r`
		eq[38][i] = IsEqual();
		eq[38][i].in[0] <== in[i];
		eq[38][i].in[1] <== 114;
		and[127][i] = AND();
		and[127][i].a <== states[i][124];
		and[127][i].b <== eq[38][i].out;
		states[i+1][125] <== and[127][i].out;
		state_changed[i].in[124] <== states[i+1][125];
		// 58 = `:`
		eq[39][i] = IsEqual();
		eq[39][i].in[0] <== in[i];
		eq[39][i].in[1] <== 58;
		and[128][i] = AND();
		and[128][i].a <== states[i][125];
		and[128][i].b <== eq[39][i].out;
		states[i+1][126] <== and[128][i].out;
		state_changed[i].in[125] <== states[i+1][126];
		// 35 = `#`
		eq[40][i] = IsEqual();
		eq[40][i].in[0] <== in[i];
		eq[40][i].in[1] <== 35;
		and[129][i] = AND();
		and[129][i].a <== states[i][126];
		and[129][i].b <== eq[40][i].out;
		states[i+1][127] <== and[129][i].out;
		state_changed[i].in[126] <== states[i+1][127];
		and[130][i] = AND();
		and[130][i].a <== states[i][127];
		and[130][i].b <== eq[21][i].out; // 48 = `0`
		states[i+1][128] <== and[130][i].out;
		state_changed[i].in[127] <== states[i+1][128];
		and[131][i] = AND();
		and[131][i].a <== states[i][128];
		and[131][i].b <== eq[21][i].out; // 48 = `0`
		states[i+1][129] <== and[131][i].out;
		state_changed[i].in[128] <== states[i+1][129];
		// 55 = `7`
		eq[41][i] = IsEqual();
		eq[41][i].in[0] <== in[i];
		eq[41][i].in[1] <== 55;
		and[132][i] = AND();
		and[132][i].a <== states[i][129];
		and[132][i].b <== eq[41][i].out;
		states[i+1][130] <== and[132][i].out;
		state_changed[i].in[129] <== states[i+1][130];
		// 52 = `4`
		eq[42][i] = IsEqual();
		eq[42][i].in[0] <== in[i];
		eq[42][i].in[1] <== 52;
		and[133][i] = AND();
		and[133][i].a <== states[i][130];
		and[133][i].b <== eq[42][i].out;
		states[i+1][131] <== and[133][i].out;
		state_changed[i].in[130] <== states[i+1][131];
		and[134][i] = AND();
		and[134][i].a <== states[i][131];
		and[134][i].b <== eq[35][i].out; // 68 = `D`
		states[i+1][132] <== and[134][i].out;
		state_changed[i].in[131] <== states[i+1][132];
		// 69 = `E`
		eq[43][i] = IsEqual();
		eq[43][i].in[0] <== in[i];
		eq[43][i].in[1] <== 69;
		and[135][i] = AND();
		and[135][i].a <== states[i][132];
		and[135][i].b <== eq[43][i].out;
		states[i+1][133] <== and[135][i].out;
		state_changed[i].in[132] <== states[i+1][133];
		// 59 = `;`
		eq[44][i] = IsEqual();
		eq[44][i].in[0] <== in[i];
		eq[44][i].in[1] <== 59;
		and[136][i] = AND();
		and[136][i].a <== states[i][133];
		and[136][i].b <== eq[44][i].out;
		states[i+1][134] <== and[136][i].out;
		state_changed[i].in[133] <== states[i+1][134];
		and[137][i] = AND();
		and[137][i].a <== states[i][134];
		and[137][i].b <== eq[0][i].out;
		states[i+1][135] <== and[137][i].out;
		state_changed[i].in[134] <== states[i+1][135];
		and[138][i] = AND();
		and[138][i].a <== states[i][135];
		and[138][i].b <== eq[29][i].out; // 116 = `t`
		states[i+1][136] <== and[138][i].out;
		state_changed[i].in[135] <== states[i+1][136];
		and[139][i] = AND();
		and[139][i].a <== states[i][136];
		and[139][i].b <== eq[30][i].out; // 101 = `e`
		states[i+1][137] <== and[139][i].out;
		state_changed[i].in[136] <== states[i+1][137];
		// 120 = `x`
		eq[45][i] = IsEqual();
		eq[45][i].in[0] <== in[i];
		eq[45][i].in[1] <== 120;
		and[140][i] = AND();
		and[140][i].a <== states[i][137];
		and[140][i].b <== eq[45][i].out;
		states[i+1][138] <== and[140][i].out;
		state_changed[i].in[137] <== states[i+1][138];
		and[141][i] = AND();
		and[141][i].a <== states[i][138];
		and[141][i].b <== eq[29][i].out; // 116 = `t`
		states[i+1][139] <== and[141][i].out;
		state_changed[i].in[138] <== states[i+1][139];
		and[142][i] = AND();
		and[142][i].a <== states[i][139];
		and[142][i].b <== eq[26][i].out; // 45 = `-`
		states[i+1][140] <== and[142][i].out;
		state_changed[i].in[139] <== states[i+1][140];
		and[143][i] = AND();
		and[143][i].a <== states[i][140];
		and[143][i].b <== eq[22][i].out; // 100 = `d`
		states[i+1][141] <== and[143][i].out;
		state_changed[i].in[140] <== states[i+1][141];
		and[144][i] = AND();
		and[144][i].a <== states[i][141];
		and[144][i].b <== eq[30][i].out; // 101 = `e`
		states[i+1][142] <== and[144][i].out;
		state_changed[i].in[141] <== states[i+1][142];
		and[145][i] = AND();
		and[145][i].a <== states[i][142];
		and[145][i].b <== eq[37][i].out; // 99 = `c`
		states[i+1][143] <== and[145][i].out;
		state_changed[i].in[142] <== states[i+1][143];
		and[146][i] = AND();
		and[146][i].a <== states[i][143];
		and[146][i].b <== eq[28][i].out; // 111 = `o`
		states[i+1][144] <== and[146][i].out;
		state_changed[i].in[143] <== states[i+1][144];
		and[147][i] = AND();
		and[147][i].a <== states[i][118];
		and[147][i].b <== eq[25][i].out; // 33 = `!`
		states[i+1][145] <== and[147][i].out;
		state_changed[i].in[144] <== states[i+1][145];
		and[148][i] = AND();
		and[148][i].a <== states[i][144];
		and[148][i].b <== eq[38][i].out; // 114 = `r`
		states[i+1][146] <== and[148][i].out;
		state_changed[i].in[145] <== states[i+1][146];
		and[149][i] = AND();
		and[149][i].a <== states[i][146];
		and[149][i].b <== eq[16][i].out; // 97 = `a`
		states[i+1][147] <== and[149][i].out;
		state_changed[i].in[146] <== states[i+1][147];
		and[150][i] = AND();
		and[150][i].a <== states[i][147];
		and[150][i].b <== eq[29][i].out; // 116 = `t`
		states[i+1][148] <== and[150][i].out;
		state_changed[i].in[147] <== states[i+1][148];
		and[151][i] = AND();
		and[151][i].a <== states[i][148];
		and[151][i].b <== eq[23][i].out; // 105 = `i`
		states[i+1][149] <== and[151][i].out;
		state_changed[i].in[148] <== states[i+1][149];
		and[152][i] = AND();
		and[152][i].a <== states[i][149];
		and[152][i].b <== eq[28][i].out; // 111 = `o`
		states[i+1][150] <== and[152][i].out;
		state_changed[i].in[149] <== states[i+1][150];
		and[153][i] = AND();
		and[153][i].a <== states[i][150];
		and[153][i].b <== eq[27][i].out; // 110 = `n`
		states[i+1][151] <== and[153][i].out;
		state_changed[i].in[150] <== states[i+1][151];
		and[154][i] = AND();
		and[154][i].a <== states[i][151];
		and[154][i].b <== eq[39][i].out; // 58 = `:`
		states[i+1][152] <== and[154][i].out;
		state_changed[i].in[151] <== states[i+1][152];
		and[155][i] = AND();
		and[155][i].a <== states[i][152];
		and[155][i].b <== eq[27][i].out; // 110 = `n`
		states[i+1][153] <== and[155][i].out;
		state_changed[i].in[152] <== states[i+1][153];
		and[156][i] = AND();
		and[156][i].a <== states[i][153];
		and[156][i].b <== eq[28][i].out; // 111 = `o`
		states[i+1][154] <== and[156][i].out;
		state_changed[i].in[153] <== states[i+1][154];
		and[157][i] = AND();
		and[157][i].a <== states[i][154];
		and[157][i].b <== eq[27][i].out; // 110 = `n`
		states[i+1][155] <== and[157][i].out;
		state_changed[i].in[154] <== states[i+1][155];
		and[158][i] = AND();
		and[158][i].a <== states[i][155];
		and[158][i].b <== eq[30][i].out; // 101 = `e`
		states[i+1][156] <== and[158][i].out;
		state_changed[i].in[155] <== states[i+1][156];
		and[159][i] = AND();
		and[159][i].a <== states[i][156];
		and[159][i].b <== eq[36][i].out; // 34 = `"`
		states[i+1][157] <== and[159][i].out;
		state_changed[i].in[156] <== states[i+1][157];
		and[160][i] = AND();
		and[160][i].a <== states[i][157];
		and[160][i].b <== eq[18][i].out; // 13 = `\r`
		states[i+1][158] <== and[160][i].out;
		state_changed[i].in[157] <== states[i+1][158];
		and[161][i] = AND();
		and[161][i].a <== states[i][158];
		and[161][i].b <== eq[13][i].out; // 10 = `\n`
		states[i+1][159] <== and[161][i].out;
		state_changed[i].in[158] <== states[i+1][159];
		and[162][i] = AND();
		and[162][i].a <== states[i][159];
		and[162][i].b <== eq[0][i].out;
		states[i+1][160] <== and[162][i].out;
		state_changed[i].in[159] <== states[i+1][160];
		and[163][i] = AND();
		and[163][i].a <== states[i][160];
		and[163][i].b <== eq[0][i].out;
		states[i+1][161] <== and[163][i].out;
		state_changed[i].in[160] <== states[i+1][161];
		and[164][i] = AND();
		and[164][i].a <== states[i][161];
		and[164][i].b <== eq[0][i].out;
		states[i+1][162] <== and[164][i].out;
		state_changed[i].in[161] <== states[i+1][162];
		and[165][i] = AND();
		and[165][i].a <== states[i][162];
		and[165][i].b <== eq[0][i].out;
		states[i+1][163] <== and[165][i].out;
		state_changed[i].in[162] <== states[i+1][163];
		and[166][i] = AND();
		and[166][i].a <== states[i][163];
		and[166][i].b <== eq[0][i].out;
		states[i+1][164] <== and[166][i].out;
		state_changed[i].in[163] <== states[i+1][164];
		and[167][i] = AND();
		and[167][i].a <== states[i][164];
		and[167][i].b <== eq[0][i].out;
		states[i+1][165] <== and[167][i].out;
		state_changed[i].in[164] <== states[i+1][165];
		and[168][i] = AND();
		and[168][i].a <== states[i][165];
		and[168][i].b <== eq[0][i].out;
		states[i+1][166] <== and[168][i].out;
		state_changed[i].in[165] <== states[i+1][166];
		and[169][i] = AND();
		and[169][i].a <== states[i][166];
		and[169][i].b <== eq[0][i].out;
		states[i+1][167] <== and[169][i].out;
		state_changed[i].in[166] <== states[i+1][167];
		and[170][i] = AND();
		and[170][i].a <== states[i][167];
		and[170][i].b <== eq[0][i].out;
		states[i+1][168] <== and[170][i].out;
		state_changed[i].in[167] <== states[i+1][168];
		and[171][i] = AND();
		and[171][i].a <== states[i][168];
		and[171][i].b <== eq[0][i].out;
		states[i+1][169] <== and[171][i].out;
		state_changed[i].in[168] <== states[i+1][169];
		and[172][i] = AND();
		and[172][i].a <== states[i][169];
		and[172][i].b <== eq[0][i].out;
		states[i+1][170] <== and[172][i].out;
		state_changed[i].in[169] <== states[i+1][170];
		and[173][i] = AND();
		and[173][i].a <== states[i][170];
		and[173][i].b <== eq[0][i].out;
		states[i+1][171] <== and[173][i].out;
		state_changed[i].in[170] <== states[i+1][171];
		and[174][i] = AND();
		and[174][i].a <== states[i][145];
		and[174][i].b <== eq[26][i].out;
		states[i+1][172] <== and[174][i].out;
		state_changed[i].in[171] <== states[i+1][172];
		and[175][i] = AND();
		and[175][i].a <== states[i][171];
		and[175][i].b <== eq[0][i].out;
		states[i+1][173] <== and[175][i].out;
		state_changed[i].in[172] <== states[i+1][173];
		and[176][i] = AND();
		and[176][i].a <== states[i][173];
		and[176][i].b <== eq[0][i].out;
		states[i+1][174] <== and[176][i].out;
		state_changed[i].in[173] <== states[i+1][174];
		and[177][i] = AND();
		and[177][i].a <== states[i][174];
		and[177][i].b <== eq[0][i].out;
		states[i+1][175] <== and[177][i].out;
		state_changed[i].in[174] <== states[i+1][175];
		and[178][i] = AND();
		and[178][i].a <== states[i][175];
		and[178][i].b <== eq[0][i].out;
		states[i+1][176] <== and[178][i].out;
		state_changed[i].in[175] <== states[i+1][176];
		and[179][i] = AND();
		and[179][i].a <== states[i][176];
		and[179][i].b <== eq[0][i].out;
		states[i+1][177] <== and[179][i].out;
		state_changed[i].in[176] <== states[i+1][177];
		and[180][i] = AND();
		and[180][i].a <== states[i][177];
		and[180][i].b <== eq[0][i].out;
		states[i+1][178] <== and[180][i].out;
		state_changed[i].in[177] <== states[i+1][178];
		and[181][i] = AND();
		and[181][i].a <== states[i][178];
		and[181][i].b <== eq[0][i].out;
		states[i+1][179] <== and[181][i].out;
		state_changed[i].in[178] <== states[i+1][179];
		and[182][i] = AND();
		and[182][i].a <== states[i][179];
		and[182][i].b <== eq[19][i].out; // 61 = `=`
		states[i+1][180] <== and[182][i].out;
		state_changed[i].in[179] <== states[i+1][180];
		and[183][i] = AND();
		and[183][i].a <== states[i][180];
		and[183][i].b <== eq[20][i].out; // 50 = `2`
		states[i+1][181] <== and[183][i].out;
		state_changed[i].in[180] <== states[i+1][181];
		and[184][i] = AND();
		and[184][i].a <== states[i][181];
		and[184][i].b <== eq[21][i].out; // 48 = `0`
		states[i+1][182] <== and[184][i].out;
		state_changed[i].in[181] <== states[i+1][182];
		and[185][i] = AND();
		and[185][i].a <== states[i][182];
		and[185][i].b <== eq[18][i].out; // 13 = `\r`
		states[i+1][183] <== and[185][i].out;
		state_changed[i].in[182] <== states[i+1][183];
		and[186][i] = AND();
		and[186][i].a <== states[i][183];
		and[186][i].b <== eq[13][i].out; // 10 = `\n`
		states[i+1][184] <== and[186][i].out;
		state_changed[i].in[183] <== states[i+1][184];
		and[187][i] = AND();
		and[187][i].a <== states[i][184];
		and[187][i].b <== eq[0][i].out;
		states[i+1][185] <== and[187][i].out;
		state_changed[i].in[184] <== states[i+1][185];
		and[188][i] = AND();
		and[188][i].a <== states[i][185];
		and[188][i].b <== eq[0][i].out;
		states[i+1][186] <== and[188][i].out;
		state_changed[i].in[185] <== states[i+1][186];
		and[189][i] = AND();
		and[189][i].a <== states[i][186];
		and[189][i].b <== eq[0][i].out;
		states[i+1][187] <== and[189][i].out;
		state_changed[i].in[186] <== states[i+1][187];
		and[190][i] = AND();
		and[190][i].a <== states[i][187];
		and[190][i].b <== eq[0][i].out;
		states[i+1][188] <== and[190][i].out;
		state_changed[i].in[187] <== states[i+1][188];
		and[191][i] = AND();
		and[191][i].a <== states[i][188];
		and[191][i].b <== eq[0][i].out;
		states[i+1][189] <== and[191][i].out;
		state_changed[i].in[188] <== states[i+1][189];
		and[192][i] = AND();
		and[192][i].a <== states[i][189];
		and[192][i].b <== eq[0][i].out;
		states[i+1][190] <== and[192][i].out;
		state_changed[i].in[189] <== states[i+1][190];
		and[193][i] = AND();
		and[193][i].a <== states[i][190];
		and[193][i].b <== eq[0][i].out;
		states[i+1][191] <== and[193][i].out;
		state_changed[i].in[190] <== states[i+1][191];
		and[194][i] = AND();
		and[194][i].a <== states[i][191];
		and[194][i].b <== eq[0][i].out;
		states[i+1][192] <== and[194][i].out;
		state_changed[i].in[191] <== states[i+1][192];
		and[195][i] = AND();
		and[195][i].a <== states[i][192];
		and[195][i].b <== eq[0][i].out;
		states[i+1][193] <== and[195][i].out;
		state_changed[i].in[192] <== states[i+1][193];
		and[196][i] = AND();
		and[196][i].a <== states[i][193];
		and[196][i].b <== eq[0][i].out;
		states[i+1][194] <== and[196][i].out;
		state_changed[i].in[193] <== states[i+1][194];
		and[197][i] = AND();
		and[197][i].a <== states[i][194];
		and[197][i].b <== eq[0][i].out;
		states[i+1][195] <== and[197][i].out;
		state_changed[i].in[194] <== states[i+1][195];
		and[198][i] = AND();
		and[198][i].a <== states[i][195];
		and[198][i].b <== eq[0][i].out;
		states[i+1][196] <== and[198][i].out;
		state_changed[i].in[195] <== states[i+1][196];
		and[199][i] = AND();
		and[199][i].a <== states[i][196];
		and[199][i].b <== eq[0][i].out;
		states[i+1][197] <== and[199][i].out;
		state_changed[i].in[196] <== states[i+1][197];
		and[200][i] = AND();
		and[200][i].a <== states[i][197];
		and[200][i].b <== eq[0][i].out;
		states[i+1][198] <== and[200][i].out;
		state_changed[i].in[197] <== states[i+1][198];
		and[201][i] = AND();
		and[201][i].a <== states[i][172];
		and[201][i].b <== eq[26][i].out; // 45 = `-`
		states[i+1][199] <== and[201][i].out;
		state_changed[i].in[198] <== states[i+1][199];
		and[202][i] = AND();
		and[202][i].a <== states[i][198];
		and[202][i].b <== eq[0][i].out;
		states[i+1][200] <== and[202][i].out;
		state_changed[i].in[199] <== states[i+1][200];
		and[203][i] = AND();
		and[203][i].a <== states[i][200];
		and[203][i].b <== eq[0][i].out;
		states[i+1][201] <== and[203][i].out;
		state_changed[i].in[200] <== states[i+1][201];
		and[204][i] = AND();
		and[204][i].a <== states[i][201];
		and[204][i].b <== eq[0][i].out;
		states[i+1][202] <== and[204][i].out;
		state_changed[i].in[201] <== states[i+1][202];
		and[205][i] = AND();
		and[205][i].a <== states[i][202];
		and[205][i].b <== eq[0][i].out;
		states[i+1][203] <== and[205][i].out;
		state_changed[i].in[202] <== states[i+1][203];
		and[206][i] = AND();
		and[206][i].a <== states[i][203];
		and[206][i].b <== eq[0][i].out;
		states[i+1][204] <== and[206][i].out;
		state_changed[i].in[203] <== states[i+1][204];
		and[207][i] = AND();
		and[207][i].a <== states[i][204];
		and[207][i].b <== eq[0][i].out;
		states[i+1][205] <== and[207][i].out;
		state_changed[i].in[204] <== states[i+1][205];
		// 104 = `h`
		eq[46][i] = IsEqual();
		eq[46][i].in[0] <== in[i];
		eq[46][i].in[1] <== 104;
		and[208][i] = AND();
		and[208][i].a <== states[i][205];
		and[208][i].b <== eq[46][i].out;
		states[i+1][206] <== and[208][i].out;
		state_changed[i].in[205] <== states[i+1][206];
		and[209][i] = AND();
		and[209][i].a <== states[i][206];
		and[209][i].b <== eq[38][i].out; // 114 = `r`
		states[i+1][207] <== and[209][i].out;
		state_changed[i].in[206] <== states[i+1][207];
		and[210][i] = AND();
		and[210][i].a <== states[i][207];
		and[210][i].b <== eq[30][i].out; // 101 = `e`
		states[i+1][208] <== and[210][i].out;
		state_changed[i].in[207] <== states[i+1][208];
		// 102 = `f`
		eq[47][i] = IsEqual();
		eq[47][i].in[0] <== in[i];
		eq[47][i].in[1] <== 102;
		and[211][i] = AND();
		and[211][i].a <== states[i][208];
		and[211][i].b <== eq[47][i].out;
		states[i+1][209] <== and[211][i].out;
		state_changed[i].in[208] <== states[i+1][209];
		and[212][i] = AND();
		and[212][i].a <== states[i][209];
		and[212][i].b <== eq[19][i].out; // 61 = `=`
		states[i+1][210] <== and[212][i].out;
		state_changed[i].in[209] <== states[i+1][210];
		and[213][i] = AND();
		and[213][i].a <== states[i][210];
		and[213][i].b <== eq[34][i].out; // 51 = `3`
		states[i+1][211] <== and[213][i].out;
		state_changed[i].in[210] <== states[i+1][211];
		and[214][i] = AND();
		and[214][i].a <== states[i][211];
		and[214][i].b <== eq[35][i].out; // 68 = `D`
		states[i+1][212] <== and[214][i].out;
		state_changed[i].in[211] <== states[i+1][212];
		and[215][i] = AND();
		and[215][i].a <== states[i][212];
		and[215][i].b <== eq[36][i].out; // 34 = `"`
		states[i+1][213] <== and[215][i].out;
		state_changed[i].in[212] <== states[i+1][213];
		and[216][i] = AND();
		and[216][i].a <== states[i][213];
		and[216][i].b <== eq[46][i].out; // 104 = `h`
		states[i+1][214] <== and[216][i].out;
		state_changed[i].in[213] <== states[i+1][214];
		and[217][i] = AND();
		and[217][i].a <== states[i][214];
		and[217][i].b <== eq[29][i].out; // 116 = `t`
		states[i+1][215] <== and[217][i].out;
		state_changed[i].in[214] <== states[i+1][215];
		and[218][i] = AND();
		and[218][i].a <== states[i][215];
		and[218][i].b <== eq[29][i].out; // 116 = `t`
		states[i+1][216] <== and[218][i].out;
		state_changed[i].in[215] <== states[i+1][216];
		// 112 = `p`
		eq[48][i] = IsEqual();
		eq[48][i].in[0] <== in[i];
		eq[48][i].in[1] <== 112;
		and[219][i] = AND();
		and[219][i].a <== states[i][216];
		and[219][i].b <== eq[48][i].out;
		states[i+1][217] <== and[219][i].out;
		state_changed[i].in[216] <== states[i+1][217];
		and[220][i] = AND();
		and[220][i].a <== states[i][217];
		and[220][i].b <== eq[31][i].out; // 115 = `s`
		states[i+1][218] <== and[220][i].out;
		state_changed[i].in[217] <== states[i+1][218];
		and[221][i] = AND();
		and[221][i].a <== states[i][218];
		and[221][i].b <== eq[39][i].out; // 58 = `:`
		states[i+1][219] <== and[221][i].out;
		state_changed[i].in[218] <== states[i+1][219];
		and[222][i] = AND();
		and[222][i].a <== states[i][219];
		and[222][i].b <== eq[15][i].out; // 47 = `/`
		states[i+1][220] <== and[222][i].out;
		state_changed[i].in[219] <== states[i+1][220];
		and[223][i] = AND();
		and[223][i].a <== states[i][220];
		and[223][i].b <== eq[15][i].out; // 47 = `/`
		states[i+1][221] <== and[223][i].out;
		state_changed[i].in[220] <== states[i+1][221];
		and[224][i] = AND();
		and[224][i].a <== states[i][221];
		and[224][i].b <== eq[24][i].out; // 118 = `v`
		states[i+1][222] <== and[224][i].out;
		state_changed[i].in[221] <== states[i+1][222];
		and[225][i] = AND();
		and[225][i].a <== states[i][222];
		and[225][i].b <== eq[30][i].out; // 101 = `e`
		states[i+1][223] <== and[225][i].out;
		state_changed[i].in[222] <== states[i+1][223];
		and[226][i] = AND();
		and[226][i].a <== states[i][223];
		and[226][i].b <== eq[27][i].out; // 110 = `n`
		states[i+1][224] <== and[226][i].out;
		state_changed[i].in[223] <== states[i+1][224];
		// 109 = `m`
		eq[49][i] = IsEqual();
		eq[49][i].in[0] <== in[i];
		eq[49][i].in[1] <== 109;
		and[227][i] = AND();
		and[227][i].a <== states[i][224];
		and[227][i].b <== eq[49][i].out;
		states[i+1][225] <== and[227][i].out;
		state_changed[i].in[224] <== states[i+1][225];
		and[228][i] = AND();
		and[228][i].a <== states[i][199];
		and[228][i].b <== eq[0][i].out;
		states[i+1][226] <== and[228][i].out;
		state_changed[i].in[225] <== states[i+1][226];
		and[229][i] = AND();
		and[229][i].a <== states[i][225];
		and[229][i].b <== eq[28][i].out; // 111 = `o`
		states[i+1][227] <== and[229][i].out;
		state_changed[i].in[226] <== states[i+1][227];
		// 46 = `.`
		eq[50][i] = IsEqual();
		eq[50][i].in[0] <== in[i];
		eq[50][i].in[1] <== 46;
		and[230][i] = AND();
		and[230][i].a <== states[i][227];
		and[230][i].b <== eq[50][i].out;
		states[i+1][228] <== and[230][i].out;
		state_changed[i].in[227] <== states[i+1][228];
		and[231][i] = AND();
		and[231][i].a <== states[i][228];
		and[231][i].b <== eq[37][i].out; // 99 = `c`
		states[i+1][229] <== and[231][i].out;
		state_changed[i].in[228] <== states[i+1][229];
		and[232][i] = AND();
		and[232][i].a <== states[i][229];
		and[232][i].b <== eq[28][i].out; // 111 = `o`
		states[i+1][230] <== and[232][i].out;
		state_changed[i].in[229] <== states[i+1][230];
		and[233][i] = AND();
		and[233][i].a <== states[i][230];
		and[233][i].b <== eq[49][i].out; // 109 = `m`
		states[i+1][231] <== and[233][i].out;
		state_changed[i].in[230] <== states[i+1][231];
		and[234][i] = AND();
		and[234][i].a <== states[i][231];
		and[234][i].b <== eq[15][i].out; // 47 = `/`
		states[i+1][232] <== and[234][i].out;
		state_changed[i].in[231] <== states[i+1][232];
		and[235][i] = AND();
		and[235][i].a <== states[i][232];
		and[235][i].b <== eq[37][i].out; // 99 = `c`
		states[i+1][233] <== and[235][i].out;
		state_changed[i].in[232] <== states[i+1][233];
		and[236][i] = AND();
		and[236][i].a <== states[i][233];
		and[236][i].b <== eq[28][i].out; // 111 = `o`
		states[i+1][234] <== and[236][i].out;
		state_changed[i].in[233] <== states[i+1][234];
		and[237][i] = AND();
		and[237][i].a <== states[i][234];
		and[237][i].b <== eq[22][i].out; // 100 = `d`
		states[i+1][235] <== and[237][i].out;
		state_changed[i].in[234] <== states[i+1][235];
		and[238][i] = AND();
		and[238][i].a <== states[i][235];
		and[238][i].b <== eq[30][i].out; // 101 = `e`
		states[i+1][236] <== and[238][i].out;
		state_changed[i].in[235] <== states[i+1][236];
		// 63 = `?`
		eq[51][i] = IsEqual();
		eq[51][i].in[0] <== in[i];
		eq[51][i].in[1] <== 63;
		and[239][i] = AND();
		and[239][i].a <== states[i][236];
		and[239][i].b <== eq[51][i].out;
		states[i+1][237] <== and[239][i].out;
		state_changed[i].in[236] <== states[i+1][237];
		// 117 = `u`
		eq[52][i] = IsEqual();
		eq[52][i].in[0] <== in[i];
		eq[52][i].in[1] <== 117;
		and[240][i] = AND();
		and[240][i].a <== states[i][237];
		and[240][i].b <== eq[52][i].out;
		states[i+1][238] <== and[240][i].out;
		state_changed[i].in[237] <== states[i+1][238];
		and[241][i] = AND();
		and[241][i].a <== states[i][238];
		and[241][i].b <== eq[31][i].out; // 115 = `s`
		states[i+1][239] <== and[241][i].out;
		state_changed[i].in[238] <== states[i+1][239];
		and[242][i] = AND();
		and[242][i].a <== states[i][239];
		and[242][i].b <== eq[30][i].out; // 101 = `e`
		states[i+1][240] <== and[242][i].out;
		state_changed[i].in[239] <== states[i+1][240];
		and[243][i] = AND();
		and[243][i].a <== states[i][240];
		and[243][i].b <== eq[38][i].out; // 114 = `r`
		states[i+1][241] <== and[243][i].out;
		state_changed[i].in[240] <== states[i+1][241];
		// 95 = `_`
		eq[53][i] = IsEqual();
		eq[53][i].in[0] <== in[i];
		eq[53][i].in[1] <== 95;
		and[244][i] = AND();
		and[244][i].a <== states[i][241];
		and[244][i].b <== eq[53][i].out;
		states[i+1][242] <== and[244][i].out;
		state_changed[i].in[241] <== states[i+1][242];
		and[245][i] = AND();
		and[245][i].a <== states[i][242];
		and[245][i].b <== eq[23][i].out; // 105 = `i`
		states[i+1][243] <== and[245][i].out;
		state_changed[i].in[242] <== states[i+1][243];
		and[246][i] = AND();
		and[246][i].a <== states[i][243];
		and[246][i].b <== eq[22][i].out; // 100 = `d`
		states[i+1][244] <== and[246][i].out;
		state_changed[i].in[243] <== states[i+1][244];
		and[247][i] = AND();
		and[247][i].a <== states[i][244];
		and[247][i].b <== eq[19][i].out; // 61 = `=`
		states[i+1][245] <== and[247][i].out;
		state_changed[i].in[244] <== states[i+1][245];
		and[248][i] = AND();
		and[248][i].a <== states[i][245];
		and[248][i].b <== eq[34][i].out; // 51 = `3`
		states[i+1][246] <== and[248][i].out;
		state_changed[i].in[245] <== states[i+1][246];
		and[249][i] = AND();
		and[249][i].a <== states[i][246];
		and[249][i].b <== eq[35][i].out; // 68 = `D`
		states[i+1][247] <== and[249][i].out;
		state_changed[i].in[246] <== states[i+1][247];
		// 49 = `1`
		eq[54][i] = IsEqual();
		eq[54][i].in[0] <== in[i];
		eq[54][i].in[1] <== 49;
		// 53 = `5`
		eq[55][i] = IsEqual();
		eq[55][i].in[0] <== in[i];
		eq[55][i].in[1] <== 53;
		// 54 = `6`
		eq[56][i] = IsEqual();
		eq[56][i].in[0] <== in[i];
		eq[56][i].in[1] <== 54;
		// 56 = `8`
		eq[57][i] = IsEqual();
		eq[57][i].in[0] <== in[i];
		eq[57][i].in[1] <== 56;
		// 57 = `9`
		eq[58][i] = IsEqual();
		eq[58][i].in[0] <== in[i];
		eq[58][i].in[1] <== 57;
		and[250][i] = AND();
		and[250][i].a <== states[i][247];
		multi_or[2][i] = MultiOR(13);
		multi_or[2][i].in[0] <== eq[13][i].out; // 10 = `\n`
		multi_or[2][i].in[1] <== eq[18][i].out; // 13 = `\r`
		multi_or[2][i].in[2] <== eq[21][i].out; // 48 = `0`
		multi_or[2][i].in[3] <== eq[54][i].out;
		multi_or[2][i].in[4] <== eq[20][i].out; // 50 = `2`
		multi_or[2][i].in[5] <== eq[34][i].out; // 51 = `3`
		multi_or[2][i].in[6] <== eq[42][i].out; // 52 = `4`
		multi_or[2][i].in[7] <== eq[55][i].out; // 53 = `5`
		multi_or[2][i].in[8] <== eq[56][i].out; // 54 = `6`
		multi_or[2][i].in[9] <== eq[41][i].out; // 55 = `7`
		multi_or[2][i].in[10] <== eq[57][i].out;
		multi_or[2][i].in[11] <== eq[58][i].out;
		multi_or[2][i].in[12] <== eq[19][i].out; // 61 = `=`
		and[250][i].b <== multi_or[2][i].out;
		and[251][i] = AND();
		and[251][i].a <== states[i][248];
		and[251][i].b <== multi_or[2][i].out;
		multi_or[3][i] = MultiOR(2);
		multi_or[3][i].in[0] <== and[250][i].out;
		multi_or[3][i].in[1] <== and[251][i].out;
		states[i+1][248] <== multi_or[3][i].out;
		state_changed[i].in[247] <== states[i+1][248];
		and[252][i] = AND();
		and[252][i].a <== states[i][226];
		and[252][i].b <== eq[38][i].out; // 114 = `r`
		states[i+1][249] <== and[252][i].out;
		state_changed[i].in[248] <== states[i+1][249];
		// 38 = `&`
		eq[59][i] = IsEqual();
		eq[59][i].in[0] <== in[i];
		eq[59][i].in[1] <== 38;
		and[253][i] = AND();
		and[253][i].a <== states[i][248];
		and[253][i].b <== eq[59][i].out;
		states[i+1][250] <== and[253][i].out;
		state_changed[i].in[249] <== states[i+1][250];
		and[254][i] = AND();
		and[254][i].a <== states[i][250];
		and[254][i].b <== eq[16][i].out; // 97 = `a`
		states[i+1][251] <== and[254][i].out;
		state_changed[i].in[250] <== states[i+1][251];
		and[255][i] = AND();
		and[255][i].a <== states[i][251];
		and[255][i].b <== eq[37][i].out; // 99 = `c`
		states[i+1][252] <== and[255][i].out;
		state_changed[i].in[251] <== states[i+1][252];
		and[256][i] = AND();
		and[256][i].a <== states[i][252];
		and[256][i].b <== eq[29][i].out; // 116 = `t`
		states[i+1][253] <== and[256][i].out;
		state_changed[i].in[252] <== states[i+1][253];
		and[257][i] = AND();
		and[257][i].a <== states[i][253];
		and[257][i].b <== eq[28][i].out; // 111 = `o`
		states[i+1][254] <== and[257][i].out;
		state_changed[i].in[253] <== states[i+1][254];
		and[258][i] = AND();
		and[258][i].a <== states[i][249];
		and[258][i].b <== eq[30][i].out; // 101 = `e`
		states[i+1][255] <== and[258][i].out;
		state_changed[i].in[254] <== states[i+1][255];
		and[259][i] = AND();
		and[259][i].a <== states[i][254];
		and[259][i].b <== eq[38][i].out; // 114 = `r`
		states[i+1][256] <== and[259][i].out;
		state_changed[i].in[255] <== states[i+1][256];
		and[260][i] = AND();
		and[260][i].a <== states[i][256];
		and[260][i].b <== eq[53][i].out; // 95 = `_`
		states[i+1][257] <== and[260][i].out;
		state_changed[i].in[256] <== states[i+1][257];
		and[261][i] = AND();
		and[261][i].a <== states[i][257];
		and[261][i].b <== eq[23][i].out; // 105 = `i`
		states[i+1][258] <== and[261][i].out;
		state_changed[i].in[257] <== states[i+1][258];
		and[262][i] = AND();
		and[262][i].a <== states[i][258];
		and[262][i].b <== eq[22][i].out; // 100 = `d`
		states[i+1][259] <== and[262][i].out;
		state_changed[i].in[258] <== states[i+1][259];
		and[263][i] = AND();
		and[263][i].a <== states[i][259];
		and[263][i].b <== eq[19][i].out; // 61 = `=`
		states[i+1][260] <== and[263][i].out;
		state_changed[i].in[259] <== states[i+1][260];
		and[264][i] = AND();
		and[264][i].a <== states[i][260];
		and[264][i].b <== eq[34][i].out; // 51 = `3`
		states[i+1][261] <== and[264][i].out;
		state_changed[i].in[260] <== states[i+1][261];
		and[265][i] = AND();
		and[265][i].a <== states[i][261];
		and[265][i].b <== eq[35][i].out; // 68 = `D`
		states[i+1][262] <== and[265][i].out;
		state_changed[i].in[261] <== states[i+1][262];
		and[266][i] = AND();
		and[266][i].a <== states[i][262];
		multi_or[4][i] = MultiOR(10);
		multi_or[4][i].in[0] <== eq[21][i].out; // 48 = `0`
		multi_or[4][i].in[1] <== eq[54][i].out; // 49 = `1`
		multi_or[4][i].in[2] <== eq[20][i].out; // 50 = `2`
		multi_or[4][i].in[3] <== eq[34][i].out; // 51 = `3`
		multi_or[4][i].in[4] <== eq[42][i].out; // 52 = `4`
		multi_or[4][i].in[5] <== eq[55][i].out; // 53 = `5`
		multi_or[4][i].in[6] <== eq[56][i].out; // 54 = `6`
		multi_or[4][i].in[7] <== eq[41][i].out; // 55 = `7`
		multi_or[4][i].in[8] <== eq[57][i].out; // 56 = `8`
		multi_or[4][i].in[9] <== eq[58][i].out; // 57 = `9`
		and[266][i].b <== multi_or[4][i].out;
		and[267][i] = AND();
		and[267][i].a <== states[i][263];
		and[267][i].b <== multi_or[4][i].out;
		multi_or[5][i] = MultiOR(2);
		multi_or[5][i].in[0] <== and[266][i].out;
		multi_or[5][i].in[1] <== and[267][i].out;
		states[i+1][263] <== multi_or[5][i].out;
		state_changed[i].in[262] <== states[i+1][263];
		and[268][i] = AND();
		and[268][i].a <== states[i][263];
		and[268][i].b <== eq[36][i].out; // 34 = `"`
		states[i+1][264] <== and[268][i].out;
		state_changed[i].in[263] <== states[i+1][264];
		and[269][i] = AND();
		and[269][i].a <== states[i][255];
		and[269][i].b <== eq[37][i].out; // 99 = `c`
		states[i+1][265] <== and[269][i].out;
		state_changed[i].in[264] <== states[i+1][265];
		and[270][i] = AND();
		and[270][i].a <== states[i][264];
		and[270][i].b <== eq[17][i].out; // 62 = `>`
		states[i+1][266] <== and[270][i].out;
		state_changed[i].in[265] <== states[i+1][266];
		and[271][i] = AND();
		and[271][i].a <== states[i][266];
		and[271][i].b <== eq[18][i].out; // 13 = `\r`
		states[i+1][267] <== and[271][i].out;
		state_changed[i].in[266] <== states[i+1][267];
		and[272][i] = AND();
		and[272][i].a <== states[i][267];
		and[272][i].b <== eq[13][i].out; // 10 = `\n`
		states[i+1][268] <== and[272][i].out;
		state_changed[i].in[267] <== states[i+1][268];
		and[273][i] = AND();
		and[273][i].a <== states[i][268];
		and[273][i].b <== eq[0][i].out;
		states[i+1][269] <== and[273][i].out;
		state_changed[i].in[268] <== states[i+1][269];
		and[274][i] = AND();
		and[274][i].a <== states[i][269];
		and[274][i].b <== eq[0][i].out;
		states[i+1][270] <== and[274][i].out;
		state_changed[i].in[269] <== states[i+1][270];
		and[275][i] = AND();
		and[275][i].a <== states[i][270];
		and[275][i].b <== eq[0][i].out;
		states[i+1][271] <== and[275][i].out;
		state_changed[i].in[270] <== states[i+1][271];
		and[276][i] = AND();
		and[276][i].a <== states[i][271];
		and[276][i].b <== eq[0][i].out;
		states[i+1][272] <== and[276][i].out;
		state_changed[i].in[271] <== states[i+1][272];
		and[277][i] = AND();
		and[277][i].a <== states[i][272];
		and[277][i].b <== eq[0][i].out;
		states[i+1][273] <== and[277][i].out;
		state_changed[i].in[272] <== states[i+1][273];
		and[278][i] = AND();
		and[278][i].a <== states[i][273];
		and[278][i].b <== eq[0][i].out;
		states[i+1][274] <== and[278][i].out;
		state_changed[i].in[273] <== states[i+1][274];
		and[279][i] = AND();
		and[279][i].a <== states[i][274];
		and[279][i].b <== eq[0][i].out;
		states[i+1][275] <== and[279][i].out;
		state_changed[i].in[274] <== states[i+1][275];
		and[280][i] = AND();
		and[280][i].a <== states[i][275];
		and[280][i].b <== eq[0][i].out;
		states[i+1][276] <== and[280][i].out;
		state_changed[i].in[275] <== states[i+1][276];
		and[281][i] = AND();
		and[281][i].a <== states[i][276];
		and[281][i].b <== eq[0][i].out;
		states[i+1][277] <== and[281][i].out;
		state_changed[i].in[276] <== states[i+1][277];
		and[282][i] = AND();
		and[282][i].a <== states[i][277];
		and[282][i].b <== eq[0][i].out;
		states[i+1][278] <== and[282][i].out;
		state_changed[i].in[277] <== states[i+1][278];
		and[283][i] = AND();
		and[283][i].a <== states[i][278];
		and[283][i].b <== eq[0][i].out;
		states[i+1][279] <== and[283][i].out;
		state_changed[i].in[278] <== states[i+1][279];
		and[284][i] = AND();
		and[284][i].a <== states[i][279];
		and[284][i].b <== eq[0][i].out;
		states[i+1][280] <== and[284][i].out;
		state_changed[i].in[279] <== states[i+1][280];
		and[285][i] = AND();
		and[285][i].a <== states[i][280];
		and[285][i].b <== eq[0][i].out;
		states[i+1][281] <== and[285][i].out;
		state_changed[i].in[280] <== states[i+1][281];
		and[286][i] = AND();
		and[286][i].a <== states[i][281];
		and[286][i].b <== eq[0][i].out;
		states[i+1][282] <== and[286][i].out;
		state_changed[i].in[281] <== states[i+1][282];
		and[287][i] = AND();
		and[287][i].a <== states[i][282];
		and[287][i].b <== eq[0][i].out;
		states[i+1][283] <== and[287][i].out;
		state_changed[i].in[282] <== states[i+1][283];
		and[288][i] = AND();
		and[288][i].a <== states[i][283];
		and[288][i].b <== eq[0][i].out;
		states[i+1][284] <== and[288][i].out;
		state_changed[i].in[283] <== states[i+1][284];
		and[289][i] = AND();
		and[289][i].a <== states[i][284];
		and[289][i].b <== eq[0][i].out;
		states[i+1][285] <== and[289][i].out;
		state_changed[i].in[284] <== states[i+1][285];
		and[290][i] = AND();
		and[290][i].a <== states[i][285];
		and[290][i].b <== eq[0][i].out;
		states[i+1][286] <== and[290][i].out;
		state_changed[i].in[285] <== states[i+1][286];
		and[291][i] = AND();
		and[291][i].a <== states[i][286];
		and[291][i].b <== eq[0][i].out;
		states[i+1][287] <== and[291][i].out;
		state_changed[i].in[286] <== states[i+1][287];
		and[292][i] = AND();
		and[292][i].a <== states[i][287];
		and[292][i].b <== eq[19][i].out; // 61 = `=`
		states[i+1][288] <== and[292][i].out;
		state_changed[i].in[287] <== states[i+1][288];
		and[293][i] = AND();
		and[293][i].a <== states[i][288];
		and[293][i].b <== eq[20][i].out; // 50 = `2`
		states[i+1][289] <== and[293][i].out;
		state_changed[i].in[288] <== states[i+1][289];
		and[294][i] = AND();
		and[294][i].a <== states[i][265];
		and[294][i].b <== eq[23][i].out; // 105 = `i`
		states[i+1][290] <== and[294][i].out;
		state_changed[i].in[289] <== states[i+1][290];
		and[295][i] = AND();
		and[295][i].a <== states[i][289];
		and[295][i].b <== eq[21][i].out; // 48 = `0`
		states[i+1][291] <== and[295][i].out;
		state_changed[i].in[290] <== states[i+1][291];
		and[296][i] = AND();
		and[296][i].a <== states[i][291];
		and[296][i].b <== eq[18][i].out; // 13 = `\r`
		states[i+1][292] <== and[296][i].out;
		state_changed[i].in[291] <== states[i+1][292];
		and[297][i] = AND();
		and[297][i].a <== states[i][292];
		and[297][i].b <== eq[13][i].out; // 10 = `\n`
		states[i+1][293] <== and[297][i].out;
		state_changed[i].in[292] <== states[i+1][293];
		and[298][i] = AND();
		and[298][i].a <== states[i][293];
		and[298][i].b <== eq[0][i].out;
		states[i+1][294] <== and[298][i].out;
		state_changed[i].in[293] <== states[i+1][294];
		and[299][i] = AND();
		and[299][i].a <== states[i][294];
		and[299][i].b <== eq[0][i].out;
		states[i+1][295] <== and[299][i].out;
		state_changed[i].in[294] <== states[i+1][295];
		and[300][i] = AND();
		and[300][i].a <== states[i][295];
		and[300][i].b <== eq[0][i].out;
		states[i+1][296] <== and[300][i].out;
		state_changed[i].in[295] <== states[i+1][296];
		and[301][i] = AND();
		and[301][i].a <== states[i][296];
		and[301][i].b <== eq[0][i].out;
		states[i+1][297] <== and[301][i].out;
		state_changed[i].in[296] <== states[i+1][297];
		and[302][i] = AND();
		and[302][i].a <== states[i][297];
		and[302][i].b <== eq[0][i].out;
		states[i+1][298] <== and[302][i].out;
		state_changed[i].in[297] <== states[i+1][298];
		and[303][i] = AND();
		and[303][i].a <== states[i][298];
		and[303][i].b <== eq[0][i].out;
		states[i+1][299] <== and[303][i].out;
		state_changed[i].in[298] <== states[i+1][299];
		and[304][i] = AND();
		and[304][i].a <== states[i][299];
		and[304][i].b <== eq[0][i].out;
		states[i+1][300] <== and[304][i].out;
		state_changed[i].in[299] <== states[i+1][300];
		and[305][i] = AND();
		and[305][i].a <== states[i][300];
		and[305][i].b <== eq[0][i].out;
		states[i+1][301] <== and[305][i].out;
		state_changed[i].in[300] <== states[i+1][301];
		and[306][i] = AND();
		and[306][i].a <== states[i][301];
		and[306][i].b <== eq[0][i].out;
		states[i+1][302] <== and[306][i].out;
		state_changed[i].in[301] <== states[i+1][302];
		and[307][i] = AND();
		and[307][i].a <== states[i][302];
		and[307][i].b <== eq[0][i].out;
		states[i+1][303] <== and[307][i].out;
		state_changed[i].in[302] <== states[i+1][303];
		and[308][i] = AND();
		and[308][i].a <== states[i][303];
		and[308][i].b <== eq[0][i].out;
		states[i+1][304] <== and[308][i].out;
		state_changed[i].in[303] <== states[i+1][304];
		and[309][i] = AND();
		and[309][i].a <== states[i][304];
		and[309][i].b <== eq[0][i].out;
		states[i+1][305] <== and[309][i].out;
		state_changed[i].in[304] <== states[i+1][305];
		and[310][i] = AND();
		and[310][i].a <== states[i][305];
		and[310][i].b <== eq[0][i].out;
		states[i+1][306] <== and[310][i].out;
		state_changed[i].in[305] <== states[i+1][306];
		and[311][i] = AND();
		and[311][i].a <== states[i][306];
		and[311][i].b <== eq[0][i].out;
		states[i+1][307] <== and[311][i].out;
		state_changed[i].in[306] <== states[i+1][307];
		and[312][i] = AND();
		and[312][i].a <== states[i][307];
		and[312][i].b <== eq[0][i].out;
		states[i+1][308] <== and[312][i].out;
		state_changed[i].in[307] <== states[i+1][308];
		and[313][i] = AND();
		and[313][i].a <== states[i][308];
		and[313][i].b <== eq[0][i].out;
		states[i+1][309] <== and[313][i].out;
		state_changed[i].in[308] <== states[i+1][309];
		and[314][i] = AND();
		and[314][i].a <== states[i][309];
		and[314][i].b <== eq[0][i].out;
		states[i+1][310] <== and[314][i].out;
		state_changed[i].in[309] <== states[i+1][310];
		and[315][i] = AND();
		and[315][i].a <== states[i][310];
		and[315][i].b <== eq[0][i].out;
		states[i+1][311] <== and[315][i].out;
		state_changed[i].in[310] <== states[i+1][311];
		and[316][i] = AND();
		and[316][i].a <== states[i][311];
		and[316][i].b <== eq[0][i].out;
		states[i+1][312] <== and[316][i].out;
		state_changed[i].in[311] <== states[i+1][312];
		and[317][i] = AND();
		and[317][i].a <== states[i][312];
		and[317][i].b <== eq[0][i].out;
		states[i+1][313] <== and[317][i].out;
		state_changed[i].in[312] <== states[i+1][313];
		and[318][i] = AND();
		and[318][i].a <== states[i][290];
		and[318][i].b <== eq[48][i].out; // 112 = `p`
		states[i+1][314] <== and[318][i].out;
		state_changed[i].in[313] <== states[i+1][314];
		and[319][i] = AND();
		and[319][i].a <== states[i][314];
		and[319][i].b <== eq[23][i].out; // 105 = `i`
		states[i+1][315] <== and[319][i].out;
		state_changed[i].in[314] <== states[i+1][315];
		and[320][i] = AND();
		and[320][i].a <== states[i][315];
		and[320][i].b <== eq[30][i].out; // 101 = `e`
		states[i+1][316] <== and[320][i].out;
		state_changed[i].in[315] <== states[i+1][316];
		and[321][i] = AND();
		and[321][i].a <== states[i][316];
		and[321][i].b <== eq[27][i].out; // 110 = `n`
		states[i+1][317] <== and[321][i].out;
		state_changed[i].in[316] <== states[i+1][317];
		and[322][i] = AND();
		and[322][i].a <== states[i][317];
		and[322][i].b <== eq[29][i].out; // 116 = `t`
		states[i+1][318] <== and[322][i].out;
		state_changed[i].in[317] <== states[i+1][318];
		and[323][i] = AND();
		and[323][i].a <== states[i][318];
		and[323][i].b <== eq[0][i].out;
		states[i+1][319] <== and[323][i].out;
		state_changed[i].in[318] <== states[i+1][319];
		and[324][i] = AND();
		and[324][i].a <== states[i][319];
		and[324][i].b <== eq[27][i].out; // 110 = `n`
		states[i+1][320] <== and[324][i].out;
		state_changed[i].in[319] <== states[i+1][320];
		and[325][i] = AND();
		and[325][i].a <== states[i][320];
		and[325][i].b <== eq[16][i].out;
		states[i+1][321] <== and[325][i].out;
		state_changed[i].in[320] <== states[i+1][321];
		and[326][i] = AND();
		and[326][i].a <== states[i][321];
		and[326][i].b <== eq[49][i].out;
		states[i+1][322] <== and[326][i].out;
		state_changed[i].in[321] <== states[i+1][322];
		and[327][i] = AND();
		and[327][i].a <== states[i][322];
		and[327][i].b <== eq[30][i].out;
		states[i+1][323] <== and[327][i].out;
		state_changed[i].in[322] <== states[i+1][323];
		and[328][i] = AND();
		and[328][i].a <== states[i][323];
		and[328][i].b <== eq[0][i].out;
		states[i+1][324] <== and[328][i].out;
		state_changed[i].in[323] <== states[i+1][324];
		and[329][i] = AND();
		and[329][i].a <== states[i][2];
		and[329][i].b <== eq[18][i].out;
		states[i+1][325] <== and[329][i].out;
		state_changed[i].in[324] <== states[i+1][325];
		and[330][i] = AND();
		and[330][i].a <== states[i][324];
		and[330][i].b <== eq[26][i].out; // 45 = `-`
		states[i+1][326] <== and[330][i].out;
		state_changed[i].in[325] <== states[i+1][326];
		and[331][i] = AND();
		and[331][i].a <== states[i][326];
		and[331][i].b <== eq[26][i].out; // 45 = `-`
		states[i+1][327] <== and[331][i].out;
		state_changed[i].in[326] <== states[i+1][327];
		and[332][i] = AND();
		and[332][i].a <== states[i][327];
		and[332][i].b <== eq[17][i].out; // 62 = `>`
		states[i+1][328] <== and[332][i].out;
		state_changed[i].in[327] <== states[i+1][328];
		and[333][i] = AND();
		and[333][i].a <== states[i][328];
		and[333][i].b <== eq[18][i].out; // 13 = `\r`
		states[i+1][329] <== and[333][i].out;
		state_changed[i].in[328] <== states[i+1][329];
		and[81][i] = AND(); // Use and[81] since we skip over this index above
		and[81][i].a <== states[i][329];
		and[81][i].b <== eq[13][i].out; // 10 = `\n`
		states[i+1][330] <== and[81][i].out;
		state_changed[i].in[329] <== states[i+1][330];
		states[i+1][0] <== 1 - state_changed[i].out;
	}

	component final_state_result = MultiOR(num_bytes+1);
	for (var i = 0; i <= num_bytes; i++) {
		final_state_result.in[i] <== states[i][98];
	}
	out <== final_state_result.out;

	signal is_consecutive[msg_bytes+1][2];
	is_consecutive[msg_bytes][1] <== 1;
	for (var i = 0; i < msg_bytes; i++) {
		is_consecutive[msg_bytes-1-i][0] <== states[num_bytes-i][98] * (1 - is_consecutive[msg_bytes-i][1]) + is_consecutive[msg_bytes-i][1];
		is_consecutive[msg_bytes-1-i][1] <== state_changed[msg_bytes-i].out * is_consecutive[msg_bytes-1-i][0];
	}
	signal is_substr0[msg_bytes][3];
	signal is_reveal0[msg_bytes];
	signal output reveal0[msg_bytes];
	for (var i = 0; i < msg_bytes; i++) {
		is_substr0[i][0] <== 0;
		is_substr0[i][1] <== is_substr0[i][0] + states[i+1][247] * states[i+2][248];
		is_substr0[i][2] <== is_substr0[i][1] + states[i+1][248] * states[i+2][248];
		is_reveal0[i] <== is_substr0[i][2] * is_consecutive[i][1];
		reveal0[i] <== in[i+1] * is_reveal0[i];
	}
}