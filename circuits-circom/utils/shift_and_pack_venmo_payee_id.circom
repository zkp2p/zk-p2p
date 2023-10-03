pragma circom 2.1.5;

include "@zk-email/circuits/helpers/extract.circom";

// Adapted from ShiftAndPack function in zkemail to shift, remove line break, and pack.
// https://github.com/zkemail/zk-email-verify/blob/main/packages/circuits/helpers/extract.circom
template ShiftAndPackVenmoPayeeId(in_array_len, max_substr_len, pack_size) {
    var max_substr_len_packed = ((max_substr_len - 1) \ pack_size + 1);

    // Include unrevealed 3 0s at the end, which we will remove prior to packing
    // e.g. [67,64,65,65,48,61,13,10,48,44] => [67,64,65,65,48,61,13,10,48,44,0,0,0]
    component shifter = VarShiftLeft(in_array_len, max_substr_len + 3);
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