pragma circom 2.1.5;

include "@zk-email/circuits/regexes/regex_helpers.circom";

template MercadoEntityRegex(msg_bytes) {
	signal input msg[msg_bytes];
	signal output out;

	var num_bytes = msg_bytes+1;
	signal in[num_bytes];
	in[0]<==255;
	for (var i = 0; i < msg_bytes; i++) {
		in[i+1] <== msg[i];
	}

	component eq[9][num_bytes];
	component and[31][num_bytes];
	component multi_or[6][num_bytes];
	signal states[num_bytes+1][26];
	component state_changed[num_bytes];

	states[0][0] <== 1;
	for (var i = 1; i < 26; i++) {
		states[0][i] <== 0;
	}

	for (var i = 0; i < num_bytes; i++) {
		state_changed[i] = MultiOR(25);
		eq[0][i] = IsEqual();
		eq[0][i].in[0] <== in[i];
		eq[0][i].in[1] <== 69;	// E
		and[0][i] = AND();
		and[0][i].a <== states[i][0];
		and[0][i].b <== eq[0][i].out;
		states[i+1][1] <== and[0][i].out;
		state_changed[i].in[0] <== states[i+1][1];

		eq[1][i] = IsEqual();
		eq[1][i].in[0] <== in[i];
		eq[1][i].in[1] <== 61;	// =
		and[1][i] = AND();
		and[1][i].a <== states[i][1];
		and[1][i].b <== eq[1][i].out;
		states[i+1][2] <== and[1][i].out;
		state_changed[i].in[1] <== states[i+1][2];

		eq[2][i] = IsEqual();
		eq[2][i].in[0] <== in[i];
		eq[2][i].in[1] <== 110;	// n
		and[2][i] = AND();
		and[2][i].a <== states[i][1];
		and[2][i].b <== eq[2][i].out;
		and[3][i] = AND();
		and[3][i].a <== states[i][7];
		and[3][i].b <== eq[2][i].out;	// n
		multi_or[0][i] = MultiOR(2);
		multi_or[0][i].in[0] <== and[2][i].out;	// =
		multi_or[0][i].in[1] <== and[3][i].out;	// n
		states[i+1][3] <== multi_or[0][i].out;
		state_changed[i].in[2] <== states[i+1][3];


		eq[3][i] = IsEqual();
		eq[3][i].in[0] <== in[i];
		eq[3][i].in[1] <== 13;	// \r
		and[4][i] = AND();
		and[4][i].a <== states[i][2];
		and[4][i].b <== eq[3][i].out;
		states[i+1][4] <== and[4][i].out;
		state_changed[i].in[3] <== states[i+1][4];

		and[5][i] = AND();
		and[5][i].a <== states[i][3];
		and[5][i].b <== eq[1][i].out;	// =
		states[i+1][5] <== and[5][i].out;
		state_changed[i].in[4] <== states[i+1][5];

		eq[4][i] = IsEqual();
		eq[4][i].in[0] <== in[i];
		eq[4][i].in[1] <== 116;	// t
		and[6][i] = AND();
		and[6][i].a <== states[i][3];
		and[6][i].b <== eq[4][i].out;
		and[7][i] = AND();
		and[7][i].a <== states[i][11];
		and[7][i].b <== eq[4][i].out;
		multi_or[1][i] = MultiOR(2);
		multi_or[1][i].in[0] <== and[6][i].out;	// =
		multi_or[1][i].in[1] <== and[7][i].out; // t
		states[i+1][6] <== multi_or[1][i].out;
		state_changed[i].in[5] <== states[i+1][6];


		eq[5][i] = IsEqual();
		eq[5][i].in[0] <== in[i];
		eq[5][i].in[1] <== 10;	// \n
		and[8][i] = AND();
		and[8][i].a <== states[i][4];
		and[8][i].b <== eq[5][i].out;
		states[i+1][7] <== and[8][i].out;
		state_changed[i].in[6] <== states[i+1][7];

		and[9][i] = AND();
		and[9][i].a <== states[i][5];
		and[9][i].b <== eq[3][i].out;	// \r
		states[i+1][8] <== and[9][i].out;
		state_changed[i].in[7] <== states[i+1][8];
		
		and[10][i] = AND();
		and[10][i].a <== states[i][6];
		and[10][i].b <== eq[1][i].out;	// =
		states[i+1][9] <== and[10][i].out;
		state_changed[i].in[8] <== states[i+1][9];
		
		eq[6][i] = IsEqual();
		eq[6][i].in[0] <== in[i];
		eq[6][i].in[1] <== 105;	// i
		and[11][i] = AND();
		and[11][i].a <== states[i][6];
		and[11][i].b <== eq[6][i].out;
		and[12][i] = AND();
		and[12][i].a <== states[i][15];
		and[12][i].b <== eq[6][i].out;
		multi_or[2][i] = MultiOR(2);
		multi_or[2][i].in[0] <== and[11][i].out;	// =
		multi_or[2][i].in[1] <== and[12][i].out;	// i
		states[i+1][10] <== multi_or[2][i].out;
		state_changed[i].in[9] <== states[i+1][10];


		and[13][i] = AND();
		and[13][i].a <== states[i][8];
		and[13][i].b <== eq[5][i].out;		// \n
		states[i+1][11] <== and[13][i].out;
		state_changed[i].in[10] <== states[i+1][11];
		and[14][i] = AND();
		and[14][i].a <== states[i][9];
		and[14][i].b <== eq[3][i].out;	// \r
		states[i+1][12] <== and[14][i].out;
		state_changed[i].in[11] <== states[i+1][12];
		and[15][i] = AND();
		and[15][i].a <== states[i][10];
		and[15][i].b <== eq[1][i].out;	// =
		states[i+1][13] <== and[15][i].out;
		state_changed[i].in[12] <== states[i+1][13];

		eq[7][i] = IsEqual();
		eq[7][i].in[0] <== in[i];
		eq[7][i].in[1] <== 100;	// d
		and[16][i] = AND();
		and[16][i].a <== states[i][10];
		and[16][i].b <== eq[7][i].out;
		and[17][i] = AND();
		and[17][i].a <== states[i][19];
		and[17][i].b <== eq[7][i].out;
		multi_or[3][i] = MultiOR(2);
		multi_or[3][i].in[0] <== and[16][i].out;	// =
		multi_or[3][i].in[1] <== and[17][i].out;	// d
		states[i+1][14] <== multi_or[3][i].out;
		state_changed[i].in[13] <== states[i+1][14];
		and[18][i] = AND();
		and[18][i].a <== states[i][12];
		and[18][i].b <== eq[5][i].out;
		states[i+1][15] <== and[18][i].out;
		state_changed[i].in[14] <== states[i+1][15];
		and[19][i] = AND();
		and[19][i].a <== states[i][13];
		and[19][i].b <== eq[3][i].out;
		states[i+1][16] <== and[19][i].out;
		state_changed[i].in[15] <== states[i+1][16];
		and[20][i] = AND();
		and[20][i].a <== states[i][14];
		and[20][i].b <== eq[1][i].out;
		states[i+1][17] <== and[20][i].out;
		state_changed[i].in[16] <== states[i+1][17];
		eq[8][i] = IsEqual();
		eq[8][i].in[0] <== in[i];
		eq[8][i].in[1] <== 97;
		and[21][i] = AND();
		and[21][i].a <== states[i][14];
		and[21][i].b <== eq[8][i].out;
		and[22][i] = AND();
		and[22][i].a <== states[i][23];
		and[22][i].b <== eq[8][i].out;
		multi_or[4][i] = MultiOR(2);
		multi_or[4][i].in[0] <== and[21][i].out;
		multi_or[4][i].in[1] <== and[22][i].out;
		states[i+1][18] <== multi_or[4][i].out;
		state_changed[i].in[17] <== states[i+1][18];
		and[23][i] = AND();
		and[23][i].a <== states[i][16];
		and[23][i].b <== eq[5][i].out;
		states[i+1][19] <== and[23][i].out;
		state_changed[i].in[18] <== states[i+1][19];
		and[24][i] = AND();
		and[24][i].a <== states[i][17];
		and[24][i].b <== eq[3][i].out;
		states[i+1][20] <== and[24][i].out;
		state_changed[i].in[19] <== states[i+1][20];
		and[25][i] = AND();
		and[25][i].a <== states[i][18];
		and[25][i].b <== eq[1][i].out;
		states[i+1][21] <== and[25][i].out;
		state_changed[i].in[20] <== states[i+1][21];
		and[26][i] = AND();
		and[26][i].a <== states[i][18];
		and[26][i].b <== eq[7][i].out;
		and[27][i] = AND();
		and[27][i].a <== states[i][25];
		and[27][i].b <== eq[7][i].out;
		multi_or[5][i] = MultiOR(2);
		multi_or[5][i].in[0] <== and[26][i].out;
		multi_or[5][i].in[1] <== and[27][i].out;
		states[i+1][22] <== multi_or[5][i].out;
		state_changed[i].in[21] <== states[i+1][22];
		and[28][i] = AND();
		and[28][i].a <== states[i][20];
		and[28][i].b <== eq[5][i].out;
		states[i+1][23] <== and[28][i].out;
		state_changed[i].in[22] <== states[i+1][23];
		and[29][i] = AND();
		and[29][i].a <== states[i][21];
		and[29][i].b <== eq[3][i].out;
		states[i+1][24] <== and[29][i].out;
		state_changed[i].in[23] <== states[i+1][24];
		and[30][i] = AND();
		and[30][i].a <== states[i][24];
		and[30][i].b <== eq[5][i].out;
		states[i+1][25] <== and[30][i].out;
		state_changed[i].in[24] <== states[i+1][25];
		states[i+1][0] <== 1 - state_changed[i].out;
	}

	component final_state_result = MultiOR(num_bytes+1);
	for (var i = 0; i <= num_bytes; i++) {
		final_state_result.in[i] <== states[i][22];
	}
	out <== final_state_result.out;

	signal is_consecutive[msg_bytes+1][2];
	is_consecutive[msg_bytes][1] <== 1;
	for (var i = 0; i < msg_bytes; i++) {
		is_consecutive[msg_bytes-1-i][0] <== states[num_bytes-i][22] * (1 - is_consecutive[msg_bytes-i][1]) + is_consecutive[msg_bytes-i][1];
		is_consecutive[msg_bytes-1-i][1] <== state_changed[msg_bytes-i].out * is_consecutive[msg_bytes-1-i][0];
	}
}