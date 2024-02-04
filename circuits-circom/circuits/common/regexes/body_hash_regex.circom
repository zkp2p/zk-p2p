pragma circom 2.1.5;

include "@zk-email/zk-regex-circom/circuits/regex_helpers.circom";

template BodyHashRegex (msg_bytes) {
    signal input msg[msg_bytes];
    signal output out;

    var num_bytes = msg_bytes;
    signal in[num_bytes];
    for (var i = 0; i < msg_bytes; i++) {
        in[i] <== msg[i];
    }

    component eq[65][num_bytes];
    component lt[6][num_bytes];
    component and[35][num_bytes];
    component multi_or[7][num_bytes];
    signal states[num_bytes+1][29];

    for (var i = 0; i < num_bytes; i++) {
        states[i][0] <== 1;
    }
    for (var i = 1; i < 29; i++) {
        states[0][i] <== 0;
    }

    for (var i = 0; i < num_bytes; i++) {
        // First regex catches all lower case except 'b' so only 25 chars
        // 110 = 'n'
        eq[0][i] = IsEqual();
        eq[0][i].in[0] <== in[i];
        eq[0][i].in[1] <== 110;
        // 108 = 'l'
        eq[1][i] = IsEqual();
        eq[1][i].in[0] <== in[i];
        eq[1][i].in[1] <== 108;
        // 103 = 'g'
        eq[2][i] = IsEqual();
        eq[2][i].in[0] <== in[i];
        eq[2][i].in[1] <== 103;
        // 114 = 'r'
        eq[3][i] = IsEqual();
        eq[3][i].in[0] <== in[i];
        eq[3][i].in[1] <== 114;
        // 115 = 's'
        eq[4][i] = IsEqual();
        eq[4][i].in[0] <== in[i];
        eq[4][i].in[1] <== 115;
        // 112 = 'p'
        eq[5][i] = IsEqual();
        eq[5][i].in[0] <== in[i];
        eq[5][i].in[1] <== 112;
        // 101 = 'e'
        eq[6][i] = IsEqual();
        eq[6][i].in[0] <== in[i];
        eq[6][i].in[1] <== 101;
        // 107 = 'k'
        eq[7][i] = IsEqual();
        eq[7][i].in[0] <== in[i];
        eq[7][i].in[1] <== 107;
        // 99 = 'c'
        eq[8][i] = IsEqual();
        eq[8][i].in[0] <== in[i];
        eq[8][i].in[1] <== 99;
        // 109 = 'm'
        eq[9][i] = IsEqual();
        eq[9][i].in[0] <== in[i];
        eq[9][i].in[1] <== 109;
        // 118 = 'v'
        eq[10][i] = IsEqual();
        eq[10][i].in[0] <== in[i];
        eq[10][i].in[1] <== 118;
        // 117 = 'u'
        eq[11][i] = IsEqual();
        eq[11][i].in[0] <== in[i];
        eq[11][i].in[1] <== 117;
        // 105 = 'i'
        eq[12][i] = IsEqual();
        eq[12][i].in[0] <== in[i];
        eq[12][i].in[1] <== 105;
        // 113 = 'q'
        eq[13][i] = IsEqual();
        eq[13][i].in[0] <== in[i];
        eq[13][i].in[1] <== 113;
        // 122 = 'z'
        eq[14][i] = IsEqual();
        eq[14][i].in[0] <== in[i];
        eq[14][i].in[1] <== 122;
        // 111 = 'o'
        eq[15][i] = IsEqual();
        eq[15][i].in[0] <== in[i];
        eq[15][i].in[1] <== 111;
        // 104 = 'h'
        eq[16][i] = IsEqual();
        eq[16][i].in[0] <== in[i];
        eq[16][i].in[1] <== 104;
        // 102 = 'f'
        eq[17][i] = IsEqual();
        eq[17][i].in[0] <== in[i];
        eq[17][i].in[1] <== 102;
        // 97 = 'a'
        eq[18][i] = IsEqual();
        eq[18][i].in[0] <== in[i];
        eq[18][i].in[1] <== 97;
        // 116 = 't'
        eq[19][i] = IsEqual();
        eq[19][i].in[0] <== in[i];
        eq[19][i].in[1] <== 116;
        // 121 = 'y'
        eq[20][i] = IsEqual();
        eq[20][i].in[0] <== in[i];
        eq[20][i].in[1] <== 121;
        // 120 = 'x'
        eq[21][i] = IsEqual();
        eq[21][i].in[0] <== in[i];
        eq[21][i].in[1] <== 120;
        // 106 = 'j'
        eq[22][i] = IsEqual();
        eq[22][i].in[0] <== in[i];
        eq[22][i].in[1] <== 106;
        // 100 = 'd'
        eq[23][i] = IsEqual();
        eq[23][i].in[0] <== in[i];
        eq[23][i].in[1] <== 100;
        // 119 = 'w'
        eq[24][i] = IsEqual();
        eq[24][i].in[0] <== in[i];
        eq[24][i].in[1] <== 119;
        and[0][i] = AND();
        and[0][i].a <== states[i][13];
        multi_or[0][i] = MultiOR(25);
        multi_or[0][i].in[0] <== eq[0][i].out; // 110 = 'n'
        multi_or[0][i].in[1] <== eq[1][i].out; // 108 = 'l'
        multi_or[0][i].in[2] <== eq[2][i].out; // 103 = 'g'
        multi_or[0][i].in[3] <== eq[3][i].out; // 114 = 'r'
        multi_or[0][i].in[4] <== eq[4][i].out; // 115 = 's'
        multi_or[0][i].in[5] <== eq[5][i].out; // 112 = 'p'
        multi_or[0][i].in[6] <== eq[6][i].out; // 101 = 'e'
        multi_or[0][i].in[7] <== eq[7][i].out; // 107 = 'k'
        multi_or[0][i].in[8] <== eq[8][i].out; // 99 = 'c'
        multi_or[0][i].in[9] <== eq[9][i].out; // 109 = 'm'
        multi_or[0][i].in[10] <== eq[10][i].out; // 118 = 'v'
        multi_or[0][i].in[11] <== eq[11][i].out; // 117 = 'u'
        multi_or[0][i].in[12] <== eq[12][i].out; // 105 = 'i'
        multi_or[0][i].in[13] <== eq[13][i].out; // 113 = 'q'
        multi_or[0][i].in[14] <== eq[14][i].out; // 122 = 'z'
        multi_or[0][i].in[15] <== eq[15][i].out; // 111 = 'o'
        multi_or[0][i].in[16] <== eq[16][i].out; // 104 = 'h'
        multi_or[0][i].in[17] <== eq[17][i].out; // 102 = 'f'
        multi_or[0][i].in[18] <== eq[18][i].out; // 97 = 'a'
        multi_or[0][i].in[19] <== eq[19][i].out; // 116 = 't'
        multi_or[0][i].in[20] <== eq[20][i].out; // 121 = 'y'
        multi_or[0][i].in[21] <== eq[21][i].out; // 120 = 'x'
        multi_or[0][i].in[22] <== eq[22][i].out; // 106 = 'j'
        multi_or[0][i].in[23] <== eq[23][i].out; // 100 = 'd'
        multi_or[0][i].in[24] <== eq[24][i].out; // 119 = 'w'
        and[0][i].b <== multi_or[0][i].out;
        // 96-123 = [a-z]
        lt[0][i] = LessThan(8);
        lt[0][i].in[0] <== 96;
        lt[0][i].in[1] <== in[i];
        lt[1][i] = LessThan(8);
        lt[1][i].in[0] <== in[i];
        lt[1][i].in[1] <== 123;
        and[1][i] = AND();
        and[1][i].a <== lt[0][i].out;
        and[1][i].b <== lt[1][i].out;
        and[2][i] = AND();
        and[2][i].a <== states[i][25];
        and[2][i].b <== and[1][i].out;
        multi_or[1][i] = MultiOR(2);
        multi_or[1][i].in[0] <== and[0][i].out;
        multi_or[1][i].in[1] <== and[2][i].out;
        states[i+1][1] <== multi_or[1][i].out;
        // 61 = '='
        eq[25][i] = IsEqual();
        eq[25][i].in[0] <== in[i];
        eq[25][i].in[1] <== 61;
        and[3][i] = AND();
        and[3][i].a <== states[i][1];
        and[3][i].b <== eq[25][i].out;
        and[4][i] = AND();
        and[4][i].a <== states[i][14];
        and[4][i].b <== eq[25][i].out;
        multi_or[2][i] = MultiOR(2);
        multi_or[2][i].in[0] <== and[3][i].out;
        multi_or[2][i].in[1] <== and[4][i].out;
        states[i+1][2] <== multi_or[2][i].out;
        // 64-91 = [A-Z]
        lt[2][i] = LessThan(8);
        lt[2][i].in[0] <== 64;
        lt[2][i].in[1] <== in[i];
        lt[3][i] = LessThan(8);
        lt[3][i].in[0] <== in[i];
        lt[3][i].in[1] <== 91;
        and[5][i] = AND();
        and[5][i].a <== lt[2][i].out;
        and[5][i].b <== lt[3][i].out;
        // 47-58 = [0-9]
        lt[4][i] = LessThan(8);
        lt[4][i].in[0] <== 47;
        lt[4][i].in[1] <== in[i];
        lt[5][i] = LessThan(8);
        lt[5][i].in[0] <== in[i];
        lt[5][i].in[1] <== 58;
        and[6][i] = AND();
        and[6][i].a <== lt[4][i].out;
        and[6][i].b <== lt[5][i].out;
        // 126 = '~'
        eq[26][i] = IsEqual();
        eq[26][i].in[0] <== in[i];
        eq[26][i].in[1] <== 126;
        // 60 = '<'
        eq[27][i] = IsEqual();
        eq[27][i].in[0] <== in[i];
        eq[27][i].in[1] <== 60;
        // 37 = '%'
        eq[28][i] = IsEqual();
        eq[28][i].in[0] <== in[i];
        eq[28][i].in[1] <== 37;
        // 96 = '`'
        eq[29][i] = IsEqual();
        eq[29][i].in[0] <== in[i];
        eq[29][i].in[1] <== 96;
        // 11 = '\t'
        eq[30][i] = IsEqual();
        eq[30][i].in[0] <== in[i];
        eq[30][i].in[1] <== 11;
        // 58 = ':'
        eq[31][i] = IsEqual();
        eq[31][i].in[0] <== in[i];
        eq[31][i].in[1] <== 58;
        // 10 = '\n'
        eq[32][i] = IsEqual();
        eq[32][i].in[0] <== in[i];
        eq[32][i].in[1] <== 10;
        // 39 = '''
        eq[33][i] = IsEqual();
        eq[33][i].in[0] <== in[i];
        eq[33][i].in[1] <== 39;
        // 41 = ')'
        eq[34][i] = IsEqual();
        eq[34][i].in[0] <== in[i];
        eq[34][i].in[1] <== 41;
        // 47 = '/'
        eq[35][i] = IsEqual();
        eq[35][i].in[0] <== in[i];
        eq[35][i].in[1] <== 47;
        // 93 = ']'
        eq[36][i] = IsEqual();
        eq[36][i].in[0] <== in[i];
        eq[36][i].in[1] <== 93;
        // 36 = '$'
        eq[37][i] = IsEqual();
        eq[37][i].in[0] <== in[i];
        eq[37][i].in[1] <== 36;
        // 64 = '@'
        eq[38][i] = IsEqual();
        eq[38][i].in[0] <== in[i];
        eq[38][i].in[1] <== 64;
        // 63 = '?'
        eq[39][i] = IsEqual();
        eq[39][i].in[0] <== in[i];
        eq[39][i].in[1] <== 63;
        // 12 = '\f'
        eq[40][i] = IsEqual();
        eq[40][i].in[0] <== in[i];
        eq[40][i].in[1] <== 12;
        // 95 = '_'
        eq[41][i] = IsEqual();
        eq[41][i].in[0] <== in[i];
        eq[41][i].in[1] <== 95;
        // 9 = '\t'
        eq[42][i] = IsEqual();
        eq[42][i].in[0] <== in[i];
        eq[42][i].in[1] <== 9;
        // 43 = '+'
        eq[43][i] = IsEqual();
        eq[43][i].in[0] <== in[i];
        eq[43][i].in[1] <== 43;
        // 35 = '#'
        eq[44][i] = IsEqual();
        eq[44][i].in[0] <== in[i];
        eq[44][i].in[1] <== 35;
        // 94 = '^'
        eq[45][i] = IsEqual();
        eq[45][i].in[0] <== in[i];
        eq[45][i].in[1] <== 94;
        // 13 = '\r'
        eq[46][i] = IsEqual();
        eq[46][i].in[0] <== in[i];
        eq[46][i].in[1] <== 13;
        // 46 = '.'
        eq[47][i] = IsEqual();
        eq[47][i].in[0] <== in[i];
        eq[47][i].in[1] <== 46;
        // 123 = '{'
        eq[48][i] = IsEqual();
        eq[48][i].in[0] <== in[i];
        eq[48][i].in[1] <== 123;
        // 92 = '\'
        eq[49][i] = IsEqual();
        eq[49][i].in[0] <== in[i];
        eq[49][i].in[1] <== 92;
        // 40 = '('
        eq[50][i] = IsEqual();
        eq[50][i].in[0] <== in[i];
        eq[50][i].in[1] <== 40;
        // 44 = ','
        eq[51][i] = IsEqual();
        eq[51][i].in[0] <== in[i];
        eq[51][i].in[1] <== 44;
        // 38 = '&'
        eq[52][i] = IsEqual();
        eq[52][i].in[0] <== in[i];
        eq[52][i].in[1] <== 38;
        // 42 = '*'
        eq[53][i] = IsEqual();
        eq[53][i].in[0] <== in[i];
        eq[53][i].in[1] <== 45;
        // 62 = '>'
        eq[54][i] = IsEqual();
        eq[54][i].in[0] <== in[i];
        eq[54][i].in[1] <== 62;
        // 32 = ' '
        eq[55][i] = IsEqual();
        eq[55][i].in[0] <== in[i];
        eq[55][i].in[1] <== 32;
        // 34 = '"'
        eq[56][i] = IsEqual();
        eq[56][i].in[0] <== in[i];
        eq[56][i].in[1] <== 34;
        // 91 = '['
        eq[57][i] = IsEqual();
        eq[57][i].in[0] <== in[i];
        eq[57][i].in[1] <== 91;
        // 33 = '!'
        eq[58][i] = IsEqual();
        eq[58][i].in[0] <== in[i];
        eq[58][i].in[1] <== 33;
        // 42 = '*'
        eq[59][i] = IsEqual();
        eq[59][i].in[0] <== in[i];
        eq[59][i].in[1] <== 42;
        // 125 = '}'
        eq[60][i] = IsEqual();
        eq[60][i].in[0] <== in[i];
        eq[60][i].in[1] <== 125;
        // 124 = '|'
        eq[61][i] = IsEqual();
        eq[61][i].in[0] <== in[i];
        eq[61][i].in[1] <== 124;
        and[7][i] = AND();
        and[7][i].a <== states[i][2];
        multi_or[3][i] = MultiOR(40);
        multi_or[3][i].in[0] <== and[5][i].out;
        multi_or[3][i].in[1] <== and[1][i].out;
        multi_or[3][i].in[2] <== and[6][i].out;
        multi_or[3][i].in[3] <== eq[26][i].out; // 126 = '~'
        multi_or[3][i].in[4] <== eq[27][i].out; // 60 = '<'
        multi_or[3][i].in[5] <== eq[28][i].out; // 37 = '%'
        multi_or[3][i].in[6] <== eq[29][i].out; // 96 = '`'
        multi_or[3][i].in[7] <== eq[30][i].out; // 11 = '\t'
        multi_or[3][i].in[8] <== eq[31][i].out; // 58 = ':'
        multi_or[3][i].in[9] <== eq[32][i].out; // 10 = '\n'
        multi_or[3][i].in[10] <== eq[33][i].out; // 39 = '''
        multi_or[3][i].in[11] <== eq[34][i].out; // 41 = ')'
        multi_or[3][i].in[12] <== eq[35][i].out; // 47 = '/'
        multi_or[3][i].in[13] <== eq[36][i].out; // 93 = ']'
        multi_or[3][i].in[14] <== eq[37][i].out; // 36 = '$'
        multi_or[3][i].in[15] <== eq[38][i].out; // 64 = '@'
        multi_or[3][i].in[16] <== eq[39][i].out; // 63 = '?'
        multi_or[3][i].in[17] <== eq[40][i].out; // 12 = '\f'
        multi_or[3][i].in[18] <== eq[25][i].out; // 61 = '=': Note using eq[25]
        multi_or[3][i].in[19] <== eq[41][i].out; // 95 = '_'
        multi_or[3][i].in[20] <== eq[42][i].out; // 9 = '\t'
        multi_or[3][i].in[21] <== eq[43][i].out; // 43 = '+'
        multi_or[3][i].in[22] <== eq[44][i].out; // 35 = '#'
        multi_or[3][i].in[23] <== eq[45][i].out; // 94 = '^'
        multi_or[3][i].in[24] <== eq[46][i].out; // 13 = '\r'
        multi_or[3][i].in[25] <== eq[47][i].out; // 46 = '.'
        multi_or[3][i].in[26] <== eq[48][i].out; // 123 = '{'
        multi_or[3][i].in[27] <== eq[49][i].out; // 92 = '\'
        multi_or[3][i].in[28] <== eq[50][i].out; // 40 = '('
        multi_or[3][i].in[29] <== eq[51][i].out; // 44 = ','
        multi_or[3][i].in[30] <== eq[52][i].out; // 38 = '&'
        multi_or[3][i].in[31] <== eq[53][i].out; // 42 = '*'
        multi_or[3][i].in[32] <== eq[54][i].out; // 62 = '>'
        multi_or[3][i].in[33] <== eq[55][i].out; // 32 = ' '
        multi_or[3][i].in[34] <== eq[56][i].out; // 34 = '"'
        multi_or[3][i].in[35] <== eq[57][i].out; // 91 = '['
        multi_or[3][i].in[36] <== eq[58][i].out; // 33 = '!'
        multi_or[3][i].in[37] <== eq[59][i].out; // 42 = '*'
        multi_or[3][i].in[38] <== eq[60][i].out; // 125 = '}'
        multi_or[3][i].in[39] <== eq[61][i].out; // 124 = '|'
        and[7][i].b <== multi_or[3][i].out;
        and[8][i] = AND();
        and[8][i].a <== states[i][3];
        and[8][i].b <== multi_or[3][i].out;
        multi_or[4][i] = MultiOR(2);
        multi_or[4][i].in[0] <== and[7][i].out;
        multi_or[4][i].in[1] <== and[8][i].out;
        states[i+1][3] <== multi_or[4][i].out;
        and[9][i] = AND();
        and[9][i].a <== states[i][0];
        and[9][i].b <== eq[46][i].out; // 13 = '\r'
        states[i+1][4] <== and[9][i].out;
        and[10][i] = AND();
        and[10][i].a <== states[i][4];
        and[10][i].b <== eq[32][i].out; // 10 = '\n'
        states[i+1][5] <== and[10][i].out;
        and[11][i] = AND();
        and[11][i].a <== states[i][5];
        and[11][i].b <== eq[23][i].out; // 100 = 'd'
        states[i+1][6] <== and[11][i].out;
        and[12][i] = AND();
        and[12][i].a <== states[i][6];
        and[12][i].b <== eq[7][i].out; // 107 = 'k'
        states[i+1][7] <== and[12][i].out;
        and[13][i] = AND();
        and[13][i].a <== states[i][7];
        and[13][i].b <== eq[12][i].out; // 105 = 'i'
        states[i+1][8] <== and[13][i].out;
        // 59 = ';'
        eq[62][i] = IsEqual();
        eq[62][i].in[0] <== in[i];
        eq[62][i].in[1] <== 59;
        and[14][i] = AND();
        and[14][i].a <== states[i][3];
        and[14][i].b <== eq[62][i].out;
        states[i+1][9] <== and[14][i].out;
        and[15][i] = AND();
        and[15][i].a <== states[i][8];
        and[15][i].b <== eq[9][i].out; // 109 = 'm'
        states[i+1][10] <== and[15][i].out;
        // 45 = '-'
        eq[63][i] = IsEqual();
        eq[63][i].in[0] <== in[i];
        eq[63][i].in[1] <== 45;
        and[16][i] = AND();
        and[16][i].a <== states[i][10];
        and[16][i].b <== eq[63][i].out;
        states[i+1][11] <== and[16][i].out;
        and[17][i] = AND();
        and[17][i].a <== states[i][11];
        and[17][i].b <== eq[4][i].out; // 115 = 's'
        states[i+1][12] <== and[17][i].out;
        and[18][i] = AND();
        and[18][i].a <== states[i][9];
        and[18][i].b <== eq[55][i].out; // 32 = ' '
        states[i+1][13] <== and[18][i].out;
        // 98 = 'b'
        eq[64][i] = IsEqual();
        eq[64][i].in[0] <== in[i];
        eq[64][i].in[1] <== 98;
        and[19][i] = AND();
        and[19][i].a <== states[i][13];
        and[19][i].b <== eq[64][i].out;
        states[i+1][14] <== and[19][i].out;
        and[20][i] = AND();
        and[20][i].a <== states[i][12];
        and[20][i].b <== eq[12][i].out;
        states[i+1][15] <== and[20][i].out;
        and[21][i] = AND();
        and[21][i].a <== states[i][14];
        and[21][i].b <== eq[16][i].out; // 104 = 'h'
        states[i+1][16] <== and[21][i].out;
        and[22][i] = AND();
        and[22][i].a <== states[i][15];
        and[22][i].b <== eq[2][i].out; // 103 = 'g'
        states[i+1][17] <== and[22][i].out;
        and[23][i] = AND();
        and[23][i].a <== states[i][17];
        and[23][i].b <== eq[0][i].out; // 110 = 'n'
        states[i+1][18] <== and[23][i].out;
        and[24][i] = AND();
        and[24][i].a <== states[i][18];
        and[24][i].b <== eq[18][i].out; // 97 = 'a'
        states[i+1][19] <== and[24][i].out;
        and[25][i] = AND();
        and[25][i].a <== states[i][19];
        and[25][i].b <== eq[19][i].out; // 116 = 't'
        states[i+1][20] <== and[25][i].out;
        and[26][i] = AND();
        and[26][i].a <== states[i][16];
        and[26][i].b <== eq[25][i].out; // 61 = '='
        states[i+1][21] <== and[26][i].out;
        and[27][i] = AND();
        and[27][i].a <== states[i][20];
        and[27][i].b <== eq[11][i].out; // 117 = 'u'
        states[i+1][22] <== and[27][i].out;
        and[28][i] = AND();
        and[28][i].a <== states[i][22];
        and[28][i].b <== eq[3][i].out; // 114 = 'r'
        states[i+1][23] <== and[28][i].out;
        and[29][i] = AND();
        and[29][i].a <== states[i][23];
        and[29][i].b <== eq[6][i].out; // 112 = 'p'
        states[i+1][24] <== and[29][i].out;
        and[30][i] = AND();
        and[30][i].a <== states[i][24];
        and[30][i].b <== eq[31][i].out; // 58 = ':'
        states[i+1][25] <== and[30][i].out;
        and[31][i] = AND();
        and[31][i].a <== states[i][21];
        multi_or[5][i] = MultiOR(6);
        // Use and[5] and[6] and[1]
        multi_or[5][i].in[0] <== and[5][i].out;
        multi_or[5][i].in[1] <== and[1][i].out;
        multi_or[5][i].in[2] <== and[6][i].out;
        multi_or[5][i].in[3] <== eq[35][i].out; // 47 = '/'
        multi_or[5][i].in[4] <== eq[43][i].out; // 43 = '+'
        multi_or[5][i].in[5] <== eq[25][i].out; // 61 = '='
        and[31][i].b <== multi_or[5][i].out;
        and[32][i] = AND();
        and[32][i].a <== states[i][26];
        and[32][i].b <== multi_or[5][i].out;
        multi_or[6][i] = MultiOR(2);
        multi_or[6][i].in[0] <== and[31][i].out;
        multi_or[6][i].in[1] <== and[32][i].out;
        states[i+1][26] <== multi_or[6][i].out;
        and[33][i] = AND();
        and[33][i].a <== states[i][26];
        and[33][i].b <== eq[62][i].out; // 59 = ';'
        states[i+1][27] <== and[33][i].out;
        and[34][i] = AND();
        and[34][i].a <== states[i][27];
        and[34][i].b <== eq[55][i].out; // 32 = ' '
        states[i+1][28] <== and[34][i].out;
    }

    signal final_state_sum[num_bytes+1];
    final_state_sum[0] <== states[0][28];
    for (var i = 1; i <= num_bytes; i++) {
        final_state_sum[i] <== final_state_sum[i-1] + states[i][28];
    }
    out <== final_state_sum[num_bytes];

    signal output reveal[num_bytes];
    for (var i = 0; i < num_bytes; i++) {
        reveal[i] <== in[i] * states[i+1][26];
    }
}