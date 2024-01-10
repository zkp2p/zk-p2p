pragma circom 2.1.5;

function ceil(value, precision) {
    return (value + precision - 1) \ precision * precision;
}