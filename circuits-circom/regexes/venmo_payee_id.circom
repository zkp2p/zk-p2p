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

    component eq[47][num_bytes];
    component lt[2][num_bytes];
    component and[47][num_bytes];
    component multi_or[2][num_bytes];
    signal states[num_bytes+1][46];

	states[0][0] <== 1;
	for (var i = 1; i < 331; i++) {
		states[0][i] <== 0;
	}

    for (var i = 0; i < num_bytes; i++) {
        // 47-58 = [0-9]
        lt[0][i] = LessThan(8);
        lt[0][i].in[0] <== 47;
        lt[0][i].in[1] <== in[i];
        lt[1][i] = LessThan(8);
        lt[1][i].in[0] <== in[i];
        lt[1][i].in[1] <== 58;        
        and[0][i] = AND();
        and[0][i].a <== lt[0][i].out;
        and[0][i].b <== lt[1][i].out;
        // 61 = '='
        eq[0][i] = IsEqual();
        eq[0][i].in[0] <== in[i];
        eq[0][i].in[1] <== 61;
        // 13 = '\r'
        eq[1][i] = IsEqual();
        eq[1][i].in[0] <== in[i];
        eq[1][i].in[1] <== 13;
        // 10 = '\n'
        eq[2][i] = IsEqual();
        eq[2][i].in[0] <== in[i];
        eq[2][i].in[1] <== 10;
        and[1][i] = AND();
        and[1][i].a <== states[i][1];
        multi_or[0][i] = MultiOR(4);
        multi_or[0][i].in[0] <== and[0][i].out;
        multi_or[0][i].in[1] <== eq[0][i].out;
        multi_or[0][i].in[2] <== eq[1][i].out;
        multi_or[0][i].in[3] <== eq[2][i].out;
        and[1][i].b <== multi_or[0][i].out;
        and[2][i] = AND();
        and[2][i].a <== states[i][45];
        and[2][i].b <== multi_or[0][i].out;
        multi_or[1][i] = MultiOR(2);
        multi_or[1][i].in[0] <== and[1][i].out;
        multi_or[1][i].in[1] <== and[2][i].out;
        states[i+1][1] <== multi_or[1][i].out;
        // 32 = space
        eq[3][i] = IsEqual();
        eq[3][i].in[0] <== in[i];
        eq[3][i].in[1] <== 32;
        and[3][i] = AND();
        and[3][i].a <== states[i][0];
        and[3][i].b <== eq[3][i].out;
        states[i+1][2] <== and[3][i].out;
        // 32 = space
        eq[4][i] = IsEqual();
        eq[4][i].in[0] <== in[i];
        eq[4][i].in[1] <== 32;
        and[4][i] = AND();
        and[4][i].a <== states[i][2];
        and[4][i].b <== eq[4][i].out;
        states[i+1][3] <== and[4][i].out;
        // 32 = space
        eq[5][i] = IsEqual();
        eq[5][i].in[0] <== in[i];
        eq[5][i].in[1] <== 32;
        and[5][i] = AND();
        and[5][i].a <== states[i][3];
        and[5][i].b <== eq[5][i].out;
        states[i+1][4] <== and[5][i].out;
        // 104 = 'h'
        eq[6][i] = IsEqual();
        eq[6][i].in[0] <== in[i];
        eq[6][i].in[1] <== 104;
        and[6][i] = AND();
        and[6][i].a <== states[i][4];
        and[6][i].b <== eq[6][i].out;
        states[i+1][5] <== and[6][i].out;
        // 114 = 'r'
        eq[7][i] = IsEqual();
        eq[7][i].in[0] <== in[i];
        eq[7][i].in[1] <== 114;
        and[7][i] = AND();
        and[7][i].a <== states[i][5];
        and[7][i].b <== eq[7][i].out;
        states[i+1][6] <== and[7][i].out;
        // 101 = 'e'
        eq[8][i] = IsEqual();
        eq[8][i].in[0] <== in[i];
        eq[8][i].in[1] <== 101;
        and[8][i] = AND();
        and[8][i].a <== states[i][6];
        and[8][i].b <== eq[8][i].out;
        states[i+1][7] <== and[8][i].out;
        // 102 = 'f'
        eq[9][i] = IsEqual();
        eq[9][i].in[0] <== in[i];
        eq[9][i].in[1] <== 102;
        and[9][i] = AND();
        and[9][i].a <== states[i][7];
        and[9][i].b <== eq[9][i].out;
        states[i+1][8] <== and[9][i].out;
        // 61 = '=''
        eq[10][i] = IsEqual();
        eq[10][i].in[0] <== in[i];
        eq[10][i].in[1] <== 61;
        and[10][i] = AND();
        and[10][i].a <== states[i][8];
        and[10][i].b <== eq[10][i].out;
        states[i+1][9] <== and[10][i].out;
        // 51 = '3'
        eq[11][i] = IsEqual();
        eq[11][i].in[0] <== in[i];
        eq[11][i].in[1] <== 51;
        and[11][i] = AND();
        and[11][i].a <== states[i][9];
        and[11][i].b <== eq[11][i].out;
        states[i+1][10] <== and[11][i].out;
        // 68 = 'D'
        eq[12][i] = IsEqual();
        eq[12][i].in[0] <== in[i];
        eq[12][i].in[1] <== 68;
        and[12][i] = AND();
        and[12][i].a <== states[i][10];
        and[12][i].b <== eq[12][i].out;
        states[i+1][11] <== and[12][i].out;
        // 34 = '"'
        eq[13][i] = IsEqual();
        eq[13][i].in[0] <== in[i];
        eq[13][i].in[1] <== 34;
        and[13][i] = AND();
        and[13][i].a <== states[i][11];
        and[13][i].b <== eq[13][i].out;
        states[i+1][12] <== and[13][i].out;
        // 104 = 'h'
        eq[14][i] = IsEqual();
        eq[14][i].in[0] <== in[i];
        eq[14][i].in[1] <== 104;
        and[14][i] = AND();
        and[14][i].a <== states[i][12];
        and[14][i].b <== eq[14][i].out;
        states[i+1][13] <== and[14][i].out;
        // 116 = 't'
        eq[15][i] = IsEqual();
        eq[15][i].in[0] <== in[i];
        eq[15][i].in[1] <== 116;
        and[15][i] = AND();
        and[15][i].a <== states[i][13];
        and[15][i].b <== eq[15][i].out;
        states[i+1][14] <== and[15][i].out;
        // 116 = 't'
        eq[16][i] = IsEqual();
        eq[16][i].in[0] <== in[i];
        eq[16][i].in[1] <== 116;
        and[16][i] = AND();
        and[16][i].a <== states[i][14];
        and[16][i].b <== eq[16][i].out;
        states[i+1][15] <== and[16][i].out;
        // 112 = 'p'
        eq[17][i] = IsEqual();
        eq[17][i].in[0] <== in[i];
        eq[17][i].in[1] <== 112;
        and[17][i] = AND();
        and[17][i].a <== states[i][15];
        and[17][i].b <== eq[17][i].out;
        states[i+1][16] <== and[17][i].out;
        // 115 = 's'
        eq[18][i] = IsEqual();
        eq[18][i].in[0] <== in[i];
        eq[18][i].in[1] <== 115;
        and[18][i] = AND();
        and[18][i].a <== states[i][16];
        and[18][i].b <== eq[18][i].out;
        states[i+1][17] <== and[18][i].out;
        // 58 = ':''
        eq[19][i] = IsEqual();
        eq[19][i].in[0] <== in[i];
        eq[19][i].in[1] <== 58;
        and[19][i] = AND();
        and[19][i].a <== states[i][17];
        and[19][i].b <== eq[19][i].out;
        states[i+1][18] <== and[19][i].out;
        // 47 = '/'
        eq[20][i] = IsEqual();
        eq[20][i].in[0] <== in[i];
        eq[20][i].in[1] <== 47;
        and[20][i] = AND();
        and[20][i].a <== states[i][18];
        and[20][i].b <== eq[20][i].out;
        states[i+1][19] <== and[20][i].out;
        // 47 = '/'
        eq[21][i] = IsEqual();
        eq[21][i].in[0] <== in[i];
        eq[21][i].in[1] <== 47;
        and[21][i] = AND();
        and[21][i].a <== states[i][19];
        and[21][i].b <== eq[21][i].out;
        states[i+1][20] <== and[21][i].out;
        // 118 = 'v'
        eq[22][i] = IsEqual();
        eq[22][i].in[0] <== in[i];
        eq[22][i].in[1] <== 118;
        and[22][i] = AND();
        and[22][i].a <== states[i][20];
        and[22][i].b <== eq[22][i].out;
        states[i+1][21] <== and[22][i].out;
        // 101 = 'e'
        eq[23][i] = IsEqual();
        eq[23][i].in[0] <== in[i];
        eq[23][i].in[1] <== 101;
        and[23][i] = AND();
        and[23][i].a <== states[i][21];
        and[23][i].b <== eq[23][i].out;
        states[i+1][22] <== and[23][i].out;
        // 110 = 'n'
        eq[24][i] = IsEqual();
        eq[24][i].in[0] <== in[i];
        eq[24][i].in[1] <== 110;
        and[24][i] = AND();
        and[24][i].a <== states[i][22];
        and[24][i].b <== eq[24][i].out;
        states[i+1][23] <== and[24][i].out;
        // 109 = 'm'
        eq[25][i] = IsEqual();
        eq[25][i].in[0] <== in[i];
        eq[25][i].in[1] <== 109;
        and[25][i] = AND();
        and[25][i].a <== states[i][23];
        and[25][i].b <== eq[25][i].out;
        states[i+1][24] <== and[25][i].out;
        // 111 = 'o'
        eq[26][i] = IsEqual();
        eq[26][i].in[0] <== in[i];
        eq[26][i].in[1] <== 111;
        and[26][i] = AND();
        and[26][i].a <== states[i][24];
        and[26][i].b <== eq[26][i].out;
        states[i+1][25] <== and[26][i].out;
        // 46 = '.'
        eq[27][i] = IsEqual();
        eq[27][i].in[0] <== in[i];
        eq[27][i].in[1] <== 46;
        and[27][i] = AND();
        and[27][i].a <== states[i][25];
        and[27][i].b <== eq[27][i].out;
        states[i+1][26] <== and[27][i].out;
        // 99 = 'c'
        eq[28][i] = IsEqual();
        eq[28][i].in[0] <== in[i];
        eq[28][i].in[1] <== 99;
        and[28][i] = AND();
        and[28][i].a <== states[i][26];
        and[28][i].b <== eq[28][i].out;
        states[i+1][27] <== and[28][i].out;
        // 111 = 'o'
        eq[29][i] = IsEqual();
        eq[29][i].in[0] <== in[i];
        eq[29][i].in[1] <== 111;
        and[29][i] = AND();
        and[29][i].a <== states[i][27];
        and[29][i].b <== eq[29][i].out;
        states[i+1][28] <== and[29][i].out;
        // 109 = 'm'
        eq[30][i] = IsEqual();
        eq[30][i].in[0] <== in[i];
        eq[30][i].in[1] <== 109;
        and[30][i] = AND();
        and[30][i].a <== states[i][28];
        and[30][i].b <== eq[30][i].out;
        states[i+1][29] <== and[30][i].out;
        // 47 = '/'
        eq[31][i] = IsEqual();
        eq[31][i].in[0] <== in[i];
        eq[31][i].in[1] <== 47;
        and[31][i] = AND();
        and[31][i].a <== states[i][29];
        and[31][i].b <== eq[31][i].out;
        states[i+1][30] <== and[31][i].out;
        // 99 = 'c'
        eq[32][i] = IsEqual();
        eq[32][i].in[0] <== in[i];
        eq[32][i].in[1] <== 99;
        and[32][i] = AND();
        and[32][i].a <== states[i][30];
        and[32][i].b <== eq[32][i].out;
        states[i+1][31] <== and[32][i].out;
        // 111 = 'o'
        eq[33][i] = IsEqual();
        eq[33][i].in[0] <== in[i];
        eq[33][i].in[1] <== 111;
        and[33][i] = AND();
        and[33][i].a <== states[i][31];
        and[33][i].b <== eq[33][i].out;
        states[i+1][32] <== and[33][i].out;
        // 100 = 'd'
        eq[34][i] = IsEqual();
        eq[34][i].in[0] <== in[i];
        eq[34][i].in[1] <== 100;
        and[34][i] = AND();
        and[34][i].a <== states[i][32];
        and[34][i].b <== eq[34][i].out;
        states[i+1][33] <== and[34][i].out;
        // 101 = 'e'
        eq[35][i] = IsEqual();
        eq[35][i].in[0] <== in[i];
        eq[35][i].in[1] <== 101;
        and[35][i] = AND();
        and[35][i].a <== states[i][33];
        and[35][i].b <== eq[35][i].out;
        states[i+1][34] <== and[35][i].out;
        // 63 = '?'
        eq[36][i] = IsEqual();
        eq[36][i].in[0] <== in[i];
        eq[36][i].in[1] <== 63;
        and[36][i] = AND();
        and[36][i].a <== states[i][34];
        and[36][i].b <== eq[36][i].out;
        states[i+1][35] <== and[36][i].out;
        // 117 = 'u'
        eq[37][i] = IsEqual();
        eq[37][i].in[0] <== in[i];
        eq[37][i].in[1] <== 117;
        and[37][i] = AND();
        and[37][i].a <== states[i][35];
        and[37][i].b <== eq[37][i].out;
        states[i+1][36] <== and[37][i].out;
        // 115 = 's'
        eq[38][i] = IsEqual();
        eq[38][i].in[0] <== in[i];
        eq[38][i].in[1] <== 115;
        and[38][i] = AND();
        and[38][i].a <== states[i][36];
        and[38][i].b <== eq[38][i].out;
        states[i+1][37] <== and[38][i].out;
        // 101 = 'e'
        eq[39][i] = IsEqual();
        eq[39][i].in[0] <== in[i];
        eq[39][i].in[1] <== 101;
        and[39][i] = AND();
        and[39][i].a <== states[i][37];
        and[39][i].b <== eq[39][i].out;
        states[i+1][38] <== and[39][i].out;
        // 114 = 'r'
        eq[40][i] = IsEqual();
        eq[40][i].in[0] <== in[i];
        eq[40][i].in[1] <== 114;
        and[40][i] = AND();
        and[40][i].a <== states[i][38];
        and[40][i].b <== eq[40][i].out;
        states[i+1][39] <== and[40][i].out;
        // 95 = '_'
        eq[41][i] = IsEqual();
        eq[41][i].in[0] <== in[i];
        eq[41][i].in[1] <== 95;
        and[41][i] = AND();
        and[41][i].a <== states[i][39];
        and[41][i].b <== eq[41][i].out;
        states[i+1][40] <== and[41][i].out;
        // 105 = 'i'
        eq[42][i] = IsEqual();
        eq[42][i].in[0] <== in[i];
        eq[42][i].in[1] <== 105;
        and[42][i] = AND();
        and[42][i].a <== states[i][40];
        and[42][i].b <== eq[42][i].out;
        states[i+1][41] <== and[42][i].out;
        // 100 = 'd'
        eq[43][i] = IsEqual();
        eq[43][i].in[0] <== in[i];
        eq[43][i].in[1] <== 100;
        and[43][i] = AND();
        and[43][i].a <== states[i][41];
        and[43][i].b <== eq[43][i].out;
        states[i+1][42] <== and[43][i].out;
        // 61 = '='
        eq[44][i] = IsEqual();
        eq[44][i].in[0] <== in[i];
        eq[44][i].in[1] <== 61;
        and[44][i] = AND();
        and[44][i].a <== states[i][42];
        and[44][i].b <== eq[44][i].out;
        states[i+1][43] <== and[44][i].out;
        // 51 = '3'
        eq[45][i] = IsEqual();
        eq[45][i].in[0] <== in[i];
        eq[45][i].in[1] <== 51;
        and[45][i] = AND();
        and[45][i].a <== states[i][43];
        and[45][i].b <== eq[45][i].out;
        states[i+1][44] <== and[45][i].out;
        // 68 = 'D'
        eq[46][i] = IsEqual();
        eq[46][i].in[0] <== in[i];
        eq[46][i].in[1] <== 68;
        and[46][i] = AND();
        and[46][i].a <== states[i][44];
        and[46][i].b <== eq[46][i].out;
        states[i+1][45] <== and[46][i].out;
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
	signal is_substr1[msg_bytes][3];
	signal is_reveal1[msg_bytes];
	signal output reveal1[msg_bytes];
	for (var i = 0; i < msg_bytes; i++) {
		is_substr1[i][0] <== 0;
		is_substr1[i][1] <== is_substr1[i][0] + states[i+1][262] * states[i+2][263];
		is_substr1[i][2] <== is_substr1[i][1] + states[i+1][263] * states[i+2][263];
		is_reveal1[i] <== is_substr1[i][2] * is_consecutive[i][1];
		reveal1[i] <== in[i+1] * is_reveal1[i];
	}
}