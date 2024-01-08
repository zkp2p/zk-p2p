pragma circom 2.1.5;

include "@zk-email/circuits/helpers/extract.circom";

// Copied from https://github.com/zkemail/zk-email-verify/blob/main/packages/circuits/helpers/extract.circom
// Shift the input left by variable size of bytes.
// Its input and output are the same as those of VarShiftLeft.
// However, it assumes the input is the masked bytes and checks that shift is the first index of the non-masked bytes.
template VarShiftMaskedStr(in_array_len, out_array_len) {
    signal input in[in_array_len]; // x
    signal input shift; // k
    signal output out[out_array_len] <== VarShiftLeft(in_array_len, out_array_len)(in, shift);

    signal is_target_idx[in_array_len];
    signal prev_byte[in_array_len];
    signal is_this_zero[in_array_len];
    signal is_prev_zero[in_array_len];
    for(var i = 0; i < in_array_len; i++) {
        is_target_idx[i] <== IsEqual()([i, shift]);
        is_this_zero[i] <== IsZero()(in[i]);
        is_target_idx[i] * is_this_zero[i] === 0;
         if(i == 0) {
            is_prev_zero[i] <== 1;
        } else {
            is_prev_zero[i] <== IsZero()(in[i-1]);
        }
        is_target_idx[i] * (1 - is_prev_zero[i]) === 0;
    }
}

// Copied from https://github.com/zkemail/zk-email-verify/blob/main/packages/circuits/helpers/extract.circom
// Shift the input left by variable size of bytes and pack the shifted bytes into fields under pack_size.
// Its input and output are the same as those of ShiftAndPack.
// However, it assumes the input is the masked bytes and checks that shift is the first index of the non-masked bytes.
template ShiftAndPackMaskedStr(in_array_len, max_substr_len, pack_size) {
    var max_substr_len_packed = ((max_substr_len - 1) \ pack_size + 1);

    component shifter = VarShiftMaskedStr(in_array_len, max_substr_len);
    component packer = PackBytes(max_substr_len, max_substr_len_packed, pack_size);

    signal input in[in_array_len];
    signal input shift;
    signal output out[max_substr_len_packed];

    for (var i = 0; i < in_array_len; i++) {
        shifter.in[i] <== in[i];
    }
    shifter.shift <== shift;

    for (var i = 0; i < max_substr_len; i++) {
        packer.in[i] <== shifter.out[i];
    }
    for (var i = 0; i < max_substr_len_packed; i++) {
        out[i] <== packer.out[i];
    }
}
