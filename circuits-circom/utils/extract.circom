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

// Adapted from ShiftAndPackMaskedStr function in zkemail to shift, remove line break, and pack.
// https://github.com/zkemail/zk-email-verify/blob/main/packages/circuits/helpers/extract.circom
template ShiftAndPackMaskedStrVenmoPayeeId(in_array_len, max_substr_len, pack_size) {
    var max_substr_len_packed = ((max_substr_len - 1) \ pack_size + 1);

    // Include unrevealed 3 0s at the end, which we will remove prior to packing
    // e.g. [67,64,65,65,48,61,13,10,48,44] => [67,64,65,65,48,61,13,10,48,44,0,0,0]
    component shifter = VarShiftMaskedStr(in_array_len, max_substr_len + 3);
    component packer = PackBytes(max_substr_len, max_substr_len_packed, pack_size);

    signal input in[in_array_len];
    signal input shift;
    signal output out[max_substr_len_packed];

    for (var i = 0; i < in_array_len; i++) {
        shifter.in[i] <== in[i];
    }
    shifter.shift <== shift;

    // Find index where `=\r\n` starts
    signal find_equals_idx[max_substr_len];
    component eq[max_substr_len];
    for (var i = 0; i < max_substr_len; i++) {
        eq[i] = IsEqual();
        eq[i].in[0] <== 61;
        eq[i].in[1] <== shifter.out[i];
        if (i == 0) {
            find_equals_idx[i] <== eq[i].out * i;
        } else {
            find_equals_idx[i] <== find_equals_idx[i - 1] + eq[i].out * i;
        }
    } 

    // Since shifter.out is max_substr_len + 3 and padded with 0s at the end, we can skip `=\r\n` without worrying about out of bounds
    signal skip_equals[max_substr_len];
    var max_substr_len_bits = log2(max_substr_len);
    component lt[max_substr_len];
    for (var i = 0; i < max_substr_len; i++) {
        lt[i] = LessThan(max_substr_len_bits);
        lt[i].in[0] <== i;
        lt[i].in[1] <== find_equals_idx[max_substr_len - 1];
        // If current index < index of `=`, then return original, otherwise skip 3 chars and return value
        skip_equals[i] <== (shifter.out[i] - shifter.out[i + 3]) * lt[i].out + shifter.out[i + 3];
    }

    // Note that this technically doesn't constrain the rest øf the bits after the max_substr_len to be 0/unmatched/unrevealed
    // Because of the constraints on signed inputs, it seems this should be OK security wise
    // But still, TODO unconstrained assert to double check they are 0
    for (var i = 0; i < max_substr_len; i++) {
        packer.in[i] <== skip_equals[i];
    }
    for (var i = 0; i < max_substr_len_packed; i++) {
        out[i] <== packer.out[i];
    }
}