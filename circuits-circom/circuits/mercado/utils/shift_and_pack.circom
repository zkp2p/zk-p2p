pragma circom 2.1.5;

include "@zk-email/circuits/helpers/extract.circom";

// Assuming only one line break "=\r\n" in the in array
template RemoveLineBreak(in_array_len) {
    signal input in[in_array_len];
    signal output out[in_array_len];
    signal prefix_sum[in_array_len + 1];
    prefix_sum[0] <== 0;
    component eq[in_array_len];

    // Expand in array to avoid out of bounds access
    signal in_expanded[in_array_len + 3];
    for (var i = 0; i < in_array_len + 3; i++) {
        if (i < in_array_len) {
            in_expanded[i] <== in[i];
        } else {
            in_expanded[i] <== 0;
        }
    }
    
    // Remove line break
    for (var i = 0; i < in_array_len; i++) {
        eq[i] = IsEqual();
        eq[i].in[0] <== 61;
        eq[i].in[1] <== in_expanded[i];
        prefix_sum[i + 1] <== prefix_sum[i] + eq[i].out;
        out[i] <== (in_expanded[i] - in_expanded[i + 3]) * (1 - prefix_sum[i + 1]) + in_expanded[i + 3];
    }
}

// Adapted from ShiftAndPackMaskedStr function in zkemail. Shfits the target string, removes line break, and packs.
// https://github.com/zkemail/zk-email-verify/blob/main/packages/circuits/helpers/extract.circom
// Assumes that the max_substr_len is set taking line break into account
// So, the max_substr_len is the length of the string WITH the line break
template ShiftAndPackMaskedStrRemovingLineBreak(in_array_len, max_substr_len, pack_size) {
    var max_substr_len_packed = ((max_substr_len - 1) \ pack_size + 1);

    component shifter = VarShiftMaskedStr(in_array_len, max_substr_len);
    component packer = PackBytes(max_substr_len, max_substr_len_packed, pack_size);

    signal input in[in_array_len];
    signal input shift;
    signal output out[max_substr_len_packed];

    // Shift
    for (var i = 0; i < in_array_len; i++) {
        shifter.in[i] <== in[i];
    }
    shifter.shift <== shift;
    
    // Remove line break
    component remove_line_break = RemoveLineBreak(max_substr_len);
    for (var i = 0; i < max_substr_len; i++) {
        remove_line_break.in[i] <== shifter.out[i];
    }
    
    // Note that this technically doesn't constrain the rest øf the bits after the max_substr_len to be 0/unmatched/unrevealed
    // Because of the constraints on signed inputs, it seems this should be OK security wise
    // But still, TODO unconstrained assert to double check they are 0
    for (var i = 0; i < max_substr_len; i++) {
        packer.in[i] <== remove_line_break.out[i];
    }
    for (var i = 0; i < max_substr_len_packed; i++) {
        out[i] <== packer.out[i];
    }
}

// Adapted from ShiftAndPack function in zkemail. Shfits the target string, removes line break, and packs.
// https://github.com/zkemail/zk-email-verify/blob/main/packages/circuits/helpers/extract.circom
// Assumes that the max_substr_len is set taking line break into account
// So, the max_substr_len is the length of the string WITH the line break
// Differennce from ShiftAndPackMaskedStrRemovingLineBreak is that this one doesn't check for index shift malleability
template ShiftAndPackRemovingLineBreak(in_array_len, max_substr_len, pack_size) {
    var max_substr_len_packed = ((max_substr_len - 1) \ pack_size + 1);

    component shifter = VarShiftLeft(in_array_len, max_substr_len);
    component packer = PackBytes(max_substr_len, max_substr_len_packed, pack_size);

    signal input in[in_array_len];
    signal input shift;
    signal output out[max_substr_len_packed];

    for (var i = 0; i < in_array_len; i++) {
        shifter.in[i] <== in[i];
    }
    shifter.shift <== shift;

    // Remove line break
    component remove_line_break = RemoveLineBreak(max_substr_len);
    for (var i = 0; i < max_substr_len; i++) {
        remove_line_break.in[i] <== shifter.out[i];
    }

    // Note that this technically doesn't constrain the rest øf the bits after the max_substr_len to be 0/unmatched/unrevealed
    // Because of the constraints on signed inputs, it seems this should be OK security wise
    // But still, TODO unconstrained assert to double check they are 0
    for (var i = 0; i < max_substr_len; i++) {
        packer.in[i] <== remove_line_break.out[i];
    }
    for (var i = 0; i < max_substr_len_packed; i++) {
        out[i] <== packer.out[i];
    }
}