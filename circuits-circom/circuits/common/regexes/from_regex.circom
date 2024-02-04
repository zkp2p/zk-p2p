pragma circom 2.1.5;

include "@zk-email/zk-regex-circom/circuits/regex_helpers.circom";

// (\r\n|^)from:([A-Za-z0-9 _.,"@-]+)<[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.-]+>\r\n
template FromRegex (msg_bytes) {
    signal input msg[msg_bytes];
    signal output out;

    var num_bytes = msg_bytes+1;
    signal in[num_bytes];
    in[0] <== 128;      // \x80 (sentinel for first character in string)
    for (var i = 0; i < msg_bytes; i++) {
        in[i+1] <== msg[i];
    }

    component eq[17][num_bytes];
    component lt[12][num_bytes];
    component and[22][num_bytes];
    component multi_or[6][num_bytes];
    signal states[num_bytes+1][16];

    for (var i = 0; i < num_bytes+1; i++) {
        states[i][0] <== 1;
    }
    for (var i = 1; i < 16; i++) {
        states[0][i] <== 0;
    }

    for (var i = 0; i < num_bytes; i++) {
        // 64-91 = [A-Z]
        lt[0][i] = LessThan(8);
        lt[0][i].in[0] <== 64;
        lt[0][i].in[1] <== in[i];
        lt[1][i] = LessThan(8);
        lt[1][i].in[0] <== in[i];
        lt[1][i].in[1] <== 91;
        and[0][i] = AND();
        and[0][i].a <== lt[0][i].out;
        and[0][i].b <== lt[1][i].out;
        // 96-123 = [a-z]
        lt[2][i] = LessThan(8);
        lt[2][i].in[0] <== 96;
        lt[2][i].in[1] <== in[i];
        lt[3][i] = LessThan(8);
        lt[3][i].in[0] <== in[i];
        lt[3][i].in[1] <== 123;
        and[1][i] = AND();
        and[1][i].a <== lt[2][i].out;
        and[1][i].b <== lt[3][i].out;
        // 47-58 = [0-9]
        lt[4][i] = LessThan(8);
        lt[4][i].in[0] <== 47;
        lt[4][i].in[1] <== in[i];
        lt[5][i] = LessThan(8);
        lt[5][i].in[0] <== in[i];
        lt[5][i].in[1] <== 58;
        and[2][i] = AND();
        and[2][i].a <== lt[4][i].out;
        and[2][i].b <== lt[5][i].out;
        // 44 = ','
        eq[0][i] = IsEqual();
        eq[0][i].in[0] <== in[i];
        eq[0][i].in[1] <== 44;
        // 45 = '-'
        eq[1][i] = IsEqual();
        eq[1][i].in[0] <== in[i];
        eq[1][i].in[1] <== 45;
        // 32 = ' '
        eq[2][i] = IsEqual();
        eq[2][i].in[0] <== in[i];
        eq[2][i].in[1] <== 32;
        // 34 = '"'
        eq[3][i] = IsEqual();
        eq[3][i].in[0] <== in[i];
        eq[3][i].in[1] <== 34;
        // 64 = '@'
        eq[4][i] = IsEqual();
        eq[4][i].in[0] <== in[i];
        eq[4][i].in[1] <== 64;
        // 95 = '_'
        eq[5][i] = IsEqual();
        eq[5][i].in[0] <== in[i];
        eq[5][i].in[1] <== 95;
        // 46 = '.'
        eq[6][i] = IsEqual();
        eq[6][i].in[0] <== in[i];
        eq[6][i].in[1] <== 46;
        and[3][i] = AND();
        and[3][i].a <== states[i][1];
        multi_or[0][i] = MultiOR(10);
        multi_or[0][i].in[0] <== and[0][i].out;
        multi_or[0][i].in[1] <== and[1][i].out;
        multi_or[0][i].in[2] <== and[2][i].out;
        multi_or[0][i].in[3] <== eq[0][i].out;
        multi_or[0][i].in[4] <== eq[1][i].out;
        multi_or[0][i].in[5] <== eq[2][i].out;
        multi_or[0][i].in[6] <== eq[3][i].out;
        multi_or[0][i].in[7] <== eq[4][i].out;
        multi_or[0][i].in[8] <== eq[5][i].out;
        multi_or[0][i].in[9] <== eq[6][i].out;
        and[3][i].b <== multi_or[0][i].out;
        and[4][i] = AND();
        and[4][i].a <== states[i][11];
        and[4][i].b <== multi_or[0][i].out;
        multi_or[1][i] = MultiOR(2);
        multi_or[1][i].in[0] <== and[3][i].out;
        multi_or[1][i].in[1] <== and[4][i].out;
        states[i+1][1] <== multi_or[1][i].out;
        // 13 = '\r'
        eq[7][i] = IsEqual();
        eq[7][i].in[0] <== in[i];
        eq[7][i].in[1] <== 13;
        and[5][i] = AND();
        and[5][i].a <== states[i][0];
        and[5][i].b <== eq[7][i].out;
        states[i+1][2] <== and[5][i].out;
        // 128 = '\x80'
        eq[8][i] = IsEqual();
        eq[8][i].in[0] <== in[i];
        eq[8][i].in[1] <== 128;
        and[6][i] = AND();
        and[6][i].a <== states[i][0];
        and[6][i].b <== eq[8][i].out;
        // 10 = '\n'
        eq[9][i] = IsEqual();
        eq[9][i].in[0] <== in[i];
        eq[9][i].in[1] <== 10;
        and[7][i] = AND();
        and[7][i].a <== states[i][2];
        and[7][i].b <== eq[9][i].out;
        multi_or[2][i] = MultiOR(2);
        multi_or[2][i].in[0] <== and[6][i].out;
        multi_or[2][i].in[1] <== and[7][i].out;
        states[i+1][3] <== multi_or[2][i].out;
        // 60 = '<'
        eq[10][i] = IsEqual();
        eq[10][i].in[0] <== in[i];
        eq[10][i].in[1] <== 60;
        and[8][i] = AND();
        and[8][i].a <== states[i][1];
        and[8][i].b <== eq[10][i].out;
        states[i+1][4] <== and[8][i].out;
        // 102 = 'f'
        eq[11][i] = IsEqual();
        eq[11][i].in[0] <== in[i];
        eq[11][i].in[1] <== 102;
        and[9][i] = AND();
        and[9][i].a <== states[i][3];
        and[9][i].b <== eq[11][i].out;
        states[i+1][5] <== and[9][i].out;
        and[10][i] = AND();
        and[10][i].a <== states[i][4];
        multi_or[3][i] = MultiOR(6);
        multi_or[3][i].in[0] <== and[0][i].out; // [A-Z]
        multi_or[3][i].in[1] <== and[1][i].out; // [a-z]
        multi_or[3][i].in[2] <== and[2][i].out; // [0-9]
        multi_or[3][i].in[3] <== eq[1][i].out; // 45 = '-'
        multi_or[3][i].in[4] <== eq[5][i].out; // 95 = '_'
        multi_or[3][i].in[5] <== eq[6][i].out; // 46 = '.'
        and[10][i].b <== multi_or[3][i].out;
        and[11][i] = AND();
        and[11][i].a <== states[i][6];
        and[11][i].b <== multi_or[3][i].out;
        multi_or[4][i] = MultiOR(2);
        multi_or[4][i].in[0] <== and[10][i].out;
        multi_or[4][i].in[1] <== and[11][i].out;
        states[i+1][6] <== multi_or[4][i].out;
        // 114 = 'r'
        eq[12][i] = IsEqual();
        eq[12][i].in[0] <== in[i];
        eq[12][i].in[1] <== 114;
        and[12][i] = AND();
        and[12][i].a <== states[i][5];
        and[12][i].b <== eq[12][i].out;
        states[i+1][7] <== and[12][i].out;
        // 111 = 'o'
        eq[13][i] = IsEqual();
        eq[13][i].in[0] <== in[i];
        eq[13][i].in[1] <== 111;
        and[13][i] = AND();
        and[13][i].a <== states[i][7];
        and[13][i].b <== eq[13][i].out;
        states[i+1][8] <== and[13][i].out;
        // 109 = 'm'
        eq[14][i] = IsEqual();
        eq[14][i].in[0] <== in[i];
        eq[14][i].in[1] <== 109;
        and[14][i] = AND();
        and[14][i].a <== states[i][8];
        and[14][i].b <== eq[14][i].out;
        states[i+1][9] <== and[14][i].out;
        and[15][i] = AND();
        and[15][i].a <== states[i][6];
        and[15][i].b <== eq[4][i].out; // 64 = '@'
        states[i+1][10] <== and[15][i].out;
        // 58 = ':'
        eq[15][i] = IsEqual();
        eq[15][i].in[0] <== in[i];
        eq[15][i].in[1] <== 58;
        and[16][i] = AND();
        and[16][i].a <== states[i][9];
        and[16][i].b <== eq[15][i].out;
        states[i+1][11] <== and[16][i].out;
        and[17][i] = AND();
        and[17][i].a <== states[i][10];
        and[17][i].b <== multi_or[3][i].out;
        and[18][i] = AND();
        and[18][i].a <== states[i][12];
        and[18][i].b <== multi_or[3][i].out;
        multi_or[5][i] = MultiOR(2);
        multi_or[5][i].in[0] <== and[17][i].out;
        multi_or[5][i].in[1] <== and[18][i].out;
        states[i+1][12] <== multi_or[5][i].out;
        // 62 = '>'
        eq[16][i] = IsEqual();
        eq[16][i].in[0] <== in[i];
        eq[16][i].in[1] <== 62;
        and[19][i] = AND();
        and[19][i].a <== states[i][12];
        and[19][i].b <== eq[16][i].out;
        states[i+1][13] <== and[19][i].out;
        and[20][i] = AND();
        and[20][i].a <== states[i][13];
        and[20][i].b <== eq[7][i].out; // 13 = '\r'
        states[i+1][14] <== and[20][i].out;
        and[21][i] = AND();
        and[21][i].a <== states[i][14];
        and[21][i].b <== eq[9][i].out; // 10 = '\n'
        states[i+1][15] <== and[21][i].out;
    }

    signal final_state_sum[num_bytes+1];
    final_state_sum[0] <== states[0][15];
    for (var i = 1; i <= num_bytes; i++) {
        final_state_sum[i] <== final_state_sum[i-1] + states[i][15];
    }
    out <== final_state_sum[num_bytes];

    signal output reveal[msg_bytes];
    for (var i = 0; i < msg_bytes; i++) {
        reveal[i] <== in[i+1] * (states[i+2][6] + states[i+2][10] + states[i+2][12]);
    }
}