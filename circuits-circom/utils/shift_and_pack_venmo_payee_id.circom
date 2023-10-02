pragma circom 2.1.5;

include "@zk-email/circuits/helpers/extract.circom";

// Adapted from ShiftAndPack function in zkemail
// https://github.com/zkemail/zk-email-verify/blob/main/packages/circuits/helpers/extract.circom
template ShiftAndPackVenmoPayeeId(in_array_len, max_substr_len, pack_size, line_break_idx) {
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

    // Constraints to skip over `=\r\n`
    signal skip_line_break[max_substr_len - 3];
    for (var i = 0; i < line_break_idx; i++) {
        skip_line_break[i] <== shifter.out[i];
    }
    for (var i = line_break_idx; i < max_substr_len - 3; i++) {
        skip_line_break[i] <== shifter.out[i + 3];
    }

    // Note that this technically doesn't constrain the rest øf the bits after the max_substr_len to be 0/unmatched/unrevealed
    // Because of the constraints on signed inputs, it seems this should be OK security wise
    // But still, TODO unconstrained assert to double check they are 0
    for (var i = 0; i < max_substr_len; i++) {
        packer.in[i] <== shifter.out[i];
    }
    for (var i = 0; i < max_substr_len_packed; i++) {
        out[i] <== packer.out[i];
    }
}